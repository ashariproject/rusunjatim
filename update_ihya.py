import json

# Target ID and Data
TARGET_ID = 9
NEW_LAT = -8.2937162509139
NEW_LNG = 114.2468218991652
NEW_ADDRESS = "Desa Padang, Kec Singojuruh, Kab Banyuwangi, Prov Jatim"

try:
    with open('rusun_data.json', encoding='utf-8') as f:
        data = json.load(f)
    
    found = False
    for r in data['rusun']:
        if r.get('id') == TARGET_ID:
            print(f"Updating ID {TARGET_ID}: {r.get('nama_rusun')}")
            
            # Update coords
            r['koordinat']['lat'] = NEW_LAT
            r['koordinat']['lng'] = NEW_LNG
            r['koordinat']['status'] = 'verified'
            
            # Update address
            r['alamat'] = NEW_ADDRESS
            
            # Ensure kabkota match just in case
            if not r.get('kabkota'):
                r['kabkota'] = "Kab. Banyuwangi"
                
            print(f"  New Coords: {r.get('koordinat')}")
            print(f"  New Address: {r.get('alamat')}")
            found = True
            break
            
    if found:
        # Update metadata stats
        # We know it was missing, so:
        data['metadata']['missing_coordinates'] -= 1
        data['metadata']['with_coordinates'] += 1
        
        with open('rusun_data.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print("Successfully updated rusun data.")
    else:
        print(f"Rusun ID {TARGET_ID} not found.")
        
except Exception as e:
    print(f"Error: {e}")
