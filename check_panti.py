import json

TARGET_KEYWORD = "panti asuhan muhammadiyah"
TARGET_KABKOTA = "pamekasan"

try:
    with open('rusun_data.json', encoding='utf-8') as f:
        data = json.load(f)
    
    found = False
    for r in data['rusun']:
        nama = (r.get('nama_rusun') or '').lower()
        kabkota = (r.get('kabkota') or '').lower()
        
        if TARGET_KEYWORD in nama and TARGET_KABKOTA in kabkota:
            print(f"FOUND: {r.get('nama_rusun')} (ID: {r.get('id')})")
            print(f"  Current Coords: {r.get('koordinat')}")
            found = True
            
    if not found:
        print("NOT FOUND")
        
except Exception as e:
    print(f"Error: {e}")
