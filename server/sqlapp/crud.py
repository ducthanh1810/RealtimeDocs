from datetime import datetime, timedelta
from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import event
from . import models, schemas

# USER CRUD methods
def get_user(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_info_user(db: Session, username: str):
    user = db.query(models.User).filter(models.User.username == username).first()
    profile = db.query(models.Profile).filter(models.Profile.user_id == user.id).first()
    return schemas.User(
        user=user.id,
        full_name=profile.full_name,
        position=profile.position,
        image=f"/{profile.image}",
        gmail=user.email,
        role=user.role,
        friends=[],)

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    password = user.password
    db_user = models.User(username = user.username, email=user.email, password=password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@event.listens_for(models.User, 'after_insert')
def create_profile(mapper, connection, target):
    session = Session(bind=connection)
    new_profile = models.Profile(user_id=target.id)
    session.add(new_profile)
    session.commit()

def update_profile(db: Session, user, full_name, position, image_link):
    db_profile = db.query(models.Profile).filter(models.Profile.user_id == user.id).first()
    db_profile.full_name = full_name
    db_profile.position = position
    db_profile.image = image_link
    db.commit()
    return db_profile

# DOCUMENT CRUD methods
def get_document(db: Session, id: int, user_id: int):
    document = db.query(models.Document).filter(models.Document.id == id).first()
    user_collaborators = document.user_collaborator
    for index, collaborator in enumerate(document.collaborators):
        user_collaborators[index].type = collaborator.type
    data = {
        'id': document.id,
        'document_id': document.document_id,
        'title': document.title,
        'content': document.content,
        'author_id': document.author_id,
        'created_at': document.created_at,
        'updated_at': document.updated_at,
        'collaborators': user_collaborators,
        'comments': document.comments
    }
    return data

def get_documents(db: Session, user_id, skip: int = 0, limit: int = 100):
    documents = db.query(models.Document).filter(
        models.Document.author_id == user_id
    ).order_by(models.Document.updated_at.desc()).offset(skip).limit(limit).all()
    user = db.query(models.Profile).filter(models.Profile.user_id == user_id).first()
    list_documents = documents + user.documents_collaborative
    return list_documents

def get_document_author(db: Session, document_id: int, user: int):
    document = db.query(models.Document).filter(models.Document.id == document_id).first()
    if document is None:
        return "Document not found"
    if document.author_id == user:
        return db.query(models.Profile).filter(models.Profile.user_id == document.author_id).first()
    collaborator = db.query(models.Collaborator).filter(models.Collaborator.document_id == document_id, models.Collaborator.user_id == user).first()
    if collaborator is None:
        return "You are not the collaborator of this document"
    author = db.query(models.Profile).filter(models.Profile.user_id == document.author_id).first()
    return author

def create_document(db: Session, document: schemas.DocumentBase, user_id: int):
    db_document = models.Document(**document.dict(), author_id = user_id)
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document

def update_document(db: Session, document_id, title, content):
    db_document = db.query(models.Document).filter(models.Document.id == document_id).first()
    if title != "": 
        db_document.title = title
    if content != "": 
        db_document.content = content
    db.commit()
    return db_document

def delete_document(db: Session, document_id, user_id):
    db_document = db.query(models.Document).filter(models.Document.id == document_id).first()
    if db_document.author_id != user_id:
        return "You are not the author of this document"
    db_comment = db_document.comments
    for comment in db_document.comments:
        for reply in comment.replies:
            db.delete(reply)  # Delete each reply
        db.delete(comment)
    db.delete(db_document)
    db.commit()
    return "Delete successful"

def get_collaborator(db: Session, document_id):
    db_document = db.query(models.Document).filter(models.Document.id == document_id).first()
    collaborators = db_document.collaborators
    return collaborators

def get_collaborators(db: Session, document_id, collaborator_id):
    db_collaborator = db.query(models.Collaborator).filter(
        models.Collaborator.document_id == document_id, 
        models.Collaborator.user_id == collaborator_id
        ).first()
    return db_collaborator

def add_collaborator(db: Session, document_id, user_id, collaborator_id, type_collaborator):
    collaborator = db.query(models.User).filter((models.User.username == collaborator_id) | (models.User.email == collaborator_id)).first()
    if not collaborator:
        return "User not found"
    profile = collaborator.profile
    db_document = db.query(models.Document).filter(models.Document.id == document_id).first()
    if not db_document:
        return db_document
    if db_document.author_id != user_id:
        return "You are not the author of this document"
    db_collaborator = db.query(models.Collaborator).filter(models.Collaborator.document_id == document_id, models.Collaborator.user_id == collaborator.id).first()
    if db_collaborator:
        return "This user is already a collaborator"
    db_collaborator = models.Collaborator(document_id = document_id, user_id = collaborator.id, type = type_collaborator)
    db.add(db_collaborator)
    db_document.collaborators.append(db_collaborator)
    db_document.user_collaborator.append(profile)
    db.commit()
    return "Collaborator added successful"

def update_collaborator_type(db: Session, document_id: str, user_id, collaborator_id, type):
    # db_document = db.query(models.Document).filter(models.Document.id == document_id, models.Document.author_id == user_id).first()
    # if not db_document:
    #     return db_document
    db_collaborator = db.query(models.Collaborator).filter(
        models.Collaborator.document_id == document_id, 
        models.Collaborator.user_id == collaborator_id
        ).first()
    if not db_collaborator:
        return "This user is not a collaborator"
    db_collaborator.type = type
    db.commit()
    return "Collaborator type updated successful"

def remove_collaborator(db: Session, document_id, user_id, collaborator_id):
    collaborator = db.query(models.User).filter(models.User.id == collaborator_id).first()
    profile = collaborator.profile
    db_document = db.query(models.Document).filter(models.Document.id == document_id).first()
    if not db_document:
        return db_document
    if db_document.author_id != user_id:
        return "You are not the author of this document"
    db_collaborator = db.query(models.Collaborator).filter(
        models.Collaborator.document_id == document_id, 
        models.Collaborator.user_id == collaborator.id
        ).first()
    if not db_collaborator:
        return "This user is not a collaborator"
    db_document.collaborators.remove(db_collaborator)
    db_document.user_collaborator.remove(profile)
    db.delete(db_collaborator)
    db.commit()
    return "Collaborator removed successful"

# Comment CRUD methods
def get_comment(db: Session, id: int, user_id: int):
    return db.query(models.Comment).filter(models.Comment.id == id, models.Comment.user_id == user_id).options(
        joinedload(models.Comment.replies)).first()

def get_comments(db: Session, document_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Comment).filter(models.Comment.document_id == document_id).options(
        joinedload(models.Comment.user),
        joinedload(models.Comment.replies)).offset(skip).limit(limit).all()

def create_comment(db: Session, comment: schemas.CommentBase, document_id: int, user_id: int):
    db_comment = models.Comment(**comment.dict(), user_id = user_id, document_id = document_id)
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

def update_comment(db: Session, user_id, comment_id, comment: schemas.CommentBase):
    db_comment = db.query(models.Comment).filter(models.Comment.id == comment_id, models.Comment.user_id== user_id).first()
    if not db_comment:
        return db_comment
    db_comment.content = comment.content
    db_comment.location = comment.location
    db.commit()
    return db_comment

def update_comment_reaction(db: Session, comment_id, comment: schemas.CommentReaction):
    db_comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    db_comment.reaction = comment.reaction
    db.commit()
    db.refresh(db_comment)
    return db_comment

def update_comment_resolve(db: Session, comment_id, user_id):
    db_comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if user_id != db_comment.user_id:
        db_document = db_comment.document
        if db_document.author_id != user_id:
            return "You are not the author of this comment"
    db_comment.resolve = not db_comment.resolve
    db.commit()
    return db_comment

def delete_comment(db: Session, comment_id, user_id):
    db_comment = db.query(models.Comment).filter(models.Comment.id == comment_id, models.Comment.user_id == user_id).first()
    if not db_comment:
        return db_comment
    for reply in db_comment.replies:
        db.delete(reply)
    db.delete(db_comment)
    db.commit()
    return "Delete successful"

# Reply CRUD methods
def get_reply(db: Session, id: int):
    return db.query(models.CommentReply).filter(models.CommentReply.id == id).first()

def get_replies(db: Session, comment_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.CommentReply).filter(models.CommentReply.comment_id == comment_id).options(
        joinedload(models.CommentReply.user)).offset(skip).limit(limit).all()

def create_reply(db: Session, reply: schemas.ReplyBase, comment_id: int, user_id: int):
    db_reply = models.CommentReply(**reply.dict(), user_id = user_id, comment_id = comment_id)
    db.add(db_reply)
    db.commit()
    return db_reply

def update_reply(db: Session, reply_id, user_id, content):
    db_reply = db.query(models.CommentReply).filter(models.CommentReply.id == reply_id, models.CommentReply.user_id == user_id).first()
    db_reply.content = content
    db.commit()
    return db_reply

def update_reply_reaction(db: Session, reply_id, reply: schemas.CommentReaction):
    db_reply = db.query(models.CommentReply).filter(models.CommentReply.id == reply_id).first()
    db_reply.reaction = reply.reaction
    db.commit()
    return db_reply

def delete_reply(db: Session, reply_id, user_id):
    db_reply = db.query(models.CommentReply).filter(models.CommentReply.id == reply_id, models.CommentReply.user_id == user_id).first()
    if not db_reply:
        return db_reply
    db.delete(db_reply)
    db.commit()
    return "Delete successful"
