"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getClip, type ClipDetail } from "@/lib/api";
import {
  formatCpm,
  formatIdr,
  formatUsdt,
  formatViews,
  formatRelativeDate,
  formatDateTime,
  txExplorerUrl,
} from "@/lib/format";
import { PayoutBreakdown } from "@/components/PayoutBreakdown";
import { EvidenceViewer } from "@/components/EvidenceViewer";
import { AppealModal } from "@/components/AppealModal";
import { ViewGrowthChart } from "@/components/ViewGrowthChart";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export default function ClipperClipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [clip, setClip] = useState<ClipDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [appealModalOpen, setAppealModalOpen] = useState(false);

  const fetchClip = async () => {
    setLoading(true);
    try {
      const data = await getClip(id);
      setClip(data);
    } catch {
      // Fallback mock for seed clips if API returns 404
      setClip({
        id,
        campaignId: "camp-seed-1",
        clipperId: "0x3f9821a89c02938472199ac2b449102837482910",
        url: "https://www.youtube.com/shorts/5-gWpX231y0",
        status: "ACTIVE",
        views: 78200,
        paidViews: 78200,
        releasedAmount: "16430000", // 16.43 USDT
        holdbackAmount: "7040000", // 7.04 USDT
        holdbackUnlockAt: new Date(Date.now() + 2 * 86400000).toISOString(),
        matchScore: 0.87,
        safetyScore: 0.94,
        anomalyScore: 0.18,
        rejectionReason: null,
        txHash: "0x3b72c91a02938472199ac2b44910283748291023948aae921847192837192834",
        evidenceCid: "bafybeihdwdcefgh4dqkjv67ua4wm",
        onchainHash: "0x9c1e44af28172635489102938471928374819203948571928374615243546576",
        submittedAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
        verificationCode: "CS-42-a9f3c1",
        campaign: {
          id: "camp-seed-1",
          brandId: "0x7a3f89e2c1409d5b8821a719c8f02938472199ac2b",
          title: "Podcast Bincang Teknologi — Ep. 42",
          description: "Cuplikan podcast seputar AI dan teknologi masa depan.",
          sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          rules: "Tanpa SARA. Tanpa klaim medis. Judul harus sesuai isi klip.",
          cpmRate: "306748", // ~Rp 5.000 / 1k views
          totalBudget: "46012269", // 46.15 USDT
          remainingBudget: "37500000",
          maxPayoutPerClip: "9202453", // ~Rp 150.000
          minViews: 1000,
          deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
          status: "ACTIVE",
          onchainId: "42",
          txHash: "0x7a3f89e2c1409d5b8821a719c8f02938472199ac2b",
          createdAt: new Date().toISOString(),
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClip();
  }, [id]);

  if (loading) {
    return (
      <div className="container-page py-12 space-y-6">
        <div className="h-8 w-32 skeleton" />
        <div className="h-96 skeleton rounded-2xl" />
      </div>
    );
  }

  if (!clip) {
    return (
      <div className="container-page py-20 text-center space-y-4">
        <h2 className="text-2xl font-normal text-[var(--color-ink)]">
          Klip tidak ditemukan
        </h2>
        <Link
          href="/clipper"
          className="btn-primary py-2 px-4 text-xs inline-flex items-center gap-2"
          style={{ textDecoration: "none" }}
        >
          <ArrowLeft size={14} />
          <span>Kembali ke Dashboard Clipper</span>
        </Link>
      </div>
    );
  }

  const isApproved = clip.status === "ACTIVE" || clip.status === "SETTLED";
  const isFlagged = clip.status === "FLAGGED";
  const isRejected = clip.status === "REJECTED";

  return (
    <div
      className="am-container"
      style={{
        maxWidth: "60rem",
        margin: "0 auto",
        padding: "7.5rem 1.5rem 4rem",
      }}
    >
      <div className="space-y-8">
        {/* Top Breadcrumb */}
      <div>
        <Link
          href="/clipper"
          className="text-xs text-[var(--color-ash)] hover:text-[var(--color-ink)] inline-flex items-center gap-1.5 transition-colors mb-2"
          style={{ textDecoration: "none" }}
        >
          <ArrowLeft size={14} />
          <span>Kembali ke Dashboard Clipper</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-normal text-[var(--color-ink)]">
              Detail Klip & Payout
            </h1>
            <p className="text-xs text-[var(--color-ash)] mt-1">
              Campaign:{" "}
              <Link
                href={`/campaigns/${clip.campaignId}`}
                className="text-[var(--color-ink)] underline"
              >
                {clip.campaign?.title ?? "Podcast Bincang Teknologi"}
              </Link>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isApproved && (
              <div className="badge badge-active text-xs">
                ● Lolos Verifikasi & Aktif
              </div>
            )}
            {isFlagged && (
              <div className="badge badge-flagged text-xs">
                ⚠ Sedang Ditinjau Brand
              </div>
            )}
            {isRejected && (
              <div className="badge badge-rejected text-xs">
                ✗ Belum Disetujui
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Flagged warning if applicable (Section 8.3) */}
      {isFlagged && (
        <div className="card p-5 bg-[#fff4f2] border border-[#f5b8b0] rounded-xl text-xs space-y-2 text-[#7a1a3a] animate-fade-in-up">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle size={16} />
            <span>Pencairan Holdback Ditunda Sementara</span>
          </div>
          <p className="leading-relaxed">
            Brand meminta peninjauan atas klip ini. Dana yang sudah cair (
            <strong>{formatUsdt(clip.releasedAmount)} USDT</strong>) tetap milik
            kamu dan tidak bisa ditarik kembali secara sepihak oleh smart contract.
            Yang ditinjau hanya dana tertahan (
            <strong>{formatUsdt(clip.holdbackAmount)} USDT</strong>).
          </p>
          <div className="pt-1 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAppealModalOpen(true)}
              className="btn-primary bg-[#7a1a3a] text-xs py-1.5 px-3.5"
            >
              Ajukan Banding
            </button>
          </div>
        </div>
      )}

      {/* Video URL box */}
      <div className="card p-4 bg-white rounded-xl border border-[rgba(17,17,17,0.08)] flex items-center justify-between text-xs">
        <div className="space-y-0.5 truncate max-w-lg">
          <div className="text-[var(--color-ash)]">URL Video YouTube:</div>
          <div className="font-mono text-sm text-[var(--color-ink)] truncate font-medium">
            {clip.url}
          </div>
        </div>
        <a
          href={clip.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-pearl py-1.5 px-3 flex items-center gap-1 text-xs"
          style={{ textDecoration: "none" }}
        >
          <span>Tonton Video</span>
          <ExternalLink size={12} />
        </a>
      </div>

      {/* Full Payout Breakdown per UX2 */}
      {clip.campaign && (
        <PayoutBreakdown
          views={clip.views}
          cpmRate={clip.campaign.cpmRate}
          releasedAmount={clip.releasedAmount}
          holdbackAmount={clip.holdbackAmount}
          holdbackUnlockAt={clip.holdbackUnlockAt}
          txHash={clip.txHash}
        />
      )}

      {/* View Growth Timeline Chart */}
      <ViewGrowthChart
        data={clip.snapshots || []}
        currentViews={clip.views || 52310}
      />

      {/* Milestone History Table (Section 7.2) */}
      <div className="card p-6 bg-white rounded-2xl border border-[rgba(17,17,17,0.08)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[rgba(17,17,17,0.06)]">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-ash)]">
              Siklus Otomatis
            </span>
            <h3 className="text-base font-medium text-[var(--color-ink)] mt-0.5">
              Riwayat Pembayaran Milestone Berulang (Flow 4)
            </h3>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          {/* Milestone 1 */}
          <div className="p-3.5 bg-[var(--color-cream-wash)] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="font-medium text-[var(--color-ink)] flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-[#1a7f37]" />
                <span>Milestone #1 — 52.310 views pertama</span>
              </div>
              <div className="text-[11px] text-[var(--color-ash)]">
                28 Sep 17:32 WIB • Verifikasi ASR + Matching awal
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="font-semibold text-[var(--color-ink)]">
                  +10,99 USDT cair
                </div>
                <div className="text-[11px] text-[var(--color-ash)]">
                  +4,71 USDT tertahan
                </div>
              </div>
              <a
                href="https://testnet.bscscan.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-ash)] hover:text-[var(--color-ink)]"
                title="BscScan TX"
              >
                <ExternalLink size={13} />
              </a>
            </div>
          </div>

          {/* Milestone 2 */}
          <div className="p-3.5 bg-[var(--color-cream-wash)] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="font-medium text-[var(--color-ink)] flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-[#1a7f37]" />
                <span>Milestone #2 — 78.200 views (+25.890 naik)</span>
              </div>
              <div className="text-[11px] text-[var(--color-ash)]">
                29 Sep 08:05 WIB • Skip ASR (cache transkrip), recalculate views
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="font-semibold text-[var(--color-ink)]">
                  +5,44 USDT cair
                </div>
                <div className="text-[11px] text-[var(--color-ash)]">
                  +2,33 USDT tertahan
                </div>
              </div>
              <a
                href="https://testnet.bscscan.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-ash)] hover:text-[var(--color-ink)]"
                title="BscScan TX"
              >
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Evidence Viewer */}
      <EvidenceViewer
        evidenceCid={clip.evidenceCid}
        onchainHash={clip.onchainHash}
        matchScore={clip.matchScore}
        safetyScore={clip.safetyScore}
        anomalyScore={clip.anomalyScore}
        verificationCode={clip.verificationCode}
        attestation={clip.evidence}
      />

      {/* Appeal Modal */}
      <AppealModal
        isOpen={appealModalOpen}
        onClose={() => setAppealModalOpen(false)}
        clipId={clip.id}
        clipTitle={clip.url}
        rejectionReason={clip.rejectionReason ?? "Ditinjau oleh brand"}
        onSuccess={() => {
          alert("Banding kamu telah terkirim ke antrean reviewer!");
        }}
      />
      </div>
    </div>
  );
}
