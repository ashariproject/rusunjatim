
import json
import os

def update_rusun():
    file_path = 'rusun_data.json'
    
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    updates = {
        289: {'lat': -7.461790130209426, 'lng': 112.72999751011048},
        296: {'lat': -7.461636335955731, 'lng': 112.7296291011553}
    }
    
    updated_count = 0
    
    for rusun in data['rusun']:
        rid = rusun.get('id')
        if rid in updates:
            print(f"Found: {rusun['nama_rusun']} (ID: {rid})")
            print(f"Old coords: {rusun['koordinat']}")
            
            rusun['koordinat']['lat'] = updates[rid]['lat']
            rusun['koordinat']['lng'] = updates[rid]['lng']
            rusun['koordinat']['status'] = 'verified'
            
            print(f"New coords: {rusun['koordinat']}")
            updated_count += 1
            
    if updated_count > 0:
        # Recalculate metadata more accurately
        total = len(data['rusun'])
        with_coords = sum(1 for r in data['rusun'] if r['koordinat']['lat'] is not None)
        need_validation = sum(1 for r in data['rusun'] if r['koordinat']['status'] == 'need_validation')
        missing = total - with_coords
        
        data['metadata']['with_coordinates'] = with_coords
        data['metadata']['need_validation'] = need_validation
        data['metadata']['missing_coordinates'] = missing
        
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)
        print(f"Successfully updated {updated_count} records.")
    else:
        print("No matching rusun found.")

if __name__ == "__main__":
    update_rusun()
