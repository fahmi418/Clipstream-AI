"use client";

import { useRouter } from "next/navigation";
import { Scissors, Megaphone, ShieldAlert, X, ArrowRight, CheckCircle2, Zap } from "lucide-react";

interface RoleSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole?: (role: "clipper" | "brand" | "admin") => void;
}

export function RoleSelectModal({ isOpen, onClose, onSelectRole }: RoleSelectModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleChooseRole = (role: "clipper" | "brand" | "admin", route: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("clipstream_user_role", role);
    }
    if (onSelectRole) onSelectRole(role);
    onClose();
    router.push(route);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      {/* Modal Shell — clean white */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#ffffff",
          border: "1px solid rgba(17,17,17,0.08)",
          borderRadius: "24px",
          maxWidth: "660px",
          width: "100%",
          overflow: "hidden",
          boxShadow: "0 32px 72px -12px rgba(0,0,0,0.18), 0 0 0 1px rgba(17,17,17,0.04)",
          position: "relative",
        }}
      >
        {/* Subtle top gradient accent strip */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: "linear-gradient(90deg, #e8400d 0%, #f59e0b 50%, #10b981 100%)",
          }}
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          style={{
            position: "absolute",
            top: "18px",
            right: "18px",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            background: "rgba(17,17,17,0.05)",
            border: "1px solid rgba(17,17,17,0.08)",
            color: "rgba(17,17,17,0.45)",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(17,17,17,0.09)";
            e.currentTarget.style.color = "#111";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(17,17,17,0.05)";
            e.currentTarget.style.color = "rgba(17,17,17,0.45)";
          }}
        >
          <X size={15} />
        </button>

        {/* Content */}
        <div style={{ padding: "2.25rem 2rem 1.75rem" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            {/* Eyebrow */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "4px 12px",
                borderRadius: "9999px",
                background: "#fff5f2",
                border: "1px solid rgba(232,64,13,0.15)",
                marginBottom: "0.875rem",
              }}
            >
              <Zap size={11} style={{ color: "#e8400d" }} />
              <span
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  letterSpacing: "1.2px",
                  textTransform: "uppercase",
                  color: "#e8400d",
                }}
              >
                Pilih Akses Portal
              </span>
            </div>

            <h3
              style={{
                fontSize: "clamp(1.5rem, 4vw, 2rem)",
                fontWeight: 700,
                color: "#111111",
                letterSpacing: "-0.03em",
                lineHeight: 1.2,
                margin: "0 0 0.5rem",
              }}
            >
              Selamat Datang di ClipStream AI
            </h3>
            <p style={{ fontSize: "0.875rem", color: "rgba(17,17,17,0.5)", margin: 0, lineHeight: 1.5 }}>
              Pilih peranmu untuk masuk ke dashboard yang sesuai
            </p>
          </div>

          {/* 3 Role Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "0.75rem",
              marginBottom: "1.125rem",
            }}
            className="role-modal-grid"
          >
            <RoleCard
              onClick={() => handleChooseRole("clipper", "/clipper")}
              accentColor="#059669"
              hoverBorder="#059669"
              hoverBg="#f0fdf4"
              iconBg="#ecfdf5"
              badgeBg="#ecfdf5"
              badgeColor="#059669"
              icon={<Scissors size={19} />}
              badge="Creator"
              title="Saya Clipper"
              desc="Potong video, submit ke Shorts/TikTok, dan cairkan USDT otomatis per 1.000 views."
              ctaLabel="Dashboard Clipper"
            />
            <RoleCard
              onClick={() => handleChooseRole("brand", "/brand/campaigns")}
              accentColor="#d97706"
              hoverBorder="#f59e0b"
              hoverBg="#fffbeb"
              iconBg="#fffbeb"
              badgeBg="#fffbeb"
              badgeColor="#d97706"
              icon={<Megaphone size={19} />}
              badge="Sponsor"
              title="Brand / Kreator"
              desc="Kunci budget escrow di BNB Chain dan raih jutaan views viral dari ratusan clipper."
              ctaLabel="Dashboard Brand"
            />
            <RoleCard
              onClick={() => handleChooseRole("admin", "/admin")}
              accentColor="#7c3aed"
              hoverBorder="#8b5cf6"
              hoverBg="#faf5ff"
              iconBg="#f5f3ff"
              badgeBg="#f5f3ff"
              badgeColor="#7c3aed"
              icon={<ShieldAlert size={19} />}
              badge="Protocol"
              title="Superadmin"
              desc="Monitor escrow vault, pipeline AI Whisper & Gemini, serta resolusi sengketa DAO."
              ctaLabel="Portal Admin"
            />
          </div>

          {/* Demo Mode Footer Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.75rem 1rem",
              borderRadius: "12px",
              background: "#f6f5f3",
              border: "1px solid rgba(17,17,17,0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <CheckCircle2 size={14} style={{ color: "#059669", flexShrink: 0 }} />
              <span style={{ fontSize: "0.75rem", color: "rgba(17,17,17,0.5)", lineHeight: 1.4 }}>
                Mode Demo Aktif — bebas berganti peran tanpa kata sandi terpisah.
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleChooseRole("clipper", "/campaigns")}
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#111",
                background: "none",
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
                marginLeft: "12px",
                opacity: 0.7,
                transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
            >
              Lihat Marketplace →
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 560px) {
          .role-modal-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

/* ── Sub-component ─────────────────────────────────────────────── */
interface RoleCardProps {
  onClick: () => void;
  accentColor: string;
  hoverBorder: string;
  hoverBg: string;
  iconBg: string;
  badgeBg: string;
  badgeColor: string;
  icon: React.ReactNode;
  badge: string;
  title: string;
  desc: string;
  ctaLabel: string;
}

function RoleCard({
  onClick,
  accentColor,
  hoverBorder,
  hoverBg,
  iconBg,
  badgeBg,
  badgeColor,
  icon,
  badge,
  title,
  desc,
  ctaLabel,
}: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "1.125rem 1rem",
        textAlign: "left",
        borderRadius: "14px",
        border: "1px solid rgba(17,17,17,0.08)",
        background: "#fafafa",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "all 0.18s ease",
        minHeight: "186px",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.border = `1px solid ${hoverBorder}`;
        el.style.background = hoverBg;
        el.style.transform = "translateY(-2px)";
        el.style.boxShadow = "0 8px 24px rgba(0,0,0,0.07)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.border = "1px solid rgba(17,17,17,0.08)";
        el.style.background = "#fafafa";
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "none";
      }}
    >
      <div>
        {/* Icon */}
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: accentColor,
            marginBottom: "0.75rem",
          }}
        >
          {icon}
        </div>

        {/* Badge */}
        <div
          style={{
            display: "inline-block",
            fontSize: "0.625rem",
            fontWeight: 700,
            letterSpacing: "0.8px",
            textTransform: "uppercase",
            padding: "2px 8px",
            borderRadius: "9999px",
            background: badgeBg,
            color: badgeColor,
            marginBottom: "0.4rem",
          }}
        >
          {badge}
        </div>

        {/* Title */}
        <h4
          style={{
            fontSize: "0.9375rem",
            fontWeight: 700,
            color: "#111111",
            margin: "0 0 0.35rem",
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h4>

        {/* Desc */}
        <p style={{ fontSize: "0.75rem", color: "rgba(17,17,17,0.5)", margin: 0, lineHeight: 1.55 }}>
          {desc}
        </p>
      </div>

      {/* CTA Row */}
      <div
        style={{
          marginTop: "0.875rem",
          paddingTop: "0.75rem",
          borderTop: "1px solid rgba(17,17,17,0.07)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: accentColor }}>{ctaLabel}</span>
        <ArrowRight size={13} style={{ color: accentColor }} />
      </div>
    </button>
  );
}
