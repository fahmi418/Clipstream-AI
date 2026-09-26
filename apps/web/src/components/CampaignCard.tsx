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
import { Users, Scissors, Clock, ArrowRight, Play, Sparkles } from "lucide-react";
import { RulesLockBadge } from "./RulesLockBadge";

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  // Extract YouTube ID for thumbnail
  const ytMatch = campaign.sourceUrl?.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/
  );
  const ytId = ytMatch ? ytMatch[1] : null;
  const thumbnailUrl = ytId
    ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
    : null;

  const remainingWei = BigInt(campaign.remainingBudget ?? campaign.totalBudget ?? 0);
  const totalWei = BigInt(campaign.totalBudget ?? 0);
  const progressPercent =
    totalWei > BigInt(0)
      ? Number(((totalWei - remainingWei) * BigInt(100)) / totalWei)
      : 0;

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "20px",
        border: "1px solid rgba(17, 17, 17, 0.08)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        boxShadow: "0 4px 18px rgba(0, 0, 0, 0.03)",
      }}
      className="hover:-translate-y-1 hover:shadow-xl group"
    >
      {/* Video Preview Poster / Thumbnail */}
      <div
        style={{
          position: "relative",
          aspectRatio: "16 / 9",
          width: "100%",
          backgroundColor: "#161514",
          overflow: "hidden",
        }}
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={campaign.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.35s ease",
            }}
            className="group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #1f1e1d 0%, #2e2c2a 100%)",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "0.5rem",
              }}
            >
              <Play size={20} fill="#ffffff" color="#ffffff" style={{ marginLeft: "2px" }} />
            </div>
            <span style={{ fontSize: "0.75rem", fontWeight: 500 }}>Source Video HD</span>
          </div>
        )}

        {/* Gradient shadow overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />

        {/* Rules lock badge */}
        <div style={{ position: "absolute", top: "0.75rem", right: "0.75rem", zIndex: 2 }}>
          <RulesLockBadge
            onchainId={campaign.onchainId}
            txHash={campaign.txHash}
          />
        </div>

        {/* Status Badge */}
        <div style={{ position: "absolute", bottom: "0.75rem", left: "0.75rem", zIndex: 2 }}>
          {campaign.status === "ACTIVE" ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.25rem 0.625rem",
                borderRadius: "9999px",
                backgroundColor: "#ecfdf5",
                color: "#059669",
                fontSize: "0.6875rem",
                fontWeight: 700,
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              }}
            >
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#059669" }} />
              Bounty Dibuka
            </span>
          ) : (
            <span
              style={{
                padding: "0.25rem 0.625rem",
                borderRadius: "9999px",
                backgroundColor: "rgba(0,0,0,0.6)",
                color: "#ffffff",
                fontSize: "0.6875rem",
                fontWeight: 600,
              }}
            >
              Selesai
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div
        style={{
          padding: "1.25rem",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "space-between",
        }}
      >
        <div>
          {/* Brand sponsor author */}
          <div
            style={{
              fontSize: "0.6875rem",
              fontWeight: 600,
              color: "rgba(17,17,17,0.5)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "0.35rem",
            }}
          >
            Sponsor: {truncateAddress(campaign.brandId || (campaign as any).brand?.address || (campaign as any).brand?.displayName || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8")}
          </div>

          {/* Title */}
          <h3
            style={{
              fontSize: "1.0625rem",
              fontWeight: 600,
              color: "#111111",
              lineHeight: 1.35,
              marginBottom: "0.875rem",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {campaign.title}
          </h3>

          {/* Prominent CPM Highlight Box */}
          <div
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "12px",
              backgroundColor: "#fffdfa",
              border: "1px solid #fef3c7",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#d97706", textTransform: "uppercase" }}>
                Tarif Imbalan Clipper
              </div>
              <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "#111111", marginTop: "2px" }}>
                {formatCpm(campaign.cpmRate)}
              </div>
            </div>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                backgroundColor: "#fef3c7",
                color: "#b45309",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={16} />
            </div>
          </div>

          {/* Budget & Views specs */}
          <div style={{ marginBottom: "1rem", fontSize: "0.75rem", color: "rgba(17,17,17,0.6)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
              <span>Sisa Alokasi Budget:</span>
              <span style={{ fontWeight: 600, color: "#111" }}>
                {formatIdr(remainingWei)} ({formatUsdt(remainingWei)} USDT)
              </span>
            </div>

            {/* Progress bar */}
            <div
              style={{
                height: "6px",
                width: "100%",
                backgroundColor: "rgba(17,17,17,0.06)",
                borderRadius: "9999px",
                overflow: "hidden",
                marginBottom: "0.5rem",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progressPercent}%`,
                  backgroundColor: "#00d084",
                  borderRadius: "9999px",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Syarat Min Views:</span>
              <span style={{ fontWeight: 600, color: "#111" }}>
                {formatViews(campaign.minViews)} views
              </span>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div
          style={{
            paddingTop: "0.875rem",
            borderTop: "1px solid rgba(17,17,17,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              fontSize: "0.75rem",
              color: "rgba(17,17,17,0.5)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }} title="Peserta Clipper">
              <Users size={13} />
              <span>{campaign.clippersCount ?? 0}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }} title="Klip Masuk">
              <Scissors size={13} />
              <span>{campaign.clipsCount ?? 0}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }} title="Batas Waktu">
              <Clock size={13} />
              <span>{formatRelativeDate(campaign.deadline)}</span>
            </div>
          </div>

          <Link
            href={`/campaigns/${campaign.id}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.4rem 0.875rem",
              borderRadius: "9999px",
              backgroundColor: "#111111",
              color: "#ffffff",
              fontSize: "0.75rem",
              fontWeight: 600,
              textDecoration: "none",
              transition: "all 0.15s ease",
            }}
          >
            <span>Ambil Bounty</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
