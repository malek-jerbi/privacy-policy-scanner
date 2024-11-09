from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import openai
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()


app = FastAPI(
    title="Privacy Policy Summarizer",
    description="An API that summarizes privacy policies and highlights risky areas using OpenAI's GPT models.",
    version="1.0.0",
)


class PrivacyPolicyInput(BaseModel):
    privacy_policy: str


openai.api_key = os.getenv("OPENAI_API_KEY")

@app.post("/summarize_privacy_policy")
async def summarize_privacy_policy(input: PrivacyPolicyInput):
    try:
    
        client = OpenAI()
        completion = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that reads privacy policies and summarizes the key points a user should be aware of. Highlight any areas that could be considered risky or dangerous.\n\n"},
                {
                    "role": "user",
                    "content": f"Privacy Policy:\n\n{input.privacy_policy}\n\nGive me a summary (with risky areas highlighted in RED):"
                }
            ]
        )

        summary = completion.choices[0].message.content

        return {"summary": summary}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
