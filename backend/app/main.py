from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine
from app.redis import redis_client
from app.api.v1 import auth, users, onboarding, holdings, asset_classes, transactions, csv_import, portfolio, dashboard, prices


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    yield
    # Shutdown
    await engine.dispose()
    await redis_client.close()


app = FastAPI(title="Invest.me API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(onboarding.router, prefix="/api/v1")
app.include_router(holdings.router, prefix="/api/v1")
app.include_router(asset_classes.router, prefix="/api/v1")
app.include_router(transactions.router, prefix="/api/v1")
app.include_router(csv_import.router, prefix="/api/v1")
app.include_router(portfolio.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(prices.router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"message": "Invest.me API"}


@app.get("/health")
async def health():
    return {"status": "ok"}
