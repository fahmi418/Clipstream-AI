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
} from "lucide-react";

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
      log.task.toLowerCase().includes(searchLog.toLowerCase());
    const matchesVerdict = selectedVerdictFilter === "ALL" || log.verdict === selectedVerdictFilter;
    return matchesSearch && matchesVerdict;
  });

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

          {/* Section 4: Live Telemetry Audit Stream */}
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "1.5rem",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#0f172a", margin: "0 0 4px 0" }}>
                  Log Eksekusi &amp; Riwayat Audit AI
                </h2>
                <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: 0 }}>
                  Daftar transaksi evaluasi klip terbaru dengan token terpakai, skor kepatuhan, dan penalaran AI.
                </p>
              </div>

              {/* Filters */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <div style={{ position: "relative" }}>
                  <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input
                    type="text"
                    placeholder="Cari judul klip atau model..."
                    value={searchLog}
                    onChange={(e) => setSearchLog(e.target.value)}
                    style={{
                      padding: "6px 12px 6px 30px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.8125rem",
                      outline: "none",
                      width: "220px",
                    }}
                  />
                </div>

                <div style={{ display: "flex", background: "#f1f5f9", borderRadius: "6px", padding: "2px" }}>
                  {(["ALL", "PASS", "REVIEW", "FAIL"] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setSelectedVerdictFilter(v)}
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

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
                    <th style={{ padding: "10px 14px", fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>WAKTU</th>
                    <th style={{ padding: "10px 14px", fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>JUDUL KLIP</th>
                    <th style={{ padding: "10px 14px", fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>MODEL TERPAKAI</th>
                    <th style={{ padding: "10px 14px", fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>TOKEN</th>
                    <th style={{ padding: "10px 14px", fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>DURASI</th>
                    <th style={{ padding: "10px 14px", fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>HASIL AUDIT</th>
                    <th style={{ padding: "10px 14px", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textAlign: "right" }}>DETAIL</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.slice(0, 30).map((log, idx) => (
                    <tr
                      key={log.id}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        backgroundColor: idx % 2 === 0 ? "#ffffff" : "#fafafa",
                      }}
                    >
                      <td style={{ padding: "10px 14px", fontSize: "0.75rem", color: "#64748b", whiteSpace: "nowrap" }}>
                        {new Date(log.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#0f172a", maxWidth: "260px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {log.clipTitle || "Klip Tanpa Judul"}
                        </div>
                        <div style={{ fontSize: "0.6875rem", color: "#64748b" }}>Tugas: {log.task}</div>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#0284c7" }}>
                          {log.model.split("/")[1] || log.model}
                        </div>
                        <div style={{ fontSize: "0.6875rem", color: "#64748b" }}>{log.provider}</div>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0f172a" }}>{log.totalTokens}</span>{" "}
                        <span style={{ fontSize: "0.6875rem", color: "#64748b" }}>tok</span>
                      </td>
                      <td style={{ padding: "10px 14px", fontSize: "0.75rem", color: "#475569" }}>
                        {log.durationMs} ms
                      </td>
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
                          {log.verdict}
                        </span>
                      </td>
                      <td style={{ padding: "10px 14px", textAlign: "right" }}>
                        <button
                          onClick={() => setSelectedLog(log)}
                          style={{
                            padding: "4px 8px",
                            fontSize: "0.6875rem",
                            fontWeight: 600,
                            color: "#475569",
                            background: "#f1f5f9",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Lihat Alasan
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal Detail Alasan Evaluasi AI */}
          {selectedLog && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(15, 23, 42, 0.6)",
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
                  borderRadius: "12px",
                  padding: "1.5rem",
                  maxWidth: "32rem",
                  width: "100%",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0, color: "#0f172a" }}>
                    Detail Penalaran AI
                  </h3>
                  <button
                    onClick={() => setSelectedLog(null)}
                    style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}
                  >
                    Tutup
                  </button>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "4px" }}>JUDUL KLIP:</div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#0f172a" }}>{selectedLog.clipTitle}</div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "0.75rem" }}>
                  <div style={{ background: "#f8fafc", padding: "8px 12px", borderRadius: "6px" }}>
                    <div style={{ fontSize: "0.6875rem", color: "#64748b" }}>MODEL:</div>
                    <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#0f172a" }}>{selectedLog.model}</div>
                  </div>
                  <div style={{ background: "#f8fafc", padding: "8px 12px", borderRadius: "6px" }}>
                    <div style={{ fontSize: "0.6875rem", color: "#64748b" }}>STATUS / VERDICT:</div>
                    <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: selectedLog.verdict === "PASS" ? "#16a34a" : "#dc2626" }}>
                      {selectedLog.verdict} (Skor: {selectedLog.score ?? 0})
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "1rem" }}>
                  <div style={{ background: "#f8fafc", padding: "8px 12px", borderRadius: "6px" }}>
                    <div style={{ fontSize: "0.6875rem", color: "#64748b" }}>TOTAL TOKEN:</div>
                    <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0f172a" }}>
                      {selectedLog.totalTokens} ({selectedLog.promptTokens} in / {selectedLog.completionTokens} out)
                    </div>
                  </div>
                  <div style={{ background: "#f8fafc", padding: "8px 12px", borderRadius: "6px" }}>
                    <div style={{ fontSize: "0.6875rem", color: "#64748b" }}>DURASI INFERENSI:</div>
                    <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0284c7" }}>
                      {selectedLog.durationMs} ms
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: "1.25rem" }}>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "4px" }}>PENJELASAN EVALUATOR:</div>
                  <div style={{ fontSize: "0.8125rem", color: "#334155", background: "#f8fafc", padding: "12px", borderRadius: "8px", lineHeight: "1.5", border: "1px solid #e2e8f0" }}>
                    {selectedLog.reasoning || "Tidak ada rincian penalaran tambahan."}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedLog(null)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    backgroundColor: "#0284c7",
                    color: "#ffffff",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Selesai
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGate>
  );
}
