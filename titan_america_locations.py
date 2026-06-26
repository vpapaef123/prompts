"""
Build titan_america_locations.csv from research-gathered Titan America facility data.
titanamerica.com/locations/ returns 403 in this environment; data compiled from
SEC filings, vincehagan.com, snwreadymix.com, and web searches.
"""

import csv

# [Name, Address, City, State, Country, Latitude, Longitude]
locations = [
    # ── CORPORATE HQ ──────────────────────────────────────────────────────────
    ["Titan America LLC – Headquarters", "5700 Lake Wright Drive Suite 300", "Norfolk", "VA", "USA", "36.8937", "-76.2597"],

    # ── CEMENT PLANTS ─────────────────────────────────────────────────────────
    ["Roanoke Cement Company", "6071 Catawba Rd", "Troutville", "VA", "USA", "37.4615", "-79.9892"],
    ["Pennsuco Cement Plant (Titan Florida)", "11000 NW 121st Way", "Medley", "FL", "USA", "25.8784", "-80.3965"],
    ["Keystone Cement Company", "Route 329", "Bath", "PA", "USA", "40.7265", "-75.4002"],

    # ── QUARRIES / MINES ──────────────────────────────────────────────────────
    ["Pennsuco Quarry", "11000 NW 121st Way", "Medley", "FL", "USA", "25.8800", "-80.3950"],
    ["Corkscrew Mine (Titan Florida)", "Corkscrew Rd", "Estero", "FL", "USA", "26.4387", "-81.8067"],
    ["Titan Mid-Atlantic Aggregates", "Catawba Rd", "Troutville", "VA", "USA", "37.4620", "-79.9850"],

    # ── CEMENT TERMINALS ──────────────────────────────────────────────────────
    ["Essex Cement Terminal – Baltimore", "Chesapeake Ave", "Essex", "MD", "USA", "39.3092", "-76.4696"],
    ["Chesapeake Terminal (Norfapeake)", "3600 Port Norfolk Circle", "Chesapeake", "VA", "USA", "36.7927", "-76.3104"],
    ["Port Newark Terminal", "Corbin St", "Newark", "NJ", "USA", "40.6974", "-74.1502"],
    ["Port Tampa Terminal", "1200 E 7th Ave", "Tampa", "FL", "USA", "27.9553", "-82.4392"],

    # ── FLY ASH / SEPARATION TECHNOLOGIES ────────────────────────────────────
    ["Separation Technologies LLC – HQ", "188 Summerfield Court Suite 101", "Roanoke", "VA", "USA", "37.3273", "-79.9781"],
    ["Separation Technologies – Brunner Island", "", "York Haven", "PA", "USA", "40.1056", "-76.7197"],
    ["Separation Technologies – Brandon Shores", "", "Curtis Bay", "MD", "USA", "39.2170", "-76.5630"],
    ["Separation Technologies – Cardinal Plant", "", "Cardinal", "OH", "USA", "38.6517", "-83.8355"],

    # ── TITAN VIRGINIA READY-MIX ──────────────────────────────────────────────
    ["Titan Virginia Ready-Mix – Norfolk", "2125 Kimball Terrace", "Norfolk", "VA", "USA", "36.8614", "-76.3086"],
    ["Titan Virginia Ready-Mix – Portsmouth", "101 Chautauqua Ave", "Portsmouth", "VA", "USA", "36.8354", "-76.2983"],
    ["Titan Virginia Ready-Mix – Fredericksburg", "48 Powell Ln", "Fredericksburg", "VA", "USA", "38.3032", "-77.4605"],
    ["Titan Virginia Ready-Mix – Sterling", "22963 Concrete Plaza", "Sterling", "VA", "USA", "39.0028", "-77.3986"],

    # ── TITAN FLORIDA READY-MIX / TITAN CONCRETE ─────────────────────────────
    ["Titan Florida – Jacksonville (Philips Hwy)", "7330 Philips Hwy", "Jacksonville", "FL", "USA", "30.2101", "-81.6225"],
    ["Titan Florida – Jacksonville (McDuff Ave NW)", "1712 McDuff Ave N", "Jacksonville", "FL", "USA", "30.3617", "-81.6984"],
    ["Titan Florida – Tampa (Anderson Rd)", "7518 Anderson Rd", "Tampa", "FL", "USA", "27.9764", "-82.5503"],
    ["Titan Florida – Orlando (Zell Dr)", "200 Zell Dr", "Orlando", "FL", "USA", "28.5288", "-81.3792"],
    ["Titan Florida – Melbourne", "", "Melbourne", "FL", "USA", "28.0836", "-80.6081"],
    ["Titan Concrete – Cocoa", "", "Cocoa", "FL", "USA", "28.3561", "-80.7281"],
    ["Titan Florida – Crystal River", "15760 W Power Line St", "Crystal River", "FL", "USA", "28.8925", "-82.5771"],
    ["Titan Florida – Nokomis", "515 Gene Green Rd", "Nokomis", "FL", "USA", "27.1228", "-82.4507"],
    ["Titan Florida – Medley RMC", "11000 NW 121st Way", "Medley", "FL", "USA", "25.8784", "-80.3965"],
    ["Titan Florida – Deerfield Beach", "", "Deerfield Beach", "FL", "USA", "26.3184", "-80.1248"],
    ["Titan Florida – Mangonia Park (W Palm Beach)", "", "Mangonia Park", "FL", "USA", "26.7659", "-80.0650"],

    # ── S&W READY MIX (NC / SC) ───────────────────────────────────────────────
    ["S&W Ready Mix – Clinton HQ", "217 Lisbon St", "Clinton", "NC", "USA", "35.0015", "-78.3224"],
    ["S&W Ready Mix – Goldsboro", "", "Goldsboro", "NC", "USA", "35.3849", "-77.9930"],
    ["S&W Ready Mix – Jacksonville", "", "Jacksonville", "NC", "USA", "34.7541", "-77.4302"],
    ["S&W Ready Mix – Fayetteville", "", "Fayetteville", "NC", "USA", "35.0527", "-78.8784"],
    ["S&W Ready Mix – New Bern", "", "New Bern", "NC", "USA", "35.1085", "-77.0441"],
    ["S&W Ready Mix – Wilmington", "", "Wilmington", "NC", "USA", "34.2257", "-77.9447"],
    ["S&W Ready Mix – Conway", "", "Conway", "SC", "USA", "33.8360", "-79.0467"],
    ["S&W Ready Mix – Myrtle Beach", "", "Myrtle Beach", "SC", "USA", "33.6891", "-78.8867"],
]

fieldnames = ["Name", "Address", "City", "State", "Country", "Latitude", "Longitude"]

with open("titan_america_locations.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    for row in locations:
        writer.writerow(dict(zip(fieldnames, row)))

print(f"Written {len(locations)} rows to titan_america_locations.csv")
