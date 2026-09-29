"use client";

import { useState, useEffect, useMemo } from "react";
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

function getThematicFallbackCover(campaign: Campaign): string {
  const text = `${campaign.title} ${campaign.description || ""} ${campaign.rules || ""}`.toLowerCase();

  if (
    text.includes("podcast") ||
    text.includes("megan") ||
    text.includes("creator") ||
    text.includes("clipper") ||
    text.includes("interview") ||
    text.includes("bincang") ||
    text.includes("showcase")
  ) {
    return "/assets/blog-cover-clipper.jpg";
  }

  if (
    text.includes("escrow") ||
    text.includes("bnb") ||
    text.includes("contract") ||
    text.includes("solidity") ||
    text.includes("token") ||
    text.includes("defi") ||
    text.includes("dex") ||
    text.includes("swap") ||
    text.includes("finance")
  ) {
    return "/assets/blog-cover-escrow.jpg";
  }

  if (
    text.includes("ai") ||
    text.includes("whisper") ||
    text.includes("vision") ||
    text.includes("gemini") ||
    text.includes("agent") ||
    text.includes("hackathon") ||
    text.includes("trading")
  ) {
    return "/assets/blog-cover-ai.jpg";
  }

  // Deterministic rotation based on campaign id/title
  const hash = (campaign.id || campaign.title || "clipstream")
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const fallbackList = [
    "/assets/blog-cover-escrow.jpg",
    "/assets/blog-cover-clipper.jpg",
    "/assets/blog-cover-ai.jpg",
  ];
  return fallbackList[hash % fallbackList.length];
}

function getCandidateThumbnail(campaign: Campaign): string | null {
  // 1. Explicit top-level thumbnailUrl
  if (campaign.thumbnailUrl && campaign.thumbnailUrl.startsWith("http")) {
    return campaign.thumbnailUrl;
  }

  // 2. Explicit sourceVideo.thumbnailUrl
  if (campaign.sourceVideo?.thumbnailUrl && campaign.sourceVideo.thumbnailUrl.startsWith("http")) {
    return campaign.sourceVideo.thumbnailUrl;
  }

  // 3. Direct videoId from sourceVideo
  const directId = campaign.sourceVideo?.videoId;
  if (
    directId &&
    directId.length === 11 &&
    !directId.includes("0000") &&
    !directId.includes("seed") &&
    directId !== "5-gWpX231y0" &&
    directId !== "k891023948a"
  ) {
    return `https://img.youtube.com/vi/${directId}/hqdefault.jpg`;
  }

  // 4. Extract YouTube ID from sourceUrl
  const url = campaign.sourceUrl || "";
  const ytMatch = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|live\/|watch\?.+&v=))([\w-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    const id = ytMatch[1];
    if (id !== "5-gWpX231y0" && id !== "k891023948a") {
      return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    }
  }

  return null;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const fallbackCover = useMemo(() => getThematicFallbackCover(campaign), [campaign]);
  const initialThumb = useMemo(
    () => getCandidateThumbnail(campaign) || fallbackCover,
    [campaign, fallbackCover]
  );

  const [thumbSrc, setThumbSrc] = useState<string>(initialThumb);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setThumbSrc(getCandidateThumbnail(campaign) || fallbackCover);
    setHasError(false);
  }, [campaign, fallbackCover]);

  const handleImgError = () => {
    if (!hasError && thumbSrc !== fallbackCover) {
      setHasError(true);
      setThumbSrc(fallbackCover);
    }
  };

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
        <img
          src={thumbSrc}
          alt={campaign.title}
          onError={handleImgError}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          className="group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient shadow overlay for legibility */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.4) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Centered Frosted Glass Play Button Action */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "rgba(0, 0, 0, 0.45)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255, 255, 255, 0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
              transition: "transform 0.25s ease, background-color 0.25s ease",
            }}
            className="group-hover:scale-110"
          >
            <Play size={20} fill="#ffffff" color="#ffffff" style={{ marginLeft: "2px" }} />
          </div>
        </div>

        {/* Top-left Video Tag */}
        <div style={{ position: "absolute", top: "0.75rem", left: "0.75rem", zIndex: 2 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "3px 9px",
              borderRadius: "6px",
              backgroundColor: "rgba(0, 0, 0, 0.55)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              color: "#ffffff",
              fontSize: "0.625rem",
              fontWeight: 700,
              letterSpacing: "0.03em",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "#ef4444",
                boxShadow: "0 0 6px #ef4444",
              }}
            />
            HD SOURCE
          </span>
        </div>

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
