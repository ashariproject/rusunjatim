import json

TARGET_KEYWORD = "darul ulum"
TARGET_KABKOTA = "karang baru"

# Coordinates provided by user
NEW_LAT = -7.129834242823818
NEW_LNG = 113.50124246745253

try:
    with open('rusun_data.json', encoding='utf-8') as f:
        data = json.load(f)
    
    found = False
    for r in data['rusun']:
        nama = (r.get('nama_rusun') or '').lower()
        
        # Checking for match. The user provided "Yayasan Darul Ulum Tomang Mateh Blumbungan Pondok Pesantren Karang Baru"
        # I'll search for "darul ulum" and "karang baru" or "blumbungan"
        if ('darul ulum' in nama and 'blumbungan' in nama) or ('darul ulum' in nama and 'karang baru' in nama):
            print(f"FOUND: {r.get('nama_rusun')} (ID: {r.get('id')})")
            print(f"  Current Coords: {r.get('koordinat')}")
            
            # Update coords
            r['koordinat']['lat'] = NEW_LAT
            r['koordinat']['lng'] = NEW_LNG
            r['koordinat']['status'] = 'verified'
            
            print(f"  New Coords: {r.get('koordinat')}")
            found = True
            break
            
    if found:
        # Update metadata stats
        # Assuming we are changing from missing to verified
        data['metadata']['missing_coordinates'] -= 1
        data['metadata']['with_coordinates'] += 1
        
        with open('rusun_data.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print("Successfully updated rusun data.")
    else:
        print("NOT FOUND. Need to add new record?")
        
except Exception as e:
    print(f"Error: {e}")
