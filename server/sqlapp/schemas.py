from datetime import datetime
from fastapi import File, Form, UploadFile
from pydantic import BaseModel


# User Model
class ProfileBase(BaseModel):
    pass

class ProfileCreate(ProfileBase):
    user_id: int

class Profile(ProfileBase):
    full_name: str
    position: str
    image: str

    class Config:
        orm_mode = True

class ProfileFull(ProfileBase):
    id: int
    full_name: str
    user_id: int
    position: str
    image: str
    verified: bool

class UserBase(BaseModel):
    id: int
    username: str
    email: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserCreate(UserBase):
    password: str


class User(BaseModel):
    user: int | None = None
    full_name: str | None = None
    position: str | None = None
    image: str | None = None
    friends: list = []
    gmail: str | None = None
    role: str | None = None

    class Config:
        orm_mode = True

class UserInDB(UserBase):
    password: str

#----------------------------------------------------------------

# Token Model
class Token(BaseModel):
    access: str
    refresh: str
    token_type: str

class RefreshToken(BaseModel):
    refresh: str

class TokenLogin(BaseModel):
    token: Token

class TokenData(BaseModel):
    user_id: int
    username: str | None = None

#----------------------------------------------------------------

# Document Model
class Collaborator(BaseModel):
    user_id: int
    document_id: int
    type: int

class ReplyBase(BaseModel):
    content: str

class ReplyReaction(ReplyBase):
    reaction: str | None

class Reply(ReplyBase):
    id: int
    reaction: str | None
    created_at: datetime
    updated_at: datetime
    comment_id: int
    user_id: int

class CommentBase(BaseModel):
    content: str
    location: str

class CommentReaction(BaseModel):
    reaction: str | None

class Comment(CommentBase):
    id: int
    reaction: str | None
    created_at: datetime
    updated_at: datetime
    resolve: bool
    document_id: int
    user_id: int

class CommentWithRely(Comment):
    replies: list[Reply]

class DocumentBase(BaseModel):
    document_id: str
    title: str
    content: str

class UpdateTitle(BaseModel):
    title: str

class UpdateContent(BaseModel):
    content: str

class Document(DocumentBase):
    id: int
    created_at: datetime
    updated_at:datetime
    author_id: int

class UserDocument(ProfileFull):
    type: bool

class DocumentFull(Document):
    collaborators: list[UserDocument]
    comments: list[Comment]

class UpdateCollaboratorType(BaseModel):
    document_id: int
    collaborator_id: int
    type: bool
