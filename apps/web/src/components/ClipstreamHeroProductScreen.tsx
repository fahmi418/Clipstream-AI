"use client";

import React, { useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Filter,
  Search,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface ClipItem {
  id: string;
  title: string;
  creator: string;
  platform: "YouTube Shorts" | "TikTok";
  views: string;
  duration: string;
  audioMatch: number;
  visionMatch: number;
  totalUsdt: string;
  totalIdr: string;
  instantUsdt: string;
  holdbackUsdt: string;
  quote: string;
  watermarkStatus: string;
  status: "verified" | "holdback" | "queued";
  statusText: string;
  statusColor: string;
}

const SAMPLE_CLIPS: ClipItem[] = [
  {
    id: "clip-1",
    title: "BNB Chain Ecosystem Spotlight",
    creator: "@budi_creator",
    platform: "YouTube Shorts",
    views: "78.200",
    duration: "45 detik",
    audioMatch: 98.8,
    visionMatch: 99.4,
    totalUsdt: "45.00 USDT",
    totalIdr: "Rp 733.500",
    instantUsdt: "31.50 USDT",
    holdbackUsdt: "13.50 USDT",
    quote:
      "Pelajari arsitektur smart contract escrow di BNB Chain bersama ClipStream. Klip video kamu dibayar otomatis begitu target views valid tanpa perlu chat admin manual.",
    watermarkStatus: "Watermark sponsor terdeteksi (00:03 - 00:45)",
    status: "verified",
    statusText: "98.8% Lolos AI",
    statusColor: "#059669",
  },
  {
    id: "clip-2",
    title: "DeFi Gasless Swap Speedrun",
    creator: "@rizky_edits",
    platform: "TikTok",
    views: "42.100",
    duration: "32 detik",
    audioMatch: 99.2,
    visionMatch: 98.6,
    totalUsdt: "28.50 USDT",
    totalIdr: "Rp 464.550",
    instantUsdt: "19.95 USDT",
    holdbackUsdt: "8.55 USDT",
    quote:
      "Swap token tanpa gas fee sekarang makin gampang. Cek integrasi DEX agregator terbaru dengan zero slippage di jaringan layer 2.",
    watermarkStatus: "Watermark sponsor terdeteksi (00:01 - 00:32)",
    status: "verified",
    statusText: "99.2% Lolos AI",
    statusColor: "#059669",
  },
  {
    id: "clip-3",
    title: "Solidity Escrow Security Audit",
    creator: "@dev_indo",
    platform: "YouTube Shorts",
    views: "19.500",
    duration: "58 detik",
    audioMatch: 96.5,
    visionMatch: 97.2,
    totalUsdt: "18.00 USDT",
    totalIdr: "Rp 293.400",
    instantUsdt: "12.60 USDT",
    holdbackUsdt: "5.40 USDT",
    quote:
      "Bedah kode smart contract timelock: mekanisme multi-sig escrow dan oracle verification anti-sybil pada platform bounty video Web3.",
    watermarkStatus: "Watermark sponsor terdeteksi (00:04 - 00:58)",
    status: "verified",
    statusText: "Audio Whisper OK",
    statusColor: "#059669",
  },
  {
    id: "clip-4",
    title: "AI Agent Trading Bot Highlight",
    creator: "@crypto_clips",
    platform: "TikTok",
    views: "88.000",
    duration: "25 detik",
    audioMatch: 98.1,
    visionMatch: 98.9,
    totalUsdt: "62.00 USDT",
    totalIdr: "Rp 1.010.600",
    instantUsdt: "43.40 USDT",
    holdbackUsdt: "18.60 USDT",
    quote:
      "Automasi trading dengan algoritma on-chain machine learning yang membaca liquidity orderbook secara real-time.",
    watermarkStatus: "Watermark sponsor terdeteksi (00:02 - 00:25)",
    status: "holdback",
    statusText: "Holdback 72 Jam",
    statusColor: "#d97706",
  },
  {
    id: "clip-5",
    title: "Web3 Creator Showcase #4",
    creator: "@sarah_cuts",
    platform: "YouTube Shorts",
    views: "12.400",
    duration: "41 detik",
    audioMatch: 97.9,
    visionMatch: 98.5,
    totalUsdt: "12.00 USDT",
    totalIdr: "Rp 195.600",
    instantUsdt: "8.40 USDT",
    holdbackUsdt: "3.60 USDT",
    quote:
      "Tiga tips bikin konten edukasi Web3 yang disukai audiens umum: visual yang padat, bahasa sederhana, dan analogi sehari-hari.",
    watermarkStatus: "Watermark sponsor terdeteksi (00:02 - 00:41)",
    status: "verified",
    statusText: "97.9% Lolos AI",
    statusColor: "#059669",
  },
  {
    id: "clip-6",
    title: "DEX Yield Farming Overview",
    creator: "@fajar_editor",
    platform: "TikTok",
    views: "26.800",
    duration: "35 detik",
    audioMatch: 98.4,
    visionMatch: 99.1,
    totalUsdt: "22.50 USDT",
    totalIdr: "Rp 366.750",
    instantUsdt: "15.75 USDT",
    holdbackUsdt: "6.75 USDT",
    quote:
      "Mengenal liquidity pool v3 dan concentrated liquidity: bagaimana mengoptimalkan APY dengan risiko impermanent loss yang terukur.",
    watermarkStatus: "Watermark sponsor terdeteksi (00:02 - 00:35)",
    status: "verified",
    statusText: "98.4% Lolos AI",
    statusColor: "#059669",
  },
  {
    id: "clip-7",
    title: "Hardware Wallet Setup Guide",
    creator: "@secure_chain",
    platform: "YouTube Shorts",
    views: "34.200",
    duration: "50 detik",
    audioMatch: 99.0,
    visionMatch: 98.7,
    totalUsdt: "25.00 USDT",
    totalIdr: "Rp 407.500",
    instantUsdt: "17.50 USDT",
    holdbackUsdt: "7.50 USDT",
    quote:
      "Langkah aman menyimpan seed phrase offline: hindari screenshot di ponsel dan gunakan cold storage bersertifikasi.",
    watermarkStatus: "Watermark sponsor terdeteksi (00:01 - 00:50)",
    status: "verified",
    statusText: "99.0% Lolos AI",
    statusColor: "#059669",
  },
  {
    id: "clip-8",
    title: "NFT Royalty Distribution Model",
    creator: "@meta_reels",
    platform: "TikTok",
    views: "15.900",
    duration: "29 detik",
    audioMatch: 96.8,
    visionMatch: 97.4,
    totalUsdt: "14.50 USDT",
    totalIdr: "Rp 236.350",
    instantUsdt: "10.15 USDT",
    holdbackUsdt: "4.35 USDT",
    quote:
      "Bagaimana standar EIP-2981 memastikan royalti kreator tetap berjalan lintas marketplace di ekosistem sekunder.",
    watermarkStatus: "Watermark sponsor terdeteksi (00:03 - 00:29)",
    status: "verified",
    statusText: "96.8% Lolos AI",
    statusColor: "#059669",
  },
];

export function ClipstreamHeroProductScreen() {
  const [selectedId, setSelectedId] = useState<string>("clip-1");
  const selectedClip =
    SAMPLE_CLIPS.find((c) => c.id === selectedId) || SAMPLE_CLIPS[0];

  return (
    <div
      className="am-home-duo-product-screen gsap-duo-screen"
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "14px",
        border: "1px solid rgba(0, 0, 0, 0.08)",
        boxShadow:
          "0 18px 45px -10px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.03)",
        overflow: "hidden",
        width: "100%",
        maxWidth: "1120px",
        margin: "0 auto",
        fontFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, sans-serif",
        textAlign: "left",
        userSelect: "none",
        color: "#111827",
        minHeight: "740px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── 1. Top Window Bar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 18px",
          borderBottom: "1px solid #f1f5f9",
          backgroundColor: "#ffffff",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        {/* Left: Window Dots + App Brand + Tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ display: "flex", gap: "6px" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#e5e7eb", display: "inline-block" }} />
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#e5e7eb", display: "inline-block" }} />
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#e5e7eb", display: "inline-block" }} />
          </div>

          <div style={{ height: "16px", width: "1px", backgroundColor: "#e5e7eb" }} />

          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#111827", letterSpacing: "-0.01em" }}>
              ClipStream Copilot
            </span>
            <span
              style={{
                fontSize: "0.625rem",
                padding: "1px 6px",
                borderRadius: "4px",
                backgroundColor: "#f3f4f6",
                color: "#4b5563",
                fontWeight: 600,
              }}
            >
              BNB Chain Escrow
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginLeft: "8px" }}>
            <span
              style={{
                padding: "3px 10px",
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: 600,
                backgroundColor: "#f3f4f6",
                color: "#111827",
              }}
            >
              Antrean Verifikasi <span style={{ color: "#6b7280", fontWeight: 500 }}>(14)</span>
            </span>
            <span
              style={{
                padding: "3px 10px",
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: 500,
                color: "#6b7280",
              }}
            >
              Pencairan Otomatis <span style={{ color: "#9ca3af" }}>(32)</span>
            </span>
          </div>
        </div>

        {/* Right: Status indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.6875rem",
              color: "#059669",
              fontWeight: 600,
              backgroundColor: "#f0fdf4",
              padding: "3px 9px",
              borderRadius: "9999px",
              border: "1px solid #dcfce7",
            }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10b981" }} />
            <span>AI Oracle Live</span>
          </div>

          <div
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "50%",
              backgroundColor: "#f3f4f6",
              color: "#374151",
              fontSize: "0.6875rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #e5e7eb",
            }}
          >
            CS
          </div>
        </div>
      </div>

      {/* ── 2. Subheader Toolbar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 18px",
          borderBottom: "1px solid #f1f5f9",
          backgroundColor: "#fafafa",
          fontSize: "0.75rem",
          color: "#6b7280",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontWeight: 600, color: "#374151" }}>Klip Terbaru ({SAMPLE_CLIPS.length})</span>
          <span style={{ color: "#d1d5db" }}>•</span>
          <span style={{ fontSize: "0.6875rem" }}>Filter: Semua Platform</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.6875rem" }}>
          <span>Urutkan: Recency</span>
          <span style={{ color: "#d1d5db" }}>•</span>
          <span>Diverifikasi AI Whisper &amp; Gemini</span>
        </div>
      </div>

      {/* ── 3. Main Dashboard Body (2 Columns) ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "40% 60%",
          flex: 1,
          backgroundColor: "#ffffff",
        }}
      >
        {/* ── Left Column: Clean List of Clips ── */}
        <div
          style={{
            borderRight: "1px solid #f1f5f9",
            backgroundColor: "#ffffff",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {SAMPLE_CLIPS.map((clip) => {
            const isSelected = clip.id === selectedId;
            return (
              <div
                key={clip.id}
                onClick={() => setSelectedId(clip.id)}
                style={{
                  padding: "13px 18px",
                  borderBottom: "1px solid #f8fafc",
                  backgroundColor: isSelected ? "#f8fafc" : "#ffffff",
                  borderLeft: isSelected ? "3px solid #111827" : "3px solid transparent",
                  cursor: "pointer",
                  transition: "background-color 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", minWidth: 0 }}>
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: clip.statusColor,
                      marginTop: "5px",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "0.8125rem",
                        fontWeight: isSelected ? 700 : 600,
                        color: "#111827",
                        lineHeight: 1.3,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {clip.title}
                    </div>
                    <div
                      style={{
                        fontSize: "0.6875rem",
                        color: "#6b7280",
                        marginTop: "2px",
                      }}
                    >
                      {clip.creator} • {clip.views} views • {clip.platform}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#111827" }}>
                    {clip.totalUsdt}
                  </div>
                  <div
                    style={{
                      fontSize: "0.625rem",
                      color: clip.statusColor,
                      fontWeight: 600,
                    }}
                  >
                    {clip.statusText}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Right Column: Clean White SaaS Inspector Panel ── */}
        <div
          style={{
            padding: "24px",
            backgroundColor: "#ffffff",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          {/* Header of Inspector */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              paddingBottom: "16px",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "1.0625rem", fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>
                  {selectedClip.creator}
                </span>
                <span
                  style={{
                    fontSize: "0.6875rem",
                    padding: "2px 8px",
                    borderRadius: "9999px",
                    backgroundColor: "#f0fdf4",
                    color: "#059669",
                    fontWeight: 600,
                    border: "1px solid #dcfce7",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Check size={11} strokeWidth={2.5} />
                  <span>Terverifikasi AI</span>
                </span>
              </div>
              <div style={{ fontSize: "0.8125rem", color: "#6b7280", marginTop: "3px" }}>
                {selectedClip.title} • {selectedClip.platform} ({selectedClip.duration})
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.6875rem", color: "#6b7280" }}>Total Payout Escrow</div>
              <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "#111827" }}>
                {selectedClip.totalUsdt}
              </div>
              <div style={{ fontSize: "0.6875rem", color: "#9ca3af" }}>{selectedClip.totalIdr}</div>
            </div>
          </div>

          {/* Section 1: Multimodal AI Verification Details (Clean White Card) */}
          <div
            style={{
              padding: "16px",
              borderRadius: "10px",
              border: "1px solid #e5e7eb",
              backgroundColor: "#ffffff",
            }}
          >
            <div
              style={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Transkrip Audio Whisper &amp; Watermark Gemini</span>
              <span style={{ color: "#059669", fontWeight: 600 }}>{selectedClip.audioMatch}% Akurasi Semantik</span>
            </div>

            <p
              style={{
                fontSize: "0.8125rem",
                lineHeight: 1.55,
                color: "#374151",
                fontStyle: "italic",
                margin: "0 0 12px 0",
                padding: "10px 12px",
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
                borderLeft: "3px solid #e5e7eb",
              }}
            >
              &ldquo;{selectedClip.quote}&rdquo;
            </p>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.75rem", color: "#4b5563" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle2 size={13} color="#059669" />
                <span>{selectedClip.watermarkStatus}</span>
              </div>
              <span style={{ fontSize: "0.6875rem", color: "#6b7280" }}>Resolusi: 1080×1920 (9:16)</span>
            </div>
          </div>

          {/* Section 2: Oracle Metrics (3 Clean White Cards) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
            <div
              style={{
                padding: "14px",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                backgroundColor: "#ffffff",
              }}
            >
              <div style={{ fontSize: "0.6875rem", color: "#6b7280", fontWeight: 600 }}>Views Terverifikasi</div>
              <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "#111827", marginTop: "4px" }}>
                {selectedClip.views}
              </div>
              <div style={{ fontSize: "0.625rem", color: "#059669", marginTop: "2px", fontWeight: 600 }}>
                API Feed Valid
              </div>
            </div>

            <div
              style={{
                padding: "14px",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                backgroundColor: "#ffffff",
              }}
            >
              <div style={{ fontSize: "0.6875rem", color: "#6b7280", fontWeight: 600 }}>Keaslian Penonton</div>
              <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "#111827", marginTop: "4px" }}>
                99.2%
              </div>
              <div style={{ fontSize: "0.625rem", color: "#059669", marginTop: "2px", fontWeight: 600 }}>
                Anti-Sybil Organik
              </div>
            </div>

            <div
              style={{
                padding: "14px",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                backgroundColor: "#ffffff",
              }}
            >
              <div style={{ fontSize: "0.6875rem", color: "#6b7280", fontWeight: 600 }}>Efektif CPM</div>
              <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "#111827", marginTop: "4px" }}>
                Rp 24.500
              </div>
              <div style={{ fontSize: "0.625rem", color: "#6b7280", marginTop: "2px" }}>
                / 1.000 views
              </div>
            </div>
          </div>

          {/* Section 3: Smart Contract Timelock Escrow Breakdown (Clean White Card) */}
          <div
            style={{
              padding: "16px",
              borderRadius: "10px",
              border: "1px solid #e5e7eb",
              backgroundColor: "#ffffff",
            }}
          >
            <div
              style={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Alokasi Escrow Smart Contract</span>
              <span style={{ fontSize: "0.625rem", color: "#9ca3af", textTransform: "none", fontWeight: 500 }}>
                Smart Contract on BNB Chain
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Step 1: 70% Instant */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  backgroundColor: "#f9fafb",
                  border: "1px solid #f3f4f6",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#111827" }}>
                    70% Pencairan Instan
                  </div>
                  <div style={{ fontSize: "0.6875rem", color: "#6b7280" }}>
                    Ditransfer langsung via Poko BI-FAST / DANA ke rekening kreator
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#059669" }}>
                    {selectedClip.instantUsdt}
                  </div>
                  <div style={{ fontSize: "0.625rem", color: "#9ca3af" }}>Status: Terkirim</div>
                </div>
              </div>

              {/* Step 2: 30% Holdback */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  backgroundColor: "#f9fafb",
                  border: "1px solid #f3f4f6",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#111827" }}>
                    30% Escrow Holdback (Cooldown 72 Jam)
                  </div>
                  <div style={{ fontSize: "0.6875rem", color: "#6b7280" }}>
                    Terkunci di smart contract untuk proteksi retensi views kampanye
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#d97706" }}>
                    {selectedClip.holdbackUsdt}
                  </div>
                  <div style={{ fontSize: "0.625rem", color: "#9ca3af" }}>Timelock Aktif</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
