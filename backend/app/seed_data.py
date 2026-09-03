import os
import json
from datetime import date
from sqlalchemy import text
from sqlalchemy.orm import Session
from .database import engine, Base, SessionLocal
from .models import User, RusunMaster, ProyekOngoing, TimelineEvent, Persuratan
from .auth import get_password_hash

def seed_database():
    Base.metadata.create_all(bind=engine)
    
    # Pastikan tipe kolom tahun_anggaran adalah VARCHAR(50) untuk multi-years budget (misal 2024-2025)
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE rusun_master ALTER COLUMN tahun_anggaran TYPE VARCHAR(50);"))
            conn.commit()
    except Exception:
        pass

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
                instansi="BP3KP - Balai Pelaksana Penyediaan Perumahan dan Kawasan Permukiman Jawa IV"
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            print("✅ Default Admin User created (admin / AdminRusun2026!)")

        # 2. Seed Master Rusun from rusun_data.json
        candidate_paths = [
            os.getenv("DATA_JSON_PATH", "rusun_data.json"),
            "/app/rusun_data.json",
            os.path.join(os.path.dirname(__file__), "..", "rusun_data.json"),
            os.path.join(os.path.dirname(__file__), "..", "..", "rusun_data.json")
        ]
        json_path = None
        for p in candidate_paths:
            if os.path.exists(p):
                json_path = p
                break

        if json_path and db.query(RusunMaster).count() == 0:
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
                        tahun_anggaran=str(item.get("tahun_anggaran")) if item.get("tahun_anggaran") is not None else None,
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
                lokasi_detail="Desa Gejug Jati, Kecamatan Lekok, Kabupaten Pasuruan",
                status_fase="Pengusulan & Kesiapan Lahan",
                progres_fisik_persen=0.0,
                pagu_anggaran=0,
                kontraktor=None,
                konsultan=None,
                deskripsi="Pembangunan Rumah Susun untuk Prajurit TNI AL Pasuruan berlokasi di Desa Gejug Jati, Kecamatan Lekok, Kabupaten Pasuruan. Saat ini dalam proses pemenuhan persyaratan kesiapan lahan dan administrasi usulan."
            )
            db.add(sample_proyek)
            db.commit()
            db.refresh(sample_proyek)
            print("✅ Proyek TNI AL Pasuruan berhasil didaftarkan (data kronologis bersih/kosong).")
        else:
            # Perbarui data eksisting
            sample_proyek.lokasi_detail = "Desa Gejug Jati, Kecamatan Lekok, Kabupaten Pasuruan"
            sample_proyek.status_fase = "Pengusulan & Kesiapan Lahan"
            sample_proyek.progres_fisik_persen = 0.0
            sample_proyek.pagu_anggaran = 0
            sample_proyek.kontraktor = None
            sample_proyek.konsultan = None
            sample_proyek.deskripsi = "Pembangunan Rumah Susun untuk Prajurit TNI AL Pasuruan berlokasi di Desa Gejug Jati, Kecamatan Lekok, Kabupaten Pasuruan. Saat ini dalam proses pemenuhan persyaratan kesiapan lahan dan administrasi usulan."
            
            # Kosongkan riwayat dummy agar siap diinput data riil berbasis waktu
            db.query(TimelineEvent).filter(TimelineEvent.proyek_id == sample_proyek.id).delete()
            db.query(Persuratan).filter(Persuratan.proyek_id == sample_proyek.id).delete()
            db.commit()
            print("✅ Data proyek TNI AL Pasuruan diperbarui: lokasi Desa Gejug Jati Lekok, pagu/kontraktor dinonaktifkan, data kronologis dikosongkan.")

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
