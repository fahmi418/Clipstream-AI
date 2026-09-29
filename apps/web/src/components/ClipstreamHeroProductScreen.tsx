"use client";

import React, { useState } from "react";
import {
  Check,
  CheckCircle2,
  Lock,
  Search,
  Zap,
  ExternalLink,
  Volume2,
  Eye,
  FileCheck,
  ChevronRight,
  ListOrdered,
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
  instantIdr: string;
  holdbackUsdt: string;
  holdbackIdr: string;
  quoteKeyword1: string;
  quoteKeyword2: string;
  watermarkStatus: string;
  status: "verified" | "holdback" | "queued";
  statusText: string;
  statusColor: string;
  txHash: string;
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
    instantIdr: "Rp 513.450",
    holdbackUsdt: "13.50 USDT",
    holdbackIdr: "Rp 220.050",
    quoteKeyword1: "BNB Chain",
    quoteKeyword2: "ClipStream",
    watermarkStatus: "Watermark sponsor terdeteksi aktif (00:03 - 00:45)",
    status: "verified",
    statusText: "98.8% Lolos AI",
    statusColor: "#059669",
    txHash: "0x8f4c...3a1c",
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
    instantIdr: "Rp 325.185",
    holdbackUsdt: "8.55 USDT",
    holdbackIdr: "Rp 139.365",
    quoteKeyword1: "Gasless Swap",
    quoteKeyword2: "ClipStream",
    watermarkStatus: "Watermark sponsor terdeteksi aktif (00:01 - 00:32)",
    status: "verified",
    statusText: "99.2% Lolos AI",
    statusColor: "#059669",
    txHash: "0x4b1e...99d2",
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
    instantIdr: "Rp 205.380",
    holdbackUsdt: "5.40 USDT",
    holdbackIdr: "Rp 88.020",
    quoteKeyword1: "Smart Contract",
    quoteKeyword2: "Multi-Sig",
    watermarkStatus: "Watermark sponsor terdeteksi aktif (00:04 - 00:58)",
    status: "verified",
    statusText: "Audio Whisper OK",
    statusColor: "#059669",
    txHash: "0x2e8a...77b1",
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
    instantIdr: "Rp 707.420",
    holdbackUsdt: "18.60 USDT",
    holdbackIdr: "Rp 303.180",
    quoteKeyword1: "AI Agent",
    quoteKeyword2: "Liquidity",
    watermarkStatus: "Watermark sponsor terdeteksi aktif (00:02 - 00:25)",
    status: "holdback",
    statusText: "Holdback 72 Jam",
    statusColor: "#d97706",
    txHash: "0x77c4...55a0",
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
    instantIdr: "Rp 136.920",
    holdbackUsdt: "3.60 USDT",
    holdbackIdr: "Rp 58.680",
    quoteKeyword1: "Web3 Creator",
    quoteKeyword2: "ClipStream",
    watermarkStatus: "Watermark sponsor terdeteksi aktif (00:02 - 00:41)",
    status: "verified",
    statusText: "97.9% Lolos AI",
    statusColor: "#059669",
    txHash: "0x91d3...11f7",
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
    instantIdr: "Rp 256.725",
    holdbackUsdt: "6.75 USDT",
    holdbackIdr: "Rp 110.025",
    quoteKeyword1: "Yield Farming",
    quoteKeyword2: "BNB Chain",
    watermarkStatus: "Watermark sponsor terdeteksi aktif (00:02 - 00:35)",
    status: "verified",
    statusText: "98.4% Lolos AI",
    statusColor: "#059669",
    txHash: "0x33e8...66cc",
  },
];

export function ClipstreamHeroProductScreen() {
  const [selectedId, setSelectedId] = useState<string>("clip-1");
  const [activeMobileTab, setActiveMobileTab] = useState<"list" | "detail">("detail");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredClips = SAMPLE_CLIPS.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.creator.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedClip =
    SAMPLE_CLIPS.find((c) => c.id === selectedId) || SAMPLE_CLIPS[0];

  return (
    <div
      className="am-home-duo-product-screen gsap-duo-screen"
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        boxShadow:
          "0 24px 60px -12px rgba(15, 23, 42, 0.12), 0 4px 16px rgba(15, 23, 42, 0.04)",
        overflow: "hidden",
        width: "100%",
        maxWidth: "1120px",
        margin: "0 auto",
        fontFamily:
          "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        textAlign: "left",
        userSelect: "none",
        color: "#0f172a",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── 1. Modern Window Header (macOS Style Chrome) ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 18px",
          borderBottom: "1px solid #e2e8f0",
          backgroundColor: "#f8fafc",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        {/* Left: Window Controls + Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {/* macOS Traffic Lights */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                width: "11px",
                height: "11px",
                borderRadius: "50%",
                backgroundColor: "#ef4444",
                display: "inline-block",
                border: "1px solid rgba(0,0,0,0.1)",
              }}
            />
            <span
              style={{
                width: "11px",
                height: "11px",
                borderRadius: "50%",
                backgroundColor: "#f59e0b",
                display: "inline-block",
                border: "1px solid rgba(0,0,0,0.1)",
              }}
            />
            <span
              style={{
                width: "11px",
                height: "11px",
                borderRadius: "50%",
                backgroundColor: "#10b981",
                display: "inline-block",
                border: "1px solid rgba(0,0,0,0.1)",
              }}
            />
          </div>

          <div
            style={{
              width: "1px",
              height: "16px",
              backgroundColor: "#cbd5e1",
            }}
          />

          {/* App Title & Protocol Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>
              ClipStream Copilot
            </span>
            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: 600,
                color: "#475569",
                backgroundColor: "#e2e8f0",
                padding: "2px 8px",
                borderRadius: "6px",
              }}
            >
              BNB Chain Escrow
            </span>
          </div>
        </div>

        {/* Center/Right: Live Status & Tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Desktop Mode Tabs */}
          <div
            className="hidden sm:flex"
            style={{
              alignItems: "center",
              gap: "4px",
              backgroundColor: "#e2e8f0",
              padding: "3px",
              borderRadius: "8px",
            }}
          >
            <button
              type="button"
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#0f172a",
                backgroundColor: "#ffffff",
                padding: "4px 10px",
                borderRadius: "6px",
                border: "none",
                boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                cursor: "pointer",
              }}
            >
              Antrean Verifikasi ({SAMPLE_CLIPS.length})
            </button>
            <button
              type="button"
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#64748b",
                backgroundColor: "transparent",
                padding: "4px 10px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Pencairan Otomatis (32)
            </button>
          </div>

          {/* AI Oracle Status Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.6875rem",
              fontWeight: 700,
              color: "#047857",
              backgroundColor: "#ecfdf5",
              border: "1px solid #a7f3d0",
              padding: "4px 10px",
              borderRadius: "9999px",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                backgroundColor: "#10b981",
              }}
            />
            <span>AI Oracle Live</span>
          </div>
        </div>
      </div>

      {/* ── Mobile Viewport Switcher (< 768px) ── */}
      <div
        className="flex md:hidden"
        style={{
          padding: "8px 12px",
          backgroundColor: "#f1f5f9",
          borderBottom: "1px solid #e2e8f0",
          gap: "8px",
        }}
      >
        <button
          type="button"
          onClick={() => setActiveMobileTab("list")}
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: "8px",
            fontSize: "0.75rem",
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            backgroundColor: activeMobileTab === "list" ? "#0f172a" : "#ffffff",
            color: activeMobileTab === "list" ? "#ffffff" : "#475569",
            boxShadow:
              activeMobileTab === "list"
                ? "0 2px 6px rgba(0,0,0,0.15)"
                : "none",
            transition: "all 0.15s ease",
          }}
        >
          <ListOrdered size={14} /> Daftar Klip ({SAMPLE_CLIPS.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileTab("detail")}
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: "8px",
            fontSize: "0.75rem",
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            backgroundColor:
              activeMobileTab === "detail" ? "#0f172a" : "#ffffff",
            color: activeMobileTab === "detail" ? "#ffffff" : "#475569",
            boxShadow:
              activeMobileTab === "detail"
                ? "0 2px 6px rgba(0,0,0,0.15)"
                : "none",
            transition: "all 0.15s ease",
          }}
        >
          <Search size={14} /> Hasil Audit AI
        </button>
      </div>

      {/* ── 2. Dashboard Body (2 Column Layout) ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
          minHeight: "560px",
          backgroundColor: "#ffffff",
        }}
      >
        {/* ── Left Column: Feed / Clip List ── */}
        <div
          className={`${
            activeMobileTab === "list" ? "flex" : "hidden md:flex"
          }`}
          style={{
            gridColumn: "span 5 / span 5",
            borderRight: "1px solid #e2e8f0",
            backgroundColor: "#f8fafc",
            flexDirection: "column",
            padding: "12px",
            gap: "8px",
            overflowY: "auto",
            maxHeight: "580px",
          }}
        >
          {/* Quick Search Header */}
          <div
            style={{
              position: "relative",
              marginBottom: "4px",
            }}
          >
            <Search
              size={14}
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
              }}
            />
            <input
              type="text"
              placeholder="Cari klip atau kreator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "7px 10px 7px 30px",
                fontSize: "0.75rem",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                backgroundColor: "#ffffff",
                outline: "none",
                color: "#0f172a",
              }}
            />
          </div>

          {/* Clip Items List */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              flex: 1,
            }}
          >
            {filteredClips.map((clip) => {
              const isSelected = clip.id === selectedId;
              return (
                <div
                  key={clip.id}
                  onClick={() => {
                    setSelectedId(clip.id);
                    setActiveMobileTab("detail");
                  }}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                    backgroundColor: isSelected ? "#ffffff" : "transparent",
                    border: isSelected
                      ? "1px solid #10b981"
                      : "1px solid transparent",
                    boxShadow: isSelected
                      ? "0 4px 12px -2px rgba(16, 185, 129, 0.12), 0 1px 3px rgba(0,0,0,0.05)"
                      : "none",
                  }}
                >
                  {/* Left Info */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                      minWidth: 0,
                    }}
                  >
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
                          fontWeight: 700,
                          color: isSelected ? "#0f172a" : "#334155",
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
                          color: "#64748b",
                          marginTop: "2px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>{clip.creator}</span>
                        <span>•</span>
                        <span>{clip.views} views</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Status */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div
                      style={{
                        fontSize: "0.8125rem",
                        fontWeight: 800,
                        color: "#0f172a",
                      }}
                    >
                      {clip.totalUsdt}
                    </div>
                    <div
                      style={{
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        color: clip.statusColor,
                      }}
                    >
                      {clip.statusText}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right Column: AI Inspector Panel ── */}
        <div
          className={`${
            activeMobileTab === "detail" ? "flex" : "hidden md:flex"
          }`}
          style={{
            gridColumn: "span 7 / span 7",
            padding: "18px 20px",
            backgroundColor: "#ffffff",
            flexDirection: "column",
            gap: "14px",
            overflowY: "auto",
            maxHeight: "580px",
          }}
        >
          {/* Inspector Header */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              paddingBottom: "12px",
              borderBottom: "1px solid #f1f5f9",
              gap: "12px",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: "1.0625rem",
                    fontWeight: 800,
                    color: "#0f172a",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {selectedClip.creator}
                </span>
                <span
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    color: "#047857",
                    backgroundColor: "#ecfdf5",
                    border: "1px solid #a7f3d0",
                    padding: "2px 8px",
                    borderRadius: "9999px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Check size={11} strokeWidth={3} />
                  <span>Terverifikasi AI</span>
                </span>
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#64748b",
                  marginTop: "3px",
                }}
              >
                {selectedClip.title} • {selectedClip.platform} ({selectedClip.duration})
              </div>
            </div>

            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 600 }}>
                Total Payout Escrow
              </div>
              <div
                style={{
                  fontSize: "1.0625rem",
                  fontWeight: 900,
                  color: "#0f172a",
                  letterSpacing: "-0.01em",
                }}
              >
                {selectedClip.totalUsdt}
              </div>
              <div style={{ fontSize: "0.6875rem", color: "#94a3b8", fontWeight: 500 }}>
                {selectedClip.totalIdr}
              </div>
            </div>
          </div>

          {/* ── Section 1: AI Multi-Modal Verification Card ── */}
          <div
            style={{
              backgroundColor: "#f8fafc",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              padding: "14px 16px",
            }}
          >
            {/* Header Badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#334155",
                }}
              >
                <Volume2 size={15} style={{ color: "#ea580c" }} />
                <span>Transkrip Audio Whisper &amp; Watermark Gemini</span>
              </div>
              <span
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  color: "#047857",
                  backgroundColor: "#d1fae5",
                  padding: "2px 8px",
                  borderRadius: "6px",
                }}
              >
                {selectedClip.audioMatch}% Akurasi Semantik
              </span>
            </div>

            {/* Transcript Quote Box */}
            <div
              style={{
                fontSize: "0.8125rem",
                lineHeight: 1.6,
                color: "#1e293b",
                backgroundColor: "#ffffff",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                marginBottom: "10px",
              }}
            >
              &ldquo;Pelajari arsitektur smart contract escrow di{" "}
              <span
                style={{
                  backgroundColor: "#ffedd5",
                  color: "#c2410c",
                  fontWeight: 700,
                  padding: "1px 6px",
                  borderRadius: "4px",
                  border: "1px solid #fed7aa",
                }}
              >
                {selectedClip.quoteKeyword1}
              </span>{" "}
              bersama{" "}
              <span
                style={{
                  backgroundColor: "#dcfce7",
                  color: "#15803d",
                  fontWeight: 700,
                  padding: "1px 6px",
                  borderRadius: "4px",
                  border: "1px solid #bbf7d0",
                }}
              >
                {selectedClip.quoteKeyword2}
              </span>
              . Klip video kamu dibayar otomatis begitu target views valid tanpa perlu chat admin manual.&rdquo;
            </div>

            {/* Watermark Details */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "0.75rem",
                color: "#475569",
                flexWrap: "wrap",
                gap: "6px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle2 size={14} style={{ color: "#10b981", flexShrink: 0 }} />
                <span>{selectedClip.watermarkStatus}</span>
              </div>
              <span style={{ fontSize: "0.6875rem", color: "#94a3b8" }}>
                Resolusi 1080×1920 (9:16)
              </span>
            </div>
          </div>

          {/* ── Section 2: Oracle Metrics (3 Cards Grid) ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "10px",
            }}
          >
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#f8fafc",
              }}
            >
              <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 700 }}>
                Views Terverifikasi
              </div>
              <div
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 900,
                  color: "#0f172a",
                  marginTop: "2px",
                }}
              >
                {selectedClip.views}
              </div>
              <div
                style={{
                  fontSize: "0.6875rem",
                  color: "#047857",
                  fontWeight: 700,
                  marginTop: "2px",
                }}
              >
                ✓ API Feed Valid
              </div>
            </div>

            <div
              style={{
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#f8fafc",
              }}
            >
              <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 700 }}>
                Keaslian Penonton
              </div>
              <div
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 900,
                  color: "#0f172a",
                  marginTop: "2px",
                }}
              >
                99.2%
              </div>
              <div
                style={{
                  fontSize: "0.6875rem",
                  color: "#047857",
                  fontWeight: 700,
                  marginTop: "2px",
                }}
              >
                ✓ Anti-Sybil Organik
              </div>
            </div>

            <div
              style={{
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#f8fafc",
              }}
            >
              <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 700 }}>
                Efektif CPM
              </div>
              <div
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 900,
                  color: "#0f172a",
                  marginTop: "2px",
                }}
              >
                Rp 24.500
              </div>
              <div
                style={{
                  fontSize: "0.6875rem",
                  color: "#64748b",
                  marginTop: "2px",
                }}
              >
                / 1.000 views
              </div>
            </div>
          </div>

          {/* ── Section 3: Smart Contract Timelock Breakdown ── */}
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#f8fafc",
            }}
          >
            {/* Split Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#334155",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Alokasi Escrow Smart Contract
              </span>
              <span
                style={{
                  fontSize: "0.6875rem",
                  color: "#64748b",
                  fontWeight: 600,
                }}
              >
                BNB Chain Timelock
              </span>
            </div>

            {/* Split Progress Bar */}
            <div
              style={{
                height: "6px",
                width: "100%",
                borderRadius: "9999px",
                backgroundColor: "#e2e8f0",
                display: "flex",
                overflow: "hidden",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  width: "70%",
                  height: "100%",
                  backgroundColor: "#10b981",
                }}
              />
              <div
                style={{
                  width: "30%",
                  height: "100%",
                  backgroundColor: "#f59e0b",
                }}
              />
            </div>

            {/* Rows Breakdown */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {/* 70% Instant */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  backgroundColor: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                  <div
                    style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "6px",
                      backgroundColor: "#059669",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Zap size={14} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0f172a" }}>
                      70% Pencairan Instan
                    </div>
                    <div
                      style={{
                        fontSize: "0.6875rem",
                        color: "#047857",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      Poko BI-FAST / DANA langsung ke rekening kreator
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "0.8125rem", fontWeight: 800, color: "#047857" }}>
                    {selectedClip.instantUsdt}
                  </div>
                  <div style={{ fontSize: "0.6875rem", color: "#059669", fontWeight: 600 }}>
                    {selectedClip.instantIdr}
                  </div>
                </div>
              </div>

              {/* 30% Holdback */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  backgroundColor: "#fffbeb",
                  border: "1px solid #fde68a",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                  <div
                    style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "6px",
                      backgroundColor: "#d97706",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Lock size={13} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0f172a" }}>
                      30% Escrow Holdback (72 Jam)
                    </div>
                    <div
                      style={{
                        fontSize: "0.6875rem",
                        color: "#b45309",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      Terkunci di smart contract untuk proteksi retensi views
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "0.8125rem", fontWeight: 800, color: "#b45309" }}>
                    {selectedClip.holdbackUsdt}
                  </div>
                  <div style={{ fontSize: "0.6875rem", color: "#d97706", fontWeight: 600 }}>
                    {selectedClip.holdbackIdr}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Sub-bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: "6px",
              fontSize: "0.6875rem",
              color: "#94a3b8",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span>On-Chain Tx:</span>
              <span style={{ fontFamily: "monospace", color: "#64748b" }}>
                {selectedClip.txHash}
              </span>
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                color: "#2563eb",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <span>Verifikasi di BscScan</span>
              <ExternalLink size={11} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
