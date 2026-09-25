"use client";

import Link from "next/link";
import { ShieldCheck, ExternalLink } from "lucide-react";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer
      className="am-section am-is-black-bg"
      style={{
        backgroundColor: "#0a0a0a",
        color: "#ffffff",
        paddingTop: "3.5rem",
        paddingBottom: "2.5rem",
        marginTop: "auto",
        width: "100%",
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        position: "relative",
        zIndex: 10,
      }}
    >
      <div
        className="am-container"
        style={{
          maxWidth: "1340px",
          margin: "0 auto",
          paddingLeft: "clamp(1rem, 2.5vw, 2.5rem)",
          paddingRight: "clamp(1rem, 2.5vw, 2.5rem)",
          boxSizing: "border-box",
        }}
      >
        {/* ── Top Brand Bar ─────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
            paddingBottom: "1.75rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            marginBottom: "2.25rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                textDecoration: "none",
              }}
            >
              <Logo theme="dark" width={150} height={32} />
            </Link>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.2rem 0.625rem",
                borderRadius: "9999px",
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                fontSize: "0.6875rem",
                color: "rgba(255, 255, 255, 0.8)",
              }}
            >
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#f0b90b" }} />
              <span>BNB Chain Hackathon 2026</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexWrap: "wrap" }}>
            <Link
              href="/clipper"
              className="am-nav-btn is-secondary"
              style={{
                fontSize: "0.75rem",
                padding: "0.35rem 0.875rem",
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "9999px",
                textDecoration: "none",
              }}
            >
              Portal Clipper
            </Link>
            <Link
              href="/brand/new"
              className="am-nav-btn"
              style={{
                fontSize: "0.75rem",
                padding: "0.35rem 0.875rem",
                backgroundColor: "#ffffff",
                color: "#0a0a0a",
                borderRadius: "9999px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Pasang Bounty
            </Link>
          </div>
        </div>

        {/* ── Main Multi-Column Master Grid (Desktop: 2 Main Blocks with 5 Side-by-Side Cols) ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "clamp(1.5rem, 3vw, 3rem)",
            paddingBottom: "2.75rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          {/* ══ LEFT BLOCK: PRODUCT (2 columns side by side) ════════════ */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <div>
              <div
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#ffffff",
                  marginBottom: "0.45rem",
                }}
              >
                PRODUCT
              </div>
            </div>

            {/* Product 2 Sub-Columns */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.75rem",
              }}
            >
              {/* Product Sub-Col 1 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                <div>
                  <div
                    style={{
                      fontSize: "0.625rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "rgba(255, 255, 255, 0.4)",
                      marginBottom: "0.35rem",
                    }}
                  >
                    INTELLIGENCE &amp; AI
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <li>
                      <Link href="/product/ai-verifier" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.62)", textDecoration: "none", fontSize: "0.78125rem", lineHeight: 1.35 }}>
                        AI Verifier Copilot
                      </Link>
                    </li>
                    <li>
                      <Link href="/product/whisper-audio" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.62)", textDecoration: "none", fontSize: "0.78125rem", lineHeight: 1.35 }}>
                        Whisper Audio Matcher
                      </Link>
                    </li>
                    <li>
                      <Link href="/product/gemini-vision" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.62)", textDecoration: "none", fontSize: "0.78125rem", lineHeight: 1.35 }}>
                        Gemini Vision Watermark
                      </Link>
                    </li>
                    <li>
                      <Link href="/product/anti-sybil" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.62)", textDecoration: "none", fontSize: "0.78125rem", lineHeight: 1.35 }}>
                        Anti-Sybil Proof of Unique
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: "0.625rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "rgba(255, 255, 255, 0.4)",
                      marginBottom: "0.35rem",
                    }}
                  >
                    ORACLES &amp; INDEXERS
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <li>
                      <Link href="/product/youtube-oracle" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.62)", textDecoration: "none", fontSize: "0.78125rem", lineHeight: 1.35 }}>
                        YouTube Data API Oracle
                      </Link>
                    </li>
                    <li>
                      <Link href="/product/tiktok-crawler" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.62)", textDecoration: "none", fontSize: "0.78125rem", lineHeight: 1.35 }}>
                        TikTok Views Crawler
                      </Link>
                    </li>
                    <li>
                      <Link href="/product/reels-indexer" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.62)", textDecoration: "none", fontSize: "0.78125rem", lineHeight: 1.35 }}>
                        Instagram Reels Indexer
                      </Link>
                    </li>
                    <li>
                      <Link href="/product/webhooks" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.62)", textDecoration: "none", fontSize: "0.78125rem", lineHeight: 1.35 }}>
                        Realtime Webhook
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Product Sub-Col 2 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                <div>
                  <div
                    style={{
                      fontSize: "0.625rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "rgba(255, 255, 255, 0.4)",
                      marginBottom: "0.35rem",
                    }}
                  >
                    SMART ESCROW &amp; CPM
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <li>
                      <Link href="/product/timelock-escrow" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.62)", textDecoration: "none", fontSize: "0.78125rem", lineHeight: 1.35 }}>
                        Timelock Smart Contract
                      </Link>
                    </li>
                    <li>
                      <Link href="/product/gasless-payouts" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.62)", textDecoration: "none", fontSize: "0.78125rem", lineHeight: 1.35 }}>
                        Gasless Instant Payouts
                      </Link>
                    </li>
                    <li>
                      <Link href="/product/cpm-calculator" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.62)", textDecoration: "none", fontSize: "0.78125rem", lineHeight: 1.35 }}>
                        Dynamic CPM Calculator
                      </Link>
                    </li>
                    <li>
                      <Link href="/product/holdback-protocol" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.62)", textDecoration: "none", fontSize: "0.78125rem", lineHeight: 1.35 }}>
                        Holdback Release Protocol
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: "0.625rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "rgba(255, 255, 255, 0.4)",
                      marginBottom: "0.35rem",
                    }}
                  >
                    DEVELOPER TOOLS
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <li>
                      <a
                        href="https://testnet.bscscan.com"
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-white transition-colors"
                        style={{ color: "rgba(255, 255, 255, 0.62)", textDecoration: "none", fontSize: "0.78125rem", lineHeight: 1.35, display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                      >
                        <span>Contract ABI (BscScan)</span>
                        <ExternalLink size={10} />
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://github.com/Ethermind-Agency/Clipstream-AI"
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-white transition-colors"
                        style={{ color: "rgba(255, 255, 255, 0.62)", textDecoration: "none", fontSize: "0.78125rem", lineHeight: 1.35, display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                      >
                        <span>TypeScript SDK Repo</span>
                        <ExternalLink size={10} />
                      </a>
                    </li>
                    <li>
                      <Link href="/product/dispute-dao" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.62)", textDecoration: "none", fontSize: "0.78125rem", lineHeight: 1.35 }}>
                        Decentralized Dispute DAO
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* ══ RIGHT BLOCK: WHY US, RESOURCES, COMPANY, SOCIALS (3 Horizontal Columns) ══ */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "clamp(1rem, 2vw, 2rem)",
              borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
              paddingLeft: "clamp(1rem, 2.5vw, 2.5rem)",
            }}
          >
            {/* Right Sub-Col 1: WHY US & SOLUTIONS */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div>
                <div
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#ffffff",
                    marginBottom: "0.45rem",
                  }}
                >
                  WHY US
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <li>
                    <Link href="/why-us/cpm-transparan" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.62)", textDecoration: "none", fontSize: "0.78125rem", lineHeight: 1.35 }}>
                      Rate CPM Transparan
                    </Link>
                  </li>
                  <li>
                    <Link href="/why-us/wall-of-love" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.62)", textDecoration: "none", fontSize: "0.78125rem", lineHeight: 1.35 }}>
                      Wall Of Love
                    </Link>
                  </li>
                  <li>
                    <Link href="/why-us/hasil-nyata" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.62)", textDecoration: "none", fontSize: "0.78125rem", lineHeight: 1.35 }}>
                      Hasil Nyata Kreator
                    </Link>
                  </li>
                  <li>
                    <Link href="/why-us/audit" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.62)", textDecoration: "none", fontSize: "0.78125rem", lineHeight: 1.35 }}>
                      Audit Smart Contract
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <div
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "rgba(255, 255, 255, 0.4)",
                    marginBottom: "0.35rem",
                  }}
                >
                  SOLUTIONS
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <li>
                    <Link href="/solutions/clipper" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.62)", textDecoration: "none", fontSize: "0.78125rem", lineHeight: 1.35 }}>
                      Clipper (Kreator)
                    </Link>
                  </li>
                  <li>
                    <Link href="/solutions/brand" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.62)", textDecoration: "none", fontSize: "0.78125rem", lineHeight: 1.35 }}>
                      Brand &amp; Bisnis
                    </Link>
                  </li>
                  <li>
                    <Link href="/solutions/agency" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.62)", textDecoration: "none", fontSize: "0.78125rem", lineHeight: 1.35 }}>
                      Agency Talent / MCN
                    </Link>
                  </li>
                  <li>
                    <Link href="/solutions/reviewer-node" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.62)", textDecoration: "none", fontSize: "0.78125rem", lineHeight: 1.35 }}>
                      Reviewer Node
                    </Link>
                  </li>
                  <li>
                    <Link href="/solutions/web3-protocols" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.62)", textDecoration: "none", fontSize: "0.78125rem", lineHeight: 1.35 }}>
                      Web3 Protocols
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Sub-Col 2: RESOURCES */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div>
                <div
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#ffffff",
                    marginBottom: "0.45rem",
                  }}
                >
                  RESOURCES
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <li>
                    <Link href="/blog" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.62)", textDecoration: "none", fontSize: "0.78125rem", lineHeight: 1.35 }}>
                      Blog &amp; Insight
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog/panduan-memulai-clipper-bnb-chain" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.62)", textDecoration: "none", fontSize: "0.78125rem", lineHeight: 1.35 }}>
                      Tutorial Clipper Web3
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog/timelock-escrow-pembayaran-tanpa-admin" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.62)", textDecoration: "none", fontSize: "0.78125rem", lineHeight: 1.35 }}>
                      Panduan Timelock Escrow
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog/whisper-ai-gemini-vision-validasi-watermark" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.62)", textDecoration: "none", fontSize: "0.78125rem", lineHeight: 1.35 }}>
                      Whisper &amp; Gemini Docs
                    </Link>
                  </li>
                  <li>
                    <Link href="/faq" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.62)", textDecoration: "none", fontSize: "0.78125rem", lineHeight: 1.35 }}>
                      Help Center &amp; FAQ
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Sub-Col 3: COMPANY & SOCIALS */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div>
                <div
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#ffffff",
                    marginBottom: "0.45rem",
                  }}
                >
                  COMPANY
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <li>
                    <Link href="/about" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.62)", textDecoration: "none", fontSize: "0.78125rem", lineHeight: 1.35 }}>
                      Tentang ClipStream AI
                    </Link>
                  </li>
                  <li>
                    <Link href="/partners" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.62)", textDecoration: "none", fontSize: "0.78125rem", lineHeight: 1.35 }}>
                      Partner Program
                    </Link>
                  </li>
                  <li>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                      <Link href="/careers" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.62)", textDecoration: "none", fontSize: "0.78125rem", lineHeight: 1.35 }}>
                        Karier
                      </Link>
                      <span
                        style={{
                          fontSize: "0.5rem",
                          fontWeight: 700,
                          backgroundColor: "rgba(255, 255, 255, 0.12)",
                          color: "#ffffff",
                          padding: "1px 4px",
                          borderRadius: "3px",
                          letterSpacing: "0.4px",
                        }}
                      >
                        HIRING
                      </span>
                    </div>
                  </li>
                  <li>
                    <Link href="/manifesto" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.62)", textDecoration: "none", fontSize: "0.78125rem", lineHeight: 1.35 }}>
                      Manifesto Protokol
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <div
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "rgba(255, 255, 255, 0.4)",
                    marginBottom: "0.35rem",
                  }}
                >
                  SOCIALS
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <li>
                    <a
                      href="https://twitter.com"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-white transition-colors"
                      style={{ color: "rgba(255, 255, 255, 0.62)", textDecoration: "none", fontSize: "0.78125rem", lineHeight: 1.35, display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                    >
                      <span>𝕏 Twitter / X</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://youtube.com"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-white transition-colors"
                      style={{ color: "rgba(255, 255, 255, 0.62)", textDecoration: "none", fontSize: "0.78125rem", lineHeight: 1.35, display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                    >
                      <span>YouTube</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://github.com/Ethermind-Agency/Clipstream-AI"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-white transition-colors"
                      style={{ color: "rgba(255, 255, 255, 0.62)", textDecoration: "none", fontSize: "0.78125rem", lineHeight: 1.35, display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                    >
                      <span>GitHub</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Legal & Blockchain Metadata Bar ─────────────────── */}
        <div
          style={{
            paddingTop: "1.75rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
            fontSize: "0.71875rem",
            color: "rgba(255, 255, 255, 0.4)",
          }}
        >
          <div>
            &copy; 2026 ClipStream AI. Built for BNB Chain 2026 Hackathon.
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.125rem",
              flexWrap: "wrap",
            }}
          >
            <Link href="/legal/privacy" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.5)", textDecoration: "none" }}>
              Privacy Policy
            </Link>
            <Link href="/legal/terms" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.5)", textDecoration: "none" }}>
              Terms of Service
            </Link>
            <Link href="/legal/certik" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.5)", textDecoration: "none" }}>
              CertiK Security
            </Link>
            <a
              href="https://testnet.bscscan.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
              style={{
                color: "rgba(255, 255, 255, 0.65)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <span>BSC Testnet (Chain ID: 97)</span>
              <ExternalLink size={9} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
