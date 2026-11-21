"use client";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { api } from "@/lib/api";
import { useLang } from "@/lib/LangContext";
import { t } from "@/lib/translations";
import { Camera, Wifi, WifiOff, AlertCircle, MapPin, Clock } from "lucide-react";

function CameraPreview({ status }: { status: string }) {
  return (
    <div className="camera-preview">
      {status === "ONLINE" && <div className="scan-line" />}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        {status === "OFFLINE" ? (
          <>
            <WifiOff size={28} style={{ color: "#ef4444", marginBottom: 6 }} />
            <div style={{ fontSize: 10, color: "#ef4444" }}>NO SIGNAL</div>
          </>
        ) : status === "DEGRADED" ? (
          <>
            <AlertCircle size={28} style={{ color: "#fb923c", marginBottom: 6 }} />
            <div style={{ fontSize: 10, color: "#fb923c" }}>DEGRADED SIGNAL</div>
          </>
        ) : (
          <>
            {/* Simulated camera grid overlay */}
            <div style={{
              width: 60, height: 45, border: "1px solid rgba(37,99,235,0.4)",
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, opacity: 0.5,
            }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ background: `rgba(37,99,235,${0.1 + i * 0.05})` }} />
              ))}
            </div>
            <div style={{ fontSize: 10, color: "#3b82f6", marginTop: 8 }}>[SIMULATED FEED]</div>
          </>
        )}
      </div>
      {/* Corner brackets */}
      {status === "ONLINE" && (
        <>
          <div style={{ position: "absolute", top: 6, left: 6, width: 12, height: 12, borderTop: "2px solid #3b82f6", borderLeft: "2px solid #3b82f6" }} />
          <div style={{ position: "absolute", top: 6, right: 6, width: 12, height: 12, borderTop: "2px solid #3b82f6", borderRight: "2px solid #3b82f6" }} />
          <div style={{ position: "absolute", bottom: 6, left: 6, width: 12, height: 12, borderBottom: "2px solid #3b82f6", borderLeft: "2px solid #3b82f6" }} />
          <div style={{ position: "absolute", bottom: 6, right: 6, width: 12, height: 12, borderBottom: "2px solid #3b82f6", borderRight: "2px solid #3b82f6" }} />
        </>
      )}
    </div>
  );
}

export default function CamerasPage() {
  const { lang } = useLang();
  const [cameras, setCameras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCameras().then(setCameras).finally(() => setLoading(false));
  }, []);

  const statusColors: Record<string, string> = {
    ONLINE: "#4ade80", OFFLINE: "#ef4444", DEGRADED: "#fb923c"
  };

  const online = cameras.filter(c => c.status === "ONLINE").length;
  const offline = cameras.filter(c => c.status === "OFFLINE").length;
  const degraded = cameras.filter(c => c.status === "DEGRADED").length;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header title={t(lang, "cameras")} />
        <main style={{ flex: 1, overflowY: "auto", padding: "24px", background: "#0a0e1a" }}>
          {/* Summary */}
          <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            {[
              { label: "Online", count: online, color: "#16a34a" },
              { label: "Offline", count: offline, color: "#dc2626" },
              { label: "Degraded", count: degraded, color: "#ea580c" },
            ].map(({ label, count, color }) => (
              <div key={label} className="stat-card" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px" }}>
                <div className="pulse-dot" style={{ background: color }} />
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color }}>{count}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{label}</div>
                </div>
              </div>
            ))}
            <div style={{ marginLeft: "auto", fontSize: 12, color: "#475569", display: "flex", alignItems: "center" }}>
              All feeds are simulated demo data
            </div>
          </div>

          {/* Camera grid */}
          {loading ? (
            <div style={{ color: "#64748b", textAlign: "center", padding: 48 }}>Loading cameras...</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {cameras.map((cam) => (
                <div key={cam.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
                  {/* Header */}
                  <div style={{ padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #2a3a55" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Camera size={14} style={{ color: "#3b82f6" }} />
                      <span style={{ fontSize: 12, fontWeight: 600, fontFamily: "monospace", color: "#60a5fa" }}>{cam.camera_id}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div className="pulse-dot" style={{ background: statusColors[cam.status], width: 7, height: 7 }} />
                      <span style={{ fontSize: 11, color: statusColors[cam.status], fontWeight: 600 }}>{cam.status}</span>
                    </div>
                  </div>

                  {/* Preview */}
                  <div style={{ padding: 10 }}>
                    <CameraPreview status={cam.status} />
                  </div>

                  {/* Info */}
                  <div style={{ padding: "10px 14px", borderTop: "1px solid #2a3a55" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 6 }}>{cam.name}</div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#64748b" }}>
                        <MapPin size={11} />
                        {cam.location}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#64748b" }}>
                        <Clock size={11} />
                        {cam.last_update ? new Date(cam.last_update).toLocaleTimeString() : "—"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
