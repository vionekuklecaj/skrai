"use client";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { api } from "@/lib/api";
import { useLang } from "@/lib/LangContext";
import { t } from "@/lib/translations";
import { Zap, X, Bot, User } from "lucide-react";

function RiskBadge({ level }: { level: string }) {
  const map: Record<string, string> = { HIGH: "badge-red", MODERATE: "badge-orange", LOW: "badge-green", UNDETERMINED: "badge-gray" };
  return <span className={`badge ${map[level] || "badge-gray"}`}>{level}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { PENDING: "badge-yellow", VERIFIED: "badge-green", DISMISSED: "badge-gray" };
  return <span className={`badge ${map[status] || "badge-gray"}`}>{status}</span>;
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 85 ? "#ef4444" : pct >= 65 ? "#fb923c" : "#facc15";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: "#1a2235", borderRadius: 2 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 11, color, fontWeight: 600, minWidth: 32 }}>{pct}%</span>
    </div>
  );
}

export default function DetectionsPage() {
  const { lang } = useLang();
  const [detections, setDetections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterRisk, setFilterRisk] = useState("ALL");

  useEffect(() => {
    api.getDetections().then(setDetections).finally(() => setLoading(false));
  }, []);

  const filtered = detections.filter(d =>
    (filterStatus === "ALL" || d.status === filterStatus) &&
    (filterRisk === "ALL" || d.risk_level === filterRisk)
  );

  const handleTriggerDemo = async () => {
    await api.triggerDemoDetection();
    const updated = await api.getDetections();
    setDetections(updated);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header title={t(lang, "detections")} />
        <main style={{ flex: 1, overflowY: "auto", padding: "24px", background: "#0a0e1a" }}>
          {/* Toolbar */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: "auto" }}>
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="VERIFIED">Verified</option>
              <option value="DISMISSED">Dismissed</option>
            </select>
            <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)} style={{ width: "auto" }}>
              <option value="ALL">All Risk Levels</option>
              <option value="HIGH">High</option>
              <option value="MODERATE">Moderate</option>
              <option value="LOW">Low</option>
              <option value="UNDETERMINED">Undetermined</option>
            </select>
            <button className="btn btn-primary" onClick={handleTriggerDemo} style={{ marginLeft: "auto" }}>
              <Zap size={14} /> {t(lang, "triggerDemo")}
            </button>
          </div>

          {/* Detection cards */}
          {loading ? (
            <div style={{ color: "#64748b", textAlign: "center", padding: 48 }}>Loading detections...</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map((det) => (
                <div key={det.id} className="card" style={{ cursor: "pointer" }} onClick={() => setSelected(det)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ minWidth: 80 }}>
                      <div style={{ fontSize: 10, color: "#475569" }}>ID</div>
                      <div style={{ fontSize: 12, fontFamily: "monospace", color: "#60a5fa" }}>DET-{det.id.toString().padStart(4, "0")}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <div style={{ fontSize: 10, color: "#475569" }}>Camera</div>
                      <div style={{ fontSize: 12, color: "#e2e8f0" }}>{det.camera_name}</div>
                    </div>
                    <div style={{ minWidth: 140 }}>
                      <div style={{ fontSize: 10, color: "#475569" }}>Timestamp</div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>{new Date(det.timestamp).toLocaleString()}</div>
                    </div>
                    <div style={{ minWidth: 120 }}>
                      <div style={{ fontSize: 10, color: "#475569", marginBottom: 4 }}>Confidence</div>
                      <ConfidenceBar value={det.confidence} />
                    </div>
                    <div><RiskBadge level={det.risk_level} /></div>
                    <div><StatusBadge status={det.status} /></div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div style={{ textAlign: "center", color: "#475569", padding: 48 }}>No detections found</div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Detection DET-{selected.id.toString().padStart(4, "0")}</h2>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{selected.camera_name} · {new Date(selected.timestamp).toLocaleString()}</div>
              </div>
              <button className="btn btn-secondary" onClick={() => setSelected(null)}><X size={14} /></button>
            </div>

            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <RiskBadge level={selected.risk_level} />
              <StatusBadge status={selected.status} />
              <span style={{ fontSize: 12, color: "#94a3b8" }}>Confidence: {Math.round(selected.confidence * 100)}%</span>
            </div>

            {/* Evidence placeholder */}
            <div style={{
              background: "#060a14", border: "1px solid #2a3a55", borderRadius: 6,
              height: 180, display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 20, flexDirection: "column", gap: 8,
            }}>
              <Zap size={24} style={{ color: "#3b82f6", opacity: 0.5 }} />
              <span style={{ fontSize: 11, color: "#334155" }}>[SIMULATED EVIDENCE SNAPSHOT]</span>
            </div>

            {/* AI Observations */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <Bot size={14} style={{ color: "#3b82f6" }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#60a5fa" }}>AI Observations</span>
                <span className="badge badge-blue" style={{ fontSize: 9 }}>AUTOMATED</span>
              </div>
              <div style={{ background: "#0d1526", border: "1px solid #1a2235", borderRadius: 6, padding: 12, fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>
                {selected.ai_observations || "No AI observations recorded."}
              </div>
            </div>

            {/* Human verification */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <User size={14} style={{ color: "#16a34a" }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#4ade80" }}>Human Verification</span>
                <span className="badge badge-green" style={{ fontSize: 9 }}>OPERATOR</span>
              </div>
              <textarea
                rows={3}
                placeholder="Add human review notes..."
                defaultValue={selected.human_notes || ""}
                style={{ marginBottom: 12 }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <select defaultValue={selected.status} style={{ flex: 1 }}
                  onChange={async (e) => {
                    await api.updateDetectionStatus(selected.id, { status: e.target.value });
                    const updated = await api.getDetections();
                    setDetections(updated);
                    setSelected(null);
                  }}>
                  <option value="PENDING">Pending</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="DISMISSED">Dismissed</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
