"use client";

import Link from "next/link";
import { Video, ShieldCheck, ExternalLink } from "lucide-react";
import { Logo } from "@/components/Logo";

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
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      <div className="am-container" style={{ maxWidth: "69rem", margin: "0 auto", padding: "0 1.5rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "2.5rem",
            paddingBottom: "3.5rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          {/* Brand Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", minWidth: "220px" }}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                textDecoration: "none",
              }}
            >
              <Logo theme="dark" width={155} height={34} />
            </Link>

            <p style={{ fontSize: "0.8125rem", color: "rgba(255, 255, 255, 0.6)", lineHeight: 1.5 }}>
              Platform video creator escrow terdesentralisasi pertama di BNB Chain dengan verifikasi otomatis AI Agent (Whisper + Gemini).
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
              <ShieldCheck size={14} color="#b7efb2" />
              <span>BNB Chain Hackathon 2026</span>
            </div>
          </div>

          {/* Navigation Column 1: Produk */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", fontSize: "0.8125rem" }}>
            <div
              style={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: "rgba(255, 255, 255, 0.4)",
              }}
            >
              PRODUK
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              <li>
                <Link href="/campaigns" style={{ color: "rgba(255, 255, 255, 0.7)", textDecoration: "none" }}>
                  Marketplace Kampanye
                </Link>
              </li>
              <li>
                <Link href="/clipper/submit" style={{ color: "rgba(255, 255, 255, 0.7)", textDecoration: "none" }}>
                  Submit Klip Video
                </Link>
              </li>
              <li>
                <Link href="/brand/new" style={{ color: "rgba(255, 255, 255, 0.7)", textDecoration: "none" }}>
                  Buat Bounty Kampanye
                </Link>
              </li>
              <li>
                <Link href="/campaigns" style={{ color: "rgba(255, 255, 255, 0.7)", textDecoration: "none" }}>
                  AI Agent Verifier
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation Column 2: Dashboard */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", fontSize: "0.8125rem" }}>
            <div
              style={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: "rgba(255, 255, 255, 0.4)",
              }}
            >
              DASHBOARD
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              <li>
                <Link href="/clipper" style={{ color: "rgba(255, 255, 255, 0.7)", textDecoration: "none" }}>
                  Dashboard Clipper
                </Link>
              </li>
              <li>
                <Link href="/brand/campaigns" style={{ color: "rgba(255, 255, 255, 0.7)", textDecoration: "none" }}>
                  Dashboard Brand
                </Link>
              </li>
              <li>
                <Link href="/campaigns" style={{ color: "rgba(255, 255, 255, 0.7)", textDecoration: "none" }}>
                  CPM Analytics Engine
                </Link>
              </li>
              <li>
                <Link href="/campaigns" style={{ color: "rgba(255, 255, 255, 0.7)", textDecoration: "none" }}>
                  Riwayat Transaksi
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation Column 3: Ekosistem */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", fontSize: "0.8125rem" }}>
            <div
              style={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: "rgba(255, 255, 255, 0.4)",
              }}
            >
              EKOSISTEM
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              <li>
                <a
                  href="https://testnet.bscscan.com"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: "rgba(255, 255, 255, 0.7)",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  <span>Smart Contract BNB Chain</span>
                  <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Ethermind-Agency/Clipstream-AI"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: "rgba(255, 255, 255, 0.7)",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  <span>GitHub Repository</span>
                  <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <Link href="/campaigns" style={{ color: "rgba(255, 255, 255, 0.7)", textDecoration: "none" }}>
                  Dokumentasi Integrasi
                </Link>
              </li>
              <li>
                <Link href="/campaigns" style={{ color: "rgba(255, 255, 255, 0.7)", textDecoration: "none" }}>
                  Panduan Anti-Fraud
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Network Info */}
        <div
          style={{
            paddingTop: "2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
            fontSize: "0.75rem",
            color: "rgba(255, 255, 255, 0.5)",
          }}
        >
          <div>
            &copy; {new Date().getFullYear()} ClipStream AI. Dibuat untuk BNB Chain 2026 Hackathon. Hak cipta dilindungi.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#f0b90b" }} />
              BNB Smart Chain Testnet (Chain ID: 97)
            </span>
            <span>•</span>
            <a
              href="https://testnet.bscscan.com"
              target="_blank"
              rel="noreferrer"
              style={{ color: "rgba(255, 255, 255, 0.7)", textDecoration: "none" }}
            >
              BscScan Explorer ↗
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
