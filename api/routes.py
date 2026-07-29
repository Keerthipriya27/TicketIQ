from fastapi import APIRouter
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import json

from models.prompts import SYSTEM_PROMPT

load_dotenv()

# Try to import the Groq client. If it's not installed or not configured
# we create a lightweight stub that raises at runtime. This avoids import
# failures during test discovery while preserving runtime failures when
# the real client is absent.
try:
    from groq import Groq  # type: ignore
except Exception:
    Groq = None  # type: ignore

_groq_api_key = os.getenv("GROQ_API_KEY")

if Groq and _groq_api_key:
    client = Groq(api_key=_groq_api_key)
else:
    class _NotConfiguredClient:
        class chat:
            class completions:
                @staticmethod
                def create(*args, **kwargs):
                    raise RuntimeError("Groq client not configured. Set GROQ_API_KEY and install 'groq' package.")

    client = _NotConfiguredClient()

router = APIRouter()


class Ticket(BaseModel):
    ticket: str


@router.post("/analyze")
def analyze(ticket: Ticket):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": ticket.ticket},
        ],
    )

    # The Groq client returns a choice with a message content that is JSON.
    return json.loads(response.choices[0].message.content)