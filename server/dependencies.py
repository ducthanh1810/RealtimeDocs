from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidKeyError
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from Auth import verify_password
from sqlapp import models, schemas
from sqlapp.crud import *
from config import public_key, ALGORITHM

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_db(request: Request):
    return request.state.db


def authenticate_user(db, username: str, password: str):
    user = get_user(db, username)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user


def check_token(token: Annotated[str, Depends(oauth2_scheme)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, public_key, algorithms=[ALGORITHM])
        username: str = payload.get("username")
        user_id: int = int(payload.get("user_id"))
        exp = payload.get("exp")
        if exp < datetime.now(timezone.utc).timestamp():
            raise credentials_exception
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username, user_id=user_id)
    except InvalidKeyError:
        raise credentials_exception
    return token_data

def get_current_user(db: Session, token: schemas.TokenData):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    user = get_user(db, token.username)
    if user is None:
        raise credentials_exception
    return user