from datetime import timedelta
import shutil
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status, Form, Request
from typing import Annotated
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from dependencies import check_token, get_db
from sqlapp import schemas, crud

router = APIRouter(
    prefix="/api",
    tags=["documents"],
    responses={404: {"description": "Not found"}},
)

@router.post("/document/", response_model=schemas.Document)
def create_document(data: schemas.DocumentBase, db: Session = Depends(get_db), user: schemas.TokenData = Depends(check_token)):
    document = crud.create_document(db, data, user.user_id)
    if document is None:
        raise HTTPException(status_code=400, detail="Create document failed")
    return document

@router.get("/document/{document_id}", response_model=schemas.DocumentFull)
def read_document(document_id: int, rq: Request, db: Session = Depends(get_db), user: schemas.TokenData = Depends(check_token)):
    document = crud.get_document(db, document_id, user.user_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")
    if user.user_id != document['author_id']:
        is_collaborator = False
        for collaborator in document['collaborators']:
            if collaborator.user_id == user.user_id:
                is_collaborator = True
                break
        if not is_collaborator:
            raise HTTPException(status_code=403, detail="You are not authorized to view this document")
        
    return document

@router.get("/documents/")
def read_document(db: Session = Depends(get_db), user: schemas.TokenData = Depends(check_token)):
    document = crud.get_documents(db, user.user_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")       
    return document

@router.get("/documents/collaborators/{document_id}")
def get_collaborators(document_id: int, db: Session = Depends(get_db), user: schemas.TokenData = Depends(check_token)):
    collaborators = crud.get_collaborator(db, document_id)
    if collaborators is None:
        raise HTTPException(status_code=404, detail="Collaborators not found")       
    return collaborators

@router.get("/documents/collaborator/{document_id}/{collaborator_id}")
def get_collaborator(document_id: int, collaborator_id: int, db: Session = Depends(get_db), user: schemas.TokenData = Depends(check_token)):
    collaborators = crud.get_collaborators(db, document_id, collaborator_id)
    if collaborators is None:
        raise HTTPException(status_code=404, detail="Collaborators not found")       
    return collaborators


@router.put("/document/{document_id}", response_model=schemas.Document)
def update_document(
    data: schemas.DocumentBase, 
    db: Session = Depends(get_db), 
    user: schemas.TokenData = Depends(check_token)
    ):
    document = crud.update_document(db, data.document_id, data.title, data.content)
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return document

@router.put("/document/title/{document_id}", response_model=schemas.Document)
def update_document(
    document_id: int,
    data: schemas.UpdateTitle, 
    db: Session = Depends(get_db), 
    user: schemas.TokenData = Depends(check_token)
    ):
    document = crud.update_document(db, document_id, data.title, "")
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return document

@router.put("/document/content/{document_id}", response_model=schemas.Document)
def update_document(
    document_id: int,
    data: schemas.UpdateContent, 
    db: Session = Depends(get_db), 
    user: schemas.TokenData = Depends(check_token)
    ):
    document = crud.update_document(db, document_id, "", data.content)
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return document

@router.delete("/document/{document_id}")
def delete_document(document_id: int, db: Session = Depends(get_db), user: schemas.TokenData = Depends(check_token)):
    response = crud.delete_document(db, document_id, user.user_id)
    if not response:
        raise HTTPException(status_code=404, detail="Document not found")
    return JSONResponse(status_code = status.HTTP_200_OK, content=response)

@router.post("/document/collaborator/{document_id}/{collaborator_id}")
def add_collaborator(document_id: int, collaborator_id: str, db: Session = Depends(get_db), user: schemas.TokenData = Depends(check_token)):
    if user.user_id == collaborator_id:
        raise HTTPException(status_code=403, detail="You cannot add yourself as a collaborator to the document")
    response = crud.add_collaborator(db, document_id, user.user_id, collaborator_id)
    if not response:
        raise HTTPException(status_code=404, detail="Document not found")
    return JSONResponse(status_code=status.HTTP_200_OK, content=response)

@router.put("/document/collaborator/")
def update_collaborator_type(data: schemas.UpdateCollaboratorType, db: Session = Depends(get_db), user: schemas.TokenData = Depends(check_token)):
    response = crud.update_collaborator_type(db, data.document_id, user.user_id, data.collaborator_id, data.type)
    if not response:
        raise HTTPException(status_code=404, detail="You are not authorized to change collaborator type")
    return JSONResponse(status_code=status.HTTP_200_OK, content=response)

@router.delete("/document/collaborator/{document_id}/{collaborator_id}")
def remove_collaborator(document_id: int, collaborator_id: str, db: Session = Depends(get_db), user: schemas.TokenData = Depends(check_token)):
    if user.user_id == collaborator_id:
        raise HTTPException(status_code=403, detail="You cannot remove yourself from the document")
    response = crud.remove_collaborator(db, document_id, user.user_id, collaborator_id)
    if not response:
        raise HTTPException(status_code=404, detail="Document not found")
    return JSONResponse(status_code = status.HTTP_200_OK, content=response)

