"""Price service endpoints: manual refresh and cache status."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User
from app.utils.security import get_current_user
from app.redis import get_redis
from app.celery_app import celery

router = APIRouter(prefix="/prices", tags=["prices"])


@router.post("/refresh")
async def refresh_prices(
    current_user: User = Depends(get_current_user),
):
    """Manually trigger a current-price fetch for all held tickers."""
    task = celery.send_task("fetch_current_prices")
    return {"status": "queued", "task_id": task.id}


@router.get("/status")
async def price_status(
    current_user: User = Depends(get_current_user),
    redis=Depends(get_redis),
):
    """Check cache warmth and last update time."""
    # Count cached price keys
    cursor = "0"
    cached_count = 0
    last_updated = None

    # Scan for price:* keys
    while True:
        cursor, keys = await redis.scan(cursor=cursor, match="price:*", count=100)
        cached_count += len(keys)

        # Sample one key for last_updated timestamp
        if keys and not last_updated:
            import json
            raw = await redis.get(keys[0])
            if raw:
                data = json.loads(raw)
                last_updated = data.get("last_updated")

        if cursor == 0 or cursor == "0":
            break

    return {
        "cached_tickers": cached_count,
        "last_updated": last_updated,
        "cache_ttl_seconds": 900,
    }
