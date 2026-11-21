"use client";
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useLang } from "@/lib/LangContext";
import { t } from "@/lib/translations";
import { Settings, Users, Globe, Shield, Database } from "lucide-react";

export default function SettingsPage() {
  const { lang, setLang } = useLang();
  const [demoMode, setDemoMode] = useState(true);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header title={t(lang, "settings")} />
        <main style={{ flex: 1, overflowY: "auto", padding: "24px", background: "#0a0e1a" }}>
          <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Demo Mode */}
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <Database size={16} style={{ color: "#3b82f6" }} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>{t(lang, "demoModeOn")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, color: "#e2e8f0" }}>Demo Mode Active</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                    All data shown is simulated. No real detections or incidents.
                  </div>
                </div>
                <div
                  onClick={() => setDemoMode(!demoMode)}
                  style={{
                    width: 44, height: 24, borderRadius: 12, cursor: "pointer",
                    background: demoMode ? "#2563eb" : "#334155",
                    position: "relative", transition: "background 0.2s",
                  }}>
                  <div style={{
                    position: "absolute", top: 3, left: demoMode ? 22 : 3,
                    width: 18, height: 18, borderRadius: "50%", background: "white",
                    transition: "left 0.2s",
                  }} />
                </div>
              </div>
            </div>

            {/* Language */}
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <Globe size={16} style={{ color: "#3b82f6" }} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>{t(lang, "languageSettings")}</span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {[{ code: "en", label: "English" }, { code: "sq", label: "Albanian (Shqip)" }].map(({ code, label }) => (
                  <button
                    key={code}
                    onClick={() => setLang(code as any)}
                    className={`btn ${lang === code ? "btn-primary" : "btn-secondary"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* System Info */}
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <Shield size={16} style={{ color: "#3b82f6" }} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>{t(lang, "systemSettings")}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { label: "Platform", value: "SKRAI v1.0.0" },
                  { label: "Build", value: "DEMO" },
                  { label: "AI Engine", value: "Simulated v2.3.1" },
                  { label: "Database", value: "SQLite (Demo)" },
                  { label: "API", value: "localhost:8000" },
                  { label: "Frontend", value: "Next.js 14" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ padding: "10px 12px", background: "#0d1526", borderRadius: 6, border: "1px solid #1a2235" }}>
                    <div style={{ fontSize: 10, color: "#475569" }}>{label}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* User Management Placeholder */}
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <Users size={16} style={{ color: "#3b82f6" }} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>{t(lang, "userManagement")}</span>
              </div>
              <div style={{
                padding: 20, border: "1px dashed #2a3a55", borderRadius: 6,
                textAlign: "center", color: "#475569", fontSize: 12,
              }}>
                User management available in production deployment.<br />
                DEMO MODE — authentication disabled.
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
