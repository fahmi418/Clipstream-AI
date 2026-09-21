"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listCampaigns, type Campaign } from "@/lib/api";
import {
  formatCpm,
  formatIdr,
  formatUsdt,
  formatViews,
  formatRelativeDate,
  formatDate,
} from "@/lib/format";
import { useAuth } from "@/lib/auth-context";
import {
  Megaphone,
  Plus,
  Users,
  Scissors,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  RotateCcw,
} from "lucide-react";
import { RulesLockBadge } from "@/components/RulesLockBadge";

export default function BrandCampaignsPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBrandCampaigns = async () => {
    setLoading(true);
    try {
      const data = await listCampaigns();
      setCampaigns(data);
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrandCampaigns();
  }, []);

  const totalBudgetWei = campaigns.reduce(
    (acc, c) => acc + BigInt(c.totalBudget),
    BigInt(0)
  );
  const totalClips = campaigns.reduce(
    (acc, c) => acc + (c.clipsCount ?? 0),
    0
  );

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
            Manajemen Brand
          </span>
          <h1 className="text-3xl sm:text-4xl font-normal text-[var(--color-ink)] tracking-tight mt-1">
            Dashboard Campaign Kamu
          </h1>
          <p className="text-sm text-[var(--color-ash)] mt-1">
            Pantau performa klip, views terverifikasi, dan pengeluaran budget
            secara real-time.
          </p>
        </div>

        <Link
          href="/brand/new"
          className="btn-primary py-2.5 px-4 text-sm inline-flex items-center gap-2 self-start sm:self-auto"
          style={{ textDecoration: "none" }}
        >
          <Plus size={16} />
          <span>Buat Campaign Baru</span>
        </Link>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 bg-white rounded-xl border border-[rgba(17,17,17,0.08)]">
          <div className="text-xs text-[var(--color-ash)] uppercase tracking-wider mb-1">
            Campaign Aktif
          </div>
          <div className="text-2xl font-semibold text-[var(--color-ink)]">
            {campaigns.filter((c) => c.status === "ACTIVE").length}
          </div>
          <div className="text-[11px] text-[var(--color-ash)] mt-1">
            dari total {campaigns.length} campaign
          </div>
        </div>

        <div className="card p-5 bg-white rounded-xl border border-[rgba(17,17,17,0.08)]">
          <div className="text-xs text-[var(--color-ash)] uppercase tracking-wider mb-1">
            Total Budget Terkunci
          </div>
          <div className="text-2xl font-semibold text-[var(--color-ink)]">
            {formatUsdt(totalBudgetWei)} USDT
          </div>
          <div className="text-[11px] text-[var(--color-ash)] mt-1">
            ≈ {formatIdr(totalBudgetWei)} (estimasi)
          </div>
        </div>

        <div className="card p-5 bg-white rounded-xl border border-[rgba(17,17,17,0.08)]">
          <div className="text-xs text-[var(--color-ash)] uppercase tracking-wider mb-1">
            Total Klip Masuk
          </div>
          <div className="text-2xl font-semibold text-[var(--color-ink)]">
            {totalClips} Klip
          </div>
          <div className="text-[11px] text-[#1a7f37] mt-1 flex items-center gap-1">
            <ShieldCheck size={12} />
            <span>Verifikasi otomatis oleh AI</span>
          </div>
        </div>
      </div>

      {/* Campaign List Table / Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-normal text-[var(--color-ink)]">
            Daftar Campaign ({campaigns.length})
          </h2>
          <button
            type="button"
            onClick={fetchBrandCampaigns}
            className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1 text-[var(--color-ash)]"
          >
            <RotateCcw size={12} />
            <span>Muat Ulang</span>
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-28 skeleton rounded-xl" />
            ))}
          </div>
        ) : campaigns.length > 0 ? (
          <div className="space-y-3">
            {campaigns.map((camp) => {
              const remainingWei = BigInt(
                camp.remainingBudget ?? camp.totalBudget
              );
              const totalWei = BigInt(camp.totalBudget);
              const usedWei = totalWei - remainingWei;
              const progressPercent =
                totalWei > BigInt(0)
                  ? Number((usedWei * BigInt(100)) / totalWei)
                  : 0;

              return (
                <div
                  key={camp.id}
                  className="card p-5 bg-white rounded-xl border border-[rgba(17,17,17,0.08)] hover:border-[rgba(17,17,17,0.2)] transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      {camp.status === "ACTIVE" ? (
                        <span className="badge badge-active text-[11px]">
                          ● Aktif
                        </span>
                      ) : (
                        <span className="badge badge-ended text-[11px]">
                          Selesai
                        </span>
                      )}
                      <RulesLockBadge
                        onchainId={camp.onchainId}
                        txHash={camp.txHash}
                      />
                    </div>
                    <h3 className="text-base font-medium text-[var(--color-ink)]">
                      {camp.title}
                    </h3>
                    <div className="text-xs text-[var(--color-ash)] flex flex-wrap items-center gap-4">
                      <span>Tarif: {formatCpm(camp.cpmRate)}</span>
                      <span>•</span>
                      <span>
                        Deadline: {formatDate(camp.deadline)} (
                        {formatRelativeDate(camp.deadline)})
                      </span>
                    </div>
                  </div>

                  {/* Budget progress */}
                  <div className="w-full md:w-56 space-y-1.5 text-xs">
                    <div className="flex justify-between text-[var(--color-ash)]">
                      <span>Budget terpakai:</span>
                      <span className="font-semibold text-[var(--color-ink)]">
                        {formatIdr(usedWei)}
                      </span>
                    </div>
                    <div className="progress-bar w-full">
                      <div
                        className="progress-fill"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-[var(--color-ash)] text-right">
                      {progressPercent}% dari {formatIdr(totalWei)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    <Link
                      href={`/brand/campaigns/${camp.id}`}
                      className="btn-primary py-2 px-4 text-xs inline-flex items-center gap-1.5"
                      style={{ textDecoration: "none" }}
                    >
                      <span>Kelola & Audit Klip</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card p-12 text-center bg-white rounded-2xl border border-[rgba(17,17,17,0.08)] space-y-4">
            <h3 className="text-lg font-medium text-[var(--color-ink)]">
              Belum ada campaign
            </h3>
            <p className="text-sm text-[var(--color-ash)] max-w-md mx-auto">
              Buat yang pertama — cukup 4 langkah untuk mengunci budget dan
              memulai promosi masif.
            </p>
            <div className="pt-2">
              <Link
                href="/brand/new"
                className="btn-primary py-2 px-4 text-xs inline-flex items-center gap-2"
                style={{ textDecoration: "none" }}
              >
                <Plus size={14} />
                <span>Buat Campaign Pertama</span>
              </Link>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
