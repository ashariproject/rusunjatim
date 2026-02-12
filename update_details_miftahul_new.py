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

TARGET_ID = 374

try:
    with open('rusun_data.json', encoding='utf-8') as f:
        data = json.load(f)
    
    found = False
    for r in data['rusun']:
        if r.get('id') == TARGET_ID:
            print(f"Updating ID {TARGET_ID}: {r.get('nama_rusun')} ({r.get('kabkota')})")
            
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
        print(f"Rusun ID {TARGET_ID} not found.")
        
except Exception as e:
    print(f"Error: {e}")
