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
        self.list_user_in_room: dict[str, list[str]] = {}   

    async def connect(self, websocket: WebSocket, room: str):
        token = websocket.query_params.get("token")
        if token:
            user = verify_token(token)
            print("user:     ----   ", user)
            if user:
                await websocket.accept()
                if room not in self.active_connections:
                    self.active_connections[room] = []
                    self.list_user_in_room[room] = []
                self.list_user_in_room[room].append(user)
                self.active_connections[room].append(websocket)
                return "connected"
        return "not connected"

    def disconnect(self, websocket: WebSocket, room: str, user: str):
        if room in self.active_connections:
            self.active_connections[room].remove(websocket)
            self.list_user_in_room[room].remove(user)
            if not self.active_connections[room]:
                del self.active_connections[room]
                del self.list_user_in_room[room]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str, room: str, sender_websocket: WebSocket):
        if room in self.active_connections:
            for connection in self.active_connections[room]:
                if connection != sender_websocket:
                    list_user_in_room = ""
                    for user in self.list_user_in_room[room]:
                        list_user_in_room += f"||{user}"
                    await connection.send_text(f"{message}{list_user_in_room}")

manager = ConnectionManager()

@router.websocket("/ws/{client_room}/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_room: str, client_id: int):
    ws = await manager.connect(websocket, client_room)
    db = SessionLocal()
    try:
        d = 0
        while ws == "connected":
            await manager.broadcast(f'{client_id}||connection', client_room, websocket) if d == 0 else None
            d += 1
            data = await websocket.receive_text()
            await manager.broadcast(f'{client_id}||{data}', client_room, websocket)
            crud.update_document(db, client_room, "", data)
    except WebSocketDisconnect:
        manager.disconnect(websocket, client_room, client_id)
        await manager.broadcast(f'{client_id}||null', client_room, websocket)