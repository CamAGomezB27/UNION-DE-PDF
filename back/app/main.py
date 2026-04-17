from fastapi import FastAPI
from app.api.routes import router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="PDF Merger API")

app.include_router(router)

origins = [
    "http://localhost:5173",  # Vite
    "http://localhost:3000",  # Next (por si acaso)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # o ["*"] para pruebas
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)