from fastapi import FastAPI
from app.api.routes import router

app = FastAPI(title="PDF Merger API")

app.include_router(router)