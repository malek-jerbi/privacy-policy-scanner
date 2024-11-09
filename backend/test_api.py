import requests

url = "http://127.0.0.1:8000/summarize_privacy_policy"

with open("test_policy.txt", "r") as file:
    privacy_policy_text = file.read()

payload = {"privacy_policy": privacy_policy_text}

response = requests.post(url, json=payload)

if response.status_code == 200:
    summary = response.json()["summary"]
    print("Summary:")
    print(summary)
else:
    print(f"Error: {response.status_code}")
    print(response.json())
