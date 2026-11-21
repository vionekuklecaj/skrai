"use client";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { api } from "@/lib/api";
import { useLang } from "@/lib/LangContext";
import { t } from "@/lib/translations";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const COLORS = ["#3b82f6", "#16a34a", "#ea580c", "#7c3aed", "#ca8a04", "#0891b2"];

export default function AnalyticsPage() {
  const { lang } = useLang();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics().then(setData).finally(() => setLoading(false));
  }, []);

  const tooltipStyle = {
    contentStyle: { background: "#111827", border: "1px solid #2a3a55", borderRadius: 6, color: "#e2e8f0" },
    labelStyle: { color: "#94a3b8" },
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header title={t(lang, "analytics")} />
        <main style={{ flex: 1, overflowY: "auto", padding: "24px", background: "#0a0e1a" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
            <span style={{ fontSize: 13, color: "#64748b" }}>All charts show simulated demonstration data.</span>
            <span className="badge badge-blue">DEMO DATA</span>
          </div>

          {loading ? (
            <div style={{ color: "#64748b", textAlign: "center", padding: 48 }}>Loading analytics...</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Detections over time */}
              <div className="card">
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: "#e2e8f0" }}>
                  Detections (Last 7 Days)
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={data?.reports_over_time}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2235" />
                    <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                    <Tooltip {...tooltipStyle} />
                    <Line type="monotone" dataKey="detections" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* By region */}
              <div className="card">
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: "#e2e8f0" }}>
                  Incidents by Region
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data?.by_region}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2235" />
                    <XAxis dataKey="region" tick={{ fill: "#64748b", fontSize: 10 }} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                    <Tooltip {...tooltipStyle} />
                    <Bar dataKey="incidents" fill="#2563eb" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* By source */}
              <div className="card">
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: "#e2e8f0" }}>
                  Incidents by Source
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={data?.by_source} cx="50%" cy="50%" outerRadius={80}
                      dataKey="value" nameKey="name" label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                      labelLine={{ stroke: "#334155" }}
                    >
                      {data?.by_source?.map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip {...tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Status distribution */}
              <div className="card">
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: "#e2e8f0" }}>
                  Incident Status Distribution
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={data?.status_distribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                      dataKey="value" nameKey="name"
                    >
                      {data?.status_distribution?.map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip {...tooltipStyle} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
