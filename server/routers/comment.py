from datetime import timedelta
import shutil
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status, Form
from typing import Annotated
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from dependencies import check_token, get_db
from sqlapp import schemas, crud

router = APIRouter(
    prefix="/api",
    tags=["comment"],
    responses={404: {"description": "Not found"}},
)

# Comment API routes
@router.post("/comment/{document_id}", response_model=schemas.Comment)
def create_comment(data: schemas.CommentBase, document_id: int, db: Session = Depends(get_db), user: schemas.TokenData = Depends(check_token)):
    comment = crud.create_comment(db, data, document_id, user.user_id)
    if comment is None:
        raise HTTPException(status_code=400, detail="Create comment failed")
    return comment

@router.get("/comment/{comment_id}", response_model=schemas.CommentWithRely)
def read_comment(comment_id: int, db: Session = Depends(get_db), user: schemas.TokenData = Depends(check_token)):
    comment = crud.get_comment(db, comment_id, user.user_id)
    if comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")      
    return comment

@router.get("/comments/{document_id}")
def get_comment_of_document(document_id: int, db: Session = Depends(get_db), user: schemas.TokenData = Depends(check_token)):
    comment = crud.get_comments(db, document_id)
    if comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")      
    return comment

@router.put("/comment/{comment_id}", response_model=schemas.Comment)
def update_comment(
        data: schemas.CommentBase, 
        comment_id: int,
        db: Session = Depends(get_db), 
        user: schemas.TokenData = Depends(check_token)
    ):
    comment = crud.update_comment(db, user.user_id, comment_id, data)
    if comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    return comment

@router.put("/comment/{comment_id}/reaction", response_model=schemas.Comment)
def update_comment_reaction(
        data: schemas.CommentReaction, 
        comment_id: int,
        db: Session = Depends(get_db), 
        user: schemas.TokenData = Depends(check_token)
    ):
    comment = crud.update_comment_reaction(db, comment_id, data)
    if comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    return comment

@router.put("/comment/{comment_id}/resolve", response_model=schemas.Comment)
def update_comment_resolve(
        comment_id: int,
        db: Session = Depends(get_db), 
        user: schemas.TokenData = Depends(check_token)
    ):
    comment = crud.update_comment_resolve(db, comment_id, user.user_id)
    if comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    return comment

@router.delete("/comment/{comment_id}")
def delete_comment(comment_id: int, db: Session = Depends(get_db), user: schemas.TokenData = Depends(check_token)):
    response = crud.delete_comment(db, comment_id, user.user_id)
    if not response:
        raise HTTPException(status_code=404, detail="Comment not found")
    return JSONResponse(status_code = status.HTTP_200_OK, content=response)

#----------------------------------------------------------------

# Reply API routes
@router.post("/reply/{comment_id}", response_model=schemas.Reply)
def create_reply(data: schemas.ReplyBase, comment_id: int, db: Session = Depends(get_db), user: schemas.TokenData = Depends(check_token)):
    reply = crud.create_reply(db, data, comment_id, user.user_id)
    if reply is None:
        raise HTTPException(status_code=400, detail="Create reply failed")
    return reply

@router.get("/reply/{reply_id}")
def read_reply(reply_id: int, db: Session = Depends(get_db), user: schemas.TokenData = Depends(check_token)):
    reply = crud.get_reply(db, reply_id, user.user_id)
    if reply is None:
        raise HTTPException(status_code=404, detail="Reply not found")      
    return reply

@router.get("/replies/{comment_id}")
def read_replies(comment_id: int, db: Session = Depends(get_db), user: schemas.TokenData = Depends(check_token)):
    reply = crud.get_replies(db, comment_id)
    if reply is None:
        raise HTTPException(status_code=404, detail="Reply not found")      
    return reply

@router.put("/reply/{reply_id}", response_model=schemas.Reply)
def update_reply(
        data: schemas.ReplyBase, 
        reply_id: int,
        db: Session = Depends(get_db), 
        user: schemas.TokenData = Depends(check_token)
    ):
    reply = crud.update_reply(db, reply_id, user.user_id, data.content)
    if reply is None:
        raise HTTPException(status_code=404, detail="Reply not found")
    return reply

@router.delete("/reply/{reply_id}")
def delete_reply(reply_id: int, db: Session = Depends(get_db), user: schemas.TokenData = Depends(check_token)):
    response = crud.delete_reply(db, reply_id, user.user_id)
    if not response:
        raise HTTPException(status_code=404, detail="Reply not found")
    return JSONResponse(status_code = status.HTTP_200_OK, content=response)

@router.put("/reply/{reply_id}/reaction", response_model=schemas.Reply)
def update_comment_reaction(
        data: schemas.CommentReaction, 
        reply_id: int,
        db: Session = Depends(get_db), 
        user: schemas.TokenData = Depends(check_token)
    ):
    comment = crud.update_reply_reaction(db, reply_id, data)
    if comment is None:
        raise HTTPException(status_code=404, detail="Reply not found")
    return comment