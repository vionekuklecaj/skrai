"use client";
import { Bell } from "lucide-react";
import { useLang } from "@/lib/LangContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export function Header({ title }: { title: string }) {
  const { lang, setLang } = useLang();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    api.getNotifications().then((data: any[]) => {
      setUnread(data.filter((n: any) => !n.is_read).length);
    }).catch(() => {});
  }, []);

  return (
    <header style={{
      background: "#0d1526",
      borderBottom: "1px solid #1e2d44",
      padding: "12px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0" }}>{title}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Language toggle */}
        <div style={{ display: "flex", gap: 4, background: "#1a2235", borderRadius: 6, padding: 3 }}>
          <button
            onClick={() => setLang("en")}
            style={{
              padding: "4px 10px", borderRadius: 4, fontSize: 12, fontWeight: 600,
              background: lang === "en" ? "#2563eb" : "transparent",
              color: lang === "en" ? "white" : "#64748b",
              border: "none", cursor: "pointer",
            }}
          >EN</button>
          <button
            onClick={() => setLang("sq")}
            style={{
              padding: "4px 10px", borderRadius: 4, fontSize: 12, fontWeight: 600,
              background: lang === "sq" ? "#2563eb" : "transparent",
              color: lang === "sq" ? "white" : "#64748b",
              border: "none", cursor: "pointer",
            }}
          >SQ</button>
        </div>
        {/* Notifications */}
        <Link href="/notifications" style={{ position: "relative", color: "#64748b" }}>
          <Bell size={20} />
          {unread > 0 && (
            <span style={{
              position: "absolute", top: -6, right: -6,
              background: "#dc2626", color: "white",
              fontSize: 10, fontWeight: 700,
              borderRadius: "50%", width: 16, height: 16,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{unread > 9 ? "9+" : unread}</span>
          )}
        </Link>
        {/* User */}
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "#1a2235", border: "1px solid #2563eb",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 700, color: "#60a5fa",
        }}>OP</div>
      </div>
    </header>
  );
}
