import requests

API_KEY = "579b464db66ec23bdd0000015518ca88819046054556373c22ae245d"
RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

# Fetch max records and filter Maharashtra client-side
params = {
    "api-key": API_KEY,
    "format": "json",
    "limit": "205",  # get all 205 records
    "filters[commodity]": "Onion",
}

res = requests.get(
    f"https://api.data.gov.in/resource/{RESOURCE_ID}",
    params=params, headers=headers, timeout=15
)
data = res.json()
records = data.get("records", [])

print(f"Total fetched: {len(records)}")
print()

# Filter Maharashtra ourselves
maha = [r for r in records if "maharashtra" in r.get("state", "").lower()]
print(f"Maharashtra records: {len(maha)}")
print()
print("=== ALL MAHARASHTRA ONION MARKETS ===")
for r in maha:
    print(f"{r['market']:<40} | Rs.{r['modal_price']:<8} | {r['arrival_date']}")