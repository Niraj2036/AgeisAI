import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from passlib.context import CryptContext

from app.auth.dependencies import get_current_api_key
from app.db.mongo import get_db
from app.models.domain import APIKey
from app.schemas.auth import (
    ClientCredentialsResponse,
    TokenRequest,
    TokenResponse,
)
from app.auth.jwt_utils import create_access_token


router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.post("/token", response_model=TokenResponse)
async def login_for_access_token(payload: TokenRequest, db=Depends(get_db)):
    record = await db["api_keys"].find_one(
        {"client_id": payload.clientId, "is_active": True}
    )
    if not record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    api_key = APIKey(**record)
    if not pwd_context.verify(payload.clientSecret, api_key.client_secret_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    org_id_str = str(api_key.organization_id)
    token = create_access_token(
        subject=api_key.client_id,
        extra_claims={"orgId": org_id_str},
    )
    return TokenResponse(access_token=token)


@router.get("/credentials", response_model=ClientCredentialsResponse)
async def get_client_credentials(
    api_key: APIKey = Depends(get_current_api_key),
):
    """
    Return the clientId and current clientSecret for the API key represented by the token.
    WARNING: This returns a sensitive secret; restrict access appropriately in deployment.
    """
    # You cannot recover the original plaintext secret from the hash.
    # In this simple implementation we assume you only call this immediately after issuing the token
    # and you have stored the plaintext elsewhere, or you use the refresh endpoint below.
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Reading existing clientSecret is not supported because it is hashed. Use /auth/credentials/refresh to issue a new secret.",
    )


@router.post("/credentials/refresh", response_model=ClientCredentialsResponse)
async def refresh_client_secret(
    api_key: APIKey = Depends(get_current_api_key),
    db=Depends(get_db),
):
    """
    Rotate the clientSecret for the current API key and return the new plaintext secret.
    """
    new_secret = secrets.token_urlsafe(32)
    new_hash = pwd_context.hash(new_secret)

    await db["api_keys"].update_one(
        {"_id": api_key.id},
        {"$set": {"client_secret_hash": new_hash}},
    )

    return ClientCredentialsResponse(
        clientId=api_key.client_id,
        clientSecret=new_secret,
    )

