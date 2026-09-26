"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";

export type IconBadgeVariant =
  | "brand"
  | "emerald"
  | "blue"
  | "amber"
  | "purple"
  | "neutral"
  | "dark"
  | "rose";

export type IconBadgeSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface IconBadgeProps {
  icon?: LucideIcon | React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  children?: React.ReactNode;
  variant?: IconBadgeVariant;
  size?: IconBadgeSize;
  shape?: "squircle" | "circle" | "rounded";
  className?: string;
  style?: React.CSSProperties;
}

const VARIANT_STYLES: Record<
  IconBadgeVariant,
  { bg: string; border: string; color: string; glow?: string }
> = {
  brand: {
    bg: "rgba(232, 64, 13, 0.08)",
    border: "rgba(232, 64, 13, 0.18)",
    color: "#e8400d",
  },
  emerald: {
    bg: "rgba(5, 150, 105, 0.08)",
    border: "rgba(5, 150, 105, 0.18)",
    color: "#059669",
  },
  blue: {
    bg: "rgba(37, 99, 235, 0.08)",
    border: "rgba(37, 99, 235, 0.18)",
    color: "#2563eb",
  },
  amber: {
    bg: "rgba(217, 119, 6, 0.08)",
    border: "rgba(217, 119, 6, 0.18)",
    color: "#d97706",
  },
  purple: {
    bg: "rgba(124, 58, 237, 0.08)",
    border: "rgba(124, 58, 237, 0.18)",
    color: "#7c3aed",
  },
  rose: {
    bg: "rgba(225, 29, 72, 0.08)",
    border: "rgba(225, 29, 72, 0.18)",
    color: "#e11d48",
  },
  neutral: {
    bg: "rgba(17, 17, 17, 0.04)",
    border: "rgba(17, 17, 17, 0.08)",
    color: "#111111",
  },
  dark: {
    bg: "rgba(255, 255, 255, 0.1)",
    border: "rgba(255, 255, 255, 0.15)",
    color: "#ffffff",
  },
};

const SIZE_CONFIG: Record<IconBadgeSize, { box: number; icon: number; radius: string }> = {
  xs: { box: 24, icon: 12, radius: "6px" },
  sm: { box: 30, icon: 14, radius: "8px" },
  md: { box: 38, icon: 18, radius: "10px" },
  lg: { box: 48, icon: 22, radius: "14px" },
  xl: { box: 56, icon: 26, radius: "16px" },
};

export function IconBadge({
  icon: IconComponent,
  children,
  variant = "brand",
  size = "md",
  shape = "squircle",
  className = "",
  style,
}: IconBadgeProps) {
  const v = VARIANT_STYLES[variant] || VARIANT_STYLES.brand;
  const s = SIZE_CONFIG[size] || SIZE_CONFIG.md;

  const borderRadius =
    shape === "circle" ? "9999px" : shape === "rounded" ? "6px" : s.radius;

  return (
    <div
      className={className}
      style={{
        width: `${s.box}px`,
        height: `${s.box}px`,
        borderRadius,
        backgroundColor: v.bg,
        border: `1px solid ${v.border}`,
        color: v.color,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        transition: "all 0.18s ease",
        ...style,
      }}
    >
      {IconComponent ? <IconComponent size={s.icon} /> : children}
    </div>
  );
}
