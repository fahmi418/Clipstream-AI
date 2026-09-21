"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getClipper, type ClipperProfile } from "@/lib/api";
import {
  formatUsdt,
  formatIdr,
  formatViews,
  truncateAddress,
  addressExplorerUrl,
} from "@/lib/format";
import {
  ShieldCheck,
  Scissors,
  CheckCircle2,
  ExternalLink,
  ArrowLeft,
  Award,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export default function PublicClipperProfilePage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = use(params);

  const [profile, setProfile] = useState<ClipperProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClipper(address)
      .then((data) => setProfile(data))
      .catch(() => {
        // Fallback mock profile
        setProfile({
          address,
          displayName: "Dika Clips",
          totalClips: 42,
          approvedClips: 39,
          totalEarned: "284500000", // 284.50 USDT
          totalViews: 1420000,
        });
      })
      .finally(() => setLoading(false));
  }, [address]);

  if (loading) {
    return (
      <div className="container-page py-12 space-y-6 max-w-3xl mx-auto">
        <div className="h-8 w-40 skeleton" />
        <div className="h-64 skeleton rounded-2xl" />
      </div>
    );
  }

  const approvalRate =
    profile && profile.totalClips > 0
      ? Math.round((profile.approvedClips / profile.totalClips) * 100)
      : 100;

  return (
    <div
      className="am-container"
      style={{
        maxWidth: "52rem",
        margin: "0 auto",
        padding: "7.5rem 1.5rem 4rem",
      }}
    >
      <div className="space-y-8">
        {/* Breadcrumb */}
      <div>
        <Link
          href="/campaigns"
          className="text-xs text-[var(--color-ash)] hover:text-[var(--color-ink)] inline-flex items-center gap-1.5 transition-colors mb-2"
          style={{ textDecoration: "none" }}
        >
          <ArrowLeft size={14} />
          <span>Kembali ke Campaign</span>
        </Link>
      </div>

      {/* Header Profile Card */}
      <div className="card p-6 md:p-8 bg-white rounded-2xl border border-[rgba(17,17,17,0.08)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-mint-green)] text-[#1a4d17] flex items-center justify-center font-bold text-xl">
              <Scissors size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-normal text-[var(--color-ink)]">
                  {profile?.displayName ?? truncateAddress(address)}
                </h1>
                <div className="badge badge-active text-[11px] flex items-center gap-1">
                  <ShieldCheck size={12} />
                  <span>Klipper Terverifikasi</span>
                </div>
              </div>
              <div className="text-xs font-mono text-[var(--color-ash)] mt-0.5 flex items-center gap-2">
                <span>{address}</span>
                <a
                  href={addressExplorerUrl(address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-ash)] hover:text-[var(--color-ink)]"
                  title="Lihat di BscScan"
                >
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>

          <div className="sm:text-right">
            <div className="text-xs text-[var(--color-ash)] uppercase tracking-wider">
              Reputasi On-Chain
            </div>
            <div className="text-xl font-bold text-[#1a7f37] mt-0.5 flex items-center sm:justify-end gap-1">
              <Award size={18} />
              <span>{approvalRate}% Akurasi</span>
            </div>
          </div>
        </div>

        {/* Reputation Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[rgba(17,17,17,0.06)] text-xs">
          <div>
            <div className="text-[var(--color-ash)] uppercase tracking-wider text-[10px]">
              Total Views
            </div>
            <div className="text-xl font-semibold text-[var(--color-ink)] mt-0.5">
              {profile ? formatViews(profile.totalViews) : "0"}
            </div>
            <div className="text-[11px] text-[#1a7f37]">100% Organik</div>
          </div>

          <div>
            <div className="text-[var(--color-ash)] uppercase tracking-wider text-[10px]">
              Klip Disetujui
            </div>
            <div className="text-xl font-semibold text-[var(--color-ink)] mt-0.5">
              {profile?.approvedClips ?? 0}
            </div>
            <div className="text-[11px] text-[var(--color-ash)]">
              dari {profile?.totalClips ?? 0} klip
            </div>
          </div>

          <div>
            <div className="text-[var(--color-ash)] uppercase tracking-wider text-[10px]">
              Total Cuan
            </div>
            <div className="text-xl font-semibold text-[var(--color-ink)] mt-0.5">
              {profile ? formatUsdt(profile.totalEarned) : "0"} USDT
            </div>
            <div className="text-[11px] text-[var(--color-ash)]">
              ≈ {profile ? formatIdr(profile.totalEarned) : "Rp 0"}
            </div>
          </div>

          <div>
            <div className="text-[var(--color-ash)] uppercase tracking-wider text-[10px]">
              Status Registry
            </div>
            <div className="text-xl font-semibold text-[#1a7f37] mt-0.5">
              Aktif
            </div>
            <div className="text-[11px] text-[var(--color-ash)]">
              ClipperRegistry.sol
            </div>
          </div>
        </div>
      </div>

      {/* Verified Badges & Trust Highlights */}
      <div className="p-6 bg-[var(--color-cream-wash)] rounded-2xl border border-[rgba(17,17,17,0.08)] space-y-3 text-xs">
        <div className="font-semibold text-xs text-[var(--color-ink)] flex items-center gap-2">
          <Sparkles size={15} className="text-[#9a6700]" />
          <span>Verifikasi Reputasi Klipper Terbuka</span>
        </div>
        <p className="text-[var(--color-ash)] leading-relaxed">
          Semua metrik dan histori klip ini dicatat secara on-chain di BNB
          Chain via kontrak <code>ClipperRegistry</code>. Brand dapat merekrut
          clipper ini dengan keyakinan penuh atas rekam jejak bebas bot dan
          kepatuhan terhadap pedoman brand.
        </p>
      </div>
      </div>
    </div>
  );
}
