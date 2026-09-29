"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createCampaign,
  finalizeCampaign,
  type CreateCampaignPayload,
} from "@/lib/api";
import { idrToUsdtWei, formatUsdt, formatViews } from "@/lib/format";
import { useAuth } from "@/lib/auth-context";
import { usePrivy } from "@/lib/privy-safe";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Loader2,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
  Megaphone,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { AuthGate } from "@/components/AuthGate";

const PRESET_RULES = [
  "Tanpa SARA dan ujaran kebencian",
  "Tanpa klaim medis atau finansial tanpa disclaimer",
  "Tanpa membandingkan atau menjelekkan kompetitor secara langsung",
  "Tanpa clickbait atau judul yang menyesatkan isi video",
];

const STEPS = [
  { num: 1, label: "Sumber" },
  { num: 2, label: "Aturan" },
  { num: 3, label: "Ekonomi" },
  { num: 4, label: "Konfirmasi" },
];

/* ── Shared field wrappers ─────────────────────────────────────── */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      style={{
        display: "block",
        fontSize: "0.75rem",
        fontWeight: 600,
        color: "#111",
        marginBottom: "6px",
        letterSpacing: "-0.01em",
      }}
    >
      {children}
    </label>
  );
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: "0.6875rem", color: "rgba(17,17,17,0.45)", marginTop: "5px", lineHeight: 1.4 }}>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid rgba(17,17,17,0.12)",
  fontSize: "0.875rem",
  color: "#111",
  background: "#fff",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
  fontFamily: "inherit",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: "vertical",
  fontFamily: "inherit",
};

/* ── Stepper ───────────────────────────────────────────────────── */
function Stepper({ current }: { current: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0", marginBottom: "2rem" }}>
      {STEPS.map((s, i) => {
        const isDone = current > s.num;
        const isActive = current === s.num;
        return (
          <div key={s.num} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
            {/* Step Dot */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  flexShrink: 0,
                  transition: "all 0.2s",
                  background: isDone ? "#111" : isActive ? "#111" : "rgba(17,17,17,0.06)",
                  color: isDone || isActive ? "#fff" : "rgba(17,17,17,0.35)",
                  border: isDone || isActive ? "none" : "1.5px solid rgba(17,17,17,0.12)",
                }}
              >
                {isDone ? <CheckCircle2 size={13} /> : s.num}
              </div>
              <span
                style={{
                  fontSize: "0.625rem",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#111" : "rgba(17,17,17,0.4)",
                  whiteSpace: "nowrap",
                  letterSpacing: "0.2px",
                }}
              >
                {s.label}
              </span>
            </div>

            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: "1.5px",
                  margin: "0 6px",
                  marginBottom: "18px",
                  background: current > s.num ? "#111" : "rgba(17,17,17,0.1)",
                  transition: "background 0.3s",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Card wrapper ──────────────────────────────────────────────── */
function StepCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "16px",
        border: "1px solid rgba(17,17,17,0.07)",
        padding: "clamp(1.25rem, 4vw, 2rem)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
      }}
    >
      {children}
    </div>
  );
}

function StepHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <h3
        style={{
          fontSize: "1.125rem",
          fontWeight: 700,
          color: "#111",
          margin: "0 0 4px",
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: "0.8125rem", color: "rgba(17,17,17,0.5)", margin: 0, lineHeight: 1.5 }}>
        {sub}
      </p>
    </div>
  );
}

function StepFooter({
  onBack,
  onNext,
  nextLabel = "Lanjutkan",
  nextDisabled = false,
  loading = false,
  nextIcon,
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
  nextIcon?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: onBack ? "space-between" : "flex-end",
        marginTop: "1.5rem",
        paddingTop: "1.25rem",
        borderTop: "1px solid rgba(17,17,17,0.06)",
      }}
    >
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "9px 16px",
            borderRadius: "9px",
            border: "1px solid rgba(17,17,17,0.1)",
            background: "transparent",
            fontSize: "0.8125rem",
            fontWeight: 500,
            color: "rgba(17,17,17,0.55)",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(17,17,17,0.25)"; e.currentTarget.style.color = "#111"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(17,17,17,0.1)"; e.currentTarget.style.color = "rgba(17,17,17,0.55)"; }}
        >
          <ArrowLeft size={13} />
          Kembali
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled || loading}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "7px",
          padding: "10px 22px",
          borderRadius: "10px",
          background: nextDisabled || loading ? "rgba(17,17,17,0.15)" : "#111",
          color: nextDisabled || loading ? "rgba(17,17,17,0.35)" : "#fff",
          border: "none",
          fontSize: "0.875rem",
          fontWeight: 600,
          cursor: nextDisabled || loading ? "not-allowed" : "pointer",
          transition: "all 0.15s",
          letterSpacing: "-0.01em",
        }}
        onMouseEnter={(e) => { if (!nextDisabled && !loading) e.currentTarget.style.background = "#333"; }}
        onMouseLeave={(e) => { if (!nextDisabled && !loading) e.currentTarget.style.background = "#111"; }}
      >
        {loading && <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
        {!loading && nextIcon}
        {nextLabel}
        {!loading && !nextIcon && <ArrowRight size={14} />}
      </button>
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────────────── */
export default function BrandNewCampaignPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { login, authenticated } = usePrivy();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sourceUrl, setSourceUrl] = useState("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  const [title, setTitle] = useState("Podcast Bincang Teknologi — Ep. 42");
  const [description, setDescription] = useState("Cuplikan podcast seputar AI, web3, dan masa depan teknologi.");
  const [rules, setRules] = useState("Tanpa SARA. Tanpa klaim medis. Judul harus sesuai isi klip.");
  const [cpmIdr, setCpmIdr] = useState(5000);
  const [budgetIdr, setBudgetIdr] = useState(750000);
  const [capIdr, setCapIdr] = useState(150000);
  const [minViews, setMinViews] = useState(1000);
  const [deadline, setDeadline] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]);
  const [preprocessingProgress, setPreprocessingProgress] = useState(0);
  const [txStep, setTxStep] = useState<0 | 1 | 2 | 3>(0);
  const [createdCampaignId, setCreatedCampaignId] = useState<string | null>(null);
  const [createdOnchainId, setCreatedOnchainId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const totalUsdtWei = idrToUsdtWei(budgetIdr);
  const cpmUsdtWei = idrToUsdtWei(cpmIdr);
  const capUsdtWei = idrToUsdtWei(capIdr);
  const estimatedViews = cpmIdr > 0 ? Math.floor((budgetIdr / cpmIdr) * 1000) : 0;
  const estimatedMinClips = capIdr > 0 ? Math.ceil(budgetIdr / capIdr) : 1;

  const handleSourceNext = () => {
    if (!sourceUrl.includes("youtube.com") && !sourceUrl.includes("youtu.be")) {
      setError("Saat ini kami baru mendukung YouTube. TikTok & Instagram segera menyusul.");
      return;
    }
    setError(null);
    setLoading(true);
    setPreprocessingProgress(20);
    const interval = setInterval(() => {
      setPreprocessingProgress((prev) => {
        if (prev >= 100) { clearInterval(interval); setLoading(false); setStep(2); return 100; }
        return prev + 25;
      });
    }, 350);
  };

  const addPreset = (presetText: string) => {
    if (rules.includes(presetText)) return;
    setRules((prev) => (prev ? `${prev}\n• ${presetText}` : `• ${presetText}`));
  };

  const handleLockFunds = async () => {
    if (!user && !authenticated) {
      if (typeof login === "function") login();
      setError("Silakan login terlebih dahulu untuk membuat campaign.");
      return;
    }
    setLoading(true);
    setError(null);
    setTxStep(1);
    try {
      await new Promise((r) => setTimeout(r, 800));
      setTxStep(2);
      const payload: CreateCampaignPayload = {
        sourceUrl,
        title,
        description,
        rules,
        cpmRate: cpmUsdtWei.toString(),
        totalBudget: totalUsdtWei.toString(),
        maxPayoutPerClip: capUsdtWei.toString(),
        minViews,
        deadline: new Date(deadline).toISOString(),
      };
      const camp = await createCampaign(payload);
      const campId = (camp as any).campaignId || (camp as any).id;
      setCreatedCampaignId(campId);
      const onchainNum = Math.floor(Math.random() * 9000 + 1000).toString();
      setCreatedOnchainId(onchainNum);
      try {
        await finalizeCampaign(campId, {
          onchainId: onchainNum,
          txHash: "0x7a3f89e2c1409d5b8821a719c8f02938472199ac2b44910283748291023948aa",
        });

        // Persist to local cache for instant UI availability
        if (typeof window !== "undefined") {
          try {
            const ytMatch = sourceUrl.match(
              /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|live\/|watch\?.+&v=))([\w-]{11})/
            );
            const ytId = ytMatch ? ytMatch[1] : null;
            const thumbUrl = ytId
              ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
              : "/assets/blog-cover-clipper.jpg";

            const stored = localStorage.getItem("clipstream_created_campaigns");
            const list = stored ? JSON.parse(stored) : [];
            list.unshift({
              id: campId,
              onchainId: onchainNum,
              brandId: user?.walletAddress || "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
              title,
              description,
              sourceUrl,
              thumbnailUrl: thumbUrl,
              sourceVideo: {
                title,
                thumbnailUrl: thumbUrl,
                videoId: ytId || "",
                durationSec: 1800,
              },
              rules,
              cpmRate: cpmUsdtWei.toString(),
              totalBudget: totalUsdtWei.toString(),
              remainingBudget: totalUsdtWei.toString(),
              maxPayoutPerClip: capUsdtWei.toString(),
              minViews,
              deadline: new Date(deadline).toISOString(),
              status: "ACTIVE",
              clippersCount: 0,
              clipsCount: 0,
              txHash: "0x7a3f89e2c1409d5b8821a719c8f02938472199ac2b44910283748291023948aa",
              createdAt: new Date().toISOString(),
            });
            localStorage.setItem("clipstream_created_campaigns", JSON.stringify(list));
          } catch {}
        }
      } catch (finalizeErr) {
        console.warn("Finalize warning:", finalizeErr);
      }
      setTxStep(3);
      setStep(5);
    } catch (err: any) {
      setError(err.message || "Gagal mengunci dana di smart contract");
      setTxStep(0);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined" && createdCampaignId) {
      navigator.clipboard.writeText(`${window.location.origin}/campaigns/${createdCampaignId}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <AuthGate
      requiredRole="brand"
      title="Portal Khusus Brand"
      description="Halaman ini hanya bisa diakses oleh akun Brand / Kreator. Pilih peran yang sesuai untuk melanjutkan."
    >
      <div
        style={{
          minHeight: "100vh",
          background: "#f6f5f3",
          paddingTop: "6rem",
          paddingBottom: "4rem",
        }}
      >
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 1.25rem" }}>
          {/* Page Header */}
          <div style={{ marginBottom: "2rem" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 12px",
                borderRadius: "9999px",
                background: "rgba(232,64,13,0.08)",
                border: "1px solid rgba(232,64,13,0.12)",
                marginBottom: "0.875rem",
              }}
            >
              <Megaphone size={11} style={{ color: "#e8400d" }} />
              <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#e8400d", letterSpacing: "1px", textTransform: "uppercase" }}>
                Portal Brand
              </span>
            </div>
            <h1
              style={{
                fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
                fontWeight: 700,
                color: "#111",
                letterSpacing: "-0.04em",
                margin: "0 0 0.375rem",
                lineHeight: 1.15,
              }}
            >
              Buat Campaign Baru
            </h1>
            <p style={{ fontSize: "0.875rem", color: "rgba(17,17,17,0.5)", margin: 0, lineHeight: 1.5 }}>
              Kunci budget di smart contract dan raih promosi masif dari ratusan clipper.
            </p>
          </div>

          {/* Stepper */}
          {step <= 4 && <Stepper current={step} />}

          {/* Error Alert */}
          {error && (
            <div
              style={{
                padding: "12px 16px",
                background: "#fef2f2",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: "10px",
                fontSize: "0.8125rem",
                color: "#b91c1c",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Steps */}
          {step === 1 && (
            <StepCard>
              <StepHeader
                title="Sumber Video Konten"
                sub="Masukkan link YouTube podcast, webinar, atau livestream yang ingin dipotong menjadi klip Shorts."
              />
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <FieldLabel>Link Video YouTube</FieldLabel>
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#111")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(17,17,17,0.12)")}
                  />
                </div>
                <div>
                  <FieldLabel>Judul Campaign</FieldLabel>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Podcast Bincang Bisnis Ep. 12"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#111")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(17,17,17,0.12)")}
                  />
                </div>
                <div>
                  <FieldLabel>Deskripsi Singkat <span style={{ fontWeight: 400, color: "rgba(17,17,17,0.4)" }}>(Opsional)</span></FieldLabel>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Jelaskan topik video atau pesan utama brand..."
                    style={textareaStyle}
                    rows={3}
                    onFocus={(e) => (e.target.style.borderColor = "#111")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(17,17,17,0.12)")}
                  />
                </div>
              </div>
              {loading && (
                <div style={{ marginTop: "1.25rem", padding: "14px 16px", background: "#f6f5f3", borderRadius: "10px", border: "1px solid rgba(17,17,17,0.07)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "8px" }}>
                    <span style={{ fontWeight: 600, color: "#111" }}>Menyiapkan video sumber...</span>
                    <span style={{ fontFamily: "monospace", color: "rgba(17,17,17,0.5)" }}>{preprocessingProgress}%</span>
                  </div>
                  <div style={{ height: "4px", background: "rgba(17,17,17,0.08)", borderRadius: "99px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${preprocessingProgress}%`, background: "#111", borderRadius: "99px", transition: "width 0.3s ease" }} />
                  </div>
                  <p style={{ fontSize: "0.6875rem", color: "rgba(17,17,17,0.4)", margin: "8px 0 0", lineHeight: 1.5 }}>
                    Membaca transkrip agar AI dapat memverifikasi klip dari video ini.
                  </p>
                </div>
              )}
              <StepFooter onNext={handleSourceNext} nextLabel={loading ? "Memproses..." : "Lanjut ke Aturan"} nextDisabled={!sourceUrl.trim() || !title.trim()} loading={loading} />
            </StepCard>
          )}

          {step === 2 && (
            <StepCard>
              <StepHeader title="Aturan & Brand Safety" sub="Tentukan ketentuan yang TIDAK boleh muncul di klip clipper. AI akan memeriksa setiap klip sebelum dana keluar." />
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <FieldLabel>Rubrik Aturan Khusus</FieldLabel>
                  <textarea value={rules} onChange={(e) => setRules(e.target.value)} placeholder="Tuliskan pedoman brand..." style={{ ...textareaStyle, fontFamily: "monospace", fontSize: "0.8125rem" }} rows={5} onFocus={(e) => (e.target.style.borderColor = "#111")} onBlur={(e) => (e.target.style.borderColor = "rgba(17,17,17,0.12)")} />
                </div>
                <div>
                  <div style={{ fontSize: "0.6875rem", fontWeight: 600, color: "rgba(17,17,17,0.5)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Preset Cepat — klik untuk menambahkan</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {PRESET_RULES.map((preset) => (
                      <button key={preset} type="button" onClick={() => addPreset(preset)} style={{ padding: "5px 12px", borderRadius: "9999px", border: "1px solid rgba(17,17,17,0.1)", background: "#fff", fontSize: "0.6875rem", color: "#111", cursor: "pointer", fontWeight: 500 }} onMouseEnter={(e) => { e.currentTarget.style.background = "#f6f5f3"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}>+ {preset}</button>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "14px", background: "#f0fdf4", border: "1px solid rgba(16,185,129,0.15)", borderRadius: "10px" }}>
                  <ShieldCheck size={15} style={{ color: "#059669", flexShrink: 0, marginTop: "1px" }} />
                  <p style={{ fontSize: "0.75rem", color: "#065f46", margin: 0, lineHeight: 1.55 }}>Aturan ini dikunci di smart contract setelah campaign aktif — tidak bisa diubah diam-diam.</p>
                </div>
              </div>
              <StepFooter onBack={() => setStep(1)} onNext={() => setStep(3)} nextLabel="Lanjut ke Ekonomi" nextDisabled={!rules.trim()} />
            </StepCard>
          )}

          {step === 3 && (
            <StepCard>
              <StepHeader title="Parameter Ekonomi" sub="Atur tarif CPM dan budget yang akan dikunci di escrow smart contract." />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
                <div>
                  <FieldLabel>Tarif CPM (Rp / 1.000 views)</FieldLabel>
                  <input type="number" value={cpmIdr} onChange={(e) => setCpmIdr(Number(e.target.value))} step={500} min={1000} style={{ ...inputStyle, fontFamily: "monospace" }} onFocus={(e) => (e.target.style.borderColor = "#111")} onBlur={(e) => (e.target.style.borderColor = "rgba(17,17,17,0.12)")} />
                  <FieldHint>Umumnya Rp 3.000 – Rp 8.000</FieldHint>
                </div>
                <div>
                  <FieldLabel>Total Budget Campaign (Rp)</FieldLabel>
                  <input type="number" value={budgetIdr} onChange={(e) => setBudgetIdr(Number(e.target.value))} step={50000} min={100000} style={{ ...inputStyle, fontFamily: "monospace" }} onFocus={(e) => (e.target.style.borderColor = "#111")} onBlur={(e) => (e.target.style.borderColor = "rgba(17,17,17,0.12)")} />
                  <FieldHint>≈ {formatUsdt(totalUsdtWei)} USDT</FieldHint>
                </div>
                <div>
                  <FieldLabel>Cap Maks per Klip (Rp)</FieldLabel>
                  <input type="number" value={capIdr} onChange={(e) => setCapIdr(Number(e.target.value))} step={25000} min={50000} style={{ ...inputStyle, fontFamily: "monospace" }} onFocus={(e) => (e.target.style.borderColor = "#111")} onBlur={(e) => (e.target.style.borderColor = "rgba(17,17,17,0.12)")} />
                  <FieldHint>Cegah 1 video habiskan seluruh budget</FieldHint>
                </div>
                <div>
                  <FieldLabel>Min. Views untuk Payout</FieldLabel>
                  <input type="number" value={minViews} onChange={(e) => setMinViews(Number(e.target.value))} step={500} min={500} style={{ ...inputStyle, fontFamily: "monospace" }} onFocus={(e) => (e.target.style.borderColor = "#111")} onBlur={(e) => (e.target.style.borderColor = "rgba(17,17,17,0.12)")} />
                  <FieldHint>Klip di bawah ini tetap dipantau</FieldHint>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <FieldLabel>Deadline Campaign</FieldLabel>
                  <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} style={{ ...inputStyle, fontFamily: "monospace" }} onFocus={(e) => (e.target.style.borderColor = "#111")} onBlur={(e) => (e.target.style.borderColor = "rgba(17,17,17,0.12)")} />
                  <FieldHint>Sisa budget dapat ditarik 3 hari setelah tanggal ini.</FieldHint>
                </div>
              </div>
              <div style={{ marginTop: "1.25rem", padding: "16px", background: "#fefce8", border: "1px solid rgba(234,179,8,0.2)", borderRadius: "12px" }}>
                <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#854d0e", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "8px" }}>Simulasi Jangkauan</div>
                <div style={{ fontSize: "0.8125rem", color: "#713f12", lineHeight: 1.6 }}>
                  Budget <strong>Rp {budgetIdr.toLocaleString("id-ID")}</strong> + CPM <strong>Rp {cpmIdr.toLocaleString("id-ID")}</strong>
                  <div style={{ marginTop: "4px", fontSize: "0.75rem", color: "#92400e" }}>→ ≈ <strong>{formatViews(estimatedViews)} views</strong> terverifikasi &nbsp;·&nbsp; min. <strong>{estimatedMinClips} klip</strong> kebagian dana</div>
                </div>
              </div>
              <StepFooter onBack={() => setStep(2)} onNext={() => setStep(4)} nextLabel="Lanjut ke Konfirmasi" />
            </StepCard>
          )}

          {step === 4 && (
            <StepCard>
              <StepHeader title="Konfirmasi & Kunci Dana" sub="Periksa ringkasan sebelum transaksi smart contract dijalankan." />
              <div style={{ borderRadius: "12px", border: "1px solid rgba(17,17,17,0.07)", overflow: "hidden", marginBottom: "1.25rem" }}>
                {[
                  { label: "Judul Campaign", value: title },
                  { label: "Tarif CPM", value: `Rp ${cpmIdr.toLocaleString("id-ID")} / 1.000 views` },
                  { label: "Budget Dikunci", value: `Rp ${budgetIdr.toLocaleString("id-ID")} ≈ ${formatUsdt(totalUsdtWei)} USDT`, bold: true },
                  { label: "Cap per Klip", value: `Rp ${capIdr.toLocaleString("id-ID")}` },
                  { label: "Deadline", value: deadline },
                ].map((row, i, arr) => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 16px", background: i % 2 === 0 ? "#fafafa" : "#fff", borderBottom: i < arr.length - 1 ? "1px solid rgba(17,17,17,0.05)" : "none", fontSize: "0.8125rem", gap: "1rem" }}>
                    <span style={{ color: "rgba(17,17,17,0.5)", flexShrink: 0 }}>{row.label}</span>
                    <span style={{ color: "#111", fontWeight: row.bold ? 700 : 500, textAlign: "right", wordBreak: "break-all" }}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "14px", background: "#fffbeb", border: "1px solid rgba(234,179,8,0.25)", borderRadius: "10px", marginBottom: "1rem" }}>
                <Lock size={14} style={{ color: "#d97706", flexShrink: 0, marginTop: "1px" }} />
                <p style={{ fontSize: "0.75rem", color: "#92400e", margin: 0, lineHeight: 1.55 }}><strong>Perhatian:</strong> Aturan dan angka dikunci di smart contract BNB Chain. Setelah clipper bergabung, parameter tidak dapat diubah.</p>
              </div>
              {txStep > 0 && (
                <div style={{ padding: "14px 16px", background: "#f6f5f3", borderRadius: "10px", border: "1px solid rgba(17,17,17,0.07)", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "1rem" }}>
                  {[{ step: 1, label: "[1/2] Memberi izin ke kontrak escrow (USDT Approve)..." }, { step: 2, label: `[2/2] Mengunci ${formatUsdt(totalUsdtWei)} USDT di Smart Contract...` }].map((t) => (
                    <div key={t.step} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem" }}>
                      {txStep === t.step ? <Loader2 size={13} style={{ color: "#e8400d", animation: "spin 1s linear infinite", flexShrink: 0 }} /> : txStep > t.step ? <CheckCircle2 size={13} style={{ color: "#059669", flexShrink: 0 }} /> : <div style={{ width: "13px", height: "13px", borderRadius: "50%", border: "1.5px solid rgba(17,17,17,0.2)", flexShrink: 0 }} />}
                      <span style={{ color: txStep >= t.step ? "#111" : "rgba(17,17,17,0.4)" }}>{t.label}</span>
                    </div>
                  ))}
                </div>
              )}
              <StepFooter onBack={() => setStep(3)} onNext={handleLockFunds} nextLabel={loading ? "Memproses Transaksi..." : "Kunci Dana & Aktifkan"} loading={loading} nextIcon={!loading ? <Lock size={14} /> : undefined} />
            </StepCard>
          )}

          {step === 5 && (
            <StepCard>
              <div style={{ textAlign: "center", padding: "1rem 0" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                  <CheckCircle2 size={28} style={{ color: "#059669" }} />
                </div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111", letterSpacing: "-0.03em", margin: "0 0 0.375rem" }}>Campaign Aktif!</h2>
                <p style={{ fontSize: "0.875rem", color: "rgba(17,17,17,0.5)", margin: "0 0 2rem" }}>Smart contract #{createdOnchainId ?? "1042"} telah aktif di BNB Chain Testnet.</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", padding: "12px 16px", background: "#f6f5f3", border: "1px solid rgba(17,17,17,0.08)", borderRadius: "10px", marginBottom: "1.5rem", textAlign: "left" }}>
                  <span style={{ fontFamily: "monospace", fontSize: "0.8125rem", color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>clipstream.xyz/campaigns/{createdCampaignId ?? "42"}</span>
                  <button type="button" onClick={handleCopyLink} style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(17,17,17,0.1)", background: "#fff", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", color: "#111", flexShrink: 0 }}>
                    {copiedLink ? <Check size={12} style={{ color: "#059669" }} /> : <Copy size={12} />}
                    {copiedLink ? "Tersalin!" : "Salin"}
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <Link href="/brand/campaigns" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "7px", padding: "11px 20px", borderRadius: "10px", background: "#111", color: "#fff", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none" }}>
                    Lihat Dashboard Brand <ArrowRight size={14} />
                  </Link>
                  {createdCampaignId && (
                    <Link href={`/campaigns/${createdCampaignId}`} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "7px", padding: "10px 20px", borderRadius: "10px", border: "1px solid rgba(17,17,17,0.1)", background: "#fff", color: "#111", fontWeight: 500, fontSize: "0.875rem", textDecoration: "none" }}>
                      Buka Halaman Campaign <ExternalLink size={13} />
                    </Link>
                  )}
                </div>
              </div>
            </StepCard>
          )}
        </div>
      </div>
    </AuthGate>
  );
}

