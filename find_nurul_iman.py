
import json

def find_nurul_iman():
    file_path = 'rusun_data.json'
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    found = []
    for rusun in data['rusun']:
        if 'nurul iman' in (rusun.get('nama_rusun') or '').lower():
            found.append(rusun)
            
    for item in found:
        print(f"ID: {item['id']}, Name: {item['nama_rusun']}, KabKota: {item['kabkota']}, Address: {item['alamat']}")

if __name__ == "__main__":
    find_nurul_iman()
