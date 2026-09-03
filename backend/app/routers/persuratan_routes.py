import os
import uuid
import shutil
from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Persuratan, ProyekOngoing, User
from ..schemas import PersuratanResponse
from ..auth import get_current_user, require_role

router = APIRouter(prefix="/api/persuratan", tags=["Persuratan Cepat"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
SURAT_DIR = os.path.join(UPLOAD_DIR, "documents")
os.makedirs(SURAT_DIR, exist_ok=True)

@router.get("/proyek/{proyek_id}", response_model=List[PersuratanResponse])
def get_persuratan_by_proyek(proyek_id: str, db: Session = Depends(get_db)):
    return db.query(Persuratan).filter(Persuratan.proyek_id == proyek_id).order_by(Persuratan.tgl_surat.desc()).all()

@router.post("/upload", response_model=PersuratanResponse)
async def upload_persuratan_cepat(
    proyek_id: str = Form(...),
    no_surat: str = Form(...),
    tgl_surat: date = Form(...),
    jenis_surat: str = Form(...),
    perihal: str = Form(...),
    pengirim: Optional[str] = Form(None),
    status_disposisi: Optional[str] = Form("Masuk"),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "verifikator", "surveyor"]))
):
    proyek = db.query(ProyekOngoing).filter(ProyekOngoing.id == proyek_id).first()
    if not proyek:
        raise HTTPException(status_code=404, detail="Proyek tidak ditemukan")
    
    file_rel_path = None
    if file and file.filename:
        ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{ext}"
        destination = os.path.join(SURAT_DIR, unique_filename)
        with open(destination, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        file_rel_path = f"/uploads/documents/{unique_filename}"
    
    new_surat = Persuratan(
        proyek_id=proyek.id,
        no_surat=no_surat,
        tgl_surat=tgl_surat,
        jenis_surat=jenis_surat,
        pengirim=pengirim,
        perihal=perihal,
        file_path=file_rel_path,
        status_disposisi=status_disposisi,
        uploaded_by_id=current_user.id
    )
    
    db.add(new_surat)
    db.commit()
    db.refresh(new_surat)
    return new_surat

@router.delete("/{surat_id}", dependencies=[Depends(require_role(["admin", "verifikator"]))])
def delete_persuratan(surat_id: str, db: Session = Depends(get_db)):
    surat = db.query(Persuratan).filter(Persuratan.id == surat_id).first()
    if not surat:
        raise HTTPException(status_code=404, detail="Data persuratan tidak ditemukan")
    
    if surat.file_path:
        local_path = surat.file_path.replace("/uploads/", "uploads/")
        if os.path.exists(local_path):
            try:
                os.remove(local_path)
            except Exception:
                pass
                
    db.delete(surat)
    db.commit()
    return {"message": "Data persuratan berhasil dihapus"}
