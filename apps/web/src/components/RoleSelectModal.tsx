"use client";

import { useRouter } from "next/navigation";
import {
  Scissors,
  Megaphone,
  ShieldAlert,
  X,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  LogIn,
  UserPlus,
} from "lucide-react";

interface RoleSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole?: (role: string) => void;
}

export function RoleSelectModal({ isOpen, onClose }: RoleSelectModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const navigateTo = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(14px)" }}
      onClick={onClose}
    >
      {/* Modal Shell */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#121620",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "24px",
          maxWidth: "720px",
          width: "100%",
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 32px 80px -12px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)",
          position: "relative",
          color: "#ffffff",
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
            width: "34px",
            height: "34px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.6)",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.15)";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            e.currentTarget.style.color = "rgba(255,255,255,0.6)";
          }}
        >
          <X size={16} />
        </button>

        {/* Content */}
        <div style={{ padding: "clamp(1.5rem, 4vw, 2.5rem) clamp(1.25rem, 3vw, 2rem) 1.5rem" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 14px",
                borderRadius: "9999px",
                background: "rgba(232,64,13,0.12)",
                border: "1px solid rgba(232,64,13,0.3)",
                marginBottom: "0.875rem",
              }}
            >
              <Sparkles size={13} style={{ color: "#f97316" }} />
              <span
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  color: "#f97316",
                }}
              >
                Pilih Akses Portal
              </span>
            </div>

            <h3
              style={{
                fontSize: "clamp(1.4rem, 3.5vw, 1.875rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.2,
                margin: "0 0 0.5rem",
              }}
            >
              Mulai Menggunakan Clipstream AI
            </h3>
            <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: 1.5 }}>
              Pilih peran Anda untuk mendaftar akun baru atau masuk ke portal yang sesuai
            </p>
          </div>

          {/* 3 Role Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            {/* Clipper Card */}
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(16,185,129,0.25)",
                borderRadius: "18px",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "1rem",
                transition: "all 0.2s",
              }}
            >
              <div>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    background: "rgba(16,185,129,0.15)",
                    border: "1px solid rgba(16,185,129,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#34d399",
                    marginBottom: "0.875rem",
                  }}
                >
                  <Scissors size={20} />
                </div>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: "0.25rem" }}>
                  Clipper / Kreator
                </div>
                <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.45, margin: 0 }}>
                  Potong video, raih views YouTube Shorts & TikTok, dan cairkan reward USDC otomatis.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => navigateTo("/register?role=CLIPPER")}
                  style={{
                    padding: "0.625rem",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                    color: "#fff",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.35rem",
                    boxShadow: "0 4px 12px rgba(16,185,129,0.25)",
                  }}
                >
                  <UserPlus size={14} />
                  <span>Daftar Clipper</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo("/login?role=CLIPPER")}
                  style={{
                    padding: "0.5rem",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.8)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.35rem",
                  }}
                >
                  <LogIn size={13} />
                  <span>Masuk Akun</span>
                </button>
              </div>
            </div>

            {/* Brand Card */}
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(232,64,13,0.25)",
                borderRadius: "18px",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "1rem",
                transition: "all 0.2s",
              }}
            >
              <div>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    background: "rgba(232,64,13,0.15)",
                    border: "1px solid rgba(232,64,13,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#f97316",
                    marginBottom: "0.875rem",
                  }}
                >
                  <Megaphone size={20} />
                </div>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: "0.25rem" }}>
                  Brand / Sponsor
                </div>
                <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.45, margin: 0 }}>
                  Pasang kampanye marketing video dengan verifikasi AI anti-bot dan escrow smart contract.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => navigateTo("/register?role=BRAND")}
                  style={{
                    padding: "0.625rem",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #e8400d 0%, #ea580c 100%)",
                    color: "#fff",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.35rem",
                    boxShadow: "0 4px 12px rgba(232,64,13,0.25)",
                  }}
                >
                  <UserPlus size={14} />
                  <span>Daftar Brand</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo("/login?role=BRAND")}
                  style={{
                    padding: "0.5rem",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.8)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.35rem",
                  }}
                >
                  <LogIn size={13} />
                  <span>Masuk Akun</span>
                </button>
              </div>
            </div>

            {/* Admin Card */}
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(139,92,246,0.25)",
                borderRadius: "18px",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "1rem",
                transition: "all 0.2s",
              }}
            >
              <div>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    background: "rgba(139,92,246,0.15)",
                    border: "1px solid rgba(139,92,246,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#a78bfa",
                    marginBottom: "0.875rem",
                  }}
                >
                  <ShieldAlert size={20} />
                </div>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: "0.25rem" }}>
                  Superadmin
                </div>
                <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.45, margin: 0 }}>
                  Kelola sengketa banding, monitor worker AI queue, dan audit escrow vault.
                </p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => navigateTo("/login?role=ADMIN")}
                  style={{
                    width: "100%",
                    padding: "0.625rem",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)",
                    color: "#fff",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.35rem",
                    boxShadow: "0 4px 12px rgba(139,92,246,0.25)",
                  }}
                >
                  <LogIn size={14} />
                  <span>Portal Admin</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer Info Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.875rem 1.125rem",
              borderRadius: "14px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldCheck size={16} style={{ color: "#10b981", flexShrink: 0 }} />
              <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.4 }}>
                Autentikasi terenkripsi non-custodial & verifikasi AI on-chain
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigateTo("/campaigns")}
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#f97316",
                background: "none",
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span>Jelajahi Kampanye</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
