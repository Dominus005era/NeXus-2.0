from typing import Optional

import httpx
from fastapi import Header, HTTPException
from pydantic import BaseModel

from app.core.config import settings


class AuthenticatedUser(BaseModel):
    id: str
    email: Optional[str] = None
    role: Optional[str] = None


async def get_current_user(authorization: Optional[str] = Header(None)) -> AuthenticatedUser:
    if settings.NEXUS_AUTH_DISABLED:
        return AuthenticatedUser(id="dev-user", email="dev@localhost", role="authenticated")

    if not settings.supabase_configured:
        raise HTTPException(
            status_code=503,
            detail="Supabase Auth is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY.",
        )

    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token.")

    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Empty bearer token.")

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{settings.supabase_base_url}/auth/v1/user",
                headers={
                    "apikey": settings.SUPABASE_ANON_KEY,
                    "Authorization": f"Bearer {token}",
                },
            )
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Could not reach Supabase Auth.")

    if response.status_code == 401:
        raise HTTPException(status_code=401, detail="Invalid or expired session.")
    if response.status_code != 200:
        raise HTTPException(status_code=503, detail="Supabase Auth verification failed.")

    payload = response.json()
    user_id = payload.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Supabase token did not contain a user.")

    metadata = payload.get("user_metadata") or {}
    return AuthenticatedUser(
        id=str(user_id),
        email=payload.get("email"),
        role=metadata.get("role"),
    )
