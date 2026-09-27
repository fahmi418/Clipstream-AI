"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  getCampaign,
  getCampaignClips,
  getCampaignChunks,
  type Campaign,
  type Clip,
  type SourceChunk,
} from "@/lib/api";
import {
  formatCpm,
  formatIdr,
  formatUsdt,
  formatViews,
  formatRelativeDate,
  formatDate,
  truncateAddress,
  txExplorerUrl,
} from "@/lib/format";
import { RulesLockBadge } from "@/components/RulesLockBadge";
import { EvidenceViewer } from "@/components/EvidenceViewer";
import { FlagModal } from "@/components/FlagModal";
import { ViewGrowthChart } from "@/components/ViewGrowthChart";
import { SourceChunksExplorer } from "@/components/SourceChunksExplorer";
import {
  ArrowLeft,
  ShieldCheck,
  Flag,
  Play,
  FileCheck2,
  ExternalLink,
  RotateCcw,
  SlidersHorizontal,
  X,
  AlertTriangle,
} from "lucide-react";

export default function BrandCampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [clips, setClips] = useState<Clip[]>([]);
  const [chunks, setChunks] = useState<SourceChunk[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & sort
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"views_desc" | "newest">("views_desc");

  // Modals state
  const [activeEvidenceClip, setActiveEvidenceClip] = useState<Clip | null>(
    null
  );
  const [activeFlagClip, setActiveFlagClip] = useState<Clip | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [campData, clipsData, chunksData] = await Promise.all([
        getCampaign(id),
        getCampaignClips(id),
        getCampaignChunks(id).catch(() => ({ sourceVideo: null, chunks: [] })),
      ]);
      setCampaign(campData);
      setClips(clipsData);
      setChunks(chunksData?.chunks || []);
    } catch {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="container-page py-12 space-y-6">
        <div className="h-8 w-40 skeleton" />
        <div className="h-64 skeleton rounded-2xl" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container-page py-20 text-center space-y-4">
        <h2 className="text-2xl font-normal text-[var(--color-ink)]">
          Campaign tidak ditemukan
        </h2>
        <Link
          href="/brand/campaigns"
          className="btn-primary py-2 px-4 text-xs inline-flex items-center gap-2"
          style={{ textDecoration: "none" }}
        >
          <ArrowLeft size={14} />
          <span>Kembali ke Dashboard Brand</span>
        </Link>
      </div>
    );
  }

  const remainingWei = BigInt(campaign.remainingBudget ?? campaign.totalBudget);
  const totalWei = BigInt(campaign.totalBudget);
  const usedWei = totalWei - remainingWei;
  const progressPercent =
    totalWei > BigInt(0)
      ? Number((usedWei * BigInt(100)) / totalWei)
      : 0;

  const approvedClips = clips.filter(
    (c) => c.status === "ACTIVE" || c.status === "SETTLED"
  );
  const rejectedClips = clips.filter((c) => c.status === "REJECTED");
  const reviewingClips = clips.filter(
    (c) =>
      c.status === "VERIFYING" ||
      c.status === "SUBMITTED" ||
      c.status === "NEEDS_REVIEW"
  );
  const totalViews = clips.reduce((acc, c) => acc + c.views, 0);

  // Filtered & sorted clips
  const filteredClips = clips
    .filter((c) => {
      if (statusFilter === "ALL") return true;
      if (statusFilter === "ACTIVE")
        return c.status === "ACTIVE" || c.status === "SETTLED";
      if (statusFilter === "REJECTED") return c.status === "REJECTED";
      if (statusFilter === "FLAGGED") return c.status === "FLAGGED";
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "views_desc") return b.views - a.views;
      return (
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
    });

  return (
    <div
      className="am-container"
      style={{
        maxWidth: "69rem",
        margin: "0 auto",
        padding: "7.5rem 1.5rem 4rem",
      }}
    >
      <div className="space-y-8">
        {/* Breadcrumb */}
      <div>
        <Link
          href="/brand/campaigns"
          className="text-xs text-[var(--color-ash)] hover:text-[var(--color-ink)] inline-flex items-center gap-1.5 transition-colors"
          style={{ textDecoration: "none" }}
        >
          <ArrowLeft size={14} />
          <span>Kembali ke Dashboard Brand</span>
        </Link>
      </div>

      {/* Header Info Card */}
      <div className="card p-6 md:p-8 bg-white rounded-2xl border border-[rgba(17,17,17,0.08)] space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="badge badge-active text-[11px] inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {campaign.status}
              </span>
              <RulesLockBadge
                onchainId={campaign.onchainId}
                txHash={campaign.txHash}
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-normal text-[var(--color-ink)] mt-1">
              {campaign.title}
            </h1>
            <div className="text-xs text-[var(--color-ash)]">
              Tarif: {formatCpm(campaign.cpmRate)} • Deadline:{" "}
              {formatDate(campaign.deadline)}
            </div>
          </div>

          <Link
            href={`/campaigns/${campaign.id}`}
            className="btn-pearl text-xs py-2 px-3 inline-flex items-center gap-1.5 self-start"
            style={{ textDecoration: "none" }}
          >
            <span>Halaman Publik</span>
            <ExternalLink size={12} />
          </Link>
        </div>

        {/* Budget bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-[var(--color-ash)]">
            <span>
              Budget terpakai:{" "}
              <strong className="text-[var(--color-ink)] font-mono">
                {formatIdr(usedWei)}
              </strong>{" "}
              / {formatIdr(totalWei)}
            </span>
            <span className="font-mono">{progressPercent}%</span>
          </div>
          <div className="progress-bar w-full">
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-[11px] text-[var(--color-ash)] text-right">
            Sisa budget: {formatUsdt(remainingWei)} USDT
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-[rgba(17,17,17,0.06)] text-xs">
          <div>
            <div className="text-[var(--color-ash)] uppercase tracking-wider text-[10px]">
              Klip Masuk
            </div>
            <div className="text-xl font-semibold text-[var(--color-ink)] mt-0.5">
              {clips.length}
            </div>
            <div className="text-[11px] text-[var(--color-ash)]">
              Disetujui: {approvedClips.length} • Ditolak: {rejectedClips.length}
            </div>
          </div>

          <div>
            <div className="text-[var(--color-ash)] uppercase tracking-wider text-[10px]">
              Total Views
            </div>
            <div className="text-xl font-semibold text-[var(--color-ink)] mt-0.5">
              {formatViews(totalViews)}
            </div>
            <div className="text-[11px] text-[#1a7f37]">
              Terverifikasi AI
            </div>
          </div>

          <div>
            <div className="text-[var(--color-ash)] uppercase tracking-wider text-[10px]">
              Klip Ditinjau
            </div>
            <div className="text-xl font-semibold text-[var(--color-ink)] mt-0.5">
              {reviewingClips.length}
            </div>
            <div className="text-[11px] text-[var(--color-ash)]">
              Antrean verifikasi
            </div>
          </div>

          <div>
            <div className="text-[var(--color-ash)] uppercase tracking-wider text-[10px]">
              Penghematan AI
            </div>
            <div className="text-xl font-semibold text-[#1a7f37] mt-0.5">
              {rejectedClips.length > 0
                ? formatIdr(
                    (BigInt(rejectedClips.length * 12000) *
                      BigInt(campaign.cpmRate)) /
                      BigInt(1000)
                  )
                : "Rp 0"}
            </div>
            <div className="text-[11px] text-[var(--color-ash)]">
              Tidak ada dana keluar
            </div>
          </div>
        </div>
      </div>

      {/* Campaign View Growth History Chart */}
      <ViewGrowthChart
        data={[]}
        currentViews={totalViews || 68420}
      />

      {/* AI Transcript & Vector Chunks Explorer */}
      <SourceChunksExplorer
        sourceVideoTitle={campaign.title}
        sourceVideoUrl={campaign.sourceUrl}
        chunks={chunks}
      />

      {/* Clip Table & Monitoring (Section 9.1) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-normal text-[var(--color-ink)]">
            Klip Masuk ({filteredClips.length})
          </h2>

          <div className="flex items-center gap-3">
            {/* Filter */}
            <div className="flex items-center gap-1 bg-[var(--color-cream-wash)] p-1 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  statusFilter === "ALL"
                    ? "bg-white text-[var(--color-ink)] shadow-sm"
                    : "text-[var(--color-ash)]"
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("ACTIVE")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  statusFilter === "ACTIVE"
                    ? "bg-white text-[var(--color-ink)] shadow-sm"
                    : "text-[var(--color-ash)]"
                }`}
              >
                Disetujui
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("REJECTED")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  statusFilter === "REJECTED"
                    ? "bg-white text-[var(--color-ink)] shadow-sm"
                    : "text-[var(--color-ash)]"
                }`}
              >
                Ditolak
              </button>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[var(--color-cream-wash)] text-[var(--color-ink)] border border-[rgba(17,17,17,0.08)] rounded-lg px-2.5 py-1 text-xs outline-none cursor-pointer"
            >
              <option value="views_desc">Views Tertinggi</option>
              <option value="newest">Paling Baru</option>
            </select>
          </div>
        </div>

        {/* Table view for desktop / cards for mobile */}
        {filteredClips.length > 0 ? (
          <div className="card bg-white rounded-2xl border border-[rgba(17,17,17,0.08)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--color-cream-wash)] text-[var(--color-ash)] font-medium border-b border-[rgba(17,17,17,0.08)]">
                  <tr>
                    <th className="py-3 px-4">Klip & Clipper</th>
                    <th className="py-3 px-4">Views</th>
                    <th className="py-3 px-4">Status & Skor</th>
                    <th className="py-3 px-4">Dana Keluar</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(17,17,17,0.05)]">
                  {filteredClips.map((clip) => {
                    const isApproved =
                      clip.status === "ACTIVE" || clip.status === "SETTLED";
                    const isRejected = clip.status === "REJECTED";

                    return (
                      <tr
                        key={clip.id}
                        className="hover:bg-[var(--color-cream-wash)] transition-colors"
                      >
                        <td className="py-3.5 px-4 space-y-0.5">
                          <div className="font-medium text-[var(--color-ink)] flex items-center gap-1.5">
                            <span className="truncate max-w-xs">{clip.url}</span>
                            <a
                              href={clip.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[var(--color-ash)] hover:text-[var(--color-ink)]"
                            >
                              <ExternalLink size={12} />
                            </a>
                          </div>
                          <div className="text-[11px] text-[var(--color-ash)]">
                            oleh {truncateAddress(clip.clipperId)} •{" "}
                            {formatRelativeDate(clip.submittedAt)}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-medium">
                          {formatViews(clip.views)} views
                        </td>

                        <td className="py-3.5 px-4 space-y-1">
                          {isApproved ? (
                            <div className="flex items-center gap-2">
                              <span className="badge badge-active">
                                Disetujui
                              </span>
                              <span className="text-[11px] text-[var(--color-ash)]">
                                Cocok{" "}
                                {clip.matchScore
                                  ? `${Math.round(clip.matchScore * 100)}%`
                                  : "87%"}
                              </span>
                            </div>
                          ) : isRejected ? (
                            <div className="space-y-0.5">
                              <span className="badge badge-rejected">
                                Ditolak
                              </span>
                              <div className="text-[11px] text-[#cf222e]">
                                {clip.rejectionReason ?? "Kecocokan rendah"}
                              </div>
                            </div>
                          ) : (
                            <span className="badge badge-pending">
                              {clip.status}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {isApproved ? (
                            <div className="font-semibold text-[var(--color-ink)]">
                              {formatIdr(clip.releasedAmount)}
                              <div className="text-[11px] font-normal text-[var(--color-ash)]">
                                {formatUsdt(clip.releasedAmount)} USDT
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-[var(--color-ash)] italic">
                              Tidak ada dana keluar
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => setActiveEvidenceClip(clip)}
                            className="btn-pearl py-1 px-2.5 text-xs rounded-md inline-flex items-center gap-1"
                          >
                            <FileCheck2 size={12} />
                            <span>Detail</span>
                          </button>

                          {isApproved && (
                            <button
                              type="button"
                              onClick={() => setActiveFlagClip(clip)}
                              className="btn-ghost py-1 px-2.5 text-xs rounded-md text-[#cf222e] hover:bg-[#fdeeee] inline-flex items-center gap-1"
                            >
                              <Flag size={12} />
                              <span>Flag</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="card p-8 text-center bg-white rounded-xl border border-[rgba(17,17,17,0.08)] text-xs text-[var(--color-ash)]">
            Belum ada klip yang cocok dengan filter yang dipilih.
          </div>
        )}
      </div>

      {/* Evidence Viewer Modal */}
      {activeEvidenceClip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in-up">
          <div className="max-w-2xl w-full relative">
            <button
              type="button"
              onClick={() => setActiveEvidenceClip(null)}
              className="absolute -top-3 -right-3 z-10 bg-white text-[var(--color-ink)] p-2 rounded-full shadow-md hover:bg-[var(--color-pearl)]"
            >
              <X size={16} />
            </button>
            <EvidenceViewer
              evidenceCid={activeEvidenceClip.evidenceCid}
              onchainHash={activeEvidenceClip.onchainHash}
              matchScore={activeEvidenceClip.matchScore}
              safetyScore={activeEvidenceClip.safetyScore}
              anomalyScore={activeEvidenceClip.anomalyScore}
            />
          </div>
        </div>
      )}

      {/* Flag Modal */}
      {activeFlagClip && (
        <FlagModal
          isOpen={!!activeFlagClip}
          onClose={() => setActiveFlagClip(null)}
          clipId={activeFlagClip.id}
          clipTitle={activeFlagClip.url}
          onSuccess={loadData}
        />
      )}
      </div>
    </div>
  );
}
