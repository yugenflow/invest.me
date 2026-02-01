from celery import Celery
from celery.schedules import crontab
import os

celery = Celery(
    "invest_me",
    broker=os.getenv("CELERY_BROKER_URL", "redis://redis:6379/1"),
    backend=os.getenv("CELERY_BROKER_URL", "redis://redis:6379/1"),
    include=["app.tasks.price_tasks"],
)

celery.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    beat_schedule={
        "fetch-current-prices-every-15-min": {
            "task": "fetch_current_prices",
            "schedule": 900.0,  # 15 minutes
        },
        "fetch-eod-prices-daily": {
            "task": "fetch_eod_prices",
            "schedule": crontab(hour=16, minute=30),  # 16:30 UTC (after IN + US close)
        },
    },
)
