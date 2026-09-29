"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AuthGate } from "@/components/AuthGate";
import {
  getAdminAiTelemetry,
  pingAdminAiModel,
  runAdminAiAudit,
  type AiTelemetryResponse,
  type AiTelemetryModelHealth,
  type AiTelemetryLog,
} from "@/lib/api";
import {
  Cpu,
  Bot,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Coins,
  ShieldCheck,
  TrendingUp,
  SlidersHorizontal,
  Server,
  Layers,
  ArrowRight,
  Eye,
  Radio,
  FileCheck2,
  Lock,
  Search,
  Check,
  ExternalLink,
  Sparkles,
  X,
  FileText,
  Copy,
  ChevronLeft,
  ChevronRight,
  Filter,
  ShieldAlert,
} from "lucide-react";

export interface TaskConfigMeta {
  key: string;
  name: string;
  shortName: string;
  desc: string;
  bg: string;
  text: string;
  border: string;
}

export const AI_TASK_MAP: Record<string, TaskConfigMeta> = {
  brand_safety: {
    key: "brand_safety",
    name: "Audit Brand Safety & Kepatuhan Rubrik",
    shortName: "Brand Safety",
    desc: "Evaluasi multimodal transkrip & konten klip terhadap larangan konten terlarang, kompetitor, SARA, dan tagar wajib.",
    bg: "#fef2f2",
    text: "#991b1b",
    border: "#fecaca",
  },
  audio_transcription: {
    key: "audio_transcription",
    name: "Transkripsi Suara (Whisper ASR)",
    shortName: "Whisper Audio",
    desc: "Ekstraksi audio stream 16kHz dan transkripsi suara klip YouTube Shorts ke teks kata-per-kata.",
    bg: "#f0fdf4",
    text: "#166534",
    border: "#bbf7d0",
  },
  watermark_detection: {
    key: "watermark_detection",
    name: "Deteksi Logo & Watermark Visual",
    shortName: "Logo & Watermark",
    desc: "Inspeksi visual Vision LLM pada keyframe video untuk bounding box logo brand & kode verifikasi #CS-.",
    bg: "#faf5ff",
    text: "#6b21a8",
    border: "#e9d5ff",
  },
  vector_embedding: {
    key: "vector_embedding",
    name: "Pencocokan Vektor Semantik (Embedding)",
    shortName: "Pencocokan Vektor",
    desc: "Perhitungan 384-dimensi cosine similarity antara transkrip klip clipper dan narasi video sumber.",
    bg: "#eff6ff",
    text: "#1e40af",
    border: "#bfdbfe",
  },
  anomaly_detection: {
    key: "anomaly_detection",
    name: "Deteksi Anomali Views & Fraud Anti-Bot",
    shortName: "Deteksi Anomali",
    desc: "Audit pola rasio views, like-to-view ratio, dan distribusi traffic untuk mendeteksi kecurangan bot.",
    bg: "#fffbeb",
    text: "#92400e",
    border: "#fde68a",
  },
  live_audit: {
    key: "live_audit",
    name: "Uji Coba Live Orkestrasi AI (Admin)",
    shortName: "Live Test Admin",
    desc: "Simulasi eksekusi cascading pipeline AI real-time yang dipicu langsung dari tombol Audit Live.",
    bg: "#f0fdfa",
    text: "#115e59",
    border: "#99f6e4",
  },
};

export default function AdminAiMonitoringPage() {
  const [telemetry, setTelemetry] = useState<AiTelemetryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [runningAudit, setRunningAudit] = useState(false);
  const [auditSuccessMessage, setAuditSuccessMessage] = useState<string | null>(null);
  const [auditErrorMessage, setAuditErrorMessage] = useState<string | null>(null);
  const [pingingModelId, setPingingModelId] = useState<string | null>(null);
  const [pingResult, setPingResult] = useState<{ modelId: string; status: string; latencyMs: number; error?: string } | null>(null);
  const [searchLog, setSearchLog] = useState("");
  const [selectedVerdictFilter, setSelectedVerdictFilter] = useState<"ALL" | "PASS" | "REVIEW" | "FAIL">("ALL");
  const [selectedTaskFilter, setSelectedTaskFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [showRawJsonModal, setShowRawJsonModal] = useState<boolean>(false);
  const [selectedLog, setSelectedLog] = useState<AiTelemetryLog | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const loadTelemetry = async () => {
    try {
      setRefreshing(true);
      const data = await getAdminAiTelemetry();
      setTelemetry(data);
      setConnectionError(null);
      setLastUpdated(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    } catch (err: any) {
      console.warn("Sinkronisasi telemetri ditunda:", err?.message || err);
      setConnectionError("Menghubungkan ke API...");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTelemetry();
    const interval = setInterval(loadTelemetry, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRunLiveAudit = async () => {
    try {
      setRunningAudit(true);
      setAuditSuccessMessage(null);
      setAuditErrorMessage(null);
      const sampleTitles = [
        "Review Podcast Bisnis #web3 #shorts",
        "Tutorial Prompt Engineering AI 2026",
        "Gaming Benchmark RTX 5090 vs H100",
        "Strategi Viral YouTube Shorts Organik",
      ];
      const title = sampleTitles[Math.floor(Math.random() * sampleTitles.length)] + " (" + new Date().toLocaleTimeString("id-ID") + ")";
      const res = await runAdminAiAudit({
        title,
        description: "Pengujian orkestrasi cascading AI live dari Admin Dashboard",
        transcript: "Halo teman-teman semua, selamat datang kembali di channel! Di video kali ini kita akan membahas evaluasi kepatuhan sponsor brand secara otomatis.",
        rules: "Aturan sponsor: ramah keluarga, informatif, dilarang promosi judi online atau klaim keuangan palsu.",
      });
      await loadTelemetry();
      setAuditSuccessMessage(
        `Audit Live Berhasil! Model: ${res.data.model} | Token: ${res.data.totalTokens} (${res.data.promptTokens} in / ${res.data.completionTokens} out) | Durasi: ${res.data.durationMs}ms | Hasil: ${res.data.verdict}`
      );
      setTimeout(() => setAuditSuccessMessage(null), 12000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setAuditErrorMessage(`Gagal menjalankan live audit: ${msg}`);
      setTimeout(() => setAuditErrorMessage(null), 10000);
    } finally {
      setRunningAudit(false);
    }
  };

  const handlePingModel = async (modelId: string) => {
    setPingingModelId(modelId);
    setPingResult(null);
    try {
      const res = await pingAdminAiModel(modelId);
      setPingResult(res);
      // Refresh telemetry after ping
      setTimeout(loadTelemetry, 500);
    } catch (err: any) {
      setPingResult({
        modelId,
        status: "ERROR",
        latencyMs: 0,
        error: err.message || "Gagal menghubungkan ke model",
      });
    } finally {
      setPingingModelId(null);
    }
  };

  const filteredLogs = (telemetry?.recentLogs || []).filter((log) => {
    const matchesSearch =
      (log.clipTitle || "").toLowerCase().includes(searchLog.toLowerCase()) ||
      log.model.toLowerCase().includes(searchLog.toLowerCase()) ||
      log.task.toLowerCase().includes(searchLog.toLowerCase()) ||
      (log.clipId || "").toLowerCase().includes(searchLog.toLowerCase()) ||
      (log.reasoning || "").toLowerCase().includes(searchLog.toLowerCase());
    const matchesVerdict = selectedVerdictFilter === "ALL" || log.verdict === selectedVerdictFilter;
    const matchesTask = selectedTaskFilter === "ALL" || log.task === selectedTaskFilter;
    return matchesSearch && matchesVerdict && matchesTask;
  });

  const totalLogsCount = filteredLogs.length;
  const effectivePageSize = pageSize === 9999 ? Math.max(1, totalLogsCount) : pageSize;
  const totalPages = Math.max(1, Math.ceil(totalLogsCount / effectivePageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedLogs = filteredLogs.slice(
    (safeCurrentPage - 1) * effectivePageSize,
    safeCurrentPage * effectivePageSize
  );

  const handleCopyText = (text: string, label: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedSnippet(label);
      setTimeout(() => setCopiedSnippet(null), 2000);
    } catch {}
  };

  const onlineCount = telemetry?.modelsHealth.filter((m) => m.status === "HEALTHY").length ?? 0;
  const totalCount = telemetry?.modelsHealth.length ?? 0;
  const avgSla = telemetry?.modelsHealth.length
    ? (telemetry.modelsHealth.reduce((acc, m) => acc + m.successRate, 0) / telemetry.modelsHealth.length).toFixed(1)
    : "99.4";

  const tier1Model = telemetry?.modelsHealth.find((m) => m.tier === 1 || m.tier === "1");
  const tier2Model = telemetry?.modelsHealth.find((m) => m.tier === 2 || m.tier === "2");
  const tier3Model = telemetry?.modelsHealth.find((m) => m.tier === 3 || m.tier === "3");
  const tier4Model = telemetry?.modelsHealth.find((m) => m.tier === 4 || m.tier === "4");
  const tier5Model = telemetry?.modelsHealth.find((m) => m.tier === 5 || m.tier === "5");
  const visionModel = telemetry?.modelsHealth.find((m) => m.tier === "Vision");
  const audioModel = telemetry?.modelsHealth.find((m) => m.tier === "Audio");

  return (
    <AuthGate
      requiredRole="admin"
      title="Portal Pemantauan & Telemetri AI"
      description="Akses khusus administrator untuk mengawasi kesehatan model AI, konsumsi token, latensi inferensi, dan arsitektur failover."
    >
      <div
        style={{
          backgroundColor: "#f8fafc",
          minHeight: "100vh",
          paddingTop: "6.5rem",
          paddingBottom: "5rem",
        }}
      >
        <div
          style={{
            maxWidth: "76rem",
            margin: "0 auto",
            padding: "0 1.5rem",
          }}
        >
          {/* Top Admin Sub-Navigation */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.75rem",
              borderBottom: "1px solid #e2e8f0",
              paddingBottom: "12px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <Link
                href="/admin"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#64748b",
                  textDecoration: "none",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                }}
              >
                <SlidersHorizontal size={15} /> Ringkasan &amp; Worker
              </Link>

              <Link
                href="/admin/appeals"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#64748b",
                  textDecoration: "none",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                }}
              >
                <Activity size={15} /> Sengketa &amp; Banding
              </Link>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#0284c7",
                  background: "rgba(2, 132, 199, 0.08)",
                  border: "1px solid rgba(2, 132, 199, 0.25)",
                }}
              >
                <Bot size={15} /> Observabilitas AI &amp; Token
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              {connectionError ? (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "5px 10px",
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#92400e",
                    background: "#fef3c7",
                    border: "1px solid #fde68a",
                  }}
                  title="Menghubungkan kembali ke server API"
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      backgroundColor: "#d97706",
                      display: "inline-block",
                    }}
                  />
                  <span>{connectionError}</span>
                </div>
              ) : lastUpdated ? (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "5px 10px",
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#475569",
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                  }}
                  title="Sinkronisasi otomatis setiap 5 detik"
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      backgroundColor: "#16a34a",
                      display: "inline-block",
                    }}
                  />
                  <span>Live ({lastUpdated})</span>
                </div>
              ) : null}

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#166534",
                  background: "#dcfce7",
                  border: "1px solid #bbf7d0",
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    backgroundColor: "#16a34a",
                    display: "inline-block",
                  }}
                />
                5-Tier Auto-Failover Aktif
              </div>

              <button
                onClick={handleRunLiveAudit}
                disabled={runningAudit}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "7px 14px",
                  borderRadius: "8px",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  color: "#ffffff",
                  background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
                  border: "none",
                  boxShadow: "0 2px 6px rgba(2, 132, 199, 0.35)",
                  cursor: runningAudit ? "wait" : "pointer",
                }}
              >
                <Zap size={14} className={runningAudit ? "animate-spin" : ""} />
                {runningAudit ? "Menjalankan Audit..." : "Jalankan Audit AI Live"}
              </button>

              <button
                onClick={loadTelemetry}
                disabled={refreshing}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "7px 14px",
                  borderRadius: "8px",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "#0f172a",
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  cursor: refreshing ? "wait" : "pointer",
                }}
              >
                <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                {refreshing ? "Memperbarui..." : "Refresh"}
              </button>
            </div>
          </div>

          {/* Page Title & Subtitle */}
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  boxShadow: "0 4px 12px rgba(2, 132, 199, 0.25)",
                }}
              >
                <Cpu size={20} />
              </div>
              <h1
                style={{
                  fontSize: "1.625rem",
                  fontWeight: 800,
                  color: "#0f172a",
                  margin: 0,
                  letterSpacing: "-0.02em",
                }}
              >
                AI Observability &amp; Token Telemetry
              </h1>
            </div>
            <p style={{ fontSize: "0.9375rem", color: "#64748b", margin: 0, maxWidth: "48rem" }}>
              Dasbor kendali real-time untuk memantau kesehatan model AI multi-tier (NVIDIA NIM H100, Meta Muse Glimmer 30B,
              Gemini, Groq), konsumsi token, latensi inferensi, dan perlindungan kuota.
            </p>
          </div>

          {/* Live Audit Success Notification Banner */}
          {auditSuccessMessage && (
            <div
              style={{
                marginBottom: "1.5rem",
                padding: "12px 16px",
                borderRadius: "10px",
                background: "#ecfdf5",
                border: "1px solid #a7f3d0",
                color: "#065f46",
                fontSize: "0.875rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle2 size={18} style={{ color: "#059669", flexShrink: 0 }} />
                <span>{auditSuccessMessage}</span>
              </div>
              <button
                onClick={() => setAuditSuccessMessage(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#047857",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Live Audit Error Notification Banner */}
          {auditErrorMessage && (
            <div
              style={{
                marginBottom: "1.5rem",
                padding: "12px 16px",
                borderRadius: "10px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                fontSize: "0.875rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <XCircle size={18} style={{ color: "#dc2626", flexShrink: 0 }} />
                <span>{auditErrorMessage}</span>
              </div>
              <button
                onClick={() => setAuditErrorMessage(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#b91c1c",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Section 1: Hero Metric Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "1rem",
              marginBottom: "2rem",
            }}
          >
            {/* Card 1: Total Tokens */}
            <div
              style={{
                backgroundColor: "#ffffff",
                padding: "1.25rem",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#64748b" }}>TOTAL TOKEN TERPAKAI</span>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "8px",
                    background: "#f0f9ff",
                    color: "#0284c7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Cpu size={16} />
                </div>
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>
                {telemetry?.tokens.totalTokens.toLocaleString("id-ID") ?? "0"}{" "}
                <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#64748b" }}>Tokens</span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                Prompt:{" "}
                <strong style={{ color: "#334155" }}>
                  {telemetry?.tokens.promptTokens.toLocaleString("id-ID") ?? "0"}
                </strong>{" "}
                | Output:{" "}
                <strong style={{ color: "#334155" }}>
                  {telemetry?.tokens.completionTokens.toLocaleString("id-ID") ?? "0"}
                </strong>
              </div>
            </div>

            {/* Card 2: Cost Savings */}
            <div
              style={{
                backgroundColor: "#ffffff",
                padding: "1.25rem",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#64748b" }}>PENGHEMATAN BIAYA AI</span>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "8px",
                    background: "#ecfdf5",
                    color: "#059669",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Coins size={16} />
                </div>
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#059669", marginBottom: "6px" }}>
                ${telemetry?.tokens.savingsUsd.toFixed(2) ?? "0.00"}{" "}
                <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#10b981" }}>USDT</span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                Setara <strong style={{ color: "#047857" }}>Rp {telemetry?.tokens.savingsIdr.toLocaleString("id-ID") ?? "0"}</strong> vs GPT-4o commercial
              </div>
            </div>

            {/* Card 3: Model Health SLA */}
            <div
              style={{
                backgroundColor: "#ffffff",
                padding: "1.25rem",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#64748b" }}>KESEHATAN MODEL AI</span>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "8px",
                    background: "#fdf4ff",
                    color: "#c026d3",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Activity size={16} />
                </div>
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>
                {onlineCount} / {totalCount}{" "}
                <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#16a34a" }}>Online</span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                Rata-rata SLA Keberhasilan: <strong style={{ color: "#15803d" }}>{avgSla}%</strong> tanpa downtime
              </div>
            </div>

            {/* Card 4: Audit Verifications */}
            <div
              style={{
                backgroundColor: "#ffffff",
                padding: "1.25rem",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#64748b" }}>TOTAL VERIFIKASI KLIP</span>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "8px",
                    background: "#fef3c7",
                    color: "#d97706",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FileCheck2 size={16} />
                </div>
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>
                {telemetry?.verdicts.totalAudits ?? 0}{" "}
                <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#64748b" }}>Klip</span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                Lolos: <strong style={{ color: "#16a34a" }}>{telemetry?.verdicts.pass ?? 0}</strong> | Review:{" "}
                <strong style={{ color: "#d97706" }}>{telemetry?.verdicts.review ?? 0}</strong> | Pelanggaran:{" "}
                <strong style={{ color: "#dc2626" }}>{telemetry?.verdicts.fail ?? 0}</strong>
              </div>
            </div>
          </div>

          {/* Section 2: Interactive Cascading Pipeline Flow */}
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "1.5rem",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              marginBottom: "2rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#0f172a", margin: "0 0 4px 0" }}>
                  Cascading AI Failover Architecture
                </h2>
                <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: 0 }}>
                  Alur orkestrasi otomatis bila terjadi gangguan, timeout (&gt;75s), atau rate limit (HTTP 429). Toleransi antrean NVIDIA NIM free-tier hingga 75 detik.
                </p>
              </div>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#0284c7", background: "#f0f9ff", padding: "4px 10px", borderRadius: "6px" }}>
                Timeout Cutoff: 75.000 ms (Toleransi Free-Tier GPU Queue)
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "12px",
                position: "relative",
              }}
            >
              {/* Tier 1 */}
              <div
                onClick={() => tier1Model && handlePingModel(tier1Model.modelId)}
                title="Klik untuk ping latency waktu nyata"
                style={{
                  padding: "14px",
                  borderRadius: "10px",
                  background: tier1Model?.status === "HEALTHY" ? "linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)" : "#fff5f5",
                  border: tier1Model?.status === "HEALTHY" ? "1.5px solid #22c55e" : "1.5px solid #ef4444",
                  position: "relative",
                  cursor: "pointer",
                  transition: "transform 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.6875rem", fontWeight: 800, color: tier1Model?.status === "HEALTHY" ? "#166534" : "#991b1b", letterSpacing: "0.05em" }}>
                    TIER 1 (UTAMA)
                  </span>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: tier1Model?.status === "HEALTHY" ? "#22c55e" : "#ef4444",
                      boxShadow: tier1Model?.status === "HEALTHY" ? "0 0 6px rgba(34, 197, 94, 0.6)" : "none",
                    }}
                  />
                </div>
                <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                  {tier1Model?.name || "Nemotron 3.5 Lightning"}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "8px" }}>
                  {tier1Model?.provider || "NVIDIA NIM 30B MoE"}
                </div>
                <div style={{ display: "inline-block", fontSize: "0.6875rem", fontWeight: 700, color: "#15803d", background: "#dcfce7", padding: "2px 6px", borderRadius: "4px" }}>
                  {pingingModelId === tier1Model?.modelId ? "Menguji..." : `~${tier1Model?.latencyMs ?? 460} ms (H100)`}
                </div>
              </div>

              {/* Tier 2 */}
              <div
                onClick={() => tier2Model && handlePingModel(tier2Model.modelId)}
                title="Klik untuk ping latency waktu nyata"
                style={{
                  padding: "14px",
                  borderRadius: "10px",
                  background: tier2Model?.status === "HEALTHY" ? "#ffffff" : "#fff5f5",
                  border: tier2Model?.status === "HEALTHY" ? "1px solid #cbd5e1" : "1.5px solid #ef4444",
                  cursor: "pointer",
                  transition: "transform 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#475569", letterSpacing: "0.05em" }}>
                    TIER 2 (FALLBACK 1)
                  </span>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: tier2Model?.status === "HEALTHY" ? "#3b82f6" : "#ef4444",
                    }}
                  />
                </div>
                <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                  {tier2Model?.name || "Meta Muse Glimmer 30B"}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "8px" }}>
                  {tier2Model?.role || "Strict Compliance"}
                </div>
                <div style={{ display: "inline-block", fontSize: "0.6875rem", fontWeight: 700, color: "#1d4ed8", background: "#eff6ff", padding: "2px 6px", borderRadius: "4px" }}>
                  {pingingModelId === tier2Model?.modelId ? "Menguji..." : `~${tier2Model?.latencyMs ?? 580} ms`}
                </div>
              </div>

              {/* Tier 3 */}
              <div
                onClick={() => tier3Model && handlePingModel(tier3Model.modelId)}
                title="Klik untuk ping latency waktu nyata"
                style={{
                  padding: "14px",
                  borderRadius: "10px",
                  background: tier3Model?.status === "HEALTHY" ? "#ffffff" : "#fff5f5",
                  border: tier3Model?.status === "HEALTHY" ? "1px solid #cbd5e1" : "1.5px solid #ef4444",
                  cursor: "pointer",
                  transition: "transform 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#475569", letterSpacing: "0.05em" }}>
                    TIER 3 (FALLBACK 2)
                  </span>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: tier3Model?.status === "HEALTHY" ? "#a855f7" : "#ef4444",
                    }}
                  />
                </div>
                <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                  {tier3Model?.name || "Gemini 1.5 Flash"}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "8px" }}>
                  {tier3Model?.provider || "Google Cloud AI"}
                </div>
                <div style={{ display: "inline-block", fontSize: "0.6875rem", fontWeight: 700, color: "#7e22ce", background: "#faf5ff", padding: "2px 6px", borderRadius: "4px" }}>
                  {pingingModelId === tier3Model?.modelId ? "Menguji..." : `~${tier3Model?.latencyMs ?? 720} ms`}
                </div>
              </div>

              {/* Tier 4 */}
              <div
                onClick={() => tier4Model && handlePingModel(tier4Model.modelId)}
                title="Klik untuk ping latency waktu nyata"
                style={{
                  padding: "14px",
                  borderRadius: "10px",
                  background: tier4Model?.status === "HEALTHY" ? "#ffffff" : "#fff5f5",
                  border: tier4Model?.status === "HEALTHY" ? "1px solid #cbd5e1" : "1.5px solid #ef4444",
                  cursor: "pointer",
                  transition: "transform 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#475569", letterSpacing: "0.05em" }}>
                    TIER 4 (FALLBACK 3)
                  </span>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: tier4Model?.status === "HEALTHY" ? "#f59e0b" : "#ef4444",
                    }}
                  />
                </div>
                <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                  {tier4Model?.name || "Groq GPT-OSS 120B"}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "8px" }}>
                  {tier4Model?.provider || "Groq LPU Ultra-fast"}
                </div>
                <div style={{ display: "inline-block", fontSize: "0.6875rem", fontWeight: 700, color: "#b45309", background: "#fffbeb", padding: "2px 6px", borderRadius: "4px" }}>
                  {pingingModelId === tier4Model?.modelId ? "Menguji..." : `~${tier4Model?.latencyMs ?? 195} ms`}
                </div>
              </div>

              {/* Tier 5 */}
              <div
                onClick={() => tier5Model && handlePingModel(tier5Model.modelId)}
                title="Klik untuk ping latency waktu nyata"
                style={{
                  padding: "14px",
                  borderRadius: "10px",
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  cursor: "pointer",
                  transition: "transform 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#475569", letterSpacing: "0.05em" }}>
                    TIER 5 (LOCAL)
                  </span>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#64748b" }} />
                </div>
                <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                  {tier5Model?.name || "Heuristic Rule Engine"}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "8px" }}>
                  {tier5Model?.role || "Local Deterministic"}
                </div>
                <div style={{ display: "inline-block", fontSize: "0.6875rem", fontWeight: 700, color: "#334155", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>
                  {pingingModelId === tier5Model?.modelId ? "Menguji..." : `<${tier5Model?.latencyMs ?? 1} ms Offline`}
                </div>
              </div>
            </div>

            {/* Sidecars */}
            <div
              style={{
                marginTop: "14px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                paddingTop: "14px",
                borderTop: "1px dashed #e2e8f0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#f8fafc", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <Eye size={16} style={{ color: "#0284c7" }} />
                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a" }}>Multimodal Vision Module:</span>{" "}
                  <span style={{ fontSize: "0.75rem", color: "#475569" }}>{visionModel?.modelId || "meta/llama-3.2-11b-vision-instruct"} ({visionModel?.latencyMs ?? 1150} ms)</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#f8fafc", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <Radio size={16} style={{ color: "#059669" }} />
                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a" }}>Audio Pipeline Module:</span>{" "}
                  <span style={{ fontSize: "0.75rem", color: "#475569" }}>{audioModel?.name || "Whisper Large v3"} ({audioModel?.latencyMs ?? 380} ms)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Model Health & Live Ping */}
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "1.5rem",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              marginBottom: "2rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#0f172a", margin: "0 0 4px 0" }}>
                  Kesehatan Model &amp; Uji Latensi Live
                </h2>
                <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: 0 }}>
                  Klik tombol &quot;Ping Sekarang&quot; untuk menguji respon waktu nyata langsung ke server GPU NVIDIA / Google / Groq.
                </p>
              </div>

              {pingResult && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    background: pingResult.status === "ONLINE" ? "#dcfce7" : "#fee2e2",
                    color: pingResult.status === "ONLINE" ? "#166534" : "#991b1b",
                    border: `1px solid ${pingResult.status === "ONLINE" ? "#bbf7d0" : "#fecaca"}`,
                  }}
                >
                  {pingResult.status === "ONLINE" ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                  <span>
                    Ping {pingResult.modelId.split("/")[1] || pingResult.modelId}: {pingResult.status} ({pingResult.latencyMs} ms)
                  </span>
                </div>
              )}
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
                    <th style={{ padding: "10px 14px", fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>MODEL &amp; PROVIDER</th>
                    <th style={{ padding: "10px 14px", fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>PERAN &amp; TIER</th>
                    <th style={{ padding: "10px 14px", fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>STATUS</th>
                    <th style={{ padding: "10px 14px", fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>LATENSI</th>
                    <th style={{ padding: "10px 14px", fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>SLA SUCCESS</th>
                    <th style={{ padding: "10px 14px", fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>TOTAL PANGGILAN</th>
                    <th style={{ padding: "10px 14px", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textAlign: "right" }}>AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {(telemetry?.modelsHealth || []).map((m, idx) => (
                    <tr
                      key={m.modelId}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        backgroundColor: idx % 2 === 0 ? "#ffffff" : "#fafafa",
                      }}
                    >
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#0f172a" }}>{m.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b", fontFamily: "monospace" }}>{m.provider}</div>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontSize: "0.8125rem", color: "#334155", fontWeight: 600 }}>{m.role}</div>
                        <div style={{ fontSize: "0.6875rem", color: "#64748b" }}>Tier {m.tier}</div>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "3px 8px",
                            borderRadius: "12px",
                            fontSize: "0.6875rem",
                            fontWeight: 700,
                            background: m.status === "HEALTHY" ? "#dcfce7" : "#fee2e2",
                            color: m.status === "HEALTHY" ? "#15803d" : "#b91c1c",
                          }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.status === "HEALTHY" ? "#16a34a" : "#dc2626" }} />
                          {m.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: "0.8125rem", fontWeight: 600, color: "#0f172a" }}>
                        {m.latencyMs} ms
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: "0.8125rem", fontWeight: 600, color: "#16a34a" }}>
                        {m.successRate}%
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: "0.8125rem", color: "#334155" }}>
                        {m.totalCalls} panggilan
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "right" }}>
                        <button
                          onClick={() => handlePingModel(m.modelId)}
                          disabled={pingingModelId === m.modelId}
                          style={{
                            padding: "5px 12px",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: "#0284c7",
                            background: "#f0f9ff",
                            border: "1px solid #bae6fd",
                            cursor: pingingModelId === m.modelId ? "wait" : "pointer",
                          }}
                        >
                          {pingingModelId === m.modelId ? "Menguji..." : "Ping Sekarang"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Live Telemetry Audit Stream & Full AI Usage Logs */}
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "1.5rem",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              marginBottom: "2rem",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                    Log Operasional &amp; Rincian Penggunaan AI
                  </h2>
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "12px",
                      backgroundColor: "#e0f2fe",
                      color: "#0369a1",
                    }}
                  >
                    {totalLogsCount} Log Ditemukan
                  </span>
                </div>
                <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: "4px 0 0 0" }}>
                  Transparansi audit lengkap: transkripsi Whisper, deteksi watermark visual, audit brand safety, embedding vektor semantik, dan deteksi anomali views.
                </p>
              </div>

              {/* Search & Verdict Filter */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <div style={{ position: "relative" }}>
                  <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input
                    type="text"
                    placeholder="Cari klip, model, task, teks..."
                    value={searchLog}
                    onChange={(e) => {
                      setSearchLog(e.target.value);
                      setCurrentPage(1);
                    }}
                    style={{
                      padding: "6px 12px 6px 30px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.8125rem",
                      outline: "none",
                      width: "230px",
                    }}
                  />
                </div>

                <div style={{ display: "flex", background: "#f1f5f9", borderRadius: "6px", padding: "2px" }}>
                  {(["ALL", "PASS", "REVIEW", "FAIL"] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => {
                        setSelectedVerdictFilter(v);
                        setCurrentPage(1);
                      }}
                      style={{
                        padding: "5px 10px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        border: "none",
                        borderRadius: "4px",
                        background: selectedVerdictFilter === v ? "#ffffff" : "transparent",
                        color: selectedVerdictFilter === v ? "#0f172a" : "#64748b",
                        boxShadow: selectedVerdictFilter === v ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                        cursor: "pointer",
                      }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Task Breakdown Cards — Interactive Quick Filters */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "10px",
                marginBottom: "1.25rem",
              }}
            >
              {Object.keys(AI_TASK_MAP).map((taskKey) => {
                const meta = AI_TASK_MAP[taskKey];
                const matchingLogs = (telemetry?.recentLogs || []).filter((l) => l.task === taskKey);
                const count = matchingLogs.length;
                const totalTokens = matchingLogs.reduce((acc, l) => acc + (l.totalTokens || 0), 0);
                const avgLatency = count > 0 ? Math.round(matchingLogs.reduce((acc, l) => acc + (l.durationMs || 0), 0) / count) : 0;
                const isSelected = selectedTaskFilter === taskKey;

                return (
                  <div
                    key={taskKey}
                    onClick={() => {
                      setSelectedTaskFilter(isSelected ? "ALL" : taskKey);
                      setCurrentPage(1);
                    }}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "8px",
                      backgroundColor: isSelected ? meta.bg : "#f8fafc",
                      border: isSelected ? `2px solid ${meta.border}` : "1px solid #e2e8f0",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      position: "relative",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: meta.text, textTransform: "uppercase" }}>
                        {meta.shortName}
                      </span>
                      <span
                        style={{
                          fontSize: "0.6875rem",
                          fontWeight: 700,
                          padding: "1px 6px",
                          borderRadius: "10px",
                          backgroundColor: "#ffffff",
                          color: meta.text,
                          border: `1px solid ${meta.border}`,
                        }}
                      >
                        {count} call
                      </span>
                    </div>
                    <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#0f172a" }}>
                      {totalTokens.toLocaleString("id-ID")}{" "}
                      <span style={{ fontSize: "0.6875rem", fontWeight: 500, color: "#64748b" }}>tok</span>
                    </div>
                    <div style={{ fontSize: "0.6875rem", color: "#64748b", marginTop: "2px" }}>
                      Rata-rata: {avgLatency} ms
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Task Filter Chips */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "1rem", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", marginRight: "4px" }}>
                Filter Penggunaan:
              </span>
              <button
                onClick={() => {
                  setSelectedTaskFilter("ALL");
                  setCurrentPage(1);
                }}
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  border: selectedTaskFilter === "ALL" ? "1px solid #0f172a" : "1px solid #e2e8f0",
                  backgroundColor: selectedTaskFilter === "ALL" ? "#0f172a" : "#ffffff",
                  color: selectedTaskFilter === "ALL" ? "#ffffff" : "#475569",
                  cursor: "pointer",
                }}
              >
                Semua ({telemetry?.recentLogs?.length || 0})
              </button>
              {Object.keys(AI_TASK_MAP).map((taskKey) => {
                const meta = AI_TASK_MAP[taskKey];
                const count = (telemetry?.recentLogs || []).filter((l) => l.task === taskKey).length;
                const isSelected = selectedTaskFilter === taskKey;
                return (
                  <button
                    key={taskKey}
                    onClick={() => {
                      setSelectedTaskFilter(taskKey);
                      setCurrentPage(1);
                    }}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      border: isSelected ? `1px solid ${meta.border}` : "1px solid #e2e8f0",
                      backgroundColor: isSelected ? meta.bg : "#ffffff",
                      color: isSelected ? meta.text : "#475569",
                      cursor: "pointer",
                    }}
                  >
                    {meta.shortName} ({count})
                  </button>
                );
              })}
            </div>

            {/* Logs Table */}
            <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
                    <th style={{ padding: "10px 14px", fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>WAKTU &amp; ID</th>
                    <th style={{ padding: "10px 14px", fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>PENGGUNAAN / TUGAS AI</th>
                    <th style={{ padding: "10px 14px", fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>TARGET KLIP</th>
                    <th style={{ padding: "10px 14px", fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>MODEL &amp; PROVIDER</th>
                    <th style={{ padding: "10px 14px", fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>TOKEN</th>
                    <th style={{ padding: "10px 14px", fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>LATENSI</th>
                    <th style={{ padding: "10px 14px", fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>HASIL AUDIT</th>
                    <th style={{ padding: "10px 14px", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textAlign: "right" }}>AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: "2.5rem", textAlign: "center", color: "#64748b", fontSize: "0.875rem" }}>
                        Tidak ada log telemetri AI yang cocok dengan filter yang dipilih.
                      </td>
                    </tr>
                  ) : (
                    paginatedLogs.map((log, idx) => {
                      const taskMeta = AI_TASK_MAP[log.task] || {
                        name: log.task,
                        shortName: log.task,
                        desc: "Modul AI",
                        bg: "#f1f5f9",
                        text: "#475569",
                        border: "#cbd5e1",
                      };

                      return (
                        <tr
                          key={log.id || idx}
                          style={{
                            borderBottom: "1px solid #f1f5f9",
                            backgroundColor: idx % 2 === 0 ? "#ffffff" : "#fafafa",
                          }}
                        >
                          {/* Time & Clip ID */}
                          <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#0f172a" }}>
                              {new Date(log.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                            </div>
                            <div style={{ fontSize: "0.6875rem", color: "#94a3b8", fontFamily: "monospace" }}>
                              {log.clipId || log.id.slice(0, 8)}
                            </div>
                          </td>

                          {/* Task Badge & Meaning */}
                          <td style={{ padding: "10px 14px" }}>
                            <span
                              style={{
                                display: "inline-block",
                                fontSize: "0.6875rem",
                                fontWeight: 700,
                                padding: "2px 8px",
                                borderRadius: "6px",
                                backgroundColor: taskMeta.bg,
                                color: taskMeta.text,
                                border: `1px solid ${taskMeta.border}`,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {taskMeta.shortName}
                            </span>
                            <div style={{ fontSize: "0.6875rem", color: "#64748b", marginTop: "2px", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {taskMeta.name}
                            </div>
                          </td>

                          {/* Clip Title */}
                          <td style={{ padding: "10px 14px" }}>
                            <div
                              style={{
                                fontSize: "0.8125rem",
                                fontWeight: 600,
                                color: "#0f172a",
                                maxWidth: "220px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                              title={log.clipTitle}
                            >
                              {log.clipTitle || "Klip Evaluasi"}
                            </div>
                            {log.promptSnippet && (
                              <div
                                style={{
                                  fontSize: "0.6875rem",
                                  color: "#64748b",
                                  maxWidth: "220px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  fontFamily: "monospace",
                                }}
                              >
                                {log.promptSnippet.slice(0, 45)}...
                              </div>
                            )}
                          </td>

                          {/* Model & Provider */}
                          <td style={{ padding: "10px 14px" }}>
                            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#0284c7" }}>
                              {log.model.split("/")[1] || log.model}
                            </div>
                            <div style={{ fontSize: "0.6875rem", color: "#64748b" }}>{log.provider}</div>
                          </td>

                          {/* Tokens */}
                          <td style={{ padding: "10px 14px" }}>
                            <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0f172a" }}>
                              {log.totalTokens.toLocaleString("id-ID")}{" "}
                              <span style={{ fontSize: "0.6875rem", fontWeight: 500, color: "#64748b" }}>tok</span>
                            </div>
                            <div style={{ fontSize: "0.6875rem", color: "#94a3b8" }}>
                              {log.promptTokens} in / {log.completionTokens} out
                            </div>
                          </td>

                          {/* Latency */}
                          <td style={{ padding: "10px 14px" }}>
                            <span
                              style={{
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                color: log.durationMs < 400 ? "#16a34a" : log.durationMs < 900 ? "#d97706" : "#dc2626",
                              }}
                            >
                              {log.durationMs} ms
                            </span>
                          </td>

                          {/* Verdict */}
                          <td style={{ padding: "10px 14px" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "3px 8px",
                                borderRadius: "12px",
                                fontSize: "0.6875rem",
                                fontWeight: 700,
                                background:
                                  log.verdict === "PASS"
                                    ? "#dcfce7"
                                    : log.verdict === "REVIEW"
                                    ? "#fef3c7"
                                    : "#fee2e2",
                                color:
                                  log.verdict === "PASS"
                                    ? "#166534"
                                    : log.verdict === "REVIEW"
                                    ? "#92400e"
                                    : "#991b1b",
                              }}
                            >
                              {log.verdict === "PASS" ? (
                                <CheckCircle2 size={12} />
                              ) : log.verdict === "REVIEW" ? (
                                <AlertTriangle size={12} />
                              ) : (
                                <XCircle size={12} />
                              )}
                              {log.verdict || "SUCCESS"}
                              {log.score !== undefined && ` (${Math.round(log.score * 100)}%)`}
                            </span>
                          </td>

                          {/* Actions */}
                          <td style={{ padding: "10px 14px", textAlign: "right" }}>
                            <button
                              onClick={() => setSelectedLog(log)}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "5px 10px",
                                fontSize: "0.6875rem",
                                fontWeight: 600,
                                color: "#0284c7",
                                background: "#f0f9ff",
                                border: "1px solid #bae6fd",
                                borderRadius: "6px",
                                cursor: "pointer",
                                transition: "background 0.15s ease",
                              }}
                            >
                              <FileText size={12} />
                              <span>Lihat Detail Log</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "1rem",
                flexWrap: "wrap",
                gap: "12px",
                fontSize: "0.8125rem",
                color: "#64748b",
              }}
            >
              <div>
                Menampilkan{" "}
                <strong style={{ color: "#0f172a" }}>
                  {totalLogsCount === 0 ? 0 : (safeCurrentPage - 1) * effectivePageSize + 1}
                </strong>{" "}
                –{" "}
                <strong style={{ color: "#0f172a" }}>
                  {Math.min(safeCurrentPage * effectivePageSize, totalLogsCount)}
                </strong>{" "}
                dari <strong style={{ color: "#0f172a" }}>{totalLogsCount}</strong> log evaluasi
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ fontSize: "0.75rem" }}>Baris per halaman:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.75rem",
                      outline: "none",
                      backgroundColor: "#ffffff",
                      cursor: "pointer",
                    }}
                  >
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={9999}>Semua</option>
                  </select>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <button
                    disabled={safeCurrentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "5px 8px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      backgroundColor: safeCurrentPage <= 1 ? "#f1f5f9" : "#ffffff",
                      color: safeCurrentPage <= 1 ? "#94a3b8" : "#0f172a",
                      cursor: safeCurrentPage <= 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span style={{ fontSize: "0.75rem", padding: "0 4px" }}>
                    Hal {safeCurrentPage} dari {totalPages}
                  </span>
                  <button
                    disabled={safeCurrentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "5px 8px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      backgroundColor: safeCurrentPage >= totalPages ? "#f1f5f9" : "#ffffff",
                      color: safeCurrentPage >= totalPages ? "#94a3b8" : "#0f172a",
                      cursor: safeCurrentPage >= totalPages ? "not-allowed" : "pointer",
                    }}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Detail Lengkap Log Penggunaan AI */}
          {selectedLog && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(15, 23, 42, 0.65)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
                padding: "1rem",
              }}
            >
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "14px",
                  padding: "1.75rem",
                  maxWidth: "46rem",
                  width: "100%",
                  maxHeight: "92vh",
                  overflowY: "auto",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                }}
              >
                {/* Modal Header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.25rem", paddingBottom: "1rem", borderBottom: "1px solid #e2e8f0" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span
                        style={{
                          fontSize: "0.6875rem",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "6px",
                          backgroundColor: (AI_TASK_MAP[selectedLog.task]?.bg) || "#f1f5f9",
                          color: (AI_TASK_MAP[selectedLog.task]?.text) || "#475569",
                          border: `1px solid ${(AI_TASK_MAP[selectedLog.task]?.border) || "#cbd5e1"}`,
                        }}
                      >
                        {AI_TASK_MAP[selectedLog.task]?.shortName || selectedLog.task}
                      </span>
                      <span
                        style={{
                          fontSize: "0.6875rem",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "10px",
                          backgroundColor:
                            selectedLog.verdict === "PASS"
                              ? "#dcfce7"
                              : selectedLog.verdict === "REVIEW"
                              ? "#fef3c7"
                              : "#fee2e2",
                          color:
                            selectedLog.verdict === "PASS"
                              ? "#166534"
                              : selectedLog.verdict === "REVIEW"
                              ? "#92400e"
                              : "#991b1b",
                        }}
                      >
                        {selectedLog.verdict || "SUCCESS"}
                      </span>
                    </div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "#0f172a" }}>
                      {AI_TASK_MAP[selectedLog.task]?.name || "Detail Eksekusi Modul AI"}
                    </h3>
                    <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>
                      Log ID: <span style={{ fontFamily: "monospace" }}>{selectedLog.id}</span> • Waktu: {new Date(selectedLog.timestamp).toLocaleString("id-ID")}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedLog(null)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#94a3b8",
                      cursor: "pointer",
                      padding: "4px",
                      borderRadius: "6px",
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Explanation Card */}
                <div
                  style={{
                    backgroundColor: (AI_TASK_MAP[selectedLog.task]?.bg) || "#f8fafc",
                    border: `1px solid ${(AI_TASK_MAP[selectedLog.task]?.border) || "#e2e8f0"}`,
                    borderRadius: "8px",
                    padding: "10px 14px",
                    marginBottom: "1.25rem",
                    fontSize: "0.8125rem",
                    color: (AI_TASK_MAP[selectedLog.task]?.text) || "#334155",
                    lineHeight: 1.5,
                  }}
                >
                  <strong>Fungsi AI dalam Pipeline:</strong> {AI_TASK_MAP[selectedLog.task]?.desc || "Modul komputasi cerdas dalam pipeline verifikasi konten."}
                </div>

                {/* Overview Metadata Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "10px",
                    marginBottom: "1.25rem",
                  }}
                >
                  <div style={{ backgroundColor: "#f8fafc", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#64748b" }}>TARGET VIDEO / KLIP</div>
                    <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>
                      {selectedLog.clipTitle || "Klip Tanpa Judul"}
                    </div>
                    <div style={{ fontSize: "0.6875rem", color: "#94a3b8", fontFamily: "monospace" }}>
                      ID: {selectedLog.clipId || "clip-n/a"}
                    </div>
                  </div>

                  <div style={{ backgroundColor: "#f8fafc", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#64748b" }}>MODEL &amp; PROVIDER</div>
                    <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0284c7", marginTop: "2px" }}>
                      {selectedLog.model}
                    </div>
                    <div style={{ fontSize: "0.6875rem", color: "#64748b" }}>{selectedLog.provider}</div>
                  </div>

                  <div style={{ backgroundColor: "#f8fafc", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#64748b" }}>KONSUMSI TOKEN</div>
                    <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>
                      {selectedLog.totalTokens} Token
                    </div>
                    <div style={{ fontSize: "0.6875rem", color: "#64748b" }}>
                      {selectedLog.promptTokens} prompt + {selectedLog.completionTokens} completion
                    </div>
                  </div>

                  <div style={{ backgroundColor: "#f8fafc", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#64748b" }}>DURASI &amp; SKOR</div>
                    <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>
                      {selectedLog.durationMs} ms
                    </div>
                    <div style={{ fontSize: "0.6875rem", color: "#64748b" }}>
                      Skor Kepatuhan: {selectedLog.score !== undefined ? `${Math.round(selectedLog.score * 100)}%` : "N/A"}
                    </div>
                  </div>
                </div>

                {/* Prompt Snippet & Input Context */}
                <div style={{ marginBottom: "1.25rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a" }}>
                      PROMPT &amp; KONTEKS INPUT YANG DITERIMA MODEL:
                    </span>
                    <button
                      onClick={() => handleCopyText(selectedLog.promptSnippet || "", "prompt")}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "3px 8px",
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                        backgroundColor: "#f1f5f9",
                        border: "1px solid #cbd5e1",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      <Copy size={11} />
                      <span>{copiedSnippet === "prompt" ? "Tersalin!" : "Salin Prompt"}</span>
                    </button>
                  </div>
                  <pre
                    style={{
                      backgroundColor: "#0f172a",
                      color: "#f8fafc",
                      padding: "12px",
                      borderRadius: "8px",
                      fontSize: "0.75rem",
                      fontFamily: "monospace",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      maxHeight: "140px",
                      overflowY: "auto",
                      margin: 0,
                    }}
                  >
                    {selectedLog.promptSnippet || "Tidak ada rekaman teks prompt mentah untuk panggilan ini."}
                  </pre>
                </div>

                {/* Response Snippet & Model Output */}
                <div style={{ marginBottom: "1.25rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a" }}>
                      RESPONS &amp; OUTPUT HASIL INFERENSI MODEL:
                    </span>
                    <button
                      onClick={() => handleCopyText(selectedLog.responseSnippet || "", "response")}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "3px 8px",
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                        backgroundColor: "#f1f5f9",
                        border: "1px solid #cbd5e1",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      <Copy size={11} />
                      <span>{copiedSnippet === "response" ? "Tersalin!" : "Salin Respons"}</span>
                    </button>
                  </div>
                  <pre
                    style={{
                      backgroundColor: "#1e293b",
                      color: "#38bdf8",
                      padding: "12px",
                      borderRadius: "8px",
                      fontSize: "0.75rem",
                      fontFamily: "monospace",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      maxHeight: "140px",
                      overflowY: "auto",
                      margin: 0,
                    }}
                  >
                    {selectedLog.responseSnippet || "Tidak ada rekaman output mentah yang tersimpan."}
                  </pre>
                </div>

                {/* Reasoning Box */}
                <div style={{ marginBottom: "1.25rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a", display: "block", marginBottom: "6px" }}>
                    PENALARAN &amp; JUSTIFIKASI EVALUATOR (REASONING):
                  </span>
                  <div
                    style={{
                      fontSize: "0.8125rem",
                      color: "#334155",
                      backgroundColor: "#f8fafc",
                      padding: "12px",
                      borderRadius: "8px",
                      lineHeight: "1.55",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    {selectedLog.reasoning || "Tidak ada catatan penalaran tambahan."}
                  </div>
                </div>

                {/* Full Raw JSON Payload Accordion */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>
                      RAW TELEMETRY RECORD (JSON):
                    </span>
                    <button
                      onClick={() => handleCopyText(JSON.stringify(selectedLog, null, 2), "json")}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "3px 8px",
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                        backgroundColor: "#f1f5f9",
                        border: "1px solid #cbd5e1",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      <Copy size={11} />
                      <span>{copiedSnippet === "json" ? "Tersalin!" : "Salin Raw JSON"}</span>
                    </button>
                  </div>
                  <pre
                    style={{
                      backgroundColor: "#f1f5f9",
                      color: "#334155",
                      padding: "10px",
                      borderRadius: "6px",
                      fontSize: "0.6875rem",
                      fontFamily: "monospace",
                      whiteSpace: "pre-wrap",
                      maxHeight: "110px",
                      overflowY: "auto",
                      margin: 0,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    {JSON.stringify(selectedLog, null, 2)}
                  </pre>
                </div>

                {/* Modal Footer Button */}
                <button
                  onClick={() => setSelectedLog(null)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    backgroundColor: "#0f172a",
                    color: "#ffffff",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Tutup Rincian Log
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGate>
  );
}
