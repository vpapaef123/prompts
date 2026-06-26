#!/usr/bin/env python3
"""
Geocode TITAN plant addresses using Nominatim (OpenStreetMap) - free, no API key needed.
Run this on your LOCAL machine (not a restricted server).

Usage:
    pip install requests
    python geocode_nominatim.py
    python geocode_nominatim.py --input geocoded_addresses_kml.csv --output geocoded_final.csv
"""

import csv, time, argparse, requests, sys

HEADERS = {"User-Agent": "titan-geocode/1.0 contact@titan.com"}

def geocode(address):
    url = "https://nominatim.openstreetmap.org/search"
    params = {"q": address, "format": "json", "limit": 1}
    try:
        r = requests.get(url, params=params, headers=HEADERS, timeout=10)
        data = r.json()
        if data:
            return data[0]["lat"], data[0]["lon"]
    except Exception as e:
        print(f"  ERROR: {e}", file=sys.stderr)
    return "", ""

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input",  default="geocoded_addresses_kml.csv")
    parser.add_argument("--output", default="geocoded_final.csv")
    args = parser.parse_args()

    with open(args.input, newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    total = len(rows)
    out = []
    for i, row in enumerate(rows, 1):
        name    = row.get("Name", "")
        address = row.get("Address", "").strip()

        if not address or address == "USA":
            print(f"[{i}/{total}] {name} — skipped")
            out.append({"Name": name, "Address": address, "Latitude": "", "Longitude": ""})
            continue

        print(f"[{i}/{total}] {name} ... ", end="", flush=True)
        lat, lon = geocode(address)
        print(f"{lat}, {lon}" if lat else "NOT FOUND")
        out.append({"Name": name, "Address": address, "Latitude": lat, "Longitude": lon})
        time.sleep(1.1)  # Nominatim requires max 1 request/second

    with open(args.output, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["Name","Address","Latitude","Longitude"])
        w.writeheader()
        w.writerows(out)

    found = sum(1 for r in out if r["Latitude"])
    print(f"\nDone. {found}/{total} geocoded → {args.output}")

if __name__ == "__main__":
    main()
