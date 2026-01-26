from pydantic import BaseModel

class UserAuth(BaseModel):
    username: str
    password: str

class UserSignup(BaseModel):
    username: str
    email: str
    phone: str
    gender: str
    address: str
    password: str
    confirm_password: str