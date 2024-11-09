from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from haystack.components.builders import ChatPromptBuilder
from haystack.components.generators.chat import OpenAIChatGenerator
from prompt_templates import main_prompt_template
from dotenv import load_dotenv
import json

load_dotenv()

app = FastAPI(
    title="Privacy Policy Summarizer",
    description="An API that summarizes privacy policies and highlights risky areas using OpenAI's GPT models.",
    version="1.0.0",
)


class PrivacyPolicyInput(BaseModel):
    privacy_policy: str


generator = OpenAIChatGenerator(model="gpt-4o")
prompt_builder = ChatPromptBuilder()


@app.post("/summarize_privacy_policy")
async def summarize_privacy_policy(input: PrivacyPolicyInput):
    try:
        print(input.privacy_policy)
        builder = ChatPromptBuilder(template=main_prompt_template)
        prompt = builder.run(privacy_policy=input.privacy_policy)
        response = generator.run(prompt["prompt"], generation_kwargs={"response_format": {"type": "json_object"}})["replies"][0]
        return json.loads(response.content)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
