import type { Metadata } from "next";
import "./globals.css";
import { LangProvider } from "@/lib/LangContext";

export const metadata: Metadata = {
  title: "SKRAI — Kosovo Drone Detection Platform",
  description: "Kosovo National AI-Powered Drone Detection & Airspace Awareness Platform [DEMO]",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LangProvider>
          <div className="demo-banner">
            ⚠ DEMO MODE — ALL DATA IS SIMULATED — NOT FOR OPERATIONAL USE ⚠
          </div>
          {children}
        </LangProvider>
      </body>
    </html>
  );
}
