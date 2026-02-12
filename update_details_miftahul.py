import json

# Target updates
UPDATES = {
    "tipe_rusun": "Barak",
    "varian": "Rembunai",
    "jumlah_lantai": 3,
    "jumlah_tower": 1,
    "jumlah_unit": 32,
    "kapasitas_hunian": 128,
    "kondisi_bangunan": "BAIK",
    "status_lahan": "CLEAR",
    "asset_satker": "SATKER PENYEDIAAN PERUMAHAN (DJP)"
}

try:
    with open('rusun_data.json', encoding='utf-8') as f:
        data = json.load(f)
    
    found = False
    for r in data['rusun']:
        nama = (r.get('nama_rusun') or '').lower()
        kabkota = (r.get('kabkota') or '').lower()
        
        if 'miftahul ulum' in nama and 'lumajang' in kabkota:
            print(f"Updating: {r.get('nama_rusun')} ({r.get('kabkota')})")
            
            for key, value in UPDATES.items():
                r[key] = value
                print(f"  - Set {key}: {value}")
                
            found = True
            break
            
    if found:
        with open('rusun_data.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print("Successfully updated rusun details.")
    else:
        print("Rusun 'Miftahul Ulum Lumajang' not found.")
        
except Exception as e:
    print(f"Error: {e}")
