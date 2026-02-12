import pandas as pd
import json
import re
import numpy as np

def parse_coordinates(coord_str):
    """
    Parse coordinate string to extract lat, lng, and status
    Examples:
    - "-8.03859512011571 112.65702869427076 (Perlu Validasi)"
    - "-7.222309023784689 112.76982200701644"
    """
    if pd.isna(coord_str) or coord_str == '':
        return None, None, 'missing'
    
    coord_str = str(coord_str).strip()
    
    # Extract numbers (latitude and longitude)
    numbers = re.findall(r'-?\d+\.?\d*', coord_str)
    
    if len(numbers) >= 2:
        lat = float(numbers[0])
        lng = float(numbers[1])
        
        # Determine status
        if 'Perlu Validasi' in coord_str or 'perlu validasi' in coord_str.lower():
            status = 'need_validation'
        else:
            status = 'verified'
        
        return lat, lng, status
    
    return None, None, 'missing'

def clean_value(val):
    """Clean and convert values, handling NaN and empty strings"""
    if pd.isna(val):
        return None
    if isinstance(val, str):
        val = val.strip()
        if val == '' or val.lower() == 'nan':
            return None
    if isinstance(val, (int, float)) and np.isnan(val):
        return None
    return val

def convert_excel_to_json():
    """Convert dbrusun.xlsx to rusun_data.json"""
    
    print("Reading Excel file...")
    df = pd.read_excel('dbrusun.xlsx', sheet_name='JATIM')
    
    # Remove the first row if it's a header duplicate
    if pd.isna(df.iloc[0]['NO']):
        df = df.iloc[1:].reset_index(drop=True)
    
    print(f"Total rows: {len(df)}")
    
    rusun_list = []
    stats = {
        'total': 0,
        'with_coords': 0,
        'need_validation': 0,
        'missing_coords': 0
    }
    
    for idx, row in df.iterrows():
        # Skip rows without NO
        if pd.isna(row['NO']):
            continue
        
        # Parse coordinates
        lat, lng, coord_status = parse_coordinates(row['TITIK KOORDINAT'])
        
        # Build rusun object
        rusun = {
            'id': int(row['NO']) if not pd.isna(row['NO']) else idx + 1,
            'tahun_anggaran': clean_value(row['TAHUN ANGGARAN']),
            'nama_paket': clean_value(row['NAMA PAKET ']),
            'nama_rusun': clean_value(row['LOKASI RUMAH SUSUN / NAMA RUSUN']),
            'alamat': clean_value(row['ALAMAT']),
            'kabkota': clean_value(row['KAB / KOTA']),
            'penerima': clean_value(row['Penerima']),
            'koordinat': {
                'lat': lat,
                'lng': lng,
                'status': coord_status
            },
            'tipe_rusun': clean_value(row['TIPE RUSUN']),
            'varian': clean_value(row['VARIAN']),
            'jumlah_lantai': int(row['JUMLAH LANTAI']) if not pd.isna(row['JUMLAH LANTAI']) else None,
            'jumlah_tower': int(row['JUMLAH TOWER']) if not pd.isna(row['JUMLAH TOWER']) else None,
            'jumlah_unit': int(row['JUMLAH UNIT']) if not pd.isna(row['JUMLAH UNIT']) else None,
            'kapasitas_hunian': int(row['KAPASITAS HUNIAN']) if not pd.isna(row['KAPASITAS HUNIAN']) else None,
            'kondisi_bangunan': clean_value(row['KONDISI BANGUNAN']),
            'status_lahan': clean_value(row['STATUS LAHAN']),
            'asset_satker': clean_value(row['ASSET TERCATAT PADA SATUAN KERJA'])
        }
        
        rusun_list.append(rusun)
        
        # Update statistics
        stats['total'] += 1
        if coord_status == 'verified' or coord_status == 'need_validation':
            stats['with_coords'] += 1
            if coord_status == 'need_validation':
                stats['need_validation'] += 1
        else:
            stats['missing_coords'] += 1
    
    # Create final JSON structure
    output = {
        'metadata': {
            'source': 'dbrusun.xlsx',
            'sheet': 'JATIM',
            'generated_date': pd.Timestamp.now().isoformat(),
            'total_rusun': stats['total'],
            'with_coordinates': stats['with_coords'],
            'need_validation': stats['need_validation'],
            'missing_coordinates': stats['missing_coords']
        },
        'rusun': rusun_list
    }
    
    # Write to JSON file
    print("\nWriting to rusun_data.json...")
    with open('rusun_data.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print("\n=== Conversion Complete ===")
    print(f"Total Rusun: {stats['total']}")
    print(f"With Coordinates: {stats['with_coords']}")
    print(f"  - Verified: {stats['with_coords'] - stats['need_validation']}")
    print(f"  - Need Validation: {stats['need_validation']}")
    print(f"Missing Coordinates: {stats['missing_coords']}")
    print(f"\nJSON file saved: rusun_data.json")

if __name__ == '__main__':
    convert_excel_to_json()
