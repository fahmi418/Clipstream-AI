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
  const [activeMobileTab, setActiveMobileTab] = useState<"list" | "detail">("detail");
  const selectedClip =
    SAMPLE_CLIPS.find((c) => c.id === selectedId) || SAMPLE_CLIPS[0];

  return (
    <div
      className="am-home-duo-product-screen gsap-duo-screen"
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "16px",
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
        minHeight: "700px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── 1. Top Window Bar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:px-4 sm:py-2.5 border-b border-slate-100 bg-white gap-2.5">
        {/* Left: Window Dots + App Brand + Tabs */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="hidden sm:flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block" />
          </div>

          <div className="hidden sm:block h-4 w-px bg-slate-200" />

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 tracking-tight">
              ClipStream Copilot
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200/60">
              BNB Chain Escrow
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 ml-2">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-900">
              Antrean Verifikasi <span className="text-slate-500 font-normal">(14)</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-medium text-slate-500">
              Pencairan Otomatis <span className="text-slate-400">(32)</span>
            </span>
          </div>
        </div>

        {/* Right: Status indicator */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>AI Oracle Live</span>
          </div>

          <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center border border-slate-200">
            CS
          </div>
        </div>
      </div>

      {/* ── 2. Subheader Toolbar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-3 sm:px-4 py-2 border-b border-slate-100 bg-slate-50 text-xs text-slate-500 gap-1.5 sm:gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-800">Klip Masuk ({SAMPLE_CLIPS.length})</span>
          <span className="text-slate-300">•</span>
          <span className="text-[11px] text-slate-600">Semua Platform</span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-600 flex-wrap">
          <span>Urutkan: Terbaru</span>
          <span className="text-slate-300">•</span>
          <span className="text-emerald-700 font-medium">Whisper &amp; Gemini Vision Live</span>
        </div>
      </div>

      {/* ── Mobile Viewport Switcher (< md screens) ── */}
      <div className="flex md:hidden p-1.5 bg-slate-100 border-b border-slate-200 gap-1.5">
        <button
          type="button"
          onClick={() => setActiveMobileTab("list")}
          style={{
            flex: 1,
            padding: "8px 10px",
            borderRadius: "10px",
            fontSize: "0.75rem",
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            whiteSpace: "nowrap",
            backgroundColor: activeMobileTab === "list" ? "#111827" : "transparent",
            color: activeMobileTab === "list" ? "#ffffff" : "#64748b",
            boxShadow: activeMobileTab === "list" ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
            transition: "all 0.15s ease",
          }}
        >
          <span>📋 Daftar Klip ({SAMPLE_CLIPS.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileTab("detail")}
          style={{
            flex: 1,
            padding: "8px 10px",
            borderRadius: "10px",
            fontSize: "0.75rem",
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            whiteSpace: "nowrap",
            backgroundColor: activeMobileTab === "detail" ? "#111827" : "transparent",
            color: activeMobileTab === "detail" ? "#ffffff" : "#64748b",
            boxShadow: activeMobileTab === "detail" ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
            transition: "all 0.15s ease",
          }}
        >
          <span>🔍 Hasil Audit AI</span>
        </button>
      </div>

      {/* ── 3. Main Dashboard Body (Responsive 12-Column Grid) ── */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 bg-white">
        {/* ── Left Column: Clean List of Clips ── */}
        <div
          className={`md:col-span-5 md:border-r md:border-slate-100 bg-white flex-col divide-y divide-slate-50 ${
            activeMobileTab === "list" ? "flex" : "hidden md:flex"
          }`}
        >
          {SAMPLE_CLIPS.map((clip) => {
            const isSelected = clip.id === selectedId;
            return (
              <div
                key={clip.id}
                onClick={() => {
                  setSelectedId(clip.id);
                  setActiveMobileTab("detail");
                }}
                className={`p-3.5 sm:px-4 sm:py-3.5 cursor-pointer transition-all flex items-center justify-between gap-3 border-l-4 ${
                  isSelected
                    ? "bg-slate-50/80 border-slate-900"
                    : "bg-white border-transparent hover:bg-slate-50/50"
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div
                    className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: clip.statusColor }}
                  />
                  <div className="min-w-0">
                    <div className={`text-xs sm:text-sm font-bold truncate ${isSelected ? "text-slate-900" : "text-slate-800"}`}>
                      {clip.title}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {clip.creator} • {clip.views} views • {clip.platform}
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-xs sm:text-sm font-bold text-slate-900">
                    {clip.totalUsdt}
                  </div>
                  <div
                    className="text-[10px] font-bold"
                    style={{ color: clip.statusColor }}
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
          className={`md:col-span-7 p-4 sm:p-6 bg-white flex-col gap-4 sm:gap-5 ${
            activeMobileTab === "detail" ? "flex" : "hidden md:flex"
          }`}
        >
          {/* Header of Inspector */}
          <div className="flex items-start justify-between pb-3 sm:pb-4 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  {selectedClip.creator}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/60 inline-flex items-center gap-1">
                  <Check size={11} strokeWidth={2.5} />
                  <span>Terverifikasi AI</span>
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {selectedClip.title} • {selectedClip.platform} ({selectedClip.duration})
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <div className="text-[10px] text-slate-500 font-medium">Total Payout Escrow</div>
              <div className="text-sm sm:text-base font-extrabold text-slate-900">
                {selectedClip.totalUsdt}
              </div>
              <div className="text-[10px] text-slate-400">{selectedClip.totalIdr}</div>
            </div>
          </div>

          {/* Section 1: Multimodal AI Verification Details */}
          <div
            style={{
              backgroundColor: "#f8fafc",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              padding: "14px 16px",
            }}
          >
            <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex flex-col sm:flex-row justify-between sm:items-center gap-1">
              <span>Transkrip Audio Whisper &amp; Watermark Gemini</span>
              <span className="text-emerald-700 font-bold">{selectedClip.audioMatch}% Akurasi Semantik</span>
            </div>

            <p
              style={{
                fontSize: "0.8125rem",
                lineHeight: 1.55,
                color: "#1e293b",
                fontStyle: "italic",
                margin: "0 0 10px 0",
                padding: "10px 12px",
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                borderLeft: "3px solid #059669",
                boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
              }}
            >
              &ldquo;{selectedClip.quote}&rdquo;
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-1.5">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-600 flex-shrink-0" />
                <span className="truncate">{selectedClip.watermarkStatus}</span>
              </div>
              <span className="text-[10px] text-slate-400">Resolusi: 1080×1920 (9:16)</span>
            </div>
          </div>

          {/* Section 2: Oracle Metrics (3 Clean Responsive Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#f8fafc",
              }}
            >
              <div className="text-[10px] sm:text-[11px] text-slate-500 font-bold">Views Terverifikasi</div>
              <div className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                {selectedClip.views}
              </div>
              <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
                API Feed Valid
              </div>
            </div>

            <div
              style={{
                padding: "12px 14px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#f8fafc",
              }}
            >
              <div className="text-[10px] sm:text-[11px] text-slate-500 font-bold">Keaslian Penonton</div>
              <div className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                99.2%
              </div>
              <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
                Anti-Sybil Organik
              </div>
            </div>

            <div
              style={{
                padding: "12px 14px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#f8fafc",
              }}
            >
              <div className="text-[10px] sm:text-[11px] text-slate-500 font-bold">Efektif CPM</div>
              <div className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                Rp 24.500
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                / 1.000 views
              </div>
            </div>
          </div>

          {/* Section 3: Smart Contract Timelock Escrow Breakdown */}
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#f8fafc",
            }}
          >
            <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex justify-between items-center">
              <span>Alokasi Escrow Smart Contract</span>
              <span className="text-[10px] text-slate-400 lowercase font-normal">
                bnb chain escrow
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {/* Step 1: 70% Instant */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  backgroundColor: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  gap: "8px",
                }}
              >
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-slate-900">
                    70% Pencairan Instan
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-500 truncate">
                    Ditransfer langsung via Poko BI-FAST / DANA ke rekening kreator
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs sm:text-sm font-extrabold text-emerald-700">
                    {selectedClip.instantUsdt}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium">Terkirim</div>
                </div>
              </div>

              {/* Step 2: 30% Holdback */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  backgroundColor: "#fffbeb",
                  border: "1px solid #fde68a",
                  gap: "8px",
                }}
              >
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-slate-900">
                    30% Escrow Holdback (72 Jam)
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-500 truncate">
                    Terkunci di smart contract untuk proteksi retensi views kampanye
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs sm:text-sm font-extrabold text-amber-700">
                    {selectedClip.holdbackUsdt}
                  </div>
                  <div className="text-[10px] text-amber-600 font-medium">Timelock Aktif</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
