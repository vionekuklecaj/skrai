# SKRAI — Kosovo National AI-Powered Drone Detection & Airspace Awareness Platform

**DEMO PROTOTYPE — All data is simulated. Not for operational use.**

## Stack
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS v4, Recharts, Leaflet
- **Backend**: Python FastAPI, SQLite + SQLAlchemy
- **Port**: Frontend :3000 | Backend API :8000

## Quick Start

```bash
./start.sh
```

Or manually:

```bash
# Backend
cd backend && uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Frontend
cd frontend && npm run dev
```

## Pages
| Route | Description |
|-------|-------------|
| /dashboard | Stats + Kosovo map + recent activity |
| /cameras | 8 simulated camera feeds |
| /detections | AI detection review with modal detail |
| /incidents | Searchable incident table with status management |
| /analytics | Charts: detections over time, by region, by source, status dist |
| /notifications | Notification center with read/unread |
| /settings | Demo mode toggle, language selector |
| /report | Public drone sighting report form |

## API Endpoints
- GET /api/dashboard/stats
- GET /api/cameras
- GET /api/detections
- GET /api/incidents
- PATCH /api/incidents/{id}/status
- POST /api/reports
- GET /api/analytics/overview
- GET /api/notifications
- PATCH /api/notifications/{id}/read
- POST /api/demo/trigger-detection
- WS /ws/notifications
- Docs: http://localhost:8000/docs

## Languages
- English (EN)
- Albanian / Shqip (SQ)
