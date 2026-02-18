from pydantic import BaseModel


class TokenRequest(BaseModel):
    clientId: str
    clientSecret: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ClientCredentialsResponse(BaseModel):
    clientId: str
    clientSecret: str


