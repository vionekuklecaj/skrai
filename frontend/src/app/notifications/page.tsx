"use client";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { api } from "@/lib/api";
import { useLang } from "@/lib/LangContext";
import { t } from "@/lib/translations";
import { Bell, AlertCircle, Info, AlertTriangle, CheckCircle } from "lucide-react";

function NotifIcon({ type }: { type: string }) {
  if (type === "ALERT") return <AlertCircle size={16} style={{ color: "#ef4444" }} />;
  if (type === "WARNING") return <AlertTriangle size={16} style={{ color: "#fb923c" }} />;
  return <Info size={16} style={{ color: "#3b82f6" }} />;
}

export default function NotificationsPage() {
  const { lang } = useLang();
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getNotifications().then(setNotifs).finally(() => setLoading(false));
  }, []);

  const handleMarkAllRead = async () => {
    await api.markAllRead();
    setNotifs(notifs.map(n => ({ ...n, is_read: true })));
  };

  const handleMarkRead = async (id: number) => {
    await api.markNotificationRead(id);
    setNotifs(notifs.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const unreadCount = notifs.filter(n => !n.is_read).length;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header title={t(lang, "notifications")} />
        <main style={{ flex: 1, overflowY: "auto", padding: "24px", background: "#0a0e1a" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Bell size={16} style={{ color: "#3b82f6" }} />
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
              </span>
            </div>
            {unreadCount > 0 && (
              <button className="btn btn-secondary" onClick={handleMarkAllRead}>
                <CheckCircle size={13} /> {t(lang, "markAllRead")}
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ color: "#64748b", textAlign: "center", padding: 48 }}>Loading...</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {notifs.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && handleMarkRead(n.id)}
                  style={{
                    background: n.is_read ? "#1a2235" : "#1a2235",
                    border: `1px solid ${n.is_read ? "#2a3a55" : n.type === "ALERT" ? "#dc262640" : n.type === "WARNING" ? "#ea580c40" : "#2563eb40"}`,
                    borderRadius: 8,
                    padding: "14px 16px",
                    display: "flex",
                    gap: 14,
                    cursor: n.is_read ? "default" : "pointer",
                    opacity: n.is_read ? 0.65 : 1,
                    transition: "opacity 0.2s",
                  }}>
                  <div style={{ marginTop: 2 }}>
                    <NotifIcon type={n.type} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{n.title}</span>
                      <span style={{ fontSize: 11, color: "#475569", whiteSpace: "nowrap", marginLeft: 12 }}>
                        {new Date(n.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4, lineHeight: 1.5 }}>{n.message}</div>
                  </div>
                  {!n.is_read && (
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#3b82f6", flexShrink: 0, marginTop: 5 }} />
                  )}
                </div>
              ))}
              {notifs.length === 0 && (
                <div style={{ textAlign: "center", color: "#475569", padding: 48 }}>
                  {t(lang, "noNotifications")}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
