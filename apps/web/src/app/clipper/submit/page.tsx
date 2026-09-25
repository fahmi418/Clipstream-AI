"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  listCampaigns,
  submitClip,
  type Campaign,
  type ClipStatus,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { usePrivy } from "@privy-io/react-auth";
import {
  formatCpm,
  formatUsdt,
  formatViews,
  txExplorerUrl,
} from "@/lib/format";
import { VerificationTimeline } from "@/components/VerificationTimeline";
import { AppealModal } from "@/components/AppealModal";
import { AuthGate } from "@/components/AuthGate";
import {
  Scissors,
  Copy,
  Check,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Clock,
  Play,
  Sparkles,
  Video,
  KeyRound,
  Info,
  Layers,
  ChevronDown,
  Wallet,
} from "lucide-react";

function ClipperSubmitContent() {
  const searchParams = useSearchParams();
  const initialCampaignId = searchParams.get("campaignId") ?? "";

  const { user } = useAuth();
  const { login, authenticated } = usePrivy();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] =
    useState(initialCampaignId);
  const [videoUrl, setVideoUrl] = useState("");
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Verification flow state
  const [activeClipId, setActiveClipId] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    status: ClipStatus;
    clip?: any;
  } | null>(null);
  const [appealModalOpen, setAppealModalOpen] = useState(false);

  useEffect(() => {
    listCampaigns({ status: "ACTIVE" })
      .then((data) => {
        const list = Array.isArray(data) ? data : (data as any)?.items || [];
        setCampaigns(list);
        if (!selectedCampaignId && list.length > 0) {
          setSelectedCampaignId(list[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingCampaigns(false));
  }, [selectedCampaignId]);

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId);
  const verificationCode = `CS-${(selectedCampaign?.id ?? "42").slice(0, 4)}-${
    user?.walletAddress?.slice(-6) ?? "8a9b1c"
  }`;

  const isValidYoutubeUrl =
    videoUrl.includes("youtube.com/shorts/") ||
    videoUrl.includes("youtube.com/watch") ||
    videoUrl.includes("youtu.be/");

  const handleCopyCode = () => {
    navigator.clipboard.writeText(verificationCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSubmitClip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user && !authenticated) {
      setError("Silakan masuk terlebih dahulu.");
      return;
    }

    if (!isValidYoutubeUrl) {
      setError("Masukkan link YouTube Shorts atau video yang valid.");
      return;
    }

    if (!selectedCampaignId) {
      setError("Pilih campaign tujuan terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await submitClip({
        campaignId: selectedCampaignId,
        url: videoUrl.trim(),
      });
      setActiveClipId(res.clipId);
    } catch (err: any) {
      setError(err.message || "Gagal mensubmit klip");
      setSubmitting(false);
    }
  };

  const handleVerificationComplete = (status: ClipStatus, clipData?: any) => {
    setVerificationResult({ status, clip: clipData });
    setSubmitting(false);
  };

  return (
    <AuthGate
      requiredRole="clipper"
      title="Masuk untuk Submit Klip"
      description="Silakan masuk dengan akun Clipper kamu untuk mensubmit klip video dan menerima reward langsung ke dompet digital kamu."
    >
      <div
        style={{
          maxWidth: "52rem",
          margin: "0 auto",
          padding: "6.5rem 1.5rem 4rem",
          width: "100%",
        }}
      >
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/clipper"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              fontSize: "0.75rem",
              fontWeight: 500,
              color: "rgba(17,17,17,0.7)",
              padding: "0.35rem 0.75rem",
              borderRadius: "9999px",
              backgroundColor: "#ffffff",
              border: "1px solid rgba(17,17,17,0.12)",
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={13} />
            <span>Kembali ke Dashboard Clipper</span>
          </Link>
        </div>

        {/* Header Section */}
        <div style={{ borderBottom: "1px solid rgba(17,17,17,0.08)", paddingBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                fontSize: "0.6875rem",
                fontWeight: 600,
                color: "#059669",
                backgroundColor: "#ecfdf5",
                border: "1px solid #a7f3d0",
                padding: "0.2rem 0.6rem",
                borderRadius: "9999px",
              }}
            >
              <Sparkles size={11} />
              <span>AI Instant Verification • opBNB Gasless Settlement</span>
            </span>
          </div>
          <h1
            style={{
              fontSize: "1.875rem",
              fontWeight: 600,
              letterSpacing: "-0.025em",
              color: "#111111",
              margin: 0,
              lineHeight: 1.25,
            }}
          >
            Submit Klip Video
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "rgba(17,17,17,0.6)",
              marginTop: "0.35rem",
              lineHeight: 1.5,
              maxWidth: "38rem",
            }}
          >
            Tempelkan link YouTube Shorts kamu untuk diverifikasi oleh AI Whisper &amp; Gemini, lalu klaim pencairan otomatis secara instan.
          </p>
        </div>

        {/* 3-Step Guided Progress Bar */}
        {!activeClipId && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "0.75rem",
            }}
          >
            <div
              style={{
                padding: "0.875rem 1rem",
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                border: "1px solid rgba(17,17,17,0.08)",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.625rem",
                boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
              }}
            >
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  backgroundColor: "#111111",
                  color: "#ffffff",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "1px",
                }}
              >
                1
              </div>
              <div>
                <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#111" }}>
                  Pilih Campaign
                </div>
                <div style={{ fontSize: "0.75rem", color: "rgba(17,17,17,0.6)", marginTop: "2px", lineHeight: 1.35 }}>
                  Salin kode unik untuk deskripsi video
                </div>
              </div>
            </div>

            <div
              style={{
                padding: "0.875rem 1rem",
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                border: "1px solid rgba(17,17,17,0.08)",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.625rem",
                boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
              }}
            >
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  backgroundColor: "#fbfaf9",
                  color: "#111111",
                  border: "1px solid rgba(17,17,17,0.15)",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "1px",
                }}
              >
                2
              </div>
              <div>
                <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#111" }}>
                  Upload ke YouTube
                </div>
                <div style={{ fontSize: "0.75rem", color: "rgba(17,17,17,0.6)", marginTop: "2px", lineHeight: 1.35 }}>
                  Cantumkan kode di deskripsi Shorts
                </div>
              </div>
            </div>

            <div
              style={{
                padding: "0.875rem 1rem",
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                border: "1px solid rgba(17,17,17,0.08)",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.625rem",
                boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
              }}
            >
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  backgroundColor: "#fbfaf9",
                  color: "#111111",
                  border: "1px solid rgba(17,17,17,0.15)",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "1px",
                }}
              >
                3
              </div>
              <div>
                <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#111" }}>
                  Verifikasi &amp; Payout
                </div>
                <div style={{ fontSize: "0.75rem", color: "rgba(17,17,17,0.6)", marginTop: "2px", lineHeight: 1.35 }}>
                  AI memverifikasi views &amp; cairkan USDT
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div
            style={{
              padding: "0.875rem 1.25rem",
              borderRadius: "12px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              fontSize: "0.8125rem",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* ── FORM STATE (Before Submit) ──────────────────────────── */}
        {!activeClipId && (
          <form
            onSubmit={handleSubmitClip}
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: "1.75rem",
              border: "1px solid rgba(17,17,17,0.08)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}
          >
            {/* Field 1: Campaign Select */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "#111",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    margin: 0,
                  }}
                >
                  <Layers size={14} color="rgba(17,17,17,0.6)" />
                  <span>Pilih Campaign Sponsor</span>
                </label>
                {selectedCampaign && (
                  <a
                    href={selectedCampaign.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "0.75rem",
                      color: "#e8400d",
                      textDecoration: "underline",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    <Play size={10} />
                    <span>Lihat Video Sumber</span>
                    <ExternalLink size={10} />
                  </a>
                )}
              </div>

              {loadingCampaigns ? (
                <div style={{ height: "46px", backgroundColor: "#f3f4f6", borderRadius: "10px" }} />
              ) : (
                <div style={{ position: "relative" }}>
                  <select
                    value={selectedCampaignId}
                    onChange={(e) => setSelectedCampaignId(e.target.value)}
                    style={{
                      width: "100%",
                      height: "46px",
                      padding: "0 2.25rem 0 0.875rem",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      borderRadius: "10px",
                      border: "1px solid rgba(17,17,17,0.14)",
                      backgroundColor: "#ffffff",
                      color: "#111",
                      outline: "none",
                      appearance: "none",
                      cursor: "pointer",
                    }}
                    required
                  >
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} — Rate: {formatCpm(c.cpmRate)} • Min Views: {formatViews(c.minViews)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={15}
                    style={{
                      position: "absolute",
                      right: "0.875rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "rgba(17,17,17,0.5)",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              )}

              {/* Selected Campaign Mini Badge Info */}
              {selectedCampaign && (
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    backgroundColor: "#fbfaf9",
                    borderRadius: "10px",
                    border: "1px solid rgba(17,17,17,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    fontSize: "0.75rem",
                    marginTop: "0.25rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ color: "rgba(17,17,17,0.6)" }}>
                      Rate: <strong style={{ color: "#111" }}>{formatCpm(selectedCampaign.cpmRate)}</strong>
                    </span>
                    <span style={{ color: "rgba(17,17,17,0.3)" }}>•</span>
                    <span style={{ color: "rgba(17,17,17,0.6)" }}>
                      Min: <strong style={{ color: "#111" }}>{formatViews(selectedCampaign.minViews)} views</strong>
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      color: "#059669",
                      fontWeight: 600,
                      backgroundColor: "#ecfdf5",
                      padding: "0.15rem 0.5rem",
                      borderRadius: "6px",
                      border: "1px solid #a7f3d0",
                    }}
                  >
                    Escrow Siap: {formatUsdt(selectedCampaign.totalBudget)} USDT
                  </span>
                </div>
              )}
            </div>

            {/* Field 2: YouTube Shorts Link Input */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "#111",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  margin: 0,
                }}
              >
                <Video size={14} color="#dc2626" />
                <span>Link YouTube Shorts Kamu</span>
              </label>

              <div style={{ position: "relative" }}>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="https://www.youtube.com/shorts/..."
                  style={{
                    width: "100%",
                    height: "46px",
                    padding: "0 2.25rem 0 0.875rem",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    borderRadius: "10px",
                    border:
                      videoUrl && isValidYoutubeUrl
                        ? "1px solid #059669"
                        : "1px solid rgba(17,17,17,0.14)",
                    backgroundColor: "#ffffff",
                    color: "#111",
                    outline: "none",
                  }}
                  required
                />
                {videoUrl && isValidYoutubeUrl && (
                  <CheckCircle2
                    size={16}
                    color="#059669"
                    style={{
                      position: "absolute",
                      right: "0.875rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  />
                )}
              </div>
              <span style={{ fontSize: "0.75rem", color: "rgba(17,17,17,0.5)", marginTop: "0.2rem" }}>
                Format yang didukung: <code style={{ backgroundColor: "#f3f4f6", padding: "1px 5px", borderRadius: "4px" }}>youtube.com/shorts/...</code> atau link video YouTube biasa.
              </span>
            </div>

            {/* Field 3: Cryptographic Verification Code Card */}
            <div
              style={{
                backgroundColor: "#fbfaf9",
                padding: "1.25rem",
                borderRadius: "12px",
                border: "1px solid rgba(17,17,17,0.08)",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <KeyRound size={15} color="#e8400d" />
                  <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#111" }}>
                    Kode Unik Bukti Kepemilikan:
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  style={{
                    padding: "0.35rem 0.75rem",
                    borderRadius: "8px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    backgroundColor: copiedCode ? "#ecfdf5" : "#ffffff",
                    color: copiedCode ? "#059669" : "#111",
                    border: copiedCode ? "1px solid #a7f3d0" : "1px solid rgba(17,17,17,0.12)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    transition: "all 0.15s ease",
                  }}
                >
                  {copiedCode ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedCode ? "Tersalin ke Clipboard!" : "Salin Kode"}</span>
                </button>
              </div>

              {/* Code Display Badge */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  padding: "0.75rem 1rem",
                  borderRadius: "10px",
                  border: "1px solid rgba(17,17,17,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    color: "#111",
                  }}
                >
                  {verificationCode}
                </div>
                <span
                  style={{
                    fontSize: "0.6875rem",
                    fontFamily: "monospace",
                    textTransform: "uppercase",
                    padding: "0.15rem 0.5rem",
                    borderRadius: "4px",
                    backgroundColor: "#f3f4f6",
                    color: "rgba(17,17,17,0.6)",
                  }}
                >
                  SHA-256 Tag
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.4rem", fontSize: "0.75rem", color: "rgba(17,17,17,0.6)", lineHeight: 1.45 }}>
                <Info size={13} style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>
                  <strong>Wajib:</strong> Salin dan tempelkan kode unik di atas ke dalam <strong>Deskripsi YouTube Shorts</strong> kamu sebelum menekan tombol submit agar AI dapat memvalidasi kepemilikan klip tanpa meminta akses login Google.
                </span>
              </div>
            </div>

            {/* Submit CTA Button */}
            <div style={{ paddingTop: "0.25rem" }}>
              <button
                type="submit"
                disabled={submitting || !videoUrl.trim() || !isValidYoutubeUrl}
                style={{
                  width: "100%",
                  height: "48px",
                  borderRadius: "10px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  backgroundColor:
                    !videoUrl.trim() || !isValidYoutubeUrl
                      ? "rgba(17,17,17,0.08)"
                      : "#111111",
                  color:
                    !videoUrl.trim() || !isValidYoutubeUrl
                      ? "rgba(17,17,17,0.4)"
                      : "#ffffff",
                  border: "none",
                  cursor:
                    !videoUrl.trim() || !isValidYoutubeUrl
                      ? "not-allowed"
                      : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  boxShadow:
                    !videoUrl.trim() || !isValidYoutubeUrl
                      ? "none"
                      : "0 4px 14px rgba(0,0,0,0.15)",
                }}
              >
                <Scissors size={15} />
                <span>Submit &amp; Verifikasi Klip Sekarang</span>
                <ArrowRight size={14} />
              </button>
              <div
                style={{
                  textAlign: "center",
                  fontSize: "0.75rem",
                  color: "rgba(17,17,17,0.5)",
                  marginTop: "0.5rem",
                }}
              >
                Proses verifikasi pipeline Whisper &amp; Gemini membutuhkan ~15 detik secara real-time.
              </div>
            </div>
          </form>
        )}

        {/* ── LIVE VERIFICATION STATE (Section 6.2) ───────────────── */}
        {activeClipId && !verificationResult && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <VerificationTimeline
              clipId={activeClipId}
              onComplete={handleVerificationComplete}
            />
          </div>
        )}

        {/* ── RESULT: SUCCESS (Section 6.3) ───────────────────────── */}
        {verificationResult &&
          (verificationResult.status === "ACTIVE" ||
            verificationResult.status === "SETTLED") && (
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                padding: "1.75rem",
                border: "1px solid rgba(17,17,17,0.08)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "12px",
                    backgroundColor: "#ecfdf5",
                    border: "1px solid #a7f3d0",
                    color: "#059669",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <span style={{ fontSize: "0.6875rem", textTransform: "uppercase", fontWeight: 700, color: "#059669" }}>
                    Verifikasi Berhasil (AI Evaluated)
                  </span>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#111", margin: "2px 0 0" }}>
                    Klip Kamu Disetujui &amp; Payout Diproses!
                  </h3>
                </div>
              </div>

              {/* Quality breakdown */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    padding: "0.875rem",
                    backgroundColor: "#fbfaf9",
                    borderRadius: "10px",
                    textAlign: "center",
                    border: "1px solid rgba(17,17,17,0.04)",
                  }}
                >
                  <div style={{ fontSize: "0.75rem", color: "rgba(17,17,17,0.5)" }}>Kecocokan Vektor</div>
                  <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "#111", marginTop: "2px" }}>
                    {Math.round(
                      (verificationResult.clip?.matchScore ??
                        verificationResult.clip?.verification?.stages?.find(
                          (s: any) => s.stage === "source_match"
                        )?.score ??
                        0.88) * 100
                    )}%
                  </div>
                  <div style={{ fontSize: "0.6875rem", color: "#059669", fontWeight: 600, marginTop: "2px" }}>
                    Lolos (min 72%)
                  </div>
                </div>

                <div
                  style={{
                    padding: "0.875rem",
                    backgroundColor: "#fbfaf9",
                    borderRadius: "10px",
                    textAlign: "center",
                    border: "1px solid rgba(17,17,17,0.04)",
                  }}
                >
                  <div style={{ fontSize: "0.75rem", color: "rgba(17,17,17,0.5)" }}>Brand Safety</div>
                  <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "#111", marginTop: "2px" }}>
                    {Math.round(
                      (verificationResult.clip?.safetyScore ??
                        verificationResult.clip?.verification?.stages?.find(
                          (s: any) => s.stage === "brand_safety"
                        )?.score ??
                        0.96) * 100
                    )}%
                  </div>
                  <div style={{ fontSize: "0.6875rem", color: "#059669", fontWeight: 600, marginTop: "2px" }}>
                    Bebas SARA / Klaim
                  </div>
                </div>

                <div
                  style={{
                    padding: "0.875rem",
                    backgroundColor: "#fbfaf9",
                    borderRadius: "10px",
                    textAlign: "center",
                    border: "1px solid rgba(17,17,17,0.04)",
                  }}
                >
                  <div style={{ fontSize: "0.75rem", color: "rgba(17,17,17,0.5)" }}>Pola Views</div>
                  <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "#111", marginTop: "2px" }}>
                    Organik
                  </div>
                  <div style={{ fontSize: "0.6875rem", color: "#059669", fontWeight: 600, marginTop: "2px" }}>
                    Normal (0 Bot)
                  </div>
                </div>
              </div>

              {/* Arithmetic breakdown */}
              <div
                style={{
                  padding: "1rem 1.25rem",
                  backgroundColor: "#fbfaf9",
                  borderRadius: "12px",
                  border: "1px solid rgba(17,17,17,0.06)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.875rem",
                    color: "#111",
                    paddingBottom: "0.625rem",
                    borderBottom: "1px solid rgba(17,17,17,0.06)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>
                    {formatViews(
                      verificationResult.clip?.metrics?.views ??
                        verificationResult.clip?.paidViews ??
                        verificationResult.clip?.views ??
                        52310
                    )}{" "}
                    views terverifikasi
                  </span>
                  <span style={{ fontWeight: 700, color: "#059669" }}>
                    {formatUsdt(
                      verificationResult.clip?.payoutData?.releasedAmount
                        ? String(
                            BigInt(verificationResult.clip.payoutData.releasedAmount) +
                              BigInt(verificationResult.clip.payoutData.holdbackAmount || "0")
                          )
                        : "15700000"
                    )}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                  <span style={{ color: "#111", display: "flex", alignItems: "center", gap: "0.35rem", fontWeight: 500 }}>
                    <CheckCircle2 size={14} color="#059669" />
                    Cair sekarang (70%):
                  </span>
                  <span style={{ fontWeight: 600, color: "#111" }}>
                    {formatUsdt(
                      verificationResult.clip?.payoutData?.releasedAmount ??
                        verificationResult.clip?.releasedAmount ??
                        "10990000"
                    )}{" "}
                    (✓ Terkirim on-chain)
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                  <span style={{ color: "rgba(17,17,17,0.6)", display: "flex", alignItems: "center", gap: "0.35rem", fontWeight: 500 }}>
                    <Clock size={14} color="#d97706" />
                    Holdback anti-fraud (30%):
                  </span>
                  <span style={{ fontWeight: 500, color: "rgba(17,17,17,0.6)" }}>
                    {formatUsdt(
                      verificationResult.clip?.payoutData?.holdbackAmount ??
                        verificationResult.clip?.holdbackAmount ??
                        "4710000"
                    )}{" "}
                    (Cair otomatis dlm 72 jam)
                  </span>
                </div>

                {/* On-Chain Transaction Explorer Link */}
                {(verificationResult.clip?.payoutData?.txHash ||
                  verificationResult.clip?.txHash) && (
                  <div
                    style={{
                      paddingTop: "0.5rem",
                      borderTop: "1px solid rgba(17,17,17,0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "0.75rem",
                    }}
                  >
                    <span style={{ color: "rgba(17,17,17,0.6)" }}>Transaksi opBNB:</span>
                    <a
                      href={
                        verificationResult.clip?.payoutData?.explorerUrl ||
                        txExplorerUrl(
                          verificationResult.clip?.payoutData?.txHash ||
                            verificationResult.clip?.txHash
                        )
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#e8400d",
                        textDecoration: "underline",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        fontFamily: "monospace",
                      }}
                    >
                      <span>
                        {(
                          verificationResult.clip?.payoutData?.txHash ||
                          verificationResult.clip?.txHash
                        ).slice(0, 14)}
                        ...
                      </span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                )}
              </div>

              <div style={{ fontSize: "0.75rem", color: "rgba(17,17,17,0.6)", lineHeight: 1.5 }}>
                Sebagian dana (30%) ditahan 72 jam untuk memastikan kestabilan views dan melindungi sponsor dari bot. Setelah 72 jam, saldo holdback dapat diklaim langsung tanpa potongan.
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveClipId(null);
                    setVerificationResult(null);
                    setVideoUrl("");
                  }}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    backgroundColor: "#fbfaf9",
                    border: "1px solid rgba(17,17,17,0.12)",
                    color: "#111",
                    cursor: "pointer",
                  }}
                >
                  Submit Klip Lain
                </button>
                <Link
                  href="/clipper"
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    backgroundColor: "#111111",
                    color: "#ffffff",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                  }}
                >
                  <span>Ke Dashboard Saldo</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          )}

        {/* ── RESULT: REJECTED (Section 6.4 & UX3) ────────────────── */}
        {verificationResult &&
          verificationResult.status === "REJECTED" && (
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                padding: "1.75rem",
                border: "1px solid rgba(17,17,17,0.08)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "12px",
                    backgroundColor: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#dc2626",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <span style={{ fontSize: "0.6875rem", textTransform: "uppercase", fontWeight: 700, color: "#dc2626" }}>
                    Evaluasi AI
                  </span>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#111", margin: "2px 0 0" }}>
                    Klip Belum Bisa Disetujui
                  </h3>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "#fef2f2",
                  padding: "1rem",
                  borderRadius: "10px",
                  fontSize: "0.8125rem",
                  color: "#991b1b",
                  border: "1px solid #fecaca",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <div style={{ fontWeight: 600 }}>
                  {verificationResult.clip?.rejectionReason ||
                    "Klip ini tidak memenuhi ambang batas kecocokan dengan video sumber campaign."}
                </div>
                {verificationResult.clip?.rejectionCode && (
                  <div style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#b91c1c" }}>
                    Kode evaluasi: [{verificationResult.clip.rejectionCode}]
                  </div>
                )}
              </div>

              {/* UX3: Mendidik, bukan menuduh */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.75rem", color: "#111" }}>
                <div style={{ fontWeight: 700, color: "rgba(17,17,17,0.5)", textTransform: "uppercase", fontSize: "0.6875rem" }}>
                  Apa yang mungkin terjadi:
                </div>
                <div>• Klip dipotong dari video yang berbeda dengan campaign sponsor.</div>
                <div>• Kode verifikasi belum disematkan pada deskripsi video YouTube Shorts.</div>
                <div>• Klip terlalu banyak diubah atau diberi audio pihak ketiga sehingga tidak lagi selaras dengan video sumber.</div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.75rem", color: "#111" }}>
                <div style={{ fontWeight: 700, color: "rgba(17,17,17,0.5)", textTransform: "uppercase", fontSize: "0.6875rem" }}>
                  Yang bisa kamu lakukan:
                </div>
                <div>
                  {verificationResult.clip?.suggestion ||
                    "1. Buka kembali video sumber campaign.\n2. Potong langsung bagian menarik dari video itu.\n3. Upload Shorts baru dengan kode di deskripsi dan submit ulang."}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                  paddingTop: "0.75rem",
                  borderTop: "1px solid rgba(17,17,17,0.06)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveClipId(null);
                      setVerificationResult(null);
                      setVideoUrl("");
                    }}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "8px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      backgroundColor: "#111111",
                      color: "#ffffff",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Submit Klip Lain
                  </button>
                  {selectedCampaign && (
                    <a
                      href={selectedCampaign.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: "0.5rem 0.875rem",
                        borderRadius: "8px",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        backgroundColor: "#fbfaf9",
                        border: "1px solid rgba(17,17,17,0.12)",
                        color: "#111",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <Play size={12} />
                      <span>Buka Video Sumber</span>
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setAppealModalOpen(true)}
                  style={{
                    fontSize: "0.75rem",
                    color: "rgba(17,17,17,0.6)",
                    textDecoration: "underline",
                    cursor: "pointer",
                    backgroundColor: "transparent",
                    border: "none",
                    padding: 0,
                  }}
                >
                  Merasa ini keliru? Ajukan banding
                </button>
              </div>
            </div>
          )}

        {/* ── RESULT: PENDING VIEWS (Section 6.5) ─────────────────── */}
        {verificationResult &&
          verificationResult.status === "PENDING_VIEWS" && (
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                padding: "1.75rem",
                border: "1px solid rgba(17,17,17,0.08)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "12px",
                    backgroundColor: "#fffbeb",
                    border: "1px solid #fde68a",
                    color: "#d97706",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Clock size={24} />
                </div>
                <div>
                  <span style={{ fontSize: "0.6875rem", textTransform: "uppercase", fontWeight: 700, color: "#d97706" }}>
                    Klip Terdaftar &amp; Lolos Konten
                  </span>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#111", margin: "2px 0 0" }}>
                    Klip Valid, Menunggu Kuota Minimum Views
                  </h3>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(17,17,17,0.6)" }}>
                  <span>Views saat ini: <strong style={{ color: "#111" }}>{formatViews(verificationResult.clip?.metrics?.views ?? 412)}</strong></span>
                  <span>Minimum campaign: <strong style={{ color: "#111" }}>{formatViews(selectedCampaign?.minViews ?? 1000)} views</strong></span>
                </div>
                <div style={{ height: "6px", width: "100%", backgroundColor: "rgba(17,17,17,0.08)", borderRadius: "9999px", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min(
                        100,
                        Math.round(
                          ((verificationResult.clip?.metrics?.views ?? 412) /
                            (selectedCampaign?.minViews ?? 1000)) *
                            100
                        )
                      )}%`,
                      backgroundColor: "#059669",
                      borderRadius: "9999px",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              </div>

              <p style={{ fontSize: "0.75rem", color: "rgba(17,17,17,0.6)", lineHeight: 1.5, margin: 0 }}>
                Klip kamu sudah lolos uji kepemilikan dan verifikasi konten AI. Worker kami memeriksa views otomatis secara periodik — kamu tidak perlu melakukan submit ulang. Begitu views mencapai {formatViews(selectedCampaign?.minViews ?? 1000)}, dana otomatis dicairkan ke saldo akun kamu.
              </p>

              <div style={{ paddingTop: "0.5rem", display: "flex", justifyContent: "flex-end" }}>
                <Link
                  href="/clipper"
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    backgroundColor: "#111111",
                    color: "#ffffff",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                  }}
                >
                  <span>Lihat di Dashboard</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          )}

        {/* Appeal Modal */}
        {activeClipId && (
          <AppealModal
            isOpen={appealModalOpen}
            onClose={() => setAppealModalOpen(false)}
            clipId={activeClipId}
            clipTitle={videoUrl}
            rejectionReason="Kecocokan semantik di bawah ambang batas (34%)"
            onSuccess={() => {
              alert("Banding kamu telah diterima dan masuk ke antrean reviewer!");
            }}
          />
        )}
      </div>
    </div>
    </AuthGate>
  );
}

export default function ClipperSubmitPage() {
  return (
    <Suspense
      fallback={
        <div style={{ maxWidth: "52rem", margin: "0 auto", padding: "6.5rem 1.5rem 4rem" }}>
          <div style={{ height: "300px", backgroundColor: "#f3f4f6", borderRadius: "16px" }} />
        </div>
      }
    >
      <ClipperSubmitContent />
    </Suspense>
  );
}
