from pydantic import BaseModel

class UserSignup(BaseModel):
    username: str
    email: str
    phone: str
    gender: str
    address: str
    password: str
    confirm_password: str

class UserLogin(BaseModel):
    username: str
    password: str