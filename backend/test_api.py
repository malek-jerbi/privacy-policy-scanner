import requests
import os

url = "http://127.0.0.1:8000/summarize_privacy_policy"

# Use os.path.join for cross-platform path compatibility
file_path = os.path.join("test_policy.txt")

with open(file_path, "r") as file:
    privacy_policy_text = file.read()

payload = {"privacy_policy": privacy_policy_text}

response = requests.post(url, json=payload)

if response.status_code == 200:
    summary = response.json()
    print(summary)
else:
    print(f"Error: {response.status_code}")
    print(response.json())
