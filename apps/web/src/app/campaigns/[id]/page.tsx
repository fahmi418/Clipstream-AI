"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getCampaign,
  getCampaignClips,
  joinCampaign,
  type Campaign,
  type Clip,
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
import { JoinModal } from "@/components/JoinModal";
import { useAuth } from "@/lib/auth-context";
import { usePrivy } from "@privy-io/react-auth";
import {
  ArrowLeft,
  Users,
  Scissors,
  Clock,
  Share2,
  ShieldCheck,
  TrendingUp,
  CheckCircle2,
  ExternalLink,
  Lock,
  Play,
} from "lucide-react";
import Link from "next/link";

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { login, authenticated } = usePrivy();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    Promise.all([
      getCampaign(id).catch(() => null),
      getCampaignClips(id).catch(() => []),
    ]).then(([campData, clipsData]) => {
      if (campData) setCampaign(campData);
      if (clipsData) setClips(clipsData);
      setLoading(false);
    });
  }, [id]);

  const handleJoin = async () => {
    if (!authenticated) {
      login();
      return;
    }

    setJoining(true);
    try {
      const res = await joinCampaign(id);
      setVerificationCode(res.verificationCode);
      setJoinModalOpen(true);
    } catch {
      // Fallback code format if already joined or demo
      const fallbackCode = `CS-${id.slice(0, 4)}-${user?.walletAddress?.slice(-6) ?? "8a9b1c"}`;
      setVerificationCode(fallbackCode);
      setJoinModalOpen(true);
    } finally {
      setJoining(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="am-container" style={{ maxWidth: "69rem", margin: "0 auto", padding: "7.5rem 1.5rem 4rem" }}>
        <div className="space-y-6">
          <div className="h-8 w-32 skeleton" />
          <div className="h-96 skeleton rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="am-container" style={{ maxWidth: "69rem", margin: "0 auto", padding: "7.5rem 1.5rem 4rem" }}>
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-normal text-[var(--color-ink)]">
            Campaign tidak ditemukan
          </h2>
          <p className="text-sm text-[var(--color-ash)]">
            Campaign yang kamu cari mungkin sudah dihapus atau tidak tersedia.
          </p>
          <Link
            href="/campaigns"
            className="btn-primary py-2 px-4 text-xs inline-flex items-center gap-2"
            style={{ textDecoration: "none" }}
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Daftar Campaign</span>
          </Link>
        </div>
      </div>
    );
  }

  // Extract YouTube embed URL
  const ytMatch = campaign.sourceUrl.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/
  );
  const ytId = ytMatch ? ytMatch[1] : null;
  const embedUrl = ytId ? `https://www.youtube.com/embed/${ytId}` : null;

  const remainingWei = BigInt(campaign.remainingBudget ?? campaign.totalBudget);
  const totalWei = BigInt(campaign.totalBudget);
  const progressPercent =
    totalWei > BigInt(0)
      ? Number(((totalWei - remainingWei) * BigInt(100)) / totalWei)
      : 0;

  return (
    <div className="am-container" style={{ maxWidth: "69rem", margin: "0 auto", padding: "7.5rem 1.5rem 4rem" }}>
      <div className="space-y-10">
      {/* Top breadcrumb & share */}
      <div className="flex items-center justify-between">
        <Link
          href="/campaigns"
          className="text-xs text-[var(--color-ash)] hover:text-[var(--color-ink)] inline-flex items-center gap-1.5 transition-colors"
          style={{ textDecoration: "none" }}
        >
          <ArrowLeft size={14} />
          <span>Kembali ke Campaign</span>
        </Link>

        <div className="flex items-center gap-3">
          <RulesLockBadge
            onchainId={campaign.onchainId}
            txHash={campaign.txHash}
          />
          <button
            type="button"
            onClick={handleShare}
            className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5 border border-[rgba(17,17,17,0.08)]"
          >
            <Share2 size={13} />
            <span>{copiedLink ? "Link Tersalin!" : "Bagikan"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Video + Header + Action */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Video & Rules */}
        <div className="lg:col-span-2 space-y-8">
          {/* Video Container (16:9 black box) */}
          <div className="card bg-black rounded-2xl overflow-hidden aspect-video shadow-lg relative">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={campaign.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/50 text-sm">
                Video Sumber: {campaign.sourceUrl}
              </div>
            )}
          </div>

          {/* Title & Description */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-[var(--color-ash)]">
              <span>oleh {truncateAddress(campaign.brandId)}</span>
              <span>•</span>
              <span>Dibuat {formatDate(campaign.createdAt)}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-normal text-[var(--color-ink)] leading-snug">
              {campaign.title}
            </h1>
            {campaign.description && (
              <p className="text-sm text-[var(--color-ash)] leading-relaxed">
                {campaign.description}
              </p>
            )}
          </div>

          {/* Rules Section with RulesLockBadge */}
          <div className="card p-6 bg-white rounded-2xl border border-[rgba(17,17,17,0.08)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(17,17,17,0.06)]">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#1a7f37]" />
                <h3 className="text-base font-medium text-[var(--color-ink)]">
                  Pedoman & Aturan Campaign
                </h3>
              </div>
              <RulesLockBadge
                onchainId={campaign.onchainId}
                txHash={campaign.txHash}
              />
            </div>

            <div className="text-sm text-[var(--color-ink)] leading-relaxed whitespace-pre-line bg-[var(--color-cream-wash)] p-4 rounded-xl">
              {campaign.rules}
            </div>

            <div className="text-xs text-[var(--color-ash)] flex items-center gap-2 pt-1">
              <Lock size={13} className="flex-shrink-0" />
              <span>
                Aturan ini telah dikunci permanen di smart contract BNB Chain. Brand tidak
                dapat mengubah rubrik atau memotong pembayaran di luar aturan ini.
              </span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Economics & Join CTA */}
        <div className="space-y-6">
          <div className="card p-6 bg-white rounded-2xl border border-[rgba(17,17,17,0.08)] shadow-sm space-y-6 sticky top-24">
            {/* CPM Highlight */}
            <div className="bg-[var(--color-cream-wash)] p-4 rounded-xl text-center">
              <div className="text-xs uppercase tracking-wider font-semibold text-[var(--color-ash)] mb-1">
                Tarif Pembayaran Clipper
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">
                {formatCpm(campaign.cpmRate)}
              </div>
              <div className="text-xs text-[#1a7f37] mt-1 font-medium">
                70% cair langsung • 30% holdback 3 hari
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="space-y-3.5 text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[var(--color-ash)]">
                  <span>Sisa Budget:</span>
                  <span className="font-semibold text-[var(--color-ink)] text-sm">
                    {formatIdr(remainingWei)}
                  </span>
                </div>
                <div className="progress-bar w-full">
                  <div
                    className="progress-fill"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="text-[11px] text-[var(--color-ash)] text-right">
                  dari total {formatUsdt(totalWei)} USDT
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-[rgba(17,17,17,0.06)]">
                <span className="text-[var(--color-ash)]">Cap Maksimal / Klip:</span>
                <span className="font-medium text-[var(--color-ink)]">
                  {formatIdr(campaign.maxPayoutPerClip)} (
                  {formatUsdt(campaign.maxPayoutPerClip)} USDT)
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-[rgba(17,17,17,0.06)]">
                <span className="text-[var(--color-ash)]">Minimum Views:</span>
                <span className="font-medium text-[var(--color-ink)]">
                  {formatViews(campaign.minViews)} views
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-[rgba(17,17,17,0.06)]">
                <span className="text-[var(--color-ash)]">Batas Waktu:</span>
                <span className="font-medium text-[var(--color-ink)]">
                  {formatDate(campaign.deadline)} ({formatRelativeDate(campaign.deadline)})
                </span>
              </div>
            </div>

            {/* Join CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleJoin}
                disabled={joining || campaign.status !== "ACTIVE"}
                className="btn-primary w-full py-3 text-sm font-medium flex items-center justify-center gap-2"
              >
                <Scissors size={16} />
                <span>
                  {campaign.status !== "ACTIVE"
                    ? "Campaign Telah Berakhir"
                    : joining
                    ? "Menyiapkan Kode..."
                    : "Ikut Campaign Sekarang"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Section */}
      <section className="space-y-4 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-ash)]">
              Transparansi Pembayaran
            </span>
            <h2 className="text-2xl font-normal text-[var(--color-ink)] mt-0.5">
              Leaderboard Klip ({clips.length})
            </h2>
          </div>
        </div>

        {clips.length > 0 ? (
          <div className="card bg-white rounded-2xl border border-[rgba(17,17,17,0.08)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--color-cream-wash)] text-[var(--color-ash)] font-medium border-b border-[rgba(17,17,17,0.08)]">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Clipper</th>
                    <th className="py-3 px-4">Views Terverifikasi</th>
                    <th className="py-3 px-4">Kecocokan</th>
                    <th className="py-3 px-4">Total Payout</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(17,17,17,0.05)]">
                  {clips.map((clip, idx) => (
                    <tr key={clip.id} className="hover:bg-[var(--color-cream-wash)] transition-colors">
                      <td className="py-3 px-4 font-mono text-[var(--color-ash)]">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 font-medium text-[var(--color-ink)]">
                        <Link
                          href={`/clippers/${clip.clipperId}`}
                          className="hover:underline text-[var(--color-ink)]"
                        >
                          {truncateAddress(clip.clipperId)}
                        </Link>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium">
                        {formatViews(clip.views)} views
                      </td>
                      <td className="py-3 px-4">
                        {clip.matchScore ? `${Math.round(clip.matchScore * 100)}%` : "—"}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[var(--color-ink)]">
                        {formatUsdt(clip.releasedAmount)} USDT
                        <span className="text-[11px] font-normal text-[var(--color-ash)] ml-1">
                          (≈ {formatIdr(clip.releasedAmount)})
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {clip.status === "ACTIVE" || clip.status === "SETTLED" ? (
                          <span className="badge badge-active">Lolos</span>
                        ) : clip.status === "REJECTED" ? (
                          <span className="badge badge-rejected">Ditolak</span>
                        ) : (
                          <span className="badge badge-pending">{clip.status}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {clip.txHash ? (
                          <a
                            href={txExplorerUrl(clip.txHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--color-ash)] hover:text-[var(--color-ink)] inline-flex items-center gap-1"
                            title="BscScan TX"
                          >
                            <ExternalLink size={13} />
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="card p-8 text-center bg-white rounded-xl border border-[rgba(17,17,17,0.08)] text-xs text-[var(--color-ash)]">
            Belum ada klip yang disubmit untuk campaign ini. Jadilah yang pertama!
          </div>
        )}
      </section>

      {/* Join Modal */}
      {verificationCode && (
        <JoinModal
          isOpen={joinModalOpen}
          onClose={() => setJoinModalOpen(false)}
          campaignId={campaign.id}
          campaignTitle={campaign.title}
          sourceUrl={campaign.sourceUrl}
          verificationCode={verificationCode}
        />
      )}
      </div>
    </div>
  );
}
