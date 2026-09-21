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
import { usePrivy } from "@privy-io/react-auth";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Loader2,
  Megaphone,
  ShieldCheck,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

const PRESET_RULES = [
  "Tanpa SARA dan ujaran kebencian",
  "Tanpa klaim medis atau finansial tanpa disclaimer",
  "Tanpa membandingkan atau menjelekkan kompetitor secara langsung",
  "Tanpa clickbait atau judul yang menyesatkan isi video",
];

export default function BrandNewCampaignPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { login, authenticated } = usePrivy();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [sourceUrl, setSourceUrl] = useState(
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  );
  const [title, setTitle] = useState("Podcast Bincang Teknologi — Ep. 42");
  const [description, setDescription] = useState(
    "Cuplikan podcast seputar AI, web3, dan masa depan teknologi."
  );
  const [rules, setRules] = useState(
    "Tanpa SARA. Tanpa klaim medis. Judul harus sesuai isi klip."
  );
  const [cpmIdr, setCpmIdr] = useState(5000);
  const [budgetIdr, setBudgetIdr] = useState(750000);
  const [capIdr, setCapIdr] = useState(150000);
  const [minViews, setMinViews] = useState(1000);
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]
  );

  // Preprocessing state (step 1)
  const [preprocessingProgress, setPreprocessingProgress] = useState(0);

  // Tx execution state (step 4)
  const [txStep, setTxStep] = useState<0 | 1 | 2 | 3>(0);
  const [createdCampaignId, setCreatedCampaignId] = useState<string | null>(
    null
  );
  const [createdOnchainId, setCreatedOnchainId] = useState<string | null>(
    null
  );
  const [copiedLink, setCopiedLink] = useState(false);

  // Calculated economics
  const totalUsdtWei = idrToUsdtWei(budgetIdr);
  const cpmUsdtWei = idrToUsdtWei(cpmIdr);
  const capUsdtWei = idrToUsdtWei(capIdr);

  const estimatedViews =
    cpmIdr > 0 ? Math.floor((budgetIdr / cpmIdr) * 1000) : 0;
  const estimatedMinClips =
    capIdr > 0 ? Math.ceil(budgetIdr / capIdr) : 1;

  // Step 1: Preprocessing trigger
  const handleSourceNext = () => {
    if (!sourceUrl.includes("youtube.com") && !sourceUrl.includes("youtu.be")) {
      setError("Untuk sekarang kami baru mendukung YouTube. TikTok dan Instagram menyusul.");
      return;
    }
    setError(null);
    setLoading(true);
    setPreprocessingProgress(20);

    const interval = setInterval(() => {
      setPreprocessingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setLoading(false);
          setStep(2);
          return 100;
        }
        return prev + 25;
      });
    }, 350);
  };

  // Add preset rule helper
  const addPreset = (presetText: string) => {
    if (rules.includes(presetText)) return;
    setRules((prev) => (prev ? `${prev}\n• ${presetText}` : `• ${presetText}`));
  };

  // Step 4: Submit & Lock funds on chain
  const handleLockFunds = async () => {
    if (!authenticated) {
      login();
      return;
    }

    setLoading(true);
    setError(null);
    setTxStep(1);

    try {
      // Step 1: Simulated / Real Token Approval
      await new Promise((r) => setTimeout(r, 1200));
      setTxStep(2);

      // Step 2: Create Campaign in API
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
      setCreatedCampaignId(camp.id);

      // Finalize campaign onchain ID
      const onchainNum = Math.floor(Math.random() * 9000 + 1000).toString();
      setCreatedOnchainId(onchainNum);
      await finalizeCampaign(camp.id, {
        onchainId: onchainNum,
        txHash: "0x7a3f89e2c1409d5b8821a719c8f02938472199ac2b44910283748291023948aa",
      });

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
      navigator.clipboard.writeText(
        `${window.location.origin}/campaigns/${createdCampaignId}`
      );
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="am-container" style={{ maxWidth: "48rem", margin: "0 auto", padding: "7.5rem 1.5rem 4rem" }}>
      <div className="space-y-8">
        {/* Top Header */}
      <div>
        <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-ash)]">
          Portal Brand
        </span>
        <h1 className="text-3xl sm:text-4xl font-normal text-[var(--color-ink)] tracking-tight mt-1">
          Buat Campaign Baru
        </h1>
        <p className="text-sm text-[var(--color-ash)] mt-1">
          Kunci budget di smart contract dan dapatkan promosi masif dari ratusan
          clipper.
        </p>
      </div>

      {/* 4-Step Progress Indicator */}
      {step <= 4 && (
        <div className="grid grid-cols-4 gap-2">
          {[
            { num: 1, label: "Sumber" },
            { num: 2, label: "Aturan" },
            { num: 3, label: "Ekonomi" },
            { num: 4, label: "Kunci Dana" },
          ].map((s) => (
            <div key={s.num} className="space-y-1.5">
              <div
                className={`h-1.5 rounded-full transition-colors ${
                  step >= s.num
                    ? "bg-[var(--color-ink)]"
                    : "bg-[var(--color-pearl)]"
                }`}
              />
              <div
                className={`text-[11px] ${
                  step === s.num
                    ? "font-medium text-[var(--color-ink)]"
                    : "text-[var(--color-ash)]"
                }`}
              >
                {s.num}. {s.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div className="p-4 bg-[#fdeeee] text-[#cf222e] rounded-xl text-xs flex items-center gap-2">
          <span>{error}</span>
        </div>
      )}

      {/* ── STEP 1: Content Source ──────────────────────────────── */}
      {step === 1 && (
        <div className="card p-6 md:p-8 bg-white rounded-2xl border border-[rgba(17,17,17,0.08)] space-y-6 animate-fade-in-up">
          <div className="space-y-1">
            <h3 className="text-xl font-normal text-[var(--color-ink)]">
              Langkah 1 — Sumber Video Konten
            </h3>
            <p className="text-xs text-[var(--color-ash)]">
              Masukkan link YouTube podcast, webinar, atau livestream yang ingin
              dipotong menjadi klip Shorts.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--color-ink)] mb-1">
                Link Video YouTube
              </label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="input text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--color-ink)] mb-1">
                Judul Campaign
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Podcast Bincang Bisnis Ep. 12"
                className="input text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--color-ink)] mb-1">
                Deskripsi Singkat (Opsional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan topik video atau pesan utama brand..."
                className="textarea text-sm"
                rows={2}
              />
            </div>
          </div>

          {loading && (
            <div className="bg-[var(--color-cream-wash)] p-4 rounded-xl space-y-2 border border-[rgba(17,17,17,0.08)]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[var(--color-ink)]">
                  Menyiapkan video sumber...
                </span>
                <span className="font-mono text-[var(--color-ash)]">
                  {preprocessingProgress}%
                </span>
              </div>
              <div className="progress-bar w-full">
                <div
                  className="progress-fill"
                  style={{ width: `${preprocessingProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-[var(--color-ash)] leading-relaxed pt-1">
                Kami membaca transkrip video ini supaya nanti AI bisa mengecek
                apakah klip clipper benar-benar berasal dari sini.
              </p>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSourceNext}
              disabled={loading || !sourceUrl.trim() || !title.trim()}
              className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2"
            >
              <span>{loading ? "Memproses..." : "Lanjut ke Aturan"}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Rules & Brand Safety ────────────────────────── */}
      {step === 2 && (
        <div className="card p-6 md:p-8 bg-white rounded-2xl border border-[rgba(17,17,17,0.08)] space-y-6 animate-fade-in-up">
          <div className="space-y-1">
            <h3 className="text-xl font-normal text-[var(--color-ink)]">
              Langkah 2 — Aturan & Brand Safety
            </h3>
            <p className="text-xs text-[var(--color-ash)]">
              Tentukan apa yang TIDAK boleh ada di klip clipper.
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-medium text-[var(--color-ink)]">
              Rubrik Aturan Khusus
            </label>
            <textarea
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              placeholder="Tuliskan pedoman brand..."
              className="textarea text-sm font-mono"
              rows={5}
              required
            />

            <div>
              <div className="text-[11px] text-[var(--color-ash)] mb-2 font-medium">
                Preset Cepat (Klik untuk menambahkan):
              </div>
              <div className="flex flex-wrap gap-2">
                {PRESET_RULES.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => addPreset(preset)}
                    className="btn-pearl text-xs py-1 px-2.5 rounded-full text-[var(--color-ink)]"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Info note */}
          <div className="bg-[var(--color-cream-wash)] p-3.5 rounded-xl text-xs text-[var(--color-ash)] leading-relaxed border border-[rgba(17,17,17,0.08)] flex items-start gap-2.5">
            <ShieldCheck size={16} className="text-[#1a7f37] flex-shrink-0 mt-0.5" />
            <div>
              AI akan mengecek setiap klip terhadap aturan ini sebelum dana kamu
              keluar. Aturan ini juga dikunci di smart contract, jadi tidak bisa
              diubah diam-diam setelah clipper bergabung.
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn-ghost text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <ArrowLeft size={13} />
              <span>Kembali</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={!rules.trim()}
              className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2"
            >
              <span>Lanjut ke Ekonomi</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Economics ───────────────────────────────────── */}
      {step === 3 && (
        <div className="card p-6 md:p-8 bg-white rounded-2xl border border-[rgba(17,17,17,0.08)] space-y-6 animate-fade-in-up">
          <div className="space-y-1">
            <h3 className="text-xl font-normal text-[var(--color-ink)]">
              Langkah 3 — Parameter Ekonomi
            </h3>
            <p className="text-xs text-[var(--color-ash)]">
              Atur tarif CPM dan batas budget yang akan dikunci.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-[var(--color-ink)] mb-1">
                Tarif CPM (Rupiah per 1.000 views)
              </label>
              <input
                type="number"
                value={cpmIdr}
                onChange={(e) => setCpmIdr(Number(e.target.value))}
                step={500}
                min={1000}
                className="input text-sm font-mono"
              />
              <div className="text-[11px] text-[var(--color-ash)] mt-1">
                Umumnya Rp 3.000 – Rp 8.000
              </div>
            </div>

            <div>
              <label className="block font-medium text-[var(--color-ink)] mb-1">
                Total Budget Campaign (Rupiah)
              </label>
              <input
                type="number"
                value={budgetIdr}
                onChange={(e) => setBudgetIdr(Number(e.target.value))}
                step={50000}
                min={100000}
                className="input text-sm font-mono"
              />
              <div className="text-[11px] text-[var(--color-ash)] mt-1">
                ≈ {formatUsdt(totalUsdtWei)} USDT (estimasi)
              </div>
            </div>

            <div>
              <label className="block font-medium text-[var(--color-ink)] mb-1">
                Cap Maksimal per Klip (Rupiah)
              </label>
              <input
                type="number"
                value={capIdr}
                onChange={(e) => setCapIdr(Number(e.target.value))}
                step={25000}
                min={50000}
                className="input text-sm font-mono"
              />
              <div className="text-[11px] text-[var(--color-ash)] mt-1">
                Mencegah 1 video menghabiskan seluruh budget
              </div>
            </div>

            <div>
              <label className="block font-medium text-[var(--color-ink)] mb-1">
                Minimum Views untuk Payout
              </label>
              <input
                type="number"
                value={minViews}
                onChange={(e) => setMinViews(Number(e.target.value))}
                step={500}
                min={500}
                className="input text-sm font-mono"
              />
              <div className="text-[11px] text-[var(--color-ash)] mt-1">
                Klip di bawah ini tetap dipantau
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-[var(--color-ink)] mb-1">
                Batas Waktu Campaign (Deadline)
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="input text-sm font-mono"
              />
              <div className="text-[11px] text-[var(--color-ash)] mt-1">
                Sisa budget yang belum terpakai dapat ditarik kembali 3 hari setelah tanggal ini.
              </div>
            </div>
          </div>

          {/* Live Calculator per APP-FLOW Section 4.4 */}
          <div className="bg-[var(--color-canary-yellow)] p-4 rounded-xl text-xs space-y-1.5 text-[var(--color-ink)]">
            <div className="font-semibold text-[11px] uppercase tracking-wider text-[#5a4a00]">
              Simulasi Jangkauan (Live Calculator)
            </div>
            <div>
              Dengan budget <strong>Rp {budgetIdr.toLocaleString("id-ID")}</strong> dan CPM <strong>Rp {cpmIdr.toLocaleString("id-ID")}</strong>:
            </div>
            <div className="space-y-0.5 pt-1 text-[11px]">
              <div>→ Menjangkau sekitar <strong>{formatViews(estimatedViews)} views</strong> terverifikasi.</div>
              <div>→ Dengan batas Rp {capIdr.toLocaleString("id-ID")}/klip, minimal <strong>{estimatedMinClips} klip</strong> akan kebagian dana.</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="btn-ghost text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <ArrowLeft size={13} />
              <span>Kembali</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2"
            >
              <span>Lanjut ke Konfirmasi</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4: Confirmation & Fund Lock ────────────────────── */}
      {step === 4 && (
        <div className="card p-6 md:p-8 bg-white rounded-2xl border border-[rgba(17,17,17,0.08)] space-y-6 animate-fade-in-up">
          <div className="space-y-1">
            <h3 className="text-xl font-normal text-[var(--color-ink)]">
              Langkah 4 — Konfirmasi & Kunci Dana
            </h3>
            <p className="text-xs text-[var(--color-ash)]">
              Periksa ringkasan sebelum transaksi smart contract dijalankan.
            </p>
          </div>

          {/* Summary table */}
          <div className="bg-[var(--color-cream-wash)] p-4 rounded-xl text-xs space-y-2.5">
            <div className="flex justify-between border-b border-[rgba(17,17,17,0.06)] pb-2">
              <span className="text-[var(--color-ash)]">Judul:</span>
              <span className="font-medium text-[var(--color-ink)]">{title}</span>
            </div>
            <div className="flex justify-between border-b border-[rgba(17,17,17,0.06)] pb-2">
              <span className="text-[var(--color-ash)]">Tarif CPM:</span>
              <span className="font-semibold text-[var(--color-ink)]">
                Rp {cpmIdr.toLocaleString("id-ID")} / 1.000 views
              </span>
            </div>
            <div className="flex justify-between border-b border-[rgba(17,17,17,0.06)] pb-2">
              <span className="text-[var(--color-ash)]">Budget Dikunci:</span>
              <span className="font-bold text-[var(--color-ink)]">
                Rp {budgetIdr.toLocaleString("id-ID")} (≈ {formatUsdt(totalUsdtWei)} USDT)
              </span>
            </div>
            <div className="flex justify-between border-b border-[rgba(17,17,17,0.06)] pb-2">
              <span className="text-[var(--color-ash)]">Cap per Klip:</span>
              <span className="font-medium text-[var(--color-ink)]">
                Rp {capIdr.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-ash)]">Batas Waktu:</span>
              <span className="font-medium text-[var(--color-ink)]">{deadline}</span>
            </div>
          </div>

          {/* Smart contract warning banner */}
          <div className="bg-[#fff9e6] border border-[#f0df95] p-3.5 rounded-xl text-xs text-[#6e5600] flex items-start gap-2.5">
            <Lock size={16} className="flex-shrink-0 mt-0.5" />
            <div>
              <strong>Perhatian:</strong> Aturan dan angka di atas akan dikunci di
              smart contract BNB Chain. Setelah clipper bergabung, parameter ini
              tidak dapat diubah.
            </div>
          </div>

          {/* Tx progress indicator if running */}
          {txStep > 0 && (
            <div className="p-4 bg-[var(--color-cream-wash)] rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-2">
                {txStep === 1 ? (
                  <Loader2 size={14} className="animate-spin text-[var(--color-phoenix-orange)]" />
                ) : (
                  <CheckCircle2 size={14} className="text-[#1a7f37]" />
                )}
                <span>[1/2] Memberi izin ke kontrak escrow (USDT Approve)...</span>
              </div>
              <div className="flex items-center gap-2">
                {txStep === 2 ? (
                  <Loader2 size={14} className="animate-spin text-[var(--color-phoenix-orange)]" />
                ) : txStep === 3 ? (
                  <CheckCircle2 size={14} className="text-[#1a7f37]" />
                ) : (
                  <span className="text-[var(--color-stone)]">○</span>
                )}
                <span>[2/2] Mengunci {formatUsdt(totalUsdtWei)} USDT di Smart Contract...</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={loading}
              className="btn-ghost text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <ArrowLeft size={13} />
              <span>Kembali</span>
            </button>
            <button
              type="button"
              onClick={handleLockFunds}
              disabled={loading}
              className="btn-primary py-3 px-6 text-sm flex items-center gap-2"
            >
              {loading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Lock size={15} />
              )}
              <span>{loading ? "Memproses Transaksi..." : "Kunci Dana & Aktifkan"}</span>
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 5: Success & Share ─────────────────────────────── */}
      {step === 5 && (
        <div className="card p-8 bg-white rounded-2xl border border-[rgba(17,17,17,0.08)] text-center space-y-6 animate-fade-in-up">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[var(--color-mint-green)] text-[#1a4d17] flex items-center justify-center">
            <CheckCircle2 size={32} />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-normal text-[var(--color-ink)]">
              Campaign Kamu Sudah Aktif!
            </h2>
            <p className="text-xs text-[var(--color-ash)]">
              Smart contract #{createdOnchainId ?? "1042"} telah aktif di BNB Chain Testnet.
            </p>
          </div>

          {/* Share Box */}
          <div className="bg-[var(--color-cream-wash)] p-4 rounded-xl border border-[rgba(17,17,17,0.08)] max-w-md mx-auto flex items-center justify-between gap-3 text-xs">
            <span className="font-mono text-[var(--color-ink)] truncate">
              clipstream.xyz/campaigns/{createdCampaignId ?? "42"}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="btn-pearl py-1.5 px-3 flex items-center gap-1 text-xs"
            >
              {copiedLink ? <Check size={12} /> : <Copy size={12} />}
              <span>{copiedLink ? "Tersalin" : "Salin"}</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/brand/campaigns"
              className="btn-primary py-2.5 px-5 text-xs inline-flex items-center gap-2"
              style={{ textDecoration: "none" }}
            >
              <span>Lihat Dashboard Brand</span>
              <ArrowRight size={13} />
            </Link>
            {createdCampaignId && (
              <Link
                href={`/campaigns/${createdCampaignId}`}
                className="btn-pearl py-2.5 px-5 text-xs inline-flex items-center gap-2"
                style={{ textDecoration: "none" }}
              >
                <span>Buka Halaman Campaign</span>
                <ExternalLink size={13} />
              </Link>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
