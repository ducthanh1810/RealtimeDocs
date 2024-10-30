from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi_auth_jwt import JWTAuthBackend, JWTAuthenticationMiddleware, RedisConfig
from config import User, AuthenticationSettings, StorageConfig
from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlapp.schemas import User, UserInDB
from config import User as UserConfig, REFRESH_TOKEN_EXPIRE_DAYS


auth_backend = JWTAuthBackend(
    authentication_config=AuthenticationSettings(),
    user_schema=UserConfig,
    storage_config=StorageConfig(),
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)

async def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    await auth_backend.invalidate_token_of_user(to_encode["username"])
    access_token = await auth_backend.create_token(
        {
            "username": to_encode["username"],
            'user_id': to_encode["user_id"],
            "tokenType": 'access'
        }
    )
    refresh_token = await auth_backend.create_token(
        {
            "username": to_encode["username"],
            'user_id': to_encode["user_id"],
            "tokenType":'refresh',
        },
        expiration=REFRESH_TOKEN_EXPIRE_DAYS
    )
    return {"access_token": access_token, "refresh_token": refresh_token}

async def create_refresh_token(token: str):
    user_refresh: User = await auth_backend.authenticate(token)
    if not user_refresh:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    await auth_backend.invalidate_token_of_user(user_refresh.username)

    access_token = await auth_backend.create_token(
        {
            "username": user_refresh.username,
            'user_id': user_refresh.user_id,
            "tokenType": 'access'
        }
    )
    refresh_token = await auth_backend.create_token(
        {
            "username": user_refresh.username,
            'user_id': user_refresh.user_id,
            "tokenType":'refresh',
        },
        expiration=REFRESH_TOKEN_EXPIRE_DAYS
    )
    return {"access_token": access_token, "refresh_token": refresh_token}



