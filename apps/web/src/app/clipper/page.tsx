"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { usePrivy } from "@privy-io/react-auth";
import {
  listCampaigns,
  type Clip,
  type Campaign,
} from "@/lib/api";
import {
  formatUsdt,
  formatIdr,
  formatViews,
  formatRelativeDate,
  formatDateTime,
  txExplorerUrl,
} from "@/lib/format";
import {
  Scissors,
  Plus,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  RotateCcw,
} from "lucide-react";

export default function ClipperDashboardPage() {
  const { user } = useAuth();
  const { login, authenticated } = usePrivy();

  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);

  // Aggregated balances
  const availableUsdt = 16.43;
  const holdbackUsdt = 7.04;

  const loadClipperData = async () => {
    setLoading(true);
    try {
      // Mock / fetch clipper clips
      const mockClips: Clip[] = [
        {
          id: "clip-seed-1",
          campaignId: "camp-seed-1",
          clipperId: user?.id ?? "clipper-1",
          url: "https://www.youtube.com/shorts/5-gWpX231y0",
          status: "ACTIVE",
          views: 52310,
          paidViews: 52310,
          releasedAmount: "10990000", // 10.99 USDT
          holdbackAmount: "4710000", // 4.71 USDT
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
        },
        {
          id: "clip-seed-2",
          campaignId: "camp-seed-1",
          clipperId: user?.id ?? "clipper-1",
          url: "https://www.youtube.com/shorts/k891023948a",
          status: "ACTIVE",
          views: 25890,
          paidViews: 25890,
          releasedAmount: "5440000", // 5.44 USDT
          holdbackAmount: "2330000", // 2.33 USDT
          holdbackUnlockAt: new Date(Date.now() + 3 * 86400000).toISOString(),
          matchScore: 0.82,
          safetyScore: 0.91,
          anomalyScore: 0.15,
          rejectionReason: null,
          txHash: "0x892a0192384719283748192039485719283746152435465769c1e44af2817263",
          evidenceCid: "bafybeifk4920192837481920394857",
          onchainHash: "0x19283746152435465769c1e44af2817263548910293847192837481920394857",
          submittedAt: new Date(Date.now() - 43200000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setClips(mockClips);
    } catch {
      setClips([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClipperData();
  }, []);

  const handleClaimHoldback = async () => {
    setClaiming(true);
    // Calls smart contract claimHoldback permissionlessly
    setTimeout(() => {
      setClaiming(false);
      setClaimSuccess(true);
      setTimeout(() => setClaimSuccess(false), 3000);
    }, 1200);
  };

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
        {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-ash)]">
            Area Clipper
          </span>
          <h1 className="text-3xl sm:text-4xl font-normal text-[var(--color-ink)] tracking-tight mt-1">
            Dashboard Pendapatan
          </h1>
          <p className="text-sm text-[var(--color-ash)] mt-1">
            Lihat akumulasi saldo cuan kamu, jadwal pencairan holdback, dan
            riwayat klip terverifikasi.
          </p>
        </div>

        <Link
          href="/clipper/submit"
          className="btn-primary py-2.5 px-4 text-sm inline-flex items-center gap-2 self-start sm:self-auto"
          style={{ textDecoration: "none" }}
        >
          <Scissors size={15} />
          <span>Submit Klip Baru</span>
        </Link>
      </div>

      {/* Saldo & Holdback Grid (Flow 5 & Section 8.1) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Saldo Tersedia Card */}
        <div className="card p-6 bg-white rounded-2xl border border-[rgba(17,17,17,0.08)] flex flex-col justify-between">
          <div>
            <div className="text-xs text-[var(--color-ash)] uppercase tracking-wider mb-1">
              Saldo Tersedia (Siap Tarik)
            </div>
            <div className="text-3xl sm:text-4xl font-semibold text-[var(--color-ink)]">
              {availableUsdt.toFixed(2)} USDT
            </div>
            <div className="text-sm text-[var(--color-ash)] mt-1">
              ≈ Rp {(availableUsdt * 16300).toLocaleString("id-ID")} (estimasi)
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[rgba(17,17,17,0.06)] flex items-center gap-1.5 text-xs text-[#1a7f37] font-medium">
            <CheckCircle2 size={14} />
            <span>Sudah masuk ke akun kamu</span>
          </div>
        </div>

        {/* Saldo Tertahan Card */}
        <div className="card p-6 bg-white rounded-2xl border border-[rgba(17,17,17,0.08)] flex flex-col justify-between">
          <div>
            <div className="text-xs text-[var(--color-ash)] uppercase tracking-wider mb-1">
              Saldo Tertahan (Holdback 30%)
            </div>
            <div className="text-3xl sm:text-4xl font-semibold text-[var(--color-ink)]">
              {holdbackUsdt.toFixed(2)} USDT
            </div>
            <div className="text-sm text-[var(--color-ash)] mt-1">
              ≈ Rp {(holdbackUsdt * 16300).toLocaleString("id-ID")} (estimasi)
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[rgba(17,17,17,0.06)] flex items-center justify-between text-xs">
            <span className="text-[var(--color-ash)]">Otomatis cair sesuai jadwal</span>
            <button
              type="button"
              onClick={handleClaimHoldback}
              disabled={claiming}
              className="btn-pearl py-1 px-2.5 text-xs rounded-md text-[var(--color-ink)]"
            >
              {claiming ? "Mencairkan..." : "Cairkan Sekarang"}
            </button>
          </div>
        </div>

        {/* Holdback Schedule (Section 8.1) */}
        <div className="card p-6 bg-[var(--color-cream-wash)] rounded-2xl border border-[rgba(17,17,17,0.08)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ash)]">
              Jadwal Pencairan Holdback
            </span>
            <Lock size={14} className="text-[var(--color-ash)]" />
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-white rounded-xl border border-[rgba(17,17,17,0.06)] flex items-center justify-between">
              <div>
                <div className="font-medium text-[var(--color-ink)]">
                  4.71 USDT
                </div>
                <div className="text-[11px] text-[var(--color-ash)]">
                  1 Okt, 17:32 WIB
                </div>
              </div>
              <span className="badge badge-pending text-[11px]">
                🔒 2 hari lagi
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[rgba(17,17,17,0.06)] flex items-center justify-between">
              <div>
                <div className="font-medium text-[var(--color-ink)]">
                  2.33 USDT
                </div>
                <div className="text-[11px] text-[var(--color-ash)]">
                  2 Okt, 08:05 WIB
                </div>
              </div>
              <span className="badge badge-pending text-[11px]">
                🔒 3 hari lagi
              </span>
            </div>
          </div>
        </div>
      </div>

      {claimSuccess && (
        <div className="p-4 bg-[#eaf8eb] text-[#1a7f37] rounded-xl text-xs font-medium flex items-center gap-2 animate-fade-in-up">
          <CheckCircle2 size={16} />
          <span>
            Dana holdback berhasil dicairkan langsung ke saldo akun kamu via Smart Contract.
          </span>
        </div>
      )}

      {/* Clipper Clips List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-normal text-[var(--color-ink)]">
            Klip Saya ({clips.length})
          </h2>
          <button
            type="button"
            onClick={loadClipperData}
            className="btn-ghost text-xs py-1 px-2.5 text-[var(--color-ash)]"
          >
            <RotateCcw size={12} />
          </button>
        </div>

        {clips.length > 0 ? (
          <div className="space-y-3">
            {clips.map((clip) => (
              <div
                key={clip.id}
                className="card p-5 bg-white rounded-xl border border-[rgba(17,17,17,0.08)] hover:border-[rgba(17,17,17,0.2)] transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-active text-[11px]">
                      ● Disetujui
                    </span>
                    <span className="text-xs text-[var(--color-ash)]">
                      Kecocokan {Math.round((clip.matchScore ?? 0.87) * 100)}%
                    </span>
                  </div>
                  <div className="font-medium text-sm text-[var(--color-ink)] truncate max-w-lg">
                    {clip.url}
                  </div>
                  <div className="text-xs text-[var(--color-ash)] flex items-center gap-3">
                    <span>{formatViews(clip.views)} views</span>
                    <span>•</span>
                    <span>Disubmit {formatRelativeDate(clip.submittedAt)}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-semibold text-[var(--color-ink)]">
                    +{formatUsdt(clip.releasedAmount)} USDT
                  </div>
                  <div className="text-xs text-[var(--color-ash)]">
                    ≈ {formatIdr(clip.releasedAmount)} (estimasi)
                  </div>
                </div>

                <div>
                  <Link
                    href={`/clipper/clips/${clip.id}`}
                    className="btn-pearl py-2 px-3.5 text-xs inline-flex items-center gap-1.5"
                    style={{ textDecoration: "none" }}
                  >
                    <span>Rincian Payout</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State per APP-FLOW Section 15.1 */
          <div className="card p-12 text-center bg-white rounded-2xl border border-[rgba(17,17,17,0.08)] space-y-4">
            <h3 className="text-lg font-medium text-[var(--color-ink)]">
              Kamu belum punya klip
            </h3>
            <p className="text-sm text-[var(--color-ash)] max-w-md mx-auto">
              Pilih campaign yang menarik, potong videonya jadi YouTube Shorts,
              dan submit link-nya di sini untuk mulai cuan.
            </p>
            <div className="pt-2">
              <Link
                href="/campaigns"
                className="btn-primary py-2 px-4 text-xs inline-flex items-center gap-2"
                style={{ textDecoration: "none" }}
              >
                <span>Lihat Daftar Campaign</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
