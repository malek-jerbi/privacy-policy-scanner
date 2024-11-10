import requests
import os

url = "http://127.0.0.1:8000/summarize_privacy_policy"

file_path = os.path.join("test_policy.txt")

with open(file_path, "r", encoding="utf-8") as file:
    privacy_policy_text = file.read()

payload = {"privacy_policy": privacy_policy_text}

response = requests.post(url, json=payload)

if response.status_code == 200:
    summary = response.json()
    print(summary)
else:
    print(f"Error: {response.status_code}")
    print(response.json())
