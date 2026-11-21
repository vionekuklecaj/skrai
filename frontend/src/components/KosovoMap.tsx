"use client";
import { useEffect, useRef } from "react";

interface Props {
  cameras: any[];
  incidents: any[];
}

export default function KosovoMap({ cameras, incidents }: Props) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (mapRef.current) return;

    import("leaflet").then((L) => {
      // Fix default marker icons
      (L.Icon.Default.prototype as any)._getIconUrl = undefined;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      if (!containerRef.current) return;
      const map = L.map(containerRef.current, {
        center: [42.6026, 20.9030],
        zoom: 8,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        className: "dark-tiles",
      }).addTo(map);

      // Camera markers (blue)
      const cameraIcon = L.divIcon({
        html: `<div style="width:12px;height:12px;background:#3b82f6;border:2px solid #60a5fa;border-radius:50%;box-shadow:0 0 8px #3b82f6"></div>`,
        className: "",
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      cameras.forEach((cam) => {
        L.marker([cam.lat, cam.lng], { icon: cameraIcon })
          .addTo(map)
          .bindPopup(`<b style="color:#1e3a8a">${cam.name}</b><br/><small>${cam.camera_id} · ${cam.status}</small>`);
      });

      // Incident markers (red/orange)
      incidents.slice(0, 10).forEach((inc) => {
        if (!inc.lat || !inc.lng) return;
        const color = inc.risk_level === "HIGH" ? "#dc2626" : inc.risk_level === "MODERATE" ? "#ea580c" : "#ca8a04";
        const icon = L.divIcon({
          html: `<div style="width:10px;height:10px;background:${color};border:2px solid white;border-radius:2px;transform:rotate(45deg)"></div>`,
          className: "",
          iconSize: [10, 10],
          iconAnchor: [5, 5],
        });
        L.marker([inc.lat, inc.lng], { icon })
          .addTo(map)
          .bindPopup(`<b>${inc.title}</b><br/><small>${inc.reference}</small>`);
      });

      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Update markers when data changes (simplified - would re-add in a full impl)
  }, [cameras, incidents]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />
      <style>{`
        .leaflet-container { background: #0d1526 !important; }
        .leaflet-tile { filter: brightness(0.6) saturate(0.7) hue-rotate(180deg); }
        .leaflet-popup-content-wrapper { background: #111827; color: #e2e8f0; border: 1px solid #2a3a55; }
        .leaflet-popup-tip { background: #111827; }
      `}</style>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </>
  );
}
