import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class TicketModel(Base):
    __tablename__ = "tickets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, default="General")
    priority = Column(String(20), nullable=False, default="Medium")
    department = Column(String(50), nullable=False, default="Support")
    status = Column(String(20), nullable=False, default="pending")  # pending, in_progress, completed
    reasoning = Column(Text, nullable=True)
    confidence_score = Column(Float, nullable=False, default=0.85)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    histories = relationship("HistoryModel", back_populates="ticket", cascade="all, delete-orphan")

class HistoryModel(Base):
    __tablename__ = "histories"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ticket_id = Column(String(36), ForeignKey("tickets.id"), nullable=False)
    action = Column(String(50), nullable=False)  # CREATED, UPDATED, DELETED, ANALYZED
    changes = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    ticket = relationship("TicketModel", back_populates="histories")

class AnalyticsModel(Base):
    __tablename__ = "analytics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    metric_name = Column(String(100), nullable=False)
    metric_value = Column(Float, nullable=False)
    recorded_at = Column(DateTime, default=datetime.utcnow)

class LogModel(Base):
    __tablename__ = "system_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    level = Column(String(20), nullable=False)
    message = Column(Text, nullable=False)
    module = Column(String(50), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
