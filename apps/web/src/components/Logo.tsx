"use client";

import React from "react";

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
  const iconBg = isDark ? "#FFFFFF" : "#111111";
  const iconStroke = isDark ? "#111111" : "#FFFFFF";
  const textColor = isDark ? "#FFFFFF" : "#111111";

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
        {/* Squircle Badge */}
        <rect x="1" y="1" width="32" height="32" rx="9" fill={iconBg} />

        {/* Video Camera Icon */}
        <path
          d="M11 12C11 10.8954 11.8954 10 13 10H19C20.1046 10 21 10.8954 21 12V22C21 23.1046 20.1046 24 19 24H13C11.8954 24 11 23.1046 11 22V12Z"
          fill="none"
          stroke={iconStroke}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M21 15L26 11.5V22.5L21 19"
          fill="none"
          stroke={iconStroke}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Brand Text */}
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
