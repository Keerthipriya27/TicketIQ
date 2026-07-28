from fastapi import APIRouter
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv
import os
import json

from models.prompts import SYSTEM_PROMPT

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

router = APIRouter()

class Ticket(BaseModel):
    ticket:str

@router.post("/analyze")
def analyze(ticket:Ticket):

    response = client.chat.completions.create(

        model="llama-3.3-70b-versatile",

        messages=[

            {
                "role":"system",
                "content":SYSTEM_PROMPT
            },

            {
                "role":"user",
                "content":ticket.ticket
            }

        ]

    )

    return json.loads(response.choices[0].message.content)