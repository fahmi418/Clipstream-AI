"use client";

import Link from "next/link";
import { Video, ShieldCheck, Cpu, ExternalLink, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer
      className="am-section am-is-black-bg"
      style={{
        backgroundColor: "#111",
        color: "#fff",
        paddingTop: "4.5rem",
        paddingBottom: "3.5rem",
        marginTop: "auto",
        width: "100%",
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <div className="am-container" style={{ maxWidth: "69rem", margin: "0 auto", padding: "0 1.5rem" }}>
        <div
          className="grid grid-cols-1 md:grid-cols-4 gap-10"
          style={{
            paddingBottom: "3rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          {/* Brand Column */}
          <div className="md:col-span-1" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                textDecoration: "none",
                color: "#fff",
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  backgroundColor: "#fff",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#111",
                }}
              >
                <Video size={14} strokeWidth={2.2} />
              </div>
              <span style={{ fontSize: "1.125rem", fontWeight: 600, letterSpacing: "-0.4px" }}>
                ClipStream AI
              </span>
            </Link>
            <p style={{ fontSize: "0.8125rem", color: "rgba(255, 255, 255, 0.6)", lineHeight: 1.5 }}>
              Platform desentralisasi pertama untuk klip video terverifikasi AI dengan smart contract escrow di BNB Chain.
            </p>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.75rem",
                color: "rgba(255, 255, 255, 0.8)",
                paddingTop: "0.25rem",
              }}
            >
              <ShieldCheck size={14} className="text-[#b7efb2]" />
              <span>BNB Chain Hackathon 2026</span>
            </div>
          </div>

          {/* Navigation Column 1: Produk */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.8125rem" }}>
            <div style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "rgba(255, 255, 255, 0.4)" }}>
              PRODUK
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              <li>
                <Link href="/campaigns" style={{ color: "rgba(255, 255, 255, 0.7)", textDecoration: "none" }} className="hover:text-white">
                  Jelajah Campaign
                </Link>
              </li>
              <li>
                <Link href="/clipper/submit" style={{ color: "rgba(255, 255, 255, 0.7)", textDecoration: "none" }} className="hover:text-white">
                  Submit Klip
                </Link>
              </li>
              <li>
                <Link href="/brand/new" style={{ color: "rgba(255, 255, 255, 0.7)", textDecoration: "none" }} className="hover:text-white">
                  Buat Campaign
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation Column 2: Dashboard */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.8125rem" }}>
            <div style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "rgba(255, 255, 255, 0.4)" }}>
              DASHBOARD
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              <li>
                <Link href="/clipper" style={{ color: "rgba(255, 255, 255, 0.7)", textDecoration: "none" }} className="hover:text-white">
                  Dashboard Clipper
                </Link>
              </li>
              <li>
                <Link href="/brand/campaigns" style={{ color: "rgba(255, 255, 255, 0.7)", textDecoration: "none" }} className="hover:text-white">
                  Dashboard Brand
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation Column 3: Infrastruktur On-Chain */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.8125rem" }}>
            <div style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "rgba(255, 255, 255, 0.4)" }}>
              INFRASTRUKTUR
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              <li>
                <a
                  href="https://testnet.bscscan.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "rgba(255, 255, 255, 0.7)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
                  className="hover:text-white"
                >
                  <span>BscScan Testnet</span>
                  <ArrowUpRight size={13} />
                </a>
              </li>
              <li>
                <span style={{ color: "rgba(255, 255, 255, 0.5)", display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
                  <Cpu size={13} />
                  <span>Whisper &amp; Gemini AI Agent</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            paddingTop: "2rem",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            fontSize: "0.75rem",
            color: "rgba(255, 255, 255, 0.5)",
          }}
        >
          <div>
            &copy; {new Date().getFullYear()} ClipStream AI. All rights reserved.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ color: "rgba(255, 255, 255, 0.4)" }}>
              BNB Chain Hackathon 2026 Submission
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
