"use client";

import Link from "next/link";
import { type Campaign } from "@/lib/api";
import {
  formatCpm,
  formatIdr,
  formatUsdt,
  formatViews,
  formatRelativeDate,
  truncateAddress,
} from "@/lib/format";
import { Users, Scissors, Clock, ArrowUpRight } from "lucide-react";
import { RulesLockBadge } from "./RulesLockBadge";

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  // Extract YouTube ID for thumbnail
  const ytMatch = campaign.sourceUrl.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/
  );
  const ytId = ytMatch ? ytMatch[1] : null;
  const thumbnailUrl = ytId
    ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
    : null;

  const remainingWei = BigInt(campaign.remainingBudget ?? campaign.totalBudget);
  const totalWei = BigInt(campaign.totalBudget);
  const progressPercent =
    totalWei > BigInt(0)
      ? Number(((totalWei - remainingWei) * BigInt(100)) / totalWei)
      : 0;

  return (
    <div className="card bg-white border border-[rgba(17,17,17,0.08)] rounded-xl overflow-hidden flex flex-col hover:border-[rgba(17,17,17,0.2)] transition-all group">
      {/* Thumbnail area */}
      <div className="relative aspect-video w-full bg-[var(--color-charcoal)] overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={campaign.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-white/50">
            Preview Video
          </div>
        )}

        <div className="absolute top-3 right-3">
          <RulesLockBadge
            onchainId={campaign.onchainId}
            txHash={campaign.txHash}
          />
        </div>

        {campaign.status === "ACTIVE" ? (
          <div className="absolute bottom-3 left-3 badge badge-active text-[11px] shadow-sm">
            ● Aktif
          </div>
        ) : (
          <div className="absolute bottom-3 left-3 badge badge-ended text-[11px]">
            Selesai
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-xs text-[var(--color-ash)] mb-1">
            oleh {truncateAddress(campaign.brandId)}
          </div>
          <h3 className="text-base font-medium text-[var(--color-ink)] line-clamp-2 leading-snug mb-3">
            {campaign.title}
          </h3>

          {/* CPM Highlight — most prominent per UX spec */}
          <div className="bg-[var(--color-cream-wash)] p-3 rounded-lg mb-4">
            <div className="text-[11px] text-[var(--color-ash)] uppercase tracking-wider font-semibold">
              Tarif Clipper
            </div>
            <div className="text-lg font-semibold text-[var(--color-ink)] mt-0.5">
              {formatCpm(campaign.cpmRate)}
            </div>
          </div>

          {/* Meta specs */}
          <div className="space-y-2 text-xs text-[var(--color-ash)] mb-4">
            <div className="flex items-center justify-between">
              <span>Sisa budget:</span>
              <span className="font-medium text-[var(--color-ink)]">
                {formatIdr(remainingWei)} ({formatUsdt(remainingWei)} USDT)
              </span>
            </div>
            <div className="progress-bar w-full">
              <div
                className="progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <span>Min views:</span>
              <span className="font-medium text-[var(--color-ink)]">
                {formatViews(campaign.minViews)} views
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[rgba(17,17,17,0.06)] flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-[var(--color-ash)]">
            <div className="flex items-center gap-1">
              <Users size={13} />
              <span>{campaign.clippersCount ?? 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Scissors size={13} />
              <span>{campaign.clipsCount ?? 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={13} />
              <span>{formatRelativeDate(campaign.deadline)}</span>
            </div>
          </div>

          <Link
            href={`/campaigns/${campaign.id}`}
            className="btn-primary py-1.5 px-3 text-xs font-normal flex items-center gap-1"
            style={{ textDecoration: "none" }}
          >
            <span>Lihat Detail</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
