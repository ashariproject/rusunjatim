import json

TARGET_IDS = [373, 374, 375]
NEW_YEAR = "2024-2025"

try:
    with open('rusun_data.json', encoding='utf-8') as f:
        data = json.load(f)
    
    updated_count = 0
    for r in data['rusun']:
        if r.get('id') in TARGET_IDS:
            print(f"Updating ID {r.get('id')}: {r.get('nama_rusun')}")
            print(f"  Old Year: {r.get('tahun_anggaran')}")
            r['tahun_anggaran'] = NEW_YEAR
            print(f"  New Year: {r.get('tahun_anggaran')}")
            updated_count += 1
            
    if updated_count > 0:
        with open('rusun_data.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"\nSuccessfully updated {updated_count} rusun entries.")
    else:
        print("No matching rusun IDs found.")
        
except Exception as e:
    print(f"Error: {e}")
