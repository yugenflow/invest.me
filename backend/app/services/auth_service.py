import uuid
from datetime import timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from app.models.user import User
from app.utils.security import (
    hash_password, verify_password, create_access_token, create_refresh_token, decode_token,
)
from app.redis import redis_client
from app.config import settings


async def signup(db: AsyncSession, email: str, password: str, full_name: str) -> User:
    existing = await db.execute(select(User).where(User.email == email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        email=email,
        password_hash=hash_password(password),
        full_name=full_name,
    )
    db.add(user)
    await db.flush()
    return user


async def login(db: AsyncSession, email: str, password: str) -> tuple[User, str, str]:
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return user, access_token, refresh_token


async def refresh_tokens(refresh_token_str: str) -> tuple[str, str]:
    payload = decode_token(refresh_token_str)

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")

    jti = payload.get("jti")
    if jti:
        blacklisted = await redis_client.get(f"blacklist:{jti}")
        if blacklisted:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has been revoked")
        # Blacklist old refresh token (rotation)
        ttl = settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400
        await redis_client.setex(f"blacklist:{jti}", ttl, "1")

    user_id = payload.get("sub")
    new_access = create_access_token({"sub": user_id})
    new_refresh = create_refresh_token({"sub": user_id})

    return new_access, new_refresh


async def logout(refresh_token_str: str) -> None:
    payload = decode_token(refresh_token_str)
    jti = payload.get("jti")
    if jti:
        ttl = settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400
        await redis_client.setex(f"blacklist:{jti}", ttl, "1")
