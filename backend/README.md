# Project Setup
- Install python3.12 and poetry on your computer
- In `./backend`, install the poetry dependencies with `poetry install`
- Activate poetry shell with `poetry shell`
- Still in `./backend`, `cp .env.example .env` (or on Windows: `copy .env.example .env`)
- Fill your `.env` with your Openai API key etc

# Run the server
- Inside your poetry shell: `uvicorn app:app --reload`

# Testing
- You can test the endpoint with the test script `test_api.py` that uses the privacy policy from https://www.silhouette.com/ca/en/data-privacy:
    - `python test_api.py`
- You can use postman or cURL aswell
    ```
    curl -X POST "http://127.0.0.1:8000/summarize_privacy_policy" \
  -H "Content-Type: application/json" \
  -d '{"privacy_policy": "Your privacy policy text here..."}'

    ```