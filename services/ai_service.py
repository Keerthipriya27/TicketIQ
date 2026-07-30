import os
import json
import re
from dotenv import load_dotenv
from models.prompts import SYSTEM_PROMPT
from logger import get_logger

load_dotenv()
logger = get_logger("AIService")

# Attempt to load Groq client
try:
    from groq import Groq
except Exception:
    Groq = None

_groq_api_key = os.getenv("GROQ_API_KEY")

if Groq and _groq_api_key:
    groq_client = Groq(api_key=_groq_api_key)
    logger.info("Groq API client successfully initialized")
else:
    groq_client = None
    logger.warning("Groq client unavailable or GROQ_API_KEY missing. Using fallback rules engine.")

def fallback_rule_based_analysis(ticket_text: str) -> dict:
    """Fallback keyword-based rules classifier for LLM offline mode."""
    lower_text = ticket_text.lower()
    
    if any(k in lower_text for k in ["crash", "bug", "error", "exception", "broken", "failed", "500", "stacktrace"]):
        category = "Technical Support"
        priority = "High" if any(k in lower_text for k in ["crash", "critical", "down", "outage"]) else "Medium"
        assigned_team = "Engineering"
        reasoning = "Rule-based classifier detected technical fault or software bug keywords."
        confidence = 0.82
    elif any(k in lower_text for k in ["billing", "invoice", "charge", "refund", "subscription", "payment", "card"]):
        category = "Billing & Payments"
        priority = "High" if "refund" in lower_text or "wrong charge" in lower_text else "Medium"
        assigned_team = "Billing"
        reasoning = "Rule-based classifier detected payment or invoice keywords."
        confidence = 0.88
    elif any(k in lower_text for k in ["security", "hack", "password", "login", "auth", "unauthorized", "leak"]):
        category = "Account & Security"
        priority = "High"
        assigned_team = "Security"
        reasoning = "Rule-based classifier detected security or login access keywords."
        confidence = 0.91
    else:
        category = "General Inquiry"
        priority = "Low"
        assigned_team = "Customer Success"
        reasoning = "Rule-based classifier assigned default inquiry categories."
        confidence = 0.75

    summary = ticket_text.strip()[:100] + ("..." if len(ticket_text) > 100 else "")
    if not summary:
        summary = "Empty support request submitted."

    return {
        "summary": summary,
        "category": category,
        "priority": priority,
        "assigned_team": assigned_team,
        "reasoning": reasoning,
        "confidence_score": confidence
    }

def analyze_ticket_ai(ticket_text: str) -> dict:
    """Analyze ticket text using Groq LLM with fallback rule engine."""
    if not ticket_text or not ticket_text.strip():
        return {
            "summary": "Empty ticket text provided.",
            "category": "General Inquiry",
            "priority": "Low",
            "assigned_team": "Customer Success",
            "reasoning": "Ticket text was empty or contained only whitespace.",
            "confidence_score": 0.50
        }

    if not groq_client:
        return fallback_rule_based_analysis(ticket_text)

    try:
        logger.info("Dispatching ticket analysis to Groq LLM model llama-3.3-70b-versatile")
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": ticket_text},
            ],
            temperature=0.2,
            max_tokens=400,
        )

        content = response.choices[0].message.content.strip()
        # Clean markdown wrappers if present
        if content.startswith("```"):
            content = re.sub(r"^```(?:json)?\n?", "", content)
            content = re.sub(r"\n?```$", "", content)

        data = json.loads(content)
        
        # Ensure all required keys exist
        data.setdefault("summary", ticket_text[:100])
        data.setdefault("category", "General Inquiry")
        data.setdefault("priority", "Medium")
        data.setdefault("assigned_team", "Support")
        data.setdefault("reasoning", "AI classified ticket based on content context.")
        data.setdefault("confidence_score", 0.88)
        
        logger.info(f"AI ticket analysis completed successfully: {data['category']} | {data['priority']}")
        return data
    except Exception as e:
        logger.error(f"Groq API analysis failed ({e}). Falling back to rule-based analysis.")
        return fallback_rule_based_analysis(ticket_text)
