
import json
import os

def update_ronggolawe():
    file_path = 'rusun_data.json'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    target_id = 356
    new_lat = -6.9058956535379385
    new_lng = 112.0790235301429
    
    updated = False
    
    for rusun in data['rusun']:
        if rusun.get('id') == target_id:
            print(f"Found: {rusun['nama_rusun']} (ID: {rusun['id']})")
            print(f"Old coords: {rusun['koordinat']}")
            
            rusun['koordinat']['lat'] = new_lat
            rusun['koordinat']['lng'] = new_lng
            rusun['koordinat']['status'] = 'verified'
            
            print(f"New coords: {rusun['koordinat']}")
            updated = True
            break
            
    if updated:
        # Recalculate metadata
        total = len(data['rusun'])
        with_coords = sum(1 for r in data['rusun'] if r['koordinat'] and r['koordinat']['lat'] is not None)
        need_validation = sum(1 for r in data['rusun'] if r['koordinat'] and r['koordinat']['status'] == 'need_validation')
        missing = total - with_coords
        
        data['metadata']['with_coordinates'] = with_coords
        data['metadata']['need_validation'] = need_validation
        data['metadata']['missing_coordinates'] = missing
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        print(f"Successfully updated entry {target_id} (Universitas PGRI Ronggolawe).")
    else:
        print(f"Entry {target_id} not found.")

if __name__ == "__main__":
    update_ronggolawe()
