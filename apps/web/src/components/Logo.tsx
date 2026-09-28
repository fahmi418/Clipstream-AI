"use client";

import React, { useId } from "react";

interface LogoProps {
  theme?: "light" | "dark";
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({
  theme = "light",
  className = "",
  width = 150,
  height = 32,
}: LogoProps) {
  const isDark = theme === "dark";
  const id = useId().replace(/:/g, "");
  const streamGradId = `cs-stream-${id}`;
  const bgGradId = `cs-bg-${id}`;

  const iconBg = isDark ? "#09090b" : "#0f172a";
  const textColor = isDark ? "#FFFFFF" : "#0f172a";

  return (
    <div
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.625rem",
        userSelect: "none",
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 160 34"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        <defs>
          {/* Base Squircle Gradient */}
          <linearGradient id={bgGradId} x1="1" y1="1" x2="33" y2="33" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e1e24" />
            <stop offset="100%" stopColor={iconBg} />
          </linearGradient>

          {/* Kinetic Video Stream Flame Gradient */}
          <linearGradient id={streamGradId} x1="8" y1="26" x2="22" y2="10" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E8400D" />
            <stop offset="50%" stopColor="#FF6B00" />
            <stop offset="100%" stopColor="#FFA800" />
          </linearGradient>
        </defs>

        {/* ── SQUIRCLE BADGE BASE ── */}
        <rect
          x="1"
          y="1"
          width="32"
          height="32"
          rx="9"
          fill={`url(#${bgGradId})`}
        />

        {/* ── THE KINETIC PLAY-STREAM MARK ── */}
        {/* Stream Wave Blade (Left / Kinetic Upward Flow) */}
        <path
          d="M9.5 24 C8.6 24 8 22.4 8.9 21.5 L15.5 13.8 C16 13.2 16.9 13 17.6 13.4 L20.2 15 C20.9 15.5 20.8 16.5 20 17 L12.2 21.2 C11.3 21.7 10.5 22.6 9.5 24 Z"
          fill={`url(#${streamGradId})`}
        />

        {/* Interlocking Forward Play Arrow (Right / Pure White Speed Arrow) */}
        <path
          d="M13.5 9.5 C13.5 8.7 14.4 8.2 15.1 8.7 L25.5 15.8 C26.2 16.3 26.2 17.4 25.5 17.9 L15.1 25 C14.4 25.5 13.5 25 13.5 24.2 V19.8 L21.5 16.8 L13.5 13.8 V9.5 Z"
          fill="#FFFFFF"
        />

        {/* Precision AI Core Node (Luminous Center) */}
        <circle cx="17.2" cy="16.8" r="1.6" fill="#FF5500" />

        {/* ── WORDMARK "ClipStream.ai" ── */}
        <text
          x="42"
          y="23"
          fontFamily="'Labil Grotesk Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontSize="17.5"
          fontWeight="700"
          letterSpacing="-0.4px"
          fill={textColor}
        >
          ClipStream<tspan fill="#e8400d">.ai</tspan>
        </text>
      </svg>
    </div>
  );
}
