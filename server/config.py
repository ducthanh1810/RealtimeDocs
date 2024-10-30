# examples/standard/app/config.py

from datetime import timedelta
import os
from pydantic import BaseModel, Field
from typing import Optional

path_parent = os.path.dirname(os.path.abspath(__file__))
private_key_path = os.path.join(path_parent, 'private.pem')
public_key_path = os.path.join(path_parent, 'public.pem')

private_key = open(private_key_path, 'r').read()
public_key = open(public_key_path, 'r').read()
ALGORITHM = "RS256"
ACCESS_TOKEN_EXPIRE_SECONDS= 3600 # 1 hour
REFRESH_TOKEN_EXPIRE_DAYS = timedelta(days = 1)

redis_host = os.environ.get('REDIS_HOST')
redis_port = os.environ.get('REDIS_PORT')
redis_db = os.environ.get('REDIS_DB')

# redis_host='localhost'
# redis_port=6379
# redis_db=0



class User(BaseModel):
    username: str
    user_id: int
    role: str
    tokenType: str
    token: Optional[str] = Field(None)


class AuthenticationSettings(BaseModel):
    secret: str = public_key
    private_key: str = private_key
    jwt_algorithm: str = ALGORITHM
    expiration_seconds: int = ACCESS_TOKEN_EXPIRE_SECONDS  # 1 hour

class StorageConfig(BaseModel):
    storage_type: str = "redis"
    host: str = redis_host
    port: int = int(redis_port)
    db: int = int(redis_db)


__all__ = ["User", "AuthenticationSettings", "StorageConfig"]