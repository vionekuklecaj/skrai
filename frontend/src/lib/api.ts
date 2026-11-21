const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchApi(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  getDashboardStats: () => fetchApi("/api/dashboard/stats"),
  getCameras: () => fetchApi("/api/cameras"),
  getDetections: () => fetchApi("/api/detections"),
  getIncidents: () => fetchApi("/api/incidents"),
  updateIncidentStatus: (id: number, body: object) =>
    fetchApi(`/api/incidents/${id}/status`, { method: "PATCH", body: JSON.stringify(body) }),
  updateDetectionStatus: (id: number, body: object) =>
    fetchApi(`/api/detections/${id}/status`, { method: "PATCH", body: JSON.stringify(body) }),
  getAnalytics: () => fetchApi("/api/analytics/overview"),
  getNotifications: () => fetchApi("/api/notifications"),
  markNotificationRead: (id: number) =>
    fetchApi(`/api/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () =>
    fetchApi("/api/notifications/read-all", { method: "PATCH" }),
  triggerDemoDetection: () =>
    fetchApi("/api/demo/trigger-detection", { method: "POST" }),
};
