from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, Enum
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import enum

Base = declarative_base()

class RiskLevel(str, enum.Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    UNDETERMINED = "UNDETERMINED"

class IncidentStatus(str, enum.Enum):
    NEW = "NEW"
    UNDER_REVIEW = "UNDER_REVIEW"
    AWAITING_INFORMATION = "AWAITING_INFORMATION"
    VERIFIED = "VERIFIED"
    UNVERIFIED = "UNVERIFIED"
    CLOSED = "CLOSED"

class DetectionStatus(str, enum.Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    DISMISSED = "DISMISSED"

class CameraStatus(str, enum.Enum):
    ONLINE = "ONLINE"
    OFFLINE = "OFFLINE"
    DEGRADED = "DEGRADED"

class Camera(Base):
    __tablename__ = "cameras"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    status = Column(String, default="ONLINE")
    last_update = Column(DateTime, default=datetime.utcnow)
    stream_url = Column(String, nullable=True)
    camera_id = Column(String, unique=True)

class Detection(Base):
    __tablename__ = "detections"
    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(String, nullable=False)
    camera_name = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    confidence = Column(Float, nullable=False)
    risk_level = Column(String, default="UNDETERMINED")
    status = Column(String, default="PENDING")
    ai_observations = Column(Text, nullable=True)
    human_notes = Column(Text, nullable=True)
    evidence_url = Column(String, nullable=True)

class Incident(Base):
    __tablename__ = "incidents"
    id = Column(Integer, primary_key=True, index=True)
    reference = Column(String, unique=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    location = Column(String, nullable=False)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    status = Column(String, default="NEW")
    risk_level = Column(String, default="UNDETERMINED")
    source = Column(String, default="CAMERA")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    detection_id = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)

class PublicReport(Base):
    __tablename__ = "public_reports"
    id = Column(Integer, primary_key=True, index=True)
    reference = Column(String, unique=True)
    location = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    sighting_time = Column(DateTime, nullable=True)
    contact_email = Column(String, nullable=True)
    file_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="NEW")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, default="INFO")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    related_id = Column(Integer, nullable=True)
    related_type = Column(String, nullable=True)
