"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  formatIdr,
  formatUsdt,
  formatViews,
  txExplorerUrl,
} from "@/lib/format";
import { VerificationTimeline } from "@/components/VerificationTimeline";
import { AppealModal } from "@/components/AppealModal";
import {
  Scissors,
  Copy,
  Check,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  RotateCcw,
  Clock,
  Play,
} from "lucide-react";

function ClipperSubmitContent() {
  const router = useRouter();
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
        setCampaigns(data);
        if (!selectedCampaignId && data.length > 0) {
          setSelectedCampaignId(data[0].id);
        }
      })
      .finally(() => setLoadingCampaigns(false));
  }, [selectedCampaignId]);

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId);
  const verificationCode = `CS-${(selectedCampaign?.id ?? "42").slice(0, 4)}-${
    user?.walletAddress?.slice(-6) ?? "8a9b1c"
  }`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(verificationCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSubmitClip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticated) {
      login();
      return;
    }

    if (!videoUrl.includes("youtube.com") && !videoUrl.includes("youtu.be")) {
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
    <div
      className="am-container"
      style={{
        maxWidth: "48rem",
        margin: "0 auto",
        padding: "7.5rem 1.5rem 4rem",
      }}
    >
      <div className="space-y-8">
        {/* Top Header */}
      <div>
        <Link
          href="/clipper"
          className="text-xs text-[var(--color-ash)] hover:text-[var(--color-ink)] inline-flex items-center gap-1.5 transition-colors mb-2"
          style={{ textDecoration: "none" }}
        >
          <ArrowLeft size={14} />
          <span>Kembali ke Dashboard Clipper</span>
        </Link>
        <h1 className="text-3xl sm:text-4xl font-normal text-[var(--color-ink)] tracking-tight">
          Submit Klip Video
        </h1>
        <p className="text-sm text-[var(--color-ash)] mt-1">
          Tempelkan link YouTube Shorts kamu untuk diverifikasi AI dan dicairkan
          otomatis.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-[#fdeeee] text-[#cf222e] rounded-xl text-xs flex items-center gap-2">
          <span>{error}</span>
        </div>
      )}

      {/* ── FORM STATE (Before Submit) ──────────────────────────── */}
      {!activeClipId && (
        <form
          onSubmit={handleSubmitClip}
          className="card p-6 md:p-8 bg-white rounded-2xl border border-[rgba(17,17,17,0.08)] space-y-6"
        >
          {/* Campaign Select */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-ink)] mb-1">
              Pilih Campaign
            </label>
            {loadingCampaigns ? (
              <div className="h-10 skeleton rounded-xl" />
            ) : (
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="input text-sm cursor-pointer"
                required
              >
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} — {formatCpm(c.cpmRate)}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Video URL Input */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-ink)] mb-1">
              Link YouTube Shorts Kamu
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/shorts/..."
              className="input text-sm"
              required
            />
          </div>

          {/* Verification Code Box (Section 6.1) */}
          <div className="bg-[var(--color-cream-wash)] p-4 rounded-xl border border-[rgba(17,17,17,0.08)] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--color-ash)]">
                Kode verifikasi kamu untuk campaign ini:
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="btn-pearl py-1 px-2.5 text-xs inline-flex items-center gap-1 rounded-md"
              >
                {copiedCode ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedCode ? "Tersalin!" : "Salin Kode"}</span>
              </button>
            </div>
            <div className="font-mono text-lg font-semibold text-[var(--color-ink)] tracking-wider">
              {verificationCode}
            </div>
            <p className="text-[11px] text-[var(--color-ash)] leading-relaxed">
              Pastikan kode di atas sudah kamu tempelkan di deskripsi video YouTube
              Shorts sebelum menekan tombol submit.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || !videoUrl.trim()}
              className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2"
            >
              <Scissors size={15} />
              <span>Submit & Verifikasi Klip</span>
            </button>
          </div>
        </form>
      )}

      {/* ── LIVE VERIFICATION STATE (Section 6.2) ───────────────── */}
      {activeClipId && !verificationResult && (
        <div className="space-y-6 animate-fade-in-up">
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
          <div className="card p-6 md:p-8 bg-white rounded-2xl border border-[rgba(17,17,17,0.08)] space-y-6 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-mint-green)] text-[#1a4d17] flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-[#1a7f37]">
                  Verifikasi Berhasil
                </span>
                <h3 className="text-xl font-normal text-[var(--color-ink)]">
                  Klip Kamu Disetujui!
                </h3>
              </div>
            </div>

            {/* Quality breakdown */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[var(--color-cream-wash)] rounded-lg text-center">
                <div className="text-[var(--color-ash)]">Kecocokan</div>
                <div className="text-base font-semibold text-[var(--color-ink)] mt-0.5">
                  87%
                </div>
                <div className="text-[10px] text-[#1a7f37]">Lolos (min 72%)</div>
              </div>
              <div className="p-3 bg-[var(--color-cream-wash)] rounded-lg text-center">
                <div className="text-[var(--color-ash)]">Brand Safety</div>
                <div className="text-base font-semibold text-[var(--color-ink)] mt-0.5">
                  94%
                </div>
                <div className="text-[10px] text-[#1a7f37]">Bebas SARA</div>
              </div>
              <div className="p-3 bg-[var(--color-cream-wash)] rounded-lg text-center">
                <div className="text-[var(--color-ash)]">Pola Views</div>
                <div className="text-base font-semibold text-[var(--color-ink)] mt-0.5">
                  Normal
                </div>
                <div className="text-[10px] text-[#1a7f37]">Organik</div>
              </div>
            </div>

            {/* Arithmetic breakdown per UX2 */}
            <div className="p-4 bg-[var(--color-cream-wash)] rounded-xl space-y-3 text-xs">
              <div className="font-mono text-sm text-[var(--color-ink)] pb-2 border-b border-[rgba(17,17,17,0.06)]">
                52.310 views × Rp 5.000/1.000 ={" "}
                <strong>Rp 261.550 (15,69 USDT)</strong>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--color-ink)] flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-[#1a7f37]" />
                  Cair sekarang (70%):
                </span>
                <span className="font-semibold text-[var(--color-ink)]">
                  10,99 USDT (✓ terkirim)
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--color-ash)] flex items-center gap-1.5">
                  <Clock size={14} className="text-[#9a6700]" />
                  Tertahan (30%):
                </span>
                <span className="font-medium text-[var(--color-ash)]">
                  4,71 USDT (cair 1 Okt, 17:32)
                </span>
              </div>
            </div>

            <div className="text-xs text-[var(--color-ash)] leading-relaxed">
              Sebagian kecil (30%) ditahan 3 hari untuk memastikan views stabil.
              Setelah itu otomatis cair ke akun kamu tanpa bisa dibatalkan oleh pihak mana pun.
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveClipId(null);
                  setVerificationResult(null);
                  setVideoUrl("");
                }}
                className="btn-pearl py-2 px-4 text-xs"
              >
                Submit Klip Lain
              </button>
              <Link
                href="/clipper"
                className="btn-primary py-2 px-4 text-xs inline-flex items-center gap-1.5"
                style={{ textDecoration: "none" }}
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
          <div className="card p-6 md:p-8 bg-white rounded-2xl border border-[rgba(17,17,17,0.08)] space-y-6 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-petal-pink)] text-[#7a1a3a] flex items-center justify-center">
                <AlertTriangle size={24} />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-[#cf222e]">
                  Evaluasi AI
                </span>
                <h3 className="text-xl font-normal text-[var(--color-ink)]">
                  Klip Belum Bisa Disetujui
                </h3>
              </div>
            </div>

            <div className="bg-[#fdeeee] p-4 rounded-xl text-xs space-y-2 text-[#7a1a3a]">
              <div className="font-medium">
                Klip ini tidak cocok dengan video sumber campaign.
              </div>
              <div>Kecocokan semantik: <strong>34%</strong> (minimal 72% diperlukan).</div>
            </div>

            {/* UX3: Mendidik, bukan menuduh */}
            <div className="space-y-2 text-xs text-[var(--color-ink)]">
              <div className="font-medium text-[var(--color-ash)] uppercase tracking-wider text-[11px]">
                Apa yang mungkin terjadi:
              </div>
              <div>• Klip dipotong dari video yang berbeda dengan campaign.</div>
              <div>• Klip terlalu banyak diubah atau diberi dubbing audio lain sehingga tidak lagi mengikuti video sumber.</div>
            </div>

            <div className="space-y-2 text-xs text-[var(--color-ink)]">
              <div className="font-medium text-[var(--color-ash)] uppercase tracking-wider text-[11px]">
                Yang bisa kamu lakukan:
              </div>
              <div>1. Buka kembali video sumber campaign.</div>
              <div>2. Potong langsung bagian menarik dari video itu.</div>
              <div>3. Upload Shorts baru dengan kode di deskripsi dan submit ulang.</div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[rgba(17,17,17,0.06)]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveClipId(null);
                    setVerificationResult(null);
                    setVideoUrl("");
                  }}
                  className="btn-primary py-2 px-4 text-xs"
                >
                  Submit Klip Lain
                </button>
                {selectedCampaign && (
                  <a
                    href={selectedCampaign.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-pearl py-2 px-3 text-xs inline-flex items-center gap-1"
                    style={{ textDecoration: "none" }}
                  >
                    <Play size={12} />
                    <span>Buka Video Sumber</span>
                  </a>
                )}
              </div>

              <button
                type="button"
                onClick={() => setAppealModalOpen(true)}
                className="text-xs text-[var(--color-ash)] hover:text-[var(--color-ink)] underline cursor-pointer bg-transparent border-none p-0"
              >
                Merasa ini keliru? Ajukan banding
              </button>
            </div>
          </div>
        )}

      {/* ── RESULT: PENDING VIEWS (Section 6.5) ─────────────────── */}
      {verificationResult &&
        verificationResult.status === "PENDING_VIEWS" && (
          <div className="card p-6 md:p-8 bg-white rounded-2xl border border-[rgba(17,17,17,0.08)] space-y-5 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-canary-yellow)] text-[#5a4a00] flex items-center justify-center">
                <Clock size={24} />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-[#5a4a00]">
                  Klip Terdaftar
                </span>
                <h3 className="text-xl font-normal text-[var(--color-ink)]">
                  Klip Valid, Tinggal Menunggu Views
                </h3>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[var(--color-ash)]">
                <span>Views saat ini: <strong>412</strong></span>
                <span>Minimum campaign: <strong>1.000 views</strong></span>
              </div>
              <div className="progress-bar w-full">
                <div className="progress-fill" style={{ width: "41%" }} />
              </div>
            </div>

            <p className="text-xs text-[var(--color-ash)] leading-relaxed">
              Klip kamu sudah lolos uji kepemilikan dan konten. Kami memeriksa
              views otomatis setiap 6 jam — kamu tidak perlu melakukan submit
              ulang. Begitu views mencapai 1.000, dana otomatis cair ke saldo kamu.
            </p>

            <div className="pt-2 flex justify-end">
              <Link
                href="/clipper"
                className="btn-primary py-2 px-4 text-xs inline-flex items-center gap-1.5"
                style={{ textDecoration: "none" }}
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
  );
}

export default function ClipperSubmitPage() {
  return (
    <Suspense
      fallback={
        <div className="container-page py-16">
          <div className="h-64 skeleton rounded-2xl" />
        </div>
      }
    >
      <ClipperSubmitContent />
    </Suspense>
  );
}

