from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.auth.jwt_utils import decode_token
from app.db.mongo import get_db
from app.models.domain import APIKey


security_scheme = HTTPBearer(auto_error=False)


async def _get_payload_from_credentials(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),
):
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    token = credentials.credentials
    try:
        payload = decode_token(token)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
    return payload


async def get_current_org_id(
    payload=Depends(_get_payload_from_credentials),
) -> ObjectId:
    org_id = payload.get("orgId")
    if not org_id or not ObjectId.is_valid(org_id):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid organization in token",
        )
    return ObjectId(org_id)


async def get_current_api_key(
    payload=Depends(_get_payload_from_credentials),
    db=Depends(get_db),
) -> APIKey:
    client_id = payload.get("sub")
    if not client_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token subject",
        )
    record = await db["api_keys"].find_one({"client_id": client_id, "is_active": True})
    if not record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key not found or inactive",
        )
    return APIKey(**record)

