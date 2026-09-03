from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import ProyekOngoing, TimelineEvent, User
from ..schemas import (
    ProyekResponse, ProyekCreate, 
    TimelineEventResponse, TimelineEventCreate
)
from ..auth import get_current_user, require_role
import os
import shutil
import uuid

router = APIRouter(prefix="/api/proyek", tags=["Proyek Ongoing & Timeline"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(os.path.join(UPLOAD_DIR, "timeline"), exist_ok=True)

@router.get("", response_model=List[ProyekResponse])
def get_all_proyek(
    tahun: Optional[int] = None,
    status_fase: Optional[str] = None,
    kabkota: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ProyekOngoing)
    if tahun:
        query = query.filter(ProyekOngoing.tahun == tahun)
    if status_fase:
        query = query.filter(ProyekOngoing.status_fase == status_fase)
    if kabkota:
        query = query.filter(ProyekOngoing.kabkota.ilike(f"%{kabkota}%"))
    return query.order_by(ProyekOngoing.tahun.desc(), ProyekOngoing.created_at.desc()).all()

@router.get("/{tahun}/{slug}", response_model=ProyekResponse)
def get_proyek_by_tahun_and_slug(tahun: int, slug: str, db: Session = Depends(get_db)):
    proyek = db.query(ProyekOngoing).filter(
        ProyekOngoing.tahun == tahun,
        ProyekOngoing.slug == slug
    ).first()
    if not proyek:
        raise HTTPException(status_code=404, detail=f"Proyek '{slug}' pada tahun {tahun} tidak ditemukan")
    return proyek

@router.post("", response_model=ProyekResponse, dependencies=[Depends(require_role(["admin", "verifikator"]))])
def create_proyek(proyek_in: ProyekCreate, db: Session = Depends(get_db)):
    # Check duplicate
    existing = db.query(ProyekOngoing).filter(
        ProyekOngoing.tahun == proyek_in.tahun,
        ProyekOngoing.slug == proyek_in.slug
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug proyek sudah ada pada tahun tersebut")
    
    new_proyek = ProyekOngoing(**proyek_in.dict())
    db.add(new_proyek)
    db.commit()
    db.refresh(new_proyek)
    return new_proyek

# --- Quick Timeline Log Entry ---
@router.post("/{proyek_id}/timeline", response_model=TimelineEventResponse)
def add_timeline_event(
    proyek_id: str,
    event_in: TimelineEventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "verifikator", "surveyor"]))
):
    proyek = db.query(ProyekOngoing).filter(ProyekOngoing.id == proyek_id).first()
    if not proyek:
        raise HTTPException(status_code=404, detail="Proyek tidak ditemukan")
    
    new_event = TimelineEvent(
        proyek_id=proyek.id,
        tanggal=event_in.tanggal,
        fase=event_in.fase,
        judul=event_in.judul,
        catatan=event_in.catatan,
        progres_saat_ini=event_in.progres_saat_ini,
        lampiran_url=event_in.lampiran_url,
        created_by_id=current_user.id
    )
    
    # Auto-update status fase & progres proyek jika ada progres baru
    if event_in.progres_saat_ini is not None:
        proyek.progres_fisik_persen = event_in.progres_saat_ini
    if event_in.fase:
        proyek.status_fase = event_in.fase
        
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return new_event

@router.delete("/timeline/{event_id}", dependencies=[Depends(require_role(["admin", "verifikator"]))])
def delete_timeline_event(event_id: str, db: Session = Depends(get_db)):
    event = db.query(TimelineEvent).filter(TimelineEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event timeline tidak ditemukan")
    db.delete(event)
    db.commit()
    return {"message": "Event timeline berhasil dihapus"}
