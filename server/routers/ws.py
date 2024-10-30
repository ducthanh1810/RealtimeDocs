from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
import jwt
from config import public_key, ALGORITHM
from dependencies import get_db
from sqlapp.database import SessionLocal
from sqlapp import crud

router = APIRouter()

def verify_token(token):
        try:
            payload = jwt.decode(token, public_key, algorithms=[ALGORITHM])
            user_id = payload.get("user_id")
            return user_id
        except Exception as e:
            print(e)
            return None
        
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}    

    async def connect(self, websocket: WebSocket, room: str):
        token = websocket.query_params.get("token")
        if token:
            user = verify_token(token)
            print("user:     ----   ", user)
            if user:
                await websocket.accept()
                if room not in self.active_connections:
                    self.active_connections[room] = []
                self.active_connections[room].append(websocket)
                return "connected"
        return "not connected"

    def disconnect(self, websocket: WebSocket, room: str):
        if room in self.active_connections:
            self.active_connections[room].remove(websocket)
            if not self.active_connections[room]:
                del self.active_connections[room]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str, room: str, sender_websocket: WebSocket):
        if room in self.active_connections:
            for connection in self.active_connections[room]:
                if connection != sender_websocket:
                    await connection.send_text(message)

manager = ConnectionManager()

@router.websocket("/ws/{client_room}/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_room: str, client_id: int):
    ws = await manager.connect(websocket, client_room)
    db = SessionLocal()
    try:
        while ws == "connected":
            data = await websocket.receive_text()
            await manager.broadcast(f'{client_id}||{data}', client_room, websocket)
            crud.update_document(db, client_room, "", data)
    except WebSocketDisconnect:
        manager.disconnect(websocket, client_room)