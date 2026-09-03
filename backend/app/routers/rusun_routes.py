from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from ..database import get_db
from ..models import RusunMaster, User
from ..schemas import RusunResponse, RusunCreate, RusunUpdate, RusunGeoJSON
from ..auth import get_current_user, require_role

router = APIRouter(prefix="/api/rusun", tags=["Master Rusun"])

@router.get("", response_model=List[RusunResponse])
def get_all_rusun(
    skip: int = Query(0, ge=0),
    limit: int = Query(500, ge=1, le=1000),
    kabkota: Optional[str] = None,
    tahun: Optional[int] = None,
    tipe: Optional[str] = None,
    status_koordinat: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(RusunMaster)
    if kabkota:
        query = query.filter(RusunMaster.kabkota.ilike(f"%{kabkota}%"))
    if tahun:
        query = query.filter(RusunMaster.tahun_anggaran == tahun)
    if tipe:
        query = query.filter(RusunMaster.tipe_rusun.ilike(f"%{tipe}%"))
    if status_koordinat:
        query = query.filter(RusunMaster.status_koordinat == status_koordinat)
    if search:
        query = query.filter(
            or_(
                RusunMaster.nama_rusun.ilike(f"%{search}%"),
                RusunMaster.alamat.ilike(f"%{search}%"),
                RusunMaster.kabkota.ilike(f"%{search}%"),
                RusunMaster.penerima.ilike(f"%{search}%")
            )
        )
    return query.order_by(RusunMaster.id.asc()).offset(skip).limit(limit).all()

@router.get("/geojson")
def get_rusun_geojson(db: Session = Depends(get_db)):
    rusun_list = db.query(RusunMaster).filter(
        RusunMaster.latitude.isnot(None),
        RusunMaster.longitude.isnot(None)
    ).all()
    
    features = []
    for r in rusun_list:
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [float(r.longitude), float(r.latitude)]
            },
            "properties": {
                "id": r.id,
                "nama_rusun": r.nama_rusun,
                "kabkota": r.kabkota,
                "alamat": r.alamat,
                "penerima": r.penerima,
                "tahun_anggaran": r.tahun_anggaran,
                "tipe_rusun": r.tipe_rusun,
                "jumlah_lantai": r.jumlah_lantai,
                "jumlah_unit": r.jumlah_unit,
                "status_koordinat": r.status_koordinat,
                "foto_utama": r.foto_utama
            }
        })
    return {"type": "FeatureCollection", "features": features}

@router.get("/stats")
def get_rusun_stats(db: Session = Depends(get_db)):
    total = db.query(RusunMaster).count()
    with_coords = db.query(RusunMaster).filter(RusunMaster.latitude.isnot(None), RusunMaster.longitude.isnot(None)).count()
    verified = db.query(RusunMaster).filter(RusunMaster.status_koordinat == "verified").count()
    need_validation = db.query(RusunMaster).filter(RusunMaster.status_koordinat == "unverified").count()
    missing = total - with_coords
    
    by_kabkota = db.query(
        RusunMaster.kabkota, func.count(RusunMaster.id)
    ).group_by(RusunMaster.kabkota).all()
    
    return {
        "total_rusun": total,
        "with_coordinates": with_coords,
        "verified": verified,
        "need_validation": need_validation,
        "missing": missing,
        "breakdown_kabkota": [{"kabkota": k[0] or "Tidak Diketahui", "count": k[1]} for k in by_kabkota]
    }

@router.get("/{rusun_id}", response_model=RusunResponse)
def get_rusun_detail(rusun_id: int, db: Session = Depends(get_db)):
    rusun = db.query(RusunMaster).filter(RusunMaster.id == rusun_id).first()
    if not rusun:
        raise HTTPException(status_code=404, detail="Rusun tidak ditemukan")
    return rusun

@router.post("", response_model=RusunResponse, dependencies=[Depends(require_role(["admin", "verifikator"]))])
def create_rusun(rusun_in: RusunCreate, db: Session = Depends(get_db)):
    new_rusun = RusunMaster(**rusun_in.dict())
    db.add(new_rusun)
    db.commit()
    db.refresh(new_rusun)
    return new_rusun

@router.put("/{rusun_id}", response_model=RusunResponse, dependencies=[Depends(require_role(["admin", "verifikator", "surveyor"]))])
def update_rusun(rusun_id: int, rusun_in: RusunUpdate, db: Session = Depends(get_db)):
    rusun = db.query(RusunMaster).filter(RusunMaster.id == rusun_id).first()
    if not rusun:
        raise HTTPException(status_code=404, detail="Rusun tidak ditemukan")
    
    update_data = rusun_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(rusun, key, value)
    
    db.commit()
    db.refresh(rusun)
    return rusun

@router.delete("/{rusun_id}", dependencies=[Depends(require_role(["admin"]))])
def delete_rusun(rusun_id: int, db: Session = Depends(get_db)):
    rusun = db.query(RusunMaster).filter(RusunMaster.id == rusun_id).first()
    if not rusun:
        raise HTTPException(status_code=404, detail="Rusun tidak ditemukan")
    db.delete(rusun)
    db.commit()
    return {"message": "Data rusun berhasil dihapus"}
