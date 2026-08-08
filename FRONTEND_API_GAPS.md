# Frontend API Gaps & Backend Requirements

This document tracks required backend endpoints for the VajraNet FastAPI backend (`http://localhost:8000/api/v1`).

## Incident Management Endpoints
- `POST /api/v1/incidents/sos`: Broadcast immediate emergency distress packet.
- `GET /api/v1/incidents`: Fetch active disaster incidents with severity filtering.
- `PATCH /api/v1/incidents/{id}/dispatch`: Assign response force squad to incident.

## Announcements & Government Directives
- `GET /api/v1/government/announcements`: Official safety advisories and evacuation notices.
- `POST /api/v1/government/announcements`: Publish new government broadcast directive.

## Resource & Shelter Tracking
- `GET /api/v1/resources/shelters`: List relief shelters with live occupancy and supply metrics.
- `GET /api/v1/resources/hospitals`: List emergency hospitals with open ICU bed capacity and oxygen levels.
- `PATCH /api/v1/resources/hospitals/{id}/beds`: Broadcast updated ICU bed availability.

## Volunteer Field Operations
- `GET /api/v1/volunteers/tasks`: List field operations and supply distribution tasks.
- `POST /api/v1/volunteers/tasks`: Create new field response task.
- `PATCH /api/v1/volunteers/tasks/{id}/status`: Update task completion status (`PENDING`, `IN_PROGRESS`, `COMPLETED`).
