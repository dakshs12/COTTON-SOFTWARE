import requests

login_data = {"email": "admin@example.com", "password": "password"}
session = requests.Session()
response = session.post("http://localhost:8000/api/token/", json=login_data)
if response.status_code == 200:
    token = response.json()["access"]
    headers = {"Authorization": f"Bearer {token}"}
    
    r = session.get("http://localhost:8000/api/parties/", headers=headers)
    
    if r.status_code == 200 and r.json():
        party = r.json()[0]
        party_id = party["id"]
        put_r = session.put(f"http://localhost:8000/api/parties/{party_id}/", headers=headers, json=party)
        print(f"PUT party {party_id}:", put_r.status_code, put_r.text[:100])
    else:
        print("GET parties failed", r.status_code, r.text)
else:
    print("Login failed", response.text)
