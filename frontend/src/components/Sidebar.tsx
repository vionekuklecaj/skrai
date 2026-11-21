"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Camera, Zap, AlertTriangle, BarChart2, Bell, Settings, Globe } from "lucide-react";
import { Logo } from "./Logo";
import { useLang } from "@/lib/LangContext";
import { t } from "@/lib/translations";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, key: "dashboard" },
  { href: "/cameras", icon: Camera, key: "cameras" },
  { href: "/detections", icon: Zap, key: "detections" },
  { href: "/incidents", icon: AlertTriangle, key: "incidents" },
  { href: "/analytics", icon: BarChart2, key: "analytics" },
  { href: "/notifications", icon: Bell, key: "notifications" },
  { href: "/settings", icon: Settings, key: "settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { lang } = useLang();

  return (
    <div className="sidebar flex flex-col py-4" style={{ width: 240 }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 pb-6 pt-2">
        <Logo size={36} />
        <div>
          <div style={{ color: "#60a5fa", fontSize: 18, fontWeight: 800, letterSpacing: 1 }}>SKRAI</div>
          <div style={{ color: "#475569", fontSize: 9, letterSpacing: 1, lineHeight: 1.2 }}>KOSOVO AIRSPACE AI</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-1">
        {navItems.map(({ href, icon: Icon, key }) => (
          <Link key={href} href={href} className={`nav-link ${pathname === href ? "active" : ""}`}>
            <Icon size={16} />
            <span>{t(lang, key)}</span>
          </Link>
        ))}
        <div style={{ borderTop: "1px solid #1e2d44", margin: "12px 0" }} />
        <Link href="/report" className="nav-link">
          <Globe size={16} />
          <span style={{ fontSize: 12 }}>{t(lang, "publicReport")}</span>
        </Link>
      </nav>

      {/* Bottom */}
      <div className="px-4 pt-4" style={{ borderTop: "1px solid #1e2d44" }}>
        <div style={{ fontSize: 10, color: "#334155", textAlign: "center" }}>
          SKRAI v1.0 — DEMO BUILD<br />Kosovo Police · Kosovo Intelligence Agency
        </div>
      </div>
    </div>
  );
}
