import json

with open('rusun_data.json', encoding='utf-8') as f:
    data = json.load(f)

print("Mencari 'Gunung Anyar'...")
found = False
for r in data['rusun']:
    nama = str(r.get('nama_rusun') or '')
    alamat = str(r.get('alamat') or '')
    
    if 'Gunung Anyar' in nama or 'Gunung Anyar' in alamat:
        print(f"\n--- DITEMUKAN ---")
        print(f"Nama: {nama}")
        print(f"Alamat: {alamat}")
        print(f"Kab/Kota: {r.get('kabkota')}")
        print(f"Penerima: {r.get('penerima')}")
        print(f"Koordinat: {r.get('koordinat')}")
        found = True

if not found:
    print("Tidak ditemukan data dengan kata kunci 'Gunung Anyar'")
