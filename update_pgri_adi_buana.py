
import json
import os

def update_rusun():
    file_path = 'rusun_data.json'
    
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    # Target latitude is likely negative for Surabaya/East Java
    # The user input was "7.34..." but context implies "-7.34..."
    # I will use the negative value: -7.343728819575531
    
    target_name = "Adi Buana"
    new_lat = -7.343728819575531
    new_lng = 112.72027536069143
    
    updated_count = 0
    
    for rusun in data['rusun']:
        if target_name.lower() in (rusun.get('nama_rusun') or '').lower():
            print(f"Found: {rusun['nama_rusun']} (ID: {rusun['id']})")
            print(f"Old coords: {rusun['koordinat']}")
            
            rusun['koordinat']['lat'] = new_lat
            rusun['koordinat']['lng'] = new_lng
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
