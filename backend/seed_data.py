from datetime import datetime, timedelta
import random
from database import SessionLocal, create_tables
from models import Camera, Detection, Incident, PublicReport, Notification

def seed():
    create_tables()
    db = SessionLocal()

    # Clear existing
    db.query(Notification).delete()
    db.query(PublicReport).delete()
    db.query(Incident).delete()
    db.query(Detection).delete()
    db.query(Camera).delete()
    db.commit()

    cameras = [
        Camera(camera_id="CAM-001", name="Pristina Airport Perimeter", location="Pristina Airport", lat=42.5728, lng=21.0358, status="ONLINE"),
        Camera(camera_id="CAM-002", name="Pristina City Center", location="Pristina Center", lat=42.6629, lng=21.1655, status="ONLINE"),
        Camera(camera_id="CAM-003", name="Prizren Old Town", location="Prizren", lat=42.2139, lng=20.7397, status="ONLINE"),
        Camera(camera_id="CAM-004", name="Peja Mountain Outpost", location="Peja", lat=42.6598, lng=20.2886, status="DEGRADED"),
        Camera(camera_id="CAM-005", name="Gjilan Eastern Border", location="Gjilan", lat=42.4617, lng=21.4694, status="ONLINE"),
        Camera(camera_id="CAM-006", name="Ferizaj South Checkpoint", location="Ferizaj", lat=42.3702, lng=21.1553, status="ONLINE"),
        Camera(camera_id="CAM-007", name="Mitrovica Bridge Watch", location="Mitrovica", lat=42.8914, lng=20.8660, status="OFFLINE"),
        Camera(camera_id="CAM-008", name="Gjakova Western Sector", location="Gjakova", lat=42.3803, lng=20.4294, status="ONLINE"),
    ]
    db.add_all(cameras)
    db.commit()

    risk_levels = ["LOW", "LOW", "MODERATE", "MODERATE", "HIGH", "UNDETERMINED"]
    statuses = ["PENDING", "PENDING", "VERIFIED", "DISMISSED"]
    cam_ids = ["CAM-001", "CAM-002", "CAM-003", "CAM-004", "CAM-005", "CAM-006", "CAM-008"]
    cam_names = {
        "CAM-001": "Pristina Airport Perimeter",
        "CAM-002": "Pristina City Center",
        "CAM-003": "Prizren Old Town",
        "CAM-004": "Peja Mountain Outpost",
        "CAM-005": "Gjilan Eastern Border",
        "CAM-006": "Ferizaj South Checkpoint",
        "CAM-008": "Gjakova Western Sector",
    }
    obs_list = [
        "[SIMULATED] Object detected moving at approximately 15 m/s altitude ~80m. No navigation lights visible.",
        "[SIMULATED] Small aerial object with rotating elements. Trajectory suggests recreational flight.",
        "[SIMULATED] Unidentified aerial vehicle hovering near restricted boundary. High confidence drone classification.",
        "[SIMULATED] Fast-moving object near perimeter. Classification confidence moderate.",
        "[SIMULATED] Multiple aerial objects detected. Possible swarm behavior. Requires human review.",
        "[SIMULATED] Aerial object detected crossing into monitored airspace from northern sector.",
    ]
    detections = []
    for i in range(1, 16):
        cid = random.choice(cam_ids)
        det = Detection(
            camera_id=cid,
            camera_name=cam_names[cid],
            timestamp=datetime.utcnow() - timedelta(hours=random.randint(1, 72)),
            confidence=round(random.uniform(0.55, 0.98), 2),
            risk_level=random.choice(risk_levels),
            status=random.choice(statuses),
            ai_observations=random.choice(obs_list),
        )
        detections.append(det)
    db.add_all(detections)
    db.commit()

    locations = [
        ("Pristina Airport", 42.5728, 21.0358),
        ("Pristina Center", 42.6629, 21.1655),
        ("Prizren", 42.2139, 20.7397),
        ("Peja", 42.6598, 20.2886),
        ("Gjilan", 42.4617, 21.4694),
        ("Ferizaj", 42.3702, 21.1553),
        ("Mitrovica", 42.8914, 20.8660),
        ("Gjakova", 42.3803, 20.4294),
        ("Vushtrri", 42.8231, 20.9679),
        ("Suhareka", 42.3597, 20.8266),
    ]
    incident_titles = [
        "[DEMO] Unknown UAV spotted near infrastructure",
        "[DEMO] Unauthorized drone in restricted airspace",
        "[DEMO] Suspicious aerial object near public gathering",
        "[DEMO] Unregistered drone detected near border",
        "[DEMO] Night-time drone activity reported",
        "[DEMO] Commercial drone violating no-fly zone",
        "[DEMO] Multiple UAVs detected simultaneously",
        "[DEMO] Drone with unknown payload observed",
        "[DEMO] High-altitude unmanned aircraft detected",
        "[DEMO] Drone flight near critical infrastructure",
    ]
    inc_statuses = ["NEW", "NEW", "UNDER_REVIEW", "UNDER_REVIEW", "AWAITING_INFORMATION", "VERIFIED", "UNVERIFIED", "CLOSED"]
    inc_risks = ["LOW", "MODERATE", "HIGH", "UNDETERMINED"]
    inc_sources = ["CAMERA", "CAMERA", "PUBLIC_REPORT", "MANUAL"]
    incidents = []
    for i in range(1, 21):
        loc = random.choice(locations)
        inc = Incident(
            reference=f"INC-2024-{i:04d}",
            title=random.choice(incident_titles),
            description=f"[DEMO] Incident detected via automated monitoring system. This is simulated demonstration data. Location: {loc[0]}. All details are fictional.",
            location=loc[0],
            lat=loc[1] + random.uniform(-0.05, 0.05),
            lng=loc[2] + random.uniform(-0.05, 0.05),
            status=random.choice(inc_statuses),
            risk_level=random.choice(inc_risks),
            source=random.choice(inc_sources),
            created_at=datetime.utcnow() - timedelta(days=random.randint(0, 30)),
            updated_at=datetime.utcnow() - timedelta(hours=random.randint(1, 24)),
            notes="[DEMO] Automated classification pending human review.",
        )
        incidents.append(inc)
    db.add_all(incidents)
    db.commit()

    pub_locations = ["Pristina", "Prizren", "Peja", "Gjilan", "Ferizaj", "Mitrovica", "Gjakova", "Vushtrri"]
    pub_descriptions = [
        "[DEMO] Saw a drone flying over my neighborhood for about 20 minutes.",
        "[DEMO] Drone with camera flying low near school grounds.",
        "[DEMO] Unknown drone hovering near apartment building.",
        "[DEMO] Multiple drones flying in formation near stadium.",
        "[DEMO] Drone seen near government building, seemed to be recording.",
    ]
    reports = []
    for i in range(1, 11):
        rep = PublicReport(
            reference=f"RPT-2024-{i:04d}",
            location=random.choice(pub_locations),
            description=random.choice(pub_descriptions),
            sighting_time=datetime.utcnow() - timedelta(hours=random.randint(1, 168)),
            created_at=datetime.utcnow() - timedelta(hours=random.randint(1, 48)),
            status=random.choice(["NEW", "REVIEWED", "CLOSED"]),
        )
        reports.append(rep)
    db.add_all(reports)
    db.commit()

    notif_data = [
        ("HIGH Risk Detection", "[DEMO] High-risk UAV detected near Pristina Airport perimeter.", "ALERT"),
        ("New Public Report", "[DEMO] New drone sighting submitted from Prizren.", "INFO"),
        ("Camera Offline", "[DEMO] CAM-007 (Mitrovica Bridge Watch) went offline.", "WARNING"),
        ("Incident Verified", "[DEMO] Incident INC-2024-0003 has been verified by operator.", "INFO"),
        ("System Notice", "[DEMO] Scheduled maintenance window: 02:00-04:00 UTC.", "INFO"),
        ("Detection Spike", "[DEMO] Unusual detection activity in Gjilan sector.", "WARNING"),
        ("New Incident", "[DEMO] Incident INC-2024-0015 created from public report.", "INFO"),
        ("Camera Degraded", "[DEMO] CAM-004 (Peja Mountain) reporting degraded signal.", "WARNING"),
        ("Daily Summary", "[DEMO] Today: 7 detections, 3 new incidents, 2 reports.", "INFO"),
        ("High Confidence Alert", "[DEMO] 97% confidence drone detected near restricted zone.", "ALERT"),
        ("Incident Closed", "[DEMO] Incident INC-2024-0008 closed - assessed as recreational.", "INFO"),
        ("New Detection", "[DEMO] Automated detection from CAM-002 Pristina City Center.", "INFO"),
        ("Public Report Received", "[DEMO] Anonymous drone report received for Ferizaj.", "INFO"),
        ("System Update", "[DEMO] AI detection model updated to v2.3.1.", "INFO"),
        ("Border Alert", "[DEMO] Drone activity detected near eastern border zone.", "ALERT"),
        ("Inspection Due", "[DEMO] Scheduled inspection for CAM-003 due in 48 hours.", "WARNING"),
        ("New User Added", "[DEMO] New operator account activated.", "INFO"),
        ("Detection Dismissed", "[DEMO] False positive dismissed - birds, not drone.", "INFO"),
        ("High Activity Period", "[DEMO] Elevated detection count in evening hours.", "WARNING"),
        ("Backup Completed", "[DEMO] System backup completed successfully.", "INFO"),
        ("Incident Update", "[DEMO] INC-2024-0012 status changed to Awaiting Information.", "INFO"),
        ("Camera Online", "[DEMO] CAM-007 back online after maintenance.", "INFO"),
        ("Public Report", "[DEMO] Drone sighting reported near Mitrovica bridge.", "INFO"),
        ("Critical Alert", "[DEMO] Multiple simultaneous detections in northern sector.", "ALERT"),
        ("Shift Report", "[DEMO] Night shift summary: 3 detections, 0 confirmed incidents.", "INFO"),
    ]
    notifs = []
    for i, (title, msg, ntype) in enumerate(notif_data):
        notifs.append(Notification(
            title=title,
            message=msg,
            type=ntype,
            is_read=i > 7,
            created_at=datetime.utcnow() - timedelta(hours=i * 2),
        ))
    db.add_all(notifs)
    db.commit()
    db.close()
    print("Database seeded successfully.")

if __name__ == "__main__":
    seed()
