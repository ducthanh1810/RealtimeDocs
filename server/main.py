import shutil

from urllib.parse import parse_qsl
from fastapi_auth_jwt import  JWTAuthenticationMiddleware
from fastapi import Depends, FastAPI, HTTPException, Request, Response, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy.orm import Session
from fastapi.staticfiles import StaticFiles

from Auth import create_access_token, create_refresh_token, auth_backend
from middleware import SpamFilterMiddleware
from sqlapp import crud, models, schemas
from sqlapp.database import SessionLocal, engine
from dependencies import *
from routers import ws, users, documents, comment

models.Base.metadata.create_all(bind=engine)
# Initialize the Authentication Backend
app = FastAPI()

app.mount("/media", StaticFiles(directory="media"), name = "media")
app.include_router(ws.router)
app.include_router(users.router)
app.include_router(documents.router)
app.include_router(comment.router)

origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:1337",
    "*"
]

app.add_middleware(SpamFilterMiddleware)

app.add_middleware(
    JWTAuthenticationMiddleware,
    backend=auth_backend,
    exclude_urls=["/api/token/", "/token", "/media/"],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins= origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def db_session_middleware(request: Request, call_next):
    response = Response("Internal server error", status_code=500)
    try:
        request.state.db = SessionLocal()
        response = await call_next(request)
    finally:
        request.state.db.close()
    return response

# For Test Api only
class Token(BaseModel):
    access_token: str
    token_type: str

@app.post("/token")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: Session = Depends(get_db)
) -> Token:
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = await create_access_token(
        data={"username": user.username, "user_id": user.id, "role": user.role}
    )
    return Token(access_token=token["access_token"], token_type="bearer")

