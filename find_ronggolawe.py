
import json

def find_ronggolawe():
    file_path = 'rusun_data.json'
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    found = []
    for rusun in data['rusun']:
        if 'ronggolawe' in (rusun.get('nama_rusun') or '').lower():
            found.append(rusun)
            
    for item in found:
        print(f"ID: {item['id']}, Name: {item['nama_rusun']}, KabKota: {item['kabkota']}, Address: {item['alamat']}")

if __name__ == "__main__":
    find_ronggolawe()
