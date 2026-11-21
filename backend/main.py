from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
import random, string, os, asyncio, json
from typing import Optional, List
from database import get_db, create_tables
from models import Camera, Detection, Incident, PublicReport, Notification

app = FastAPI(title="SKRAI API", description="Kosovo National AI-Powered Drone Detection Platform - DEMO")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "/home/claude/skrai/backend/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# WebSocket connections
active_connections: List[WebSocket] = []

@app.on_event("startup")
async def startup():
    create_tables()

def random_ref(prefix: str, length: int = 8) -> str:
    return f"{prefix}-" + "".join(random.choices(string.digits, k=length))

# Dashboard
@app.get("/api/dashboard/stats")
def dashboard_stats(db: Session = Depends(get_db)):
    total_cameras = db.query(Camera).count()
    online_cameras = db.query(Camera).filter(Camera.status == "ONLINE").count()
    today = datetime.utcnow().replace(hour=0, minute=0, second=0)
    detections_today = db.query(Detection).filter(Detection.timestamp >= today).count()
    pending_incidents = db.query(Incident).filter(Incident.status.in_(["NEW", "UNDER_REVIEW"])).count()
    public_reports = db.query(PublicReport).count()
    confirmed_incidents = db.query(Incident).filter(Incident.status == "VERIFIED").count()
    unread_notifications = db.query(Notification).filter(Notification.is_read == False).count()
    return {
        "total_cameras": total_cameras,
        "online_cameras": online_cameras,
        "detections_today": detections_today,
        "pending_incidents": pending_incidents,
        "public_reports": public_reports,
        "confirmed_incidents": confirmed_incidents,
        "unread_notifications": unread_notifications,
        "demo_mode": True,
    }

# Cameras
@app.get("/api/cameras")
def get_cameras(db: Session = Depends(get_db)):
    cameras = db.query(Camera).all()
    return [
        {
            "id": c.id,
            "camera_id": c.camera_id,
            "name": c.name,
            "location": c.location,
            "lat": c.lat,
            "lng": c.lng,
            "status": c.status,
            "last_update": c.last_update.isoformat() if c.last_update else None,
        }
        for c in cameras
    ]

# Detections
@app.get("/api/detections")
def get_detections(db: Session = Depends(get_db)):
    dets = db.query(Detection).order_by(Detection.timestamp.desc()).all()
    return [
        {
            "id": d.id,
            "camera_id": d.camera_id,
            "camera_name": d.camera_name,
            "timestamp": d.timestamp.isoformat(),
            "confidence": d.confidence,
            "risk_level": d.risk_level,
            "status": d.status,
            "ai_observations": d.ai_observations,
            "human_notes": d.human_notes,
        }
        for d in dets
    ]

@app.patch("/api/detections/{det_id}/status")
def update_detection_status(det_id: int, body: dict, db: Session = Depends(get_db)):
    det = db.query(Detection).filter(Detection.id == det_id).first()
    if not det:
        raise HTTPException(404, "Detection not found")
    det.status = body.get("status", det.status)
    det.human_notes = body.get("human_notes", det.human_notes)
    db.commit()
    return {"status": "updated"}

# Incidents
@app.get("/api/incidents")
def get_incidents(db: Session = Depends(get_db)):
    incs = db.query(Incident).order_by(Incident.created_at.desc()).all()
    return [
        {
            "id": i.id,
            "reference": i.reference,
            "title": i.title,
            "description": i.description,
            "location": i.location,
            "lat": i.lat,
            "lng": i.lng,
            "status": i.status,
            "risk_level": i.risk_level,
            "source": i.source,
            "created_at": i.created_at.isoformat(),
            "updated_at": i.updated_at.isoformat(),
            "notes": i.notes,
        }
        for i in incs
    ]

@app.patch("/api/incidents/{inc_id}/status")
def update_incident_status(inc_id: int, body: dict, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == inc_id).first()
    if not inc:
        raise HTTPException(404, "Incident not found")
    inc.status = body.get("status", inc.status)
    inc.notes = body.get("notes", inc.notes)
    inc.updated_at = datetime.utcnow()
    db.commit()
    return {"status": "updated"}

# Public Reports
@app.post("/api/reports")
async def submit_report(
    location: str = Form(...),
    description: str = Form(...),
    sighting_time: Optional[str] = Form(None),
    contact_email: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    ref = random_ref("RPT")
    file_path = None
    if file:
        ext = os.path.splitext(file.filename)[1].lower()
        allowed = [".jpg", ".jpeg", ".png", ".mp4", ".mov"]
        if ext not in allowed:
            raise HTTPException(400, "File type not allowed")
        fname = f"{ref}{ext}"
        fpath = os.path.join(UPLOAD_DIR, fname)
        content = await file.read()
        if len(content) > 50 * 1024 * 1024:
            raise HTTPException(400, "File too large (max 50MB)")
        with open(fpath, "wb") as f:
            f.write(content)
        file_path = fname

    sighting_dt = None
    if sighting_time:
        try:
            sighting_dt = datetime.fromisoformat(sighting_time)
        except:
            pass

    report = PublicReport(
        reference=ref,
        location=location,
        description=description,
        sighting_time=sighting_dt,
        contact_email=contact_email,
        file_path=file_path,
    )
    db.add(report)
    db.commit()

    # Add notification
    notif = Notification(
        title="New Public Report",
        message=f"[DEMO] New drone sighting submitted from {location}. Reference: {ref}",
        type="INFO",
    )
    db.add(notif)
    db.commit()

    return {"reference": ref, "message": "Report submitted successfully.", "demo": True}

# Analytics
@app.get("/api/analytics/overview")
def analytics_overview(db: Session = Depends(get_db)):
    # Reports over time (last 7 days)
    reports_over_time = []
    for i in range(6, -1, -1):
        day = datetime.utcnow() - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        count = db.query(Detection).filter(Detection.timestamp >= day_start, Detection.timestamp < day_end).count()
        reports_over_time.append({"date": day_start.strftime("%m/%d"), "detections": count})

    # By region
    locations = ["Pristina", "Prizren", "Peja", "Gjilan", "Ferizaj", "Mitrovica", "Gjakova"]
    by_region = []
    for loc in locations:
        count = db.query(Incident).filter(Incident.location.contains(loc)).count()
        by_region.append({"region": loc, "incidents": count if count > 0 else random.randint(1, 5)})

    # By source
    camera_count = db.query(Incident).filter(Incident.source == "CAMERA").count()
    public_count = db.query(Incident).filter(Incident.source == "PUBLIC_REPORT").count()
    manual_count = db.query(Incident).filter(Incident.source == "MANUAL").count()
    by_source = [
        {"name": "Camera AI", "value": camera_count},
        {"name": "Public Report", "value": public_count},
        {"name": "Manual Entry", "value": manual_count},
    ]

    # Status distribution
    statuses = ["NEW", "UNDER_REVIEW", "AWAITING_INFORMATION", "VERIFIED", "UNVERIFIED", "CLOSED"]
    status_dist = []
    for s in statuses:
        count = db.query(Incident).filter(Incident.status == s).count()
        status_dist.append({"name": s.replace("_", " "), "value": count})

    return {
        "reports_over_time": reports_over_time,
        "by_region": by_region,
        "by_source": by_source,
        "status_distribution": status_dist,
        "demo": True,
    }

# Notifications
@app.get("/api/notifications")
def get_notifications(db: Session = Depends(get_db)):
    notifs = db.query(Notification).order_by(Notification.created_at.desc()).limit(50).all()
    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.type,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat(),
        }
        for n in notifs
    ]

@app.patch("/api/notifications/{notif_id}/read")
def mark_read(notif_id: int, db: Session = Depends(get_db)):
    n = db.query(Notification).filter(Notification.id == notif_id).first()
    if n:
        n.is_read = True
        db.commit()
    return {"status": "ok"}

@app.patch("/api/notifications/read-all")
def mark_all_read(db: Session = Depends(get_db)):
    db.query(Notification).filter(Notification.is_read == False).update({"is_read": True})
    db.commit()
    return {"status": "ok"}

# Demo trigger
@app.post("/api/demo/trigger-detection")
def trigger_detection(db: Session = Depends(get_db)):
    cam_ids = ["CAM-001", "CAM-002", "CAM-003", "CAM-005", "CAM-006", "CAM-008"]
    cam_names = {
        "CAM-001": "Pristina Airport Perimeter",
        "CAM-002": "Pristina City Center",
        "CAM-003": "Prizren Old Town",
        "CAM-005": "Gjilan Eastern Border",
        "CAM-006": "Ferizaj South Checkpoint",
        "CAM-008": "Gjakova Western Sector",
    }
    cid = random.choice(cam_ids)
    det = Detection(
        camera_id=cid,
        camera_name=cam_names[cid],
        confidence=round(random.uniform(0.70, 0.99), 2),
        risk_level=random.choice(["MODERATE", "HIGH", "UNDETERMINED"]),
        status="PENDING",
        ai_observations=f"[SIMULATED] Demo-triggered detection event. Aerial object detected by {cam_names[cid]}.",
    )
    db.add(det)
    notif = Notification(
        title="[DEMO] New Detection Triggered",
        message=f"[DEMO] Simulated detection event triggered at {cam_names[cid]}.",
        type="ALERT",
    )
    db.add(notif)
    db.commit()
    return {"status": "triggered", "camera": cam_names[cid], "demo": True}

# WebSocket
@app.websocket("/ws/notifications")
async def ws_notifications(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            await asyncio.sleep(30)
            await websocket.send_json({"type": "ping", "demo": True})
    except WebSocketDisconnect:
        active_connections.remove(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
