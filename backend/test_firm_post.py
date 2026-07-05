import requests

url = "http://127.0.0.1:8000/api/token/"
session = requests.Session()
login_data = {"email": "broker1@example.com", "password": "password123"}
r_login = session.post(url, json=login_data)
print("Login status:", r_login.status_code)
# Get the access token
access_token = r_login.json().get('access')

url_firm = "http://127.0.0.1:8000/api/firms/"
headers = {"Authorization": f"Bearer {access_token}"}
data = {
    "firm_name": "Test Firm",
    "address": "123 Test St",
    "city": "Test City",
    "state": "Test State",
    "mobile": "1234567890",
    "title": "",
    "firm_no": "",
    "pincode": "",
    "tele_o": "",
    "email": "",
    "website": "",
    "contact_person": "",
    "cin_no": "",
    "pan_no": "",
    "gst_no": "",
    "tan_no": "",
    "bank_name": "",
    "branch": "",
    "bank_ac_no": "",
    "ifsc_code": ""
}
r_firm = session.post(url_firm, data=data, headers=headers)
print("Firm status:", r_firm.status_code)
print("Firm response:", r_firm.text)

