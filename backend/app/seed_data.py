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
    
    # Pastikan tipe kolom tahun_anggaran dan kolom keywords tersedia
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE rusun_master ALTER COLUMN tahun_anggaran TYPE VARCHAR(50);"))
            conn.execute(text("ALTER TABLE timeline_events ADD COLUMN IF NOT EXISTS keywords VARCHAR(255);"))
            conn.execute(text("ALTER TABLE persuratan ADD COLUMN IF NOT EXISTS keywords VARCHAR(255);"))
            conn.commit()
    except Exception:
        pass

    db: Session = SessionLocal()
    
    try:
        # 1. Seed / Update Admin User
        admin_pwd = os.getenv("DEFAULT_ADMIN_PASSWORD", "admin12345")
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
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
            print("✅ Default Admin User created (admin / admin12345)")
        else:
            admin_user.password_hash = get_password_hash(admin_pwd)
            db.commit()
            print("✅ Admin User password updated to admin12345")

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

        # Sync update koordinat dari rusun_data.json ke PostgreSQL
        if json_path:
            with open(json_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                rusun_list = data.get("rusun", [])
                synced_count = 0
                for item in rusun_list:
                    coords = item.get("koordinat", {}) or {}
                    lat = coords.get("lat")
                    lng = coords.get("lng")
                    status_coord = coords.get("status", "missing")
                    if lat is not None and lng is not None:
                        r_db = db.query(RusunMaster).filter(RusunMaster.id == item.get("id")).first()
                        if r_db and (r_db.latitude != lat or r_db.longitude != lng or r_db.status_koordinat != status_coord):
                            r_db.latitude = lat
                            r_db.longitude = lng
                            r_db.status_koordinat = status_coord
                            synced_count += 1
                if synced_count > 0:
                    db.commit()
                    print(f"✅ Berhasil menyinkronkan {synced_count} koordinat rusun ke PostgreSQL!")

        # 3. Seed Proyek Ongoing Rusun TNI AL Pasuruan & Data Kronologis Lengkap
        try:
            from .proyek_tni_al_data import TNI_AL_CHRONOLOGY_DATA
        except ImportError:
            TNI_AL_CHRONOLOGY_DATA = []

        sample_proyek = db.query(ProyekOngoing).filter(
            ProyekOngoing.tahun == 2026,
            ProyekOngoing.slug == "tnialpasuruan"
        ).first()

        deskripsi_proyek = (
            "Pembangunan Rumah Susun untuk Prajurit TNI AL Pasuruan berlokasi di Desa Gejugjati, "
            "Kecamatan Lekok, Kabupaten Pasuruan. Saat ini dalam proses pembentukan Kelompok Kerja "
            "Pemilihan Jatim II UKPBJ-PKP 2026 dan persiapan E-Purchasing katalog elektronik."
        )

        if not sample_proyek:
            sample_proyek = ProyekOngoing(
                kode_proyek="PRJ-2026-TNI-PAS",
                nama_proyek="Pembangunan Rumah Susun TNI AL Pasuruan",
                tahun=2026,
                slug="tnialpasuruan",
                kabkota="Kab. Pasuruan",
                lokasi_detail="Desa Gejugjati, Kecamatan Lekok, Kabupaten Pasuruan",
                status_fase="Penyiapan E-Purchasing / Pokja UKPBJ",
                progres_fisik_persen=0.0,
                pagu_anggaran=47995000000,
                kontraktor=None,
                konsultan=None,
                deskripsi=deskripsi_proyek
            )
            db.add(sample_proyek)
            db.commit()
            db.refresh(sample_proyek)
            print("✅ Proyek TNI AL Pasuruan berhasil didaftarkan.")
        else:
            # Perbarui data eksisting
            sample_proyek.lokasi_detail = "Desa Gejugjati, Kecamatan Lekok, Kabupaten Pasuruan"
            sample_proyek.status_fase = "Penyiapan E-Purchasing / Pokja UKPBJ"
            sample_proyek.progres_fisik_persen = 0.0
            sample_proyek.pagu_anggaran = 47995000000
            sample_proyek.kontraktor = None
            sample_proyek.konsultan = None
            sample_proyek.deskripsi = deskripsi_proyek
            db.commit()

        # Seed data kronologis (Timeline Events & Persuratan)
        if TNI_AL_CHRONOLOGY_DATA:
            # Bersihkan data lama untuk proyek ini
            db.query(TimelineEvent).filter(TimelineEvent.proyek_id == sample_proyek.id).delete()
            db.query(Persuratan).filter(Persuratan.proyek_id == sample_proyek.id).delete()
            db.commit()

            for item in TNI_AL_CHRONOLOGY_DATA:
                tgl = date.fromisoformat(item["tanggal"])
                
                # Format catatan lengkap
                catatan_full = item["keterangan"]
                if item.get("nomor_dokumen"):
                    catatan_full = f"[No: {item['nomor_dokumen']}]\n" + catatan_full
                if item.get("bukti_dukung"):
                    catatan_full += f"\n[Bukti Dukung: {item['bukti_dukung']}]"

                # Tambah ke Timeline Events
                tl_event = TimelineEvent(
                    proyek_id=sample_proyek.id,
                    tanggal=tgl,
                    fase=item["fase"],
                    judul=f"#{item['no']} {item['judul']}",
                    catatan=catatan_full,
                    progres_saat_ini=0.0,
                    lampiran_url=f"/uploads/documents/{item['bukti_dukung']}" if item.get("bukti_dukung") else None,
                    keywords=item.get("keywords")
                )
                db.add(tl_event)

                # Tambah ke Berkas Persuratan
                surat_entry = Persuratan(
                    proyek_id=sample_proyek.id,
                    no_surat=item.get("nomor_dokumen") or f"DOK-{item['no']:02d}/{item['tanggal']}",
                    tgl_surat=tgl,
                    jenis_surat=item.get("jenis_surat") or item["fase"],
                    pengirim=item.get("pengirim") or "Kementerian PKP / TNI AL",
                    perihal=item.get("perihal") or item["judul"],
                    keywords=item.get("keywords"),
                    file_path=f"/uploads/documents/{item['bukti_dukung']}" if item.get("bukti_dukung") else None,
                    status_disposisi="Disetujui" if ("SK" in item["fase"] or "SPP" in (item.get("nomor_dokumen") or "")) else "Masuk"
                )
                db.add(surat_entry)

            db.commit()
            print(f"✅ Berhasil menyuntikkan {len(TNI_AL_CHRONOLOGY_DATA)} kronologis & persuratan ke Rusun TNI AL Pasuruan!")

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
