from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Table, Float
from sqlalchemy.orm import relationship
from datetime import datetime

from .database import Base

documents_collaborative_association = Table(
    'documents_collaborative_association', Base.metadata,
    Column('document_id', Integer, ForeignKey('documents.id')),
    Column('user_id', Integer, ForeignKey('profiles.user_id'))
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    password = Column(String(50), unique=True)
    last_login = Column(DateTime, nullable=True)
    fist_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    is_staff = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    date_joined = Column(DateTime, default=datetime.now())
    username = Column(String(30), unique=True, index=True)
    email = Column(String, unique=True, index=True)
    role = Column(String, default="user")

    profile = relationship("Profile", uselist=False, back_populates="user")
    documents = relationship("Document", back_populates="author")
    collaborative = relationship("Collaborator", back_populates="user")

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True)
    position = Column(String(100), default="")
    full_name = Column(String(100), default="")
    image = Column(String, default="default.png")
    verified = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="profile")
    documents_collaborative = relationship("Document", secondary=documents_collaborative_association, back_populates="user_collaborator")
    comments = relationship("Comment", back_populates="user")
    replies = relationship("CommentReply", back_populates="user")

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True)
    document_id = Column(String(100), index=True)
    title = Column(String(100), default="My Title")
    content = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(), onupdate=datetime.now())
    author_id = Column(Integer, ForeignKey("users.id"))

    author = relationship("User", back_populates="documents")
    user_collaborator = relationship("Profile", secondary=documents_collaborative_association, back_populates="documents_collaborative")
    collaborators = relationship("Collaborator", back_populates="document")
    comments = relationship("Comment", back_populates = "document")

class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True)
    content = Column(String, nullable=True)
    reaction = Column(String, default="{}")
    location = Column(String, default='[0,0]')
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(), onupdate=datetime.now())
    resolve = Column(Boolean, default=False)
    document_id = Column(Integer, ForeignKey("documents.id"))
    user_id = Column(Integer, ForeignKey("profiles.user_id"))
    
    document = relationship("Document", back_populates="comments")
    replies = relationship("CommentReply", back_populates="comment")
    user = relationship("Profile", back_populates="comments")
    

class CommentReply(Base):
    __tablename__ = "comment_replies"

    id = Column(Integer, primary_key=True)
    content = Column(String, nullable=True)
    reaction = Column(String, default="{}")
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(), onupdate=datetime.now())
    comment_id = Column(Integer, ForeignKey("comments.id"))
    user_id = Column(Integer, ForeignKey("profiles.user_id"))
    
    comment = relationship("Comment", back_populates="replies")
    user = relationship("Profile", back_populates="replies")

class Collaborator(Base):
    __tablename__ = "collaborators"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    document_id = Column(Integer, ForeignKey("documents.id"), index=True)
    type = Column(Boolean, default=False)
    
    user = relationship("User", back_populates="collaborative")
    document = relationship("Document", back_populates="collaborators")
    
