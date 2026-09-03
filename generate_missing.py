import json

with open('rusun_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

missing = [r for r in data['rusun'] if not r.get('koordinat', {}).get('lat') or not r.get('koordinat', {}).get('lng')]

with open('correct_missing_utf8.txt', 'w', encoding='utf-8') as f:
    f.write("| ID | Nama Rusun | Kabupaten/Kota |\n")
    f.write("|:---|:---|:---|\n")
    for r in missing:
        f.write(f"| {r['id']} | {r['nama_rusun']} | {r['kabkota']} |\n")
