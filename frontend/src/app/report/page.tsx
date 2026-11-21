"use client";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { useLang } from "@/lib/LangContext";
import { t } from "@/lib/translations";
import { Upload, CheckCircle, Globe, AlertCircle } from "lucide-react";
import Link from "next/link";

const KOSOVO_CITIES = [
  "Pristina", "Prizren", "Peja", "Gjilan", "Ferizaj", "Mitrovica",
  "Gjakova", "Vushtrri", "Suhareka", "Rahovec", "Skenderaj",
  "Dragash", "Klina", "Leposavic", "Zubin Potok", "Zvecan",
];

export default function ReportPage() {
  const { lang, setLang } = useLang();
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [consent, setConsent] = useState(false);
  const [fileName, setFileName] = useState("");

  const [form, setForm] = useState({
    location: "",
    description: "",
    sighting_time: "",
    contact_email: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) { setError("Please accept the privacy consent to continue."); return; }
    if (!form.location) { setError("Please select a location."); return; }
    if (!form.description.trim()) { setError("Please provide a description."); return; }

    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("location", form.location);
      fd.append("description", form.description);
      if (form.sighting_time) fd.append("sighting_time", form.sighting_time);
      if (form.contact_email) fd.append("contact_email", form.contact_email);
      if (file) fd.append("file", file);

      const res = await fetch("http://localhost:8000/api/reports", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Submission failed");
      const data = await res.json();
      setReference(data.reference);
      setSubmitted(true);
    } catch (err) {
      setError("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0e1a", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ maxWidth: 480, width: "100%", background: "#111827", border: "1px solid #2a3a55", borderRadius: 12, padding: 40, textAlign: "center" }}>
          <CheckCircle size={48} style={{ color: "#16a34a", marginBottom: 16 }} />
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#e2e8f0", marginBottom: 8 }}>{t(lang, "reportSubmitted")}</h2>
          <p style={{ color: "#64748b", fontSize: 13, marginBottom: 24 }}>{t(lang, "keepReference")}</p>
          <div style={{
            background: "#0d1526", border: "1px solid #2563eb", borderRadius: 8,
            padding: "16px 24px", marginBottom: 24,
          }}>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>{t(lang, "referenceNumber")}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#60a5fa", fontFamily: "monospace" }}>{reference}</div>
          </div>
          <button className="btn btn-primary" onClick={() => { setSubmitted(false); setForm({ location: "", description: "", sighting_time: "", contact_email: "" }); setFile(null); setConsent(false); }}>
            {t(lang, "submitAnother")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a" }}>
      {/* Demo banner */}
      <div className="demo-banner">⚠ DEMO MODE — ALL DATA IS SIMULATED — NOT FOR OPERATIONAL USE ⚠</div>

      {/* Header */}
      <header style={{
        background: "#0d1526", borderBottom: "1px solid #1e2d44",
        padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Logo size={32} />
          <div>
            <div style={{ color: "#60a5fa", fontSize: 16, fontWeight: 800 }}>SKRAI</div>
            <div style={{ color: "#334155", fontSize: 9, letterSpacing: 1 }}>KOSOVO AIRSPACE AI</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", gap: 4, background: "#1a2235", borderRadius: 6, padding: 3 }}>
            {["en", "sq"].map(l => (
              <button key={l} onClick={() => setLang(l as any)} style={{
                padding: "4px 10px", borderRadius: 4, fontSize: 12, fontWeight: 600,
                background: lang === l ? "#2563eb" : "transparent",
                color: lang === l ? "white" : "#64748b", border: "none", cursor: "pointer",
              }}>{l.toUpperCase()}</button>
            ))}
          </div>
          <Link href="/dashboard" style={{ fontSize: 12, color: "#64748b" }}>← Operator Portal</Link>
        </div>
      </header>

      <main style={{ maxWidth: 640, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
            <Globe size={20} style={{ color: "#3b82f6" }} />
            <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: 1, color: "#e2e8f0", margin: 0 }}>
              {t(lang, "reportDrone")}
            </h1>
          </div>
          <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.6 }}>
            {t(lang, "reportDescription")}
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 10, padding: "8px 16px", background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.3)", borderRadius: 6 }}>
            <AlertCircle size={13} style={{ color: "#60a5fa" }} />
            <span style={{ fontSize: 11, color: "#60a5fa" }}>{t(lang, "kosovoCitiesOnly")}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Location */}
            <div>
              <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 6, fontWeight: 500 }}>
                {t(lang, "location")} *
              </label>
              <select value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required>
                <option value="">Select location...</option>
                {KOSOVO_CITIES.map(c => <option key={c} value={c}>{c}, Kosovo</option>)}
              </select>
            </div>

            {/* Sighting time */}
            <div>
              <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 6, fontWeight: 500 }}>
                {t(lang, "sightingTime")}
              </label>
              <input type="datetime-local" value={form.sighting_time}
                onChange={e => setForm({ ...form, sighting_time: e.target.value })} />
            </div>

            {/* Description */}
            <div>
              <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 6, fontWeight: 500 }}>
                {t(lang, "description")} *
              </label>
              <textarea rows={4} required value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Describe what you saw: direction of travel, altitude, color, markings, duration..." />
            </div>

            {/* File upload */}
            <div>
              <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 6, fontWeight: 500 }}>
                {t(lang, "uploadEvidence")}
              </label>
              <div style={{
                border: "1px dashed #2a3a55", borderRadius: 6, padding: 20, textAlign: "center",
                cursor: "pointer", background: "#0d1526",
              }} onClick={() => document.getElementById("file-input")?.click()}>
                <input id="file-input" type="file" style={{ display: "none" }}
                  accept=".jpg,.jpeg,.png,.mp4,.mov"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) { setFile(f); setFileName(f.name); }
                  }} />
                <Upload size={20} style={{ color: "#475569", marginBottom: 8 }} />
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  {fileName || "Click to upload photo or video"}
                </div>
                <div style={{ fontSize: 10, color: "#334155", marginTop: 4 }}>
                  JPG, JPEG, PNG, MP4, MOV — max 50MB
                </div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 6, fontWeight: 500 }}>
                {t(lang, "contactEmail")}
              </label>
              <input type="email" value={form.contact_email}
                onChange={e => setForm({ ...form, contact_email: e.target.value })}
                placeholder="your@email.com (optional)" />
            </div>

            {/* Consent */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px", background: "#0d1526", borderRadius: 6, border: "1px solid #1a2235" }}>
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}
                style={{ width: 16, height: 16, marginTop: 2, cursor: "pointer", flexShrink: 0 }} />
              <label style={{ fontSize: 12, color: "#94a3b8", cursor: "pointer", lineHeight: 1.5 }}>
                {t(lang, "privacyConsent")}
              </label>
            </div>

            {error && (
              <div style={{ padding: 10, background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 6, fontSize: 12, color: "#ef4444" }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{ justifyContent: "center", padding: "12px", fontSize: 14 }}>
              {loading ? t(lang, "submitting") : t(lang, "submit")}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
