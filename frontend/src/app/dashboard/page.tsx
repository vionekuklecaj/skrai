"use client";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { api } from "@/lib/api";
import { useLang } from "@/lib/LangContext";
import { t } from "@/lib/translations";
import { Camera, Zap, AlertTriangle, CheckCircle, FileText, Shield, RefreshCw } from "lucide-react";
import dynamic from "next/dynamic";

const KosovoMap = dynamic(() => import("@/components/KosovoMap"), { ssr: false });

export default function DashboardPage() {
  const { lang } = useLang();
  const [stats, setStats] = useState<any>(null);
  const [cameras, setCameras] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getDashboardStats(), api.getCameras(), api.getIncidents()])
      .then(([s, c, i]) => { setStats(s); setCameras(c); setIncidents(i.slice(0, 8)); })
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: t(lang, "totalCameras"), value: stats.total_cameras, icon: Camera, color: "#3b82f6" },
    { label: t(lang, "onlineCameras"), value: stats.online_cameras, icon: Camera, color: "#16a34a" },
    { label: t(lang, "detectionsToday"), value: stats.detections_today, icon: Zap, color: "#ea580c" },
    { label: t(lang, "pendingIncidents"), value: stats.pending_incidents, icon: AlertTriangle, color: "#dc2626" },
    { label: t(lang, "publicReports"), value: stats.public_reports, icon: FileText, color: "#7c3aed" },
    { label: t(lang, "confirmedIncidents"), value: stats.confirmed_incidents, icon: CheckCircle, color: "#16a34a" },
  ] : [];

  const riskColor: Record<string, string> = {
    HIGH: "#ef4444", MODERATE: "#fb923c", LOW: "#4ade80", UNDETERMINED: "#94a3b8"
  };
  const statusColor: Record<string, string> = {
    NEW: "#ef4444", UNDER_REVIEW: "#fb923c", AWAITING_INFORMATION: "#facc15",
    VERIFIED: "#4ade80", UNVERIFIED: "#94a3b8", CLOSED: "#475569"
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header title={t(lang, "dashboard")} />
        <main style={{ flex: 1, overflowY: "auto", padding: "24px", background: "#0a0e1a" }}>
          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 24 }}>
            {loading ? Array(6).fill(0).map((_, i) => (
              <div key={i} className="stat-card" style={{ height: 90, opacity: 0.5 }} />
            )) : statCards.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="stat-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{label}</div>
                  </div>
                  <Icon size={20} style={{ color, opacity: 0.7 }} />
                </div>
              </div>
            ))}
          </div>

          {/* Map + Activity */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
            {/* Map */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid #2a3a55", display: "flex", alignItems: "center", gap: 8 }}>
                <Shield size={15} style={{ color: "#3b82f6" }} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Kosovo Airspace Map</span>
                <span className="badge badge-blue" style={{ marginLeft: "auto" }}>DEMO</span>
              </div>
              <div style={{ height: 400 }}>
                <KosovoMap cameras={cameras} incidents={incidents} />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card" style={{ padding: 0 }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid #2a3a55", display: "flex", alignItems: "center", gap: 8 }}>
                <RefreshCw size={15} style={{ color: "#3b82f6" }} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>{t(lang, "recentActivity")}</span>
              </div>
              <div style={{ overflowY: "auto", maxHeight: 400 }}>
                {incidents.map((inc) => (
                  <div key={inc.id} style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #1a2235",
                    display: "flex", flexDirection: "column", gap: 4,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>{inc.reference}</span>
                      <span className="badge" style={{
                        background: `${riskColor[inc.risk_level] || "#94a3b8"}22`,
                        color: riskColor[inc.risk_level] || "#94a3b8",
                        border: `1px solid ${riskColor[inc.risk_level] || "#94a3b8"}44`,
                        fontSize: 10,
                      }}>{inc.risk_level}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.4 }}>{inc.title}</div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11, color: "#475569" }}>{inc.location}</span>
                      <span className="badge" style={{
                        background: `${statusColor[inc.status] || "#94a3b8"}22`,
                        color: statusColor[inc.status] || "#94a3b8",
                        border: `1px solid ${statusColor[inc.status] || "#94a3b8"}44`,
                        fontSize: 10,
                      }}>{inc.status.replace("_", " ")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
