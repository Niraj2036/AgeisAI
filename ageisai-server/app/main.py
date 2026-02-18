import asyncio
import logging
import contextlib
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.logging_middleware import logging_middleware
from app.db.mongo import connect_to_mongo, close_mongo_connection
from app.api.routes.auth import router as auth_router
from app.api.routes.ingest import router as ingest_router
from app.api.routes.dashboard import router as dashboard_router
from app.workers.background import start_periodic_tasks, stop_periodic_tasks


settings = get_settings()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("aegisai")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    periodic_task = asyncio.create_task(start_periodic_tasks())
    try:
        yield
    finally:
        await stop_periodic_tasks()
        periodic_task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await periodic_task
        await close_mongo_connection()


app = FastAPI(
    title=settings.app_name,
    lifespan=lifespan,
)

app.middleware("http")(logging_middleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(ingest_router, prefix="/ingest", tags=["ingest"])
app.include_router(dashboard_router, prefix="/dashboard", tags=["dashboard"])


@app.get("/health", tags=["system"])
async def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

