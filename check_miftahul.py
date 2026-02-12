import json

try:
    with open('rusun_data.json', encoding='utf-8') as f:
        data = json.load(f)
    
    print("Searching for 'Miftahul Ulum' in 'Lumajang'...")
    found_count = 0
    for r in data['rusun']:
        nama = (r.get('nama_rusun') or '').lower()
        kabkota = (r.get('kabkota') or '').lower()
        
        if 'miftahul ulum' in nama and 'lumajang' in kabkota:
            found_count += 1
            print(f"[{r.get('id')}] {r.get('nama_rusun')}")
            print(f"   Tipe: {r.get('tipe_rusun')}, Lantai: {r.get('jumlah_lantai')}")
            
    print(f"\nTotal found: {found_count}")

except Exception as e:
    print(f"Error: {e}")
