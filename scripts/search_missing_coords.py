import os
import re
import json
import time
import urllib.parse
from playwright.sync_api import sync_playwright

INPUT_FILE = os.path.join("scratch", "rekap_rusun_tanpa_lokasi.json")
OUTPUT_FILE = os.path.join("scratch", "hasil_search_koordinat.json")
LOG_FILE = os.path.join("scratch", "search_progress.log")

def log_message(msg):
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    full_msg = f"[{timestamp}] {msg}"
    print(full_msg, flush=True)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(full_msg + "\n")

def clean_query(nama, kabkota, alamat=""):
    # If alamat has specific street/des/kec, use it if helpful, otherwise clean name
    q = nama.strip()
    # Normalize common abbreviations if needed
    if kabkota and kabkota.lower() not in q.lower():
        q = f"{q}, {kabkota}"
    return q

def extract_coords_from_url(url):
    # Try !3d!4d first (pin location)
    pin_match = re.search(r'!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)', url)
    if pin_match:
        return float(pin_match.group(1)), float(pin_match.group(2))
    
    # Try @lat,lng
    at_match = re.search(r'@(-?\d+\.\d+),(-?\d+\.\d+)', url)
    if at_match:
        return float(at_match.group(1)), float(at_match.group(2))
    return None, None

def run_search():
    if not os.path.exists(INPUT_FILE):
        log_message(f"Input file {INPUT_FILE} not found!")
        return

    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        missing_list = json.load(f)

    # Load existing results if any
    results = {}
    if os.path.exists(OUTPUT_FILE):
        try:
            with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
                existing_data = json.load(f)
                for item in existing_data:
                    results[item["id"]] = item
            log_message(f"Resuming: Loaded {len(results)} existing search results.")
        except Exception as e:
            log_message(f"Error loading existing results: {e}")

    total = len(missing_list)
    log_message(f"Total rusun to search: {total}. Starting Playwright Chromium...")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            locale="id-ID"
        )
        page = context.new_page()

        for idx, item in enumerate(missing_list, 1):
            rid = item["id"]
            if rid in results and results[rid].get("status") in ["found", "not_found"]:
                log_message(f"[{idx}/{total}] Skip ID {rid} (already processed: {results[rid].get('status')})")
                continue

            nama = item["nama_rusun"]
            kabkota = item.get("kabkota", "")
            alamat = item.get("alamat", "")
            query = clean_query(nama, kabkota, alamat)

            log_message(f"[{idx}/{total}] Searching ID {rid}: '{query}'...")
            
            maps_url = f"https://www.google.com/maps/search/{urllib.parse.quote(query)}"
            
            entry = {
                "id": rid,
                "nama_rusun": nama,
                "kabkota": kabkota,
                "alamat": alamat,
                "query": query,
                "status": "not_found",
                "lat": None,
                "lng": None,
                "place_name": None,
                "maps_url": None,
                "match_type": None,
                "updated_at": time.strftime("%Y-%m-%d %H:%M:%S")
            }

            try:
                page.goto(maps_url, timeout=20000, wait_until="domcontentloaded")
                page.wait_for_timeout(4500) # Give Maps time to resolve and redirect
                
                cur_url = page.url
                
                if "/maps/place/" in cur_url:
                    # Direct single match
                    lat, lng = extract_coords_from_url(cur_url)
                    # Extract place title from URL or page
                    place_title = None
                    try:
                        h1 = page.locator('h1').first
                        if h1.count() > 0:
                            place_title = h1.inner_text().strip()
                    except:
                        pass

                    entry["status"] = "found"
                    entry["lat"] = lat
                    entry["lng"] = lng
                    entry["place_name"] = place_title
                    entry["maps_url"] = cur_url
                    entry["match_type"] = "direct_match"
                    log_message(f"  -> FOUND (Direct): {lat}, {lng} ({place_title})")
                else:
                    # Check list results
                    place_links = page.locator('a[href*="/maps/place/"]').all()
                    if place_links:
                        first_link = place_links[0]
                        href = first_link.get_attribute("href")
                        aria_label = first_link.get_attribute("aria-label") or ""
                        lat, lng = extract_coords_from_url(href)
                        
                        entry["status"] = "found"
                        entry["lat"] = lat
                        entry["lng"] = lng
                        entry["place_name"] = aria_label
                        entry["maps_url"] = href
                        entry["match_type"] = "first_result"
                        log_message(f"  -> FOUND (First of list): {lat}, {lng} ({aria_label})")
                    else:
                        # If not found, try fallback search query if name has complex prefix
                        clean_alt = re.sub(r'^(TNI\s+Mabes\s+TNI\s+AD|PP\.|Ponpes|Yayasan|LPI)\s*', '', nama, flags=re.IGNORECASE).strip()
                        if clean_alt != nama:
                            fallback_q = f"{clean_alt}, {kabkota}"
                            log_message(f"  -> Trying fallback query: '{fallback_q}'")
                            page.goto(f"https://www.google.com/maps/search/{urllib.parse.quote(fallback_q)}", timeout=15000, wait_until="domcontentloaded")
                            page.wait_for_timeout(4000)
                            cur_url = page.url
                            if "/maps/place/" in cur_url:
                                lat, lng = extract_coords_from_url(cur_url)
                                entry["status"] = "found"
                                entry["lat"] = lat
                                entry["lng"] = lng
                                entry["maps_url"] = cur_url
                                entry["match_type"] = "fallback_direct"
                                log_message(f"  -> FOUND (Fallback Direct): {lat}, {lng}")
                            else:
                                place_links = page.locator('a[href*="/maps/place/"]').all()
                                if place_links:
                                    first_link = place_links[0]
                                    href = first_link.get_attribute("href")
                                    aria_label = first_link.get_attribute("aria-label") or ""
                                    lat, lng = extract_coords_from_url(href)
                                    entry["status"] = "found"
                                    entry["lat"] = lat
                                    entry["lng"] = lng
                                    entry["place_name"] = aria_label
                                    entry["maps_url"] = href
                                    entry["match_type"] = "fallback_list"
                                    log_message(f"  -> FOUND (Fallback List): {lat}, {lng} ({aria_label})")
                                else:
                                    log_message(f"  -> NOT FOUND after fallback.")
                        else:
                            log_message(f"  -> NOT FOUND on Google Maps.")

            except Exception as e:
                log_message(f"  -> Error searching ID {rid}: {e}")
                entry["status"] = "error"
                entry["error_msg"] = str(e)

            results[rid] = entry

            # Atomic save results list to JSON
            try:
                sorted_results = [results[k] for k in sorted(results.keys())]
                with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
                    json.dump(sorted_results, f, ensure_ascii=False, indent=2)
            except Exception as e:
                log_message(f"Error saving to {OUTPUT_FILE}: {e}")

            # Polite delay between searches
            time.sleep(1.5)

        browser.close()
        log_message("All searches completed!")

if __name__ == "__main__":
    run_search()
