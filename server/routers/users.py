from datetime import timedelta
import shutil
from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile, status, Form
from typing import Annotated
from fastapi.security import OAuth2PasswordRequestForm
import jwt
from sqlalchemy.orm import Session

from Auth import create_access_token, create_refresh_token, get_password_hash
from dependencies import check_token, get_db, get_current_user, authenticate_user
from sqlapp import schemas, crud

router = APIRouter(
    prefix="/api",
    tags=["token"],
    responses={404: {"description": "Not found"}},
)

@router.post("/token/")
async def login(
    form_data: schemas.UserLogin, db: Session = Depends(get_db)
) -> schemas.TokenLogin:
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
    token = schemas.Token(access=token["access_token"], refresh=token["refresh_token"], token_type="bearer")
    return schemas.TokenLogin(token=token)

@router.post("/token/refresh/")
async def refresh_token(data: schemas.RefreshToken,  db: Session = Depends(get_db)) -> schemas.TokenLogin:
    token = await create_refresh_token(
        data.refresh
    )
    token = schemas.Token(access=token["access_token"], refresh=token["refresh_token"], token_type="bearer")
    return schemas.TokenLogin(token=token)

@router.post("/token/register/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    user.password = get_password_hash(user.password)
    return crud.create_user(db=db, user=user)

@router.get("/token/user/", response_model=schemas.User)
def read_users(username: str, db: Session = Depends(get_db)):
    users = crud.get_user(db, username=username)
    return users

@router.get("/token/users/", response_model=list[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users


@router.get("/token/user/me")
def read_user(db: Session = Depends(get_db), token: Annotated[str, Depends(check_token)] = None):
    current_user = get_current_user(db, token)
    if current_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return current_user

@router.get("/me", response_model=schemas.User)
def read_user(db: Session = Depends(get_db), token: Annotated[str, Depends(check_token)] = None):
    current_user = crud.get_info_user(db, token.username)
    if current_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return current_user


@router.put("/user/profile/")
async def upload_profile(full_name: str = Form(...),image: UploadFile = File(...),
    position: str = Form(...), db: Session = Depends(get_db), token = Depends(check_token)):
    user = get_current_user(db, token)
    file_location = f"media/{image.filename}"
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(image.file, file_object)
    crud.update_profile(db, user, full_name, position, file_location)
    return {"message": "Uploaded successfully"}