import json

# Target ID and Data
TARGET_ID = 350
NEW_LAT = -7.1652235859689615
NEW_LNG = 113.47746618075186

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
            
            print(f"  New Coords: {r.get('koordinat')}")
            found = True
            break
            
    if found:
        # Update metadata stats
        data['metadata']['missing_coordinates'] -= 1
        data['metadata']['with_coordinates'] += 1
        
        with open('rusun_data.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print("Successfully updated rusun data.")
    else:
        print(f"Rusun ID {TARGET_ID} not found.")
        
except Exception as e:
    print(f"Error: {e}")
