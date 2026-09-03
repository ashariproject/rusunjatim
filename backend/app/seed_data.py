import os
import json
from datetime import date
from sqlalchemy.orm import Session
from .database import engine, Base, SessionLocal
from .models import User, RusunMaster, ProyekOngoing, TimelineEvent, Persuratan
from .auth import get_password_hash

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    
    try:
        # 1. Seed Admin User
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            admin_pwd = os.getenv("DEFAULT_ADMIN_PASSWORD", "AdminRusun2026!")
            admin_user = User(
                username="admin",
                email="admin@rusunjatim.my.id",
                password_hash=get_password_hash(admin_pwd),
                nama_lengkap="Administrator BP3KP Jatim",
                role="admin",
                instansi="BP3KP Jawa Timur"
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            print("✅ Default Admin User created (admin / AdminRusun2026!)")

        # 2. Seed Master Rusun from rusun_data.json
        json_path = os.getenv("DATA_JSON_PATH", "rusun_data.json")
        if not os.path.exists(json_path):
            json_path = os.path.join(os.path.dirname(__file__), "..", "..", "rusun_data.json")

        if os.path.exists(json_path) and db.query(RusunMaster).count() == 0:
            print(f"📦 Loading rusun data from {json_path}...")
            with open(json_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                rusun_list = data.get("rusun", [])
                
                for item in rusun_list:
                    coords = item.get("koordinat", {}) or {}
                    lat = coords.get("lat")
                    lng = coords.get("lng")
                    status_coord = coords.get("status", "missing")
                    
                    rusun_entry = RusunMaster(
                        id=item.get("id"),
                        tahun_anggaran=item.get("tahun_anggaran"),
                        nama_paket=item.get("nama_paket"),
                        nama_rusun=item.get("nama_rusun", "Tanpa Nama"),
                        alamat=item.get("alamat"),
                        kabkota=item.get("kabkota"),
                        penerima=item.get("penerima"),
                        tipe_rusun=str(item.get("tipe_rusun")) if item.get("tipe_rusun") is not None else None,
                        varian=str(item.get("varian")) if item.get("varian") is not None else None,
                        jumlah_lantai=int(item.get("jumlah_lantai")) if item.get("jumlah_lantai") is not None else None,
                        jumlah_tower=int(item.get("jumlah_tower")) if item.get("jumlah_tower") is not None else None,
                        jumlah_unit=int(item.get("jumlah_unit")) if item.get("jumlah_unit") is not None else None,
                        kapasitas_hunian=str(item.get("kapasitas_hunian")) if item.get("kapasitas_hunian") is not None else None,
                        kondisi_bangunan=item.get("kondisi_bangunan"),
                        status_lahan=item.get("status_lahan"),
                        asset_satker=item.get("asset_satker"),
                        latitude=lat,
                        longitude=lng,
                        status_koordinat=status_coord,
                        foto_utama=f"images/rusun/{item.get('id')}.jpg" if os.path.exists(f"images/rusun/{item.get('id')}.jpg") else None
                    )
                    db.add(rusun_entry)
                
                db.commit()
                print(f"✅ Successfully imported {len(rusun_list)} rusun records to PostgreSQL!")

        # 3. Seed Sample Proyek Ongoing (e.g. 2026/tnialpasuruan)
        sample_proyek = db.query(ProyekOngoing).filter(
            ProyekOngoing.tahun == 2026,
            ProyekOngoing.slug == "tnialpasuruan"
        ).first()

        if not sample_proyek:
            sample_proyek = ProyekOngoing(
                kode_proyek="PRJ-2026-TNI-PAS",
                nama_proyek="Pembangunan Rumah Susun TNI AL Pasuruan",
                tahun=2026,
                slug="tnialpasuruan",
                kabkota="Kab. Pasuruan",
                lokasi_detail="Kompleks TNI AL Grati, Pasuruan",
                status_fase="Konstruksi",
                progres_fisik_persen=62.50,
                pagu_anggaran=18500000000,
                kontraktor="PT. Karya Cipta Utama",
                konsultan="PT. Perencana Estetika Mandiri",
                deskripsi="Pembangunan Rumah Susun 3 Lantai untuk Prajurit TNI AL Pasuruan guna meningkatkan kesejahteraan hunian prajurit dan keluarga."
            )
            db.add(sample_proyek)
            db.commit()
            db.refresh(sample_proyek)

            # Timeline Milestones
            timelines = [
                TimelineEvent(
                    proyek_id=sample_proyek.id,
                    tanggal=date(2025, 8, 15),
                    fase="Usulan",
                    judul="Surat Usulan Permohonan Rusun Masuk",
                    catatan="Penerimaan surat usulan resmi permohonan bantuan pembangunan Rusun TNI AL Pasuruan kepada Kementerian PKP / Dinas Perumahan.",
                    progres_saat_ini=0.0,
                    created_by_id=admin_user.id
                ),
                TimelineEvent(
                    proyek_id=sample_proyek.id,
                    tanggal=date(2025, 10, 10),
                    fase="Verifikasi",
                    judul="Verifikasi Lapangan & Kesiapan Lahan",
                    catatan="Tim Verifikasi BP3KP melaksanakan peninjauan langsung ke lokasi kesiapan lahan di Grati Pasuruan. Status lahan dinyatakan Clean & Clear (Sertifikat Hak Pakai TNI AL).",
                    progres_saat_ini=10.0,
                    created_by_id=admin_user.id
                ),
                TimelineEvent(
                    proyek_id=sample_proyek.id,
                    tanggal=date(2025, 12, 5),
                    fase="Perencanaan",
                    judul="Penyelesaian Dokumen DED & RAB",
                    catatan="Detail Engineering Design (DED) disetujui, spesifikasi 3 Lantai Type 36 dengan kapasitas 44 unit hunian keluarga.",
                    progres_saat_ini=25.0,
                    created_by_id=admin_user.id
                ),
                TimelineEvent(
                    proyek_id=sample_proyek.id,
                    tanggal=date(2026, 2, 20),
                    fase="Konstruksi",
                    judul="Groundbreaking & Pekerjaan Struktur Lantai 2",
                    catatan="Pekerjaan pondasi tiang pancang dan struktur lantai 1 selesai 100%. Saat ini pengerjaan pengecoran plat lantai 2 dan kolom.",
                    progres_saat_ini=62.50,
                    created_by_id=admin_user.id
                )
            ]
            db.add_all(timelines)

            # Persuratan Awal
            surat_entries = [
                Persuratan(
                    proyek_id=sample_proyek.id,
                    no_surat="B/142/VIII/2025/TNI-AL",
                    tgl_surat=date(2025, 8, 10),
                    jenis_surat="Surat Permohonan Usulan",
                    pengirim="Komandan Lanal Pasuruan",
                    perihal="Permohonan Bantuan Pembangunan Rumah Susun Prajurit TNI AL TA 2026",
                    status_disposisi="Disetujui",
                    uploaded_by_id=admin_user.id
                ),
                Persuratan(
                    proyek_id=sample_proyek.id,
                    no_surat="600/BA.12/BP3KP/2025",
                    tgl_surat=date(2025, 10, 12),
                    jenis_surat="Berita Acara Verifikasi Lapangan",
                    pengirim="Tim Teknis Verifikasi BP3KP Jatim",
                    perihal="Berita Acara Hasil Peninjauan Lapangan Kesiapan Lahan Calon Lokasi Rusun",
                    status_disposisi="Selesai",
                    uploaded_by_id=admin_user.id
                ),
                Persuratan(
                    proyek_id=sample_proyek.id,
                    no_surat="HK.02.01/SPK/BP3KP/04/2026",
                    tgl_surat=date(2026, 1, 15),
                    jenis_surat="Surat Perjanjian Kerja (Kontrak)",
                    pengirim="PPK Rusun BP3KP Jatim",
                    perihal="Kontrak Pelaksanaan Pekerjaan Konstruksi Rusun TNI AL Pasuruan TA 2026",
                    status_disposisi="Arsip",
                    uploaded_by_id=admin_user.id
                )
            ]
            db.add_all(surat_entries)
            db.commit()
            print("✅ Sample Proyek Ongoing (2026/tnialpasuruan) seeded successfully!")

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
