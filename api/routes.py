from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

from database import get_db
from models.db_models import TicketModel, HistoryModel, AnalyticsModel
from services.ai_service import analyze_ticket_ai
from logger import get_logger

logger = get_logger("APIRoutes")
router = APIRouter()

# --- Pydantic Schemas ---

class TicketAnalyzeRequest(BaseModel):
    ticket: str = Field(..., description="Ticket content to analyze", example="The app crashes every time I click invoice history.")

class TicketCreateRequest(BaseModel):
    title: str = Field(..., example="System Outage on Login Server")
    description: str = Field(..., example="Users receive error 500 when logging into app.")
    priority: Optional[str] = Field("Medium", example="High")
    category: Optional[str] = Field("General Inquiry", example="Technical Support")
    department: Optional[str] = Field("Support", example="Engineering")
    status: Optional[str] = Field("pending", example="pending")

class TicketUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    department: Optional[str] = None
    status: Optional[str] = None

class TicketResponse(BaseModel):
    id: str
    title: str
    description: str
    category: str
    priority: str
    department: str
    status: str
    reasoning: Optional[str] = None
    confidence_score: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Endpoints ---

@router.post("/analyze", response_model=Dict[str, Any])
def analyze_ticket(request: TicketAnalyzeRequest):
    """Analyze support ticket using AI/LLM for summary, category, priority, routing, reasoning, and confidence."""
    logger.info("Received POST /analyze request")
    result = analyze_ticket_ai(request.ticket)
    return result

@router.post("/tickets", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
def create_ticket(ticket_data: TicketCreateRequest, db: Session = Depends(get_db)):
    """Create a new ticket in the database with automatic AI analysis if category/priority not specified."""
    logger.info(f"Creating ticket: {ticket_data.title}")
    
    # Run AI analysis if description is detailed
    ai_res = analyze_ticket_ai(ticket_data.description)
    
    new_ticket = TicketModel(
        title=ticket_data.title,
        description=ticket_data.description,
        category=ticket_data.category if ticket_data.category != "General Inquiry" else ai_res.get("category", "General Inquiry"),
        priority=ticket_data.priority if ticket_data.priority != "Medium" else ai_res.get("priority", "Medium"),
        department=ticket_data.department if ticket_data.department != "Support" else ai_res.get("assigned_team", "Support"),
        status=ticket_data.status or "pending",
        reasoning=ai_res.get("reasoning", "Created via API"),
        confidence_score=ai_res.get("confidence_score", 0.85)
    )
    
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)
    
    # Record history
    history = HistoryModel(
        ticket_id=new_ticket.id,
        action="CREATED",
        changes=f"Created ticket '{new_ticket.title}'"
    )
    db.add(history)
    db.commit()

    logger.info(f"Ticket created successfully with ID: {new_ticket.id}")
    return new_ticket

@router.get("/tickets", response_model=List[TicketResponse])
def get_tickets(
    status: Optional[str] = Query(None, description="Filter by status: pending, in_progress, completed"),
    priority: Optional[str] = Query(None, description="Filter by priority: High, Medium, Low"),
    category: Optional[str] = Query(None, description="Filter by category"),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Retrieve list of tickets with optional status, priority, category filtering and pagination."""
    query = db.query(TicketModel)
    if status:
        query = query.filter(TicketModel.status == status)
    if priority:
        query = query.filter(TicketModel.priority == priority)
    if category:
        query = query.filter(TicketModel.category == category)
        
    tickets = query.order_by(TicketModel.created_at.desc()).offset(skip).limit(limit).all()
    return tickets

@router.get("/tickets/{ticket_id}", response_model=TicketResponse)
def get_ticket_by_id(ticket_id: str, db: Session = Depends(get_db)):
    """Retrieve a single ticket by its UUID."""
    ticket = db.query(TicketModel).filter(TicketModel.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail=f"Ticket with ID '{ticket_id}' not found")
    return ticket

@router.put("/tickets/{ticket_id}", response_model=TicketResponse)
def update_ticket(ticket_id: str, update_data: TicketUpdateRequest, db: Session = Depends(get_db)):
    """Update ticket attributes (status, priority, department, etc.)."""
    ticket = db.query(TicketModel).filter(TicketModel.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail=f"Ticket with ID '{ticket_id}' not found")

    changes = []
    for field, val in update_data.model_dump(exclude_unset=True).items():
        if val is not None and getattr(ticket, field) != val:
            changes.append(f"{field}: '{getattr(ticket, field)}' -> '{val}'")
            setattr(ticket, field, val)

    ticket.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(ticket)

    if changes:
        history = HistoryModel(
            ticket_id=ticket.id,
            action="UPDATED",
            changes=", ".join(changes)
        )
        db.add(history)
        db.commit()

    logger.info(f"Updated ticket {ticket_id}: {changes}")
    return ticket

@router.delete("/tickets/{ticket_id}", status_code=status.HTTP_200_OK)
def delete_ticket(ticket_id: str, db: Session = Depends(get_db)):
    """Delete a ticket by ID."""
    ticket = db.query(TicketModel).filter(TicketModel.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail=f"Ticket with ID '{ticket_id}' not found")

    db.delete(ticket)
    db.commit()
    logger.info(f"Deleted ticket {ticket_id}")
    return {"message": f"Ticket {ticket_id} deleted successfully"}

@router.get("/analytics", response_model=Dict[str, Any])
def get_analytics(db: Session = Depends(get_db)):
    """Retrieve aggregated dashboard analytics, counts, category/priority distribution, and average confidence."""
    total_count = db.query(TicketModel).count()
    pending_count = db.query(TicketModel).filter(TicketModel.status == "pending").count()
    in_progress_count = db.query(TicketModel).filter(TicketModel.status == "in_progress").count()
    completed_count = db.query(TicketModel).filter(TicketModel.status == "completed").count()

    # Category distribution
    categories = db.query(TicketModel.category).all()
    category_counts: Dict[str, int] = {}
    for (cat,) in categories:
        category_counts[cat] = category_counts.get(cat, 0) + 1

    # Priority distribution
    priorities = db.query(TicketModel.priority).all()
    priority_counts: Dict[str, int] = {}
    for (prio,) in priorities:
        priority_counts[prio] = priority_counts.get(prio, 0) + 1

    # Avg confidence
    all_tickets = db.query(TicketModel).all()
    avg_confidence = (
        sum(t.confidence_score for t in all_tickets) / len(all_tickets)
        if all_tickets else 0.85
    )

    return {
        "totalCount": total_count,
        "pendingCount": pending_count,
        "inProgressCount": in_progress_count,
        "completedCount": completed_count,
        "progressPercentage": round((completed_count / total_count * 100), 1) if total_count > 0 else 0,
        "categoryDistribution": category_counts,
        "priorityDistribution": priority_counts,
        "averageConfidenceScore": round(avg_confidence, 2),
    }