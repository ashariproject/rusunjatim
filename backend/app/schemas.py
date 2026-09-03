from datetime import date, datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field

# --- User & Auth Schemas ---
class UserBase(BaseModel):
    username: str
    email: str
    nama_lengkap: Optional[str] = None
    role: str = "viewer"
    instansi: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

# --- Rusun Master Schemas ---
class RusunBase(BaseModel):
    tahun_anggaran: Optional[Any] = None
    nama_paket: Optional[str] = None
    nama_rusun: str
    alamat: Optional[str] = None
    kabkota: Optional[str] = None
    penerima: Optional[str] = None
    tipe_rusun: Optional[str] = None
    varian: Optional[str] = None
    jumlah_lantai: Optional[int] = None
    jumlah_tower: Optional[int] = None
    jumlah_unit: Optional[int] = None
    kapasitas_hunian: Optional[str] = None
    kondisi_bangunan: Optional[str] = None
    status_lahan: Optional[str] = None
    asset_satker: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status_koordinat: Optional[str] = "missing"
    foto_utama: Optional[str] = None
    status_alih_status: Optional[str] = None

class RusunCreate(RusunBase):
    pass

class RusunUpdate(BaseModel):
    tahun_anggaran: Optional[Any] = None
    nama_paket: Optional[str] = None
    nama_rusun: Optional[str] = None
    alamat: Optional[str] = None
    kabkota: Optional[str] = None
    penerima: Optional[str] = None
    tipe_rusun: Optional[str] = None
    varian: Optional[str] = None
    jumlah_lantai: Optional[int] = None
    jumlah_tower: Optional[int] = None
    jumlah_unit: Optional[int] = None
    kapasitas_hunian: Optional[str] = None
    kondisi_bangunan: Optional[str] = None
    status_lahan: Optional[str] = None
    asset_satker: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status_koordinat: Optional[str] = None
    foto_utama: Optional[str] = None
    status_alih_status: Optional[str] = None

class RusunResponse(RusunBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Timeline Schemas ---
class TimelineEventBase(BaseModel):
    tanggal: date
    fase: str
    judul: str
    catatan: Optional[str] = None
    progres_saat_ini: Optional[float] = None
    lampiran_url: Optional[str] = None

class TimelineEventCreate(TimelineEventBase):
    proyek_id: str

class TimelineEventResponse(TimelineEventBase):
    id: str
    proyek_id: str
    created_by_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Persuratan Schemas ---
class PersuratanBase(BaseModel):
    no_surat: str
    tgl_surat: date
    jenis_surat: str
    pengirim: Optional[str] = None
    perihal: str
    status_disposisi: Optional[str] = "Masuk"

class PersuratanCreate(PersuratanBase):
    proyek_id: str

class PersuratanResponse(PersuratanBase):
    id: str
    proyek_id: str
    file_path: Optional[str] = None
    uploaded_by_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Proyek Ongoing Schemas ---
class ProyekBase(BaseModel):
    rusun_id: Optional[int] = None
    kode_proyek: str
    nama_proyek: str
    tahun: int
    slug: str
    kabkota: Optional[str] = None
    lokasi_detail: Optional[str] = None
    status_fase: Optional[str] = "Usulan"
    progres_fisik_persen: Optional[float] = 0.0
    pagu_anggaran: Optional[int] = 0
    kontraktor: Optional[str] = None
    konsultan: Optional[str] = None
    deskripsi: Optional[str] = None

class ProyekCreate(ProyekBase):
    pass

class ProyekResponse(ProyekBase):
    id: str
    created_at: datetime
    updated_at: datetime
    timelines: List[TimelineEventResponse] = []
    surat_list: List[PersuratanResponse] = []

    class Config:
        from_attributes = True

# --- Stats & GeoJSON Schemas ---
class RusunGeoFeature(BaseModel):
    type: str = "Feature"
    geometry: dict
    properties: dict

class RusunGeoJSON(BaseModel):
    type: str = "FeatureCollection"
    features: List[RusunGeoFeature]
