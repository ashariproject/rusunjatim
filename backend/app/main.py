import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database import engine, Base
from .seed_data import seed_database
from .routers import auth_routes, rusun_routes, proyek_routes, persuratan_routes

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inisialisasi skema tabel database dan seeder data
    print("🚀 Inisialisasi Database Rusun Jatim...")
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield

app = FastAPI(
    title="Database Rusun Jatim API",
    description="REST API Dinamis untuk Sistem Database, GIS, Timeline Proyek, dan Persuratan Rusun Jawa Timur (BP3KP).",
    version="2.0.0",
    lifespan=lifespan
)

# Konfigurasi CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router API
app.include_router(auth_routes.router)
app.include_router(rusun_routes.router)
app.include_router(proyek_routes.router)
app.include_router(persuratan_routes.router)

# Mount Direktori Static untuk Upload Dokumen & Foto
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(os.path.join(UPLOAD_DIR, "documents"), exist_ok=True)
os.makedirs(os.path.join(UPLOAD_DIR, "timeline"), exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Mount Foto Rusun Eksisting jika ada
if os.path.exists("images"):
    app.mount("/images", StaticFiles(directory="images"), name="images")

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "online",
        "system": "Database Rusun Jatim API v2.0",
        "domain": "rusunjatim.my.id",
        "database": "PostgreSQL"
    }
