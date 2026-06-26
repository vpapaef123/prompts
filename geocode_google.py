#!/usr/bin/env python3
"""
Geocode TITAN plant addresses using Google Maps Geocoding API.
Usage:
    pip install requests
    python geocode_google.py --api-key YOUR_GOOGLE_API_KEY
    python geocode_google.py --api-key YOUR_GOOGLE_API_KEY --input geocoded_addresses_kml.csv
Get a free API key at: https://console.cloud.google.com/ (Geocoding API, free tier: 40,000 req/month)
"""

import csv
import time
import argparse
import requests
import sys
import os

def geocode_google(address, api_key):
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {"address": address, "key": api_key}
    try:
        r = requests.get(url, params=params, timeout=10)
        data = r.json()
        if data["status"] == "OK":
            loc = data["results"][0]["geometry"]["location"]
            return str(loc["lat"]), str(loc["lng"])
        else:
            return "", ""
    except Exception as e:
        print(f"  ERROR: {e}", file=sys.stderr)
        return "", ""


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--api-key", required=True, help="Google Maps API key")
    parser.add_argument("--input", default="geocoded_addresses_kml.csv",
                        help="Input CSV (Name,Address,...)")
    parser.add_argument("--output", default="geocoded_google.csv",
                        help="Output CSV filename")
    args = parser.parse_args()

    rows = []
    with open(args.input, newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    output_rows = []
    total = len(rows)
    for i, row in enumerate(rows, 1):
        name = row.get("Name", "")
        address = row.get("Address", "")

        if not address or address.strip() in ("USA", ""):
            print(f"[{i}/{total}] {name} — skipped (no address)")
            output_rows.append({"Name": name, "Address": address, "Latitude": "", "Longitude": ""})
            continue

        print(f"[{i}/{total}] {name} ... ", end="", flush=True)
        lat, lon = geocode_google(address, args.api_key)
        if lat:
            print(f"{lat}, {lon}")
        else:
            print("NOT FOUND")
        output_rows.append({"Name": name, "Address": address, "Latitude": lat, "Longitude": lon})
        time.sleep(0.05)  # ~20 req/sec, well under Google's limit

    with open(args.output, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["Name", "Address", "Latitude", "Longitude"])
        writer.writeheader()
        writer.writerows(output_rows)

    found = sum(1 for r in output_rows if r["Latitude"])
    print(f"\nDone. {found}/{total} geocoded → {args.output}")


if __name__ == "__main__":
    main()
