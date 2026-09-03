import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, Numeric, Boolean, 
    DateTime, Date, ForeignKey, BigInteger
)
from sqlalchemy.orm import relationship
from .database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    nama_lengkap = Column(String(100), nullable=True)
    role = Column(String(30), default="viewer", nullable=False)  # admin, verifikator, surveyor, viewer
    instansi = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relasi
    timeline_entries = relationship("TimelineEvent", back_populates="creator")
    surat_entries = relationship("Persuratan", back_populates="uploader")

class RusunMaster(Base):
    __tablename__ = "rusun_master"

    id = Column(Integer, primary_key=True, index=True)
    tahun_anggaran = Column(Integer, index=True, nullable=True)
    nama_paket = Column(String(255), nullable=True)
    nama_rusun = Column(String(255), nullable=False, index=True)
    alamat = Column(Text, nullable=True)
    kabkota = Column(String(100), index=True, nullable=True)
    penerima = Column(String(100), index=True, nullable=True)
    tipe_rusun = Column(String(50), nullable=True)
    varian = Column(String(50), nullable=True)
    jumlah_lantai = Column(Integer, nullable=True)
    jumlah_tower = Column(Integer, nullable=True)
    jumlah_unit = Column(Integer, nullable=True)
    kapasitas_hunian = Column(String(100), nullable=True)
    kondisi_bangunan = Column(String(100), nullable=True)
    status_lahan = Column(String(100), nullable=True)
    asset_satker = Column(String(100), nullable=True)
    
    # Koordinat Spasial
    latitude = Column(Numeric(10, 7), nullable=True)
    longitude = Column(Numeric(10, 7), nullable=True)
    status_koordinat = Column(String(30), default="missing", index=True)  # verified, unverified, missing
    
    # Media & Alih Status
    foto_utama = Column(String(255), nullable=True)
    status_alih_status = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relasi
    proyek_list = relationship("ProyekOngoing", back_populates="rusun")
    dokumen_list = relationship("DokumenMedia", back_populates="rusun")

class ProyekOngoing(Base):
    __tablename__ = "proyek_ongoing"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    rusun_id = Column(Integer, ForeignKey("rusun_master.id", ondelete="SET NULL"), nullable=True)
    kode_proyek = Column(String(50), unique=True, index=True, nullable=False)
    nama_proyek = Column(String(255), nullable=False)
    tahun = Column(Integer, index=True, nullable=False)
    slug = Column(String(100), index=True, nullable=False)  # contoh: tnialpasuruan
    kabkota = Column(String(100), nullable=True)
    lokasi_detail = Column(Text, nullable=True)
    status_fase = Column(String(50), default="Usulan", index=True)  # Usulan, Verifikasi, Perencanaan, Lelang, Konstruksi, Serah Terima, Selesai
    progres_fisik_persen = Column(Numeric(5, 2), default=0.0)
    pagu_anggaran = Column(BigInteger, default=0)
    kontraktor = Column(String(150), nullable=True)
    konsultan = Column(String(150), nullable=True)
    deskripsi = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relasi
    rusun = relationship("RusunMaster", back_populates="proyek_list")
    timelines = relationship("TimelineEvent", back_populates="proyek", cascade="all, delete-orphan", order_by="TimelineEvent.tanggal.asc()")
    surat_list = relationship("Persuratan", back_populates="proyek", cascade="all, delete-orphan", order_by="Persuratan.tgl_surat.desc()")
    dokumen_list = relationship("DokumenMedia", back_populates="proyek", cascade="all, delete-orphan")

class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    proyek_id = Column(String(36), ForeignKey("proyek_ongoing.id", ondelete="CASCADE"), nullable=False, index=True)
    tanggal = Column(Date, nullable=False)
    fase = Column(String(50), nullable=False)  # Usulan, Verifikasi, DED, Lelang, Konstruksi, Serah Terima
    judul = Column(String(200), nullable=False)
    catatan = Column(Text, nullable=True)
    progres_saat_ini = Column(Numeric(5, 2), nullable=True)
    lampiran_url = Column(String(255), nullable=True)
    created_by_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relasi
    proyek = relationship("ProyekOngoing", back_populates="timelines")
    creator = relationship("User", back_populates="timeline_entries")

class Persuratan(Base):
    __tablename__ = "persuratan"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    proyek_id = Column(String(36), ForeignKey("proyek_ongoing.id", ondelete="CASCADE"), nullable=False, index=True)
    no_surat = Column(String(100), nullable=False, index=True)
    tgl_surat = Column(Date, nullable=False)
    jenis_surat = Column(String(100), nullable=False)  # Usulan Bupati, Rekomtek, BA Verifikasi, SK, Kontrak, BAST, dll.
    pengirim = Column(String(150), nullable=True)
    perihal = Column(Text, nullable=False)
    file_path = Column(String(255), nullable=True)
    status_disposisi = Column(String(50), default="Masuk")  # Masuk, Diproses, Disetujui, Arsip
    uploaded_by_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relasi
    proyek = relationship("ProyekOngoing", back_populates="surat_list")
    uploader = relationship("User", back_populates="surat_entries")

class DokumenMedia(Base):
    __tablename__ = "dokumen_media"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    proyek_id = Column(String(36), ForeignKey("proyek_ongoing.id", ondelete="CASCADE"), nullable=True, index=True)
    rusun_id = Column(Integer, ForeignKey("rusun_master.id", ondelete="CASCADE"), nullable=True, index=True)
    kategori = Column(String(50), nullable=False)  # Foto Fisik, Gambar DED, SK Penetapan, BA Verifikasi, Dokumen Lain
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(255), nullable=False)
    file_size = Column(BigInteger, nullable=True)
    mime_type = Column(String(50), nullable=True)
    uploaded_by_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relasi
    proyek = relationship("ProyekOngoing", back_populates="dokumen_list")
    rusun = relationship("RusunMaster", back_populates="dokumen_list")
