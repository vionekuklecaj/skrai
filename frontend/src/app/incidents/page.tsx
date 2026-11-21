"use client";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { api } from "@/lib/api";
import { useLang } from "@/lib/LangContext";
import { t } from "@/lib/translations";
import { Search, X, MapPin, AlertTriangle } from "lucide-react";

function RiskBadge({ level }: { level: string }) {
  const cls: Record<string, string> = { HIGH: "badge-red", MODERATE: "badge-orange", LOW: "badge-green", UNDETERMINED: "badge-gray" };
  return <span className={`badge ${cls[level] || "badge-gray"}`}>{level}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    NEW: "badge-red", UNDER_REVIEW: "badge-orange", AWAITING_INFORMATION: "badge-yellow",
    VERIFIED: "badge-green", UNVERIFIED: "badge-gray", CLOSED: "badge-gray",
  };
  return <span className={`badge ${cls[status] || "badge-gray"}`}>{status.replace(/_/g, " ")}</span>;
}

export default function IncidentsPage() {
  const { lang } = useLang();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterRisk, setFilterRisk] = useState("ALL");
  const [selected, setSelected] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    api.getIncidents().then(setIncidents).finally(() => setLoading(false));
  }, []);

  const filtered = incidents.filter(inc =>
    (inc.title.toLowerCase().includes(search.toLowerCase()) ||
     inc.reference.toLowerCase().includes(search.toLowerCase()) ||
     inc.location.toLowerCase().includes(search.toLowerCase())) &&
    (filterStatus === "ALL" || inc.status === filterStatus) &&
    (filterRisk === "ALL" || inc.risk_level === filterRisk)
  );

  const handleStatusUpdate = async () => {
    if (!selected) return;
    await api.updateIncidentStatus(selected.id, { status: newStatus || selected.status, notes });
    const updated = await api.getIncidents();
    setIncidents(updated);
    setSelected(null);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header title={t(lang, "incidents")} />
        <main style={{ flex: 1, overflowY: "auto", padding: "24px", background: "#0a0e1a" }}>
          {/* Toolbar */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#475569" }} />
              <input placeholder={t(lang, "search")} value={search} onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 32 }} />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: "auto" }}>
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="AWAITING_INFORMATION">Awaiting Info</option>
              <option value="VERIFIED">Verified</option>
              <option value="UNVERIFIED">Unverified</option>
              <option value="CLOSED">Closed</option>
            </select>
            <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)} style={{ width: "auto" }}>
              <option value="ALL">All Risk Levels</option>
              <option value="HIGH">High</option>
              <option value="MODERATE">Moderate</option>
              <option value="LOW">Low</option>
              <option value="UNDETERMINED">Undetermined</option>
            </select>
          </div>

          {/* Table */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #2a3a55", background: "#0d1526" }}>
                    {["Reference", "Title", "Location", "Risk", "Status", "Source", "Date"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#64748b", fontWeight: 600, fontSize: 11, letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: "#475569" }}>Loading...</td></tr>
                  ) : filtered.map(inc => (
                    <tr key={inc.id} className="table-row" style={{ borderBottom: "1px solid #1a2235", cursor: "pointer" }}
                      onClick={() => { setSelected(inc); setNewStatus(inc.status); setNotes(inc.notes || ""); }}>
                      <td style={{ padding: "10px 14px", fontFamily: "monospace", color: "#60a5fa" }}>{inc.reference}</td>
                      <td style={{ padding: "10px 14px", color: "#cbd5e1", maxWidth: 240 }}>
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inc.title}</div>
                      </td>
                      <td style={{ padding: "10px 14px", color: "#94a3b8" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <MapPin size={11} />{inc.location}
                        </div>
                      </td>
                      <td style={{ padding: "10px 14px" }}><RiskBadge level={inc.risk_level} /></td>
                      <td style={{ padding: "10px 14px" }}><StatusBadge status={inc.status} /></td>
                      <td style={{ padding: "10px 14px", color: "#64748b" }}>{inc.source.replace("_", " ")}</td>
                      <td style={{ padding: "10px 14px", color: "#64748b" }}>{new Date(inc.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {!loading && filtered.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: "#475569" }}>No incidents found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 10, color: "#60a5fa", fontFamily: "monospace", marginBottom: 4 }}>{selected.reference}</div>
                <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, lineHeight: 1.4 }}>{selected.title}</h2>
              </div>
              <button className="btn btn-secondary" onClick={() => setSelected(null)}><X size={14} /></button>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <RiskBadge level={selected.risk_level} />
              <StatusBadge status={selected.status} />
              <span style={{ fontSize: 11, color: "#64748b" }}>{selected.source.replace("_", " ")}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 10, color: "#475569", marginBottom: 4 }}>Location</div>
                <div style={{ fontSize: 12, color: "#e2e8f0", display: "flex", alignItems: "center", gap: 4 }}>
                  <MapPin size={11} style={{ color: "#64748b" }} />{selected.location}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#475569", marginBottom: 4 }}>Coordinates</div>
                <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>
                  {selected.lat?.toFixed(4)}, {selected.lng?.toFixed(4)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#475569", marginBottom: 4 }}>Created</div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>{new Date(selected.created_at).toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#475569", marginBottom: 4 }}>Updated</div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>{new Date(selected.updated_at).toLocaleString()}</div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: "#475569", marginBottom: 6 }}>Description</div>
              <div style={{ fontSize: 12, color: "#94a3b8", background: "#0d1526", padding: 10, borderRadius: 6, border: "1px solid #1a2235", lineHeight: 1.6 }}>
                {selected.description}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: "#475569", marginBottom: 6 }}>Update Status</div>
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)} style={{ marginBottom: 8 }}>
                <option value="NEW">New</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="AWAITING_INFORMATION">Awaiting Information</option>
                <option value="VERIFIED">Verified</option>
                <option value="UNVERIFIED">Unverified</option>
                <option value="CLOSED">Closed</option>
              </select>
              <textarea rows={3} placeholder="Operator notes..." value={notes} onChange={e => setNotes(e.target.value)} />
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setSelected(null)}>{t(lang, "close")}</button>
              <button className="btn btn-primary" onClick={handleStatusUpdate}>{t(lang, "save")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
