"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Lock, Sparkles, Home, LogIn, AlertTriangle, UserPlus, ArrowRight } from "lucide-react";
import type { UserRole } from "@/lib/api";

interface AuthGateProps {
  children: ReactNode;
  requiredRole?: "clipper" | "brand" | "admin" | UserRole;
  title?: string;
  description?: string;
}

export function AuthGate({
  children,
  requiredRole,
  title = "Akses Khusus Pengguna Terdaftar",
  description = "Silakan masuk dengan akun atau hubungkan wallet kamu untuk mengakses dashboard performa, analitik earnings, dan pencairan escrow on-chain.",
}: AuthGateProps) {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#f6f5f3]">
        <div className="w-8 h-8 border-3 border-black/10 border-t-[#e8400d] rounded-full animate-spin" />
      </div>
    );
  }

  // Normalize role
  const normalizedRequiredRole: UserRole | undefined =
    requiredRole === "clipper"
      ? "CLIPPER"
      : requiredRole === "brand"
      ? "BRAND"
      : requiredRole === "admin"
      ? "ADMIN"
      : (requiredRole as UserRole | undefined);

  // 1. Not logged in
  if (!isAuthenticated || !user) {
    const registerHref = normalizedRequiredRole
      ? `/register?role=${normalizedRequiredRole}`
      : "/register";
    const loginHref = `/login?redirect=${encodeURIComponent(pathname)}`;

    return (
      <div
        style={{
          minHeight: "calc(100vh - 80px)",
          backgroundColor: "#f6f5f3",
          paddingTop: "7rem",
          paddingBottom: "4.5rem",
          paddingLeft: "1rem",
          paddingRight: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
          fontFamily: "var(--font-inter), sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "460px",
            backgroundColor: "#ffffff",
            borderRadius: "24px",
            border: "1px solid rgba(0, 0, 0, 0.08)",
            boxShadow: "0 20px 50px -10px rgba(0, 0, 0, 0.07)",
            padding: "clamp(1.75rem, 4vw, 2.5rem)",
            textAlign: "center",
            boxSizing: "border-box",
            position: "relative",
          }}
        >
          {/* Subtle top accent */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "2rem",
              right: "2rem",
              height: "3px",
              background: "linear-gradient(90deg, #e8400d 0%, #f59e0b 50%, #10b981 100%)",
              borderRadius: "9999px",
            }}
          />

          {/* Lock icon */}
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "16px",
              backgroundColor: "rgba(232, 64, 13, 0.08)",
              border: "1px solid rgba(232, 64, 13, 0.2)",
              color: "#e8400d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem auto",
            }}
          >
            <Lock size={24} />
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "4px 12px",
              borderRadius: "9999px",
              backgroundColor: "#f5f4f0",
              border: "1px solid rgba(0, 0, 0, 0.06)",
              color: "#666666",
              fontSize: "0.6875rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              marginBottom: "0.75rem",
            }}
          >
            <Sparkles size={11} color="#e8400d" />
            <span>
              {normalizedRequiredRole === "ADMIN"
                ? "Portal Superadmin & DAO"
                : normalizedRequiredRole === "BRAND"
                ? "Portal Manajemen Brand"
                : "Dashboard Clipper"}
            </span>
          </div>

          <h2
            style={{
              fontSize: "1.375rem",
              fontWeight: 700,
              color: "#111111",
              letterSpacing: "-0.025em",
              lineHeight: 1.25,
              margin: "0 0 0.5rem 0",
            }}
          >
            {title}
          </h2>

          <p
            style={{
              fontSize: "0.875rem",
              color: "#666666",
              lineHeight: 1.45,
              margin: "0 0 1.5rem 0",
            }}
          >
            {description}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            <Link
              href={loginHref}
              style={{
                width: "100%",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: "#111111",
                color: "#ffffff",
                fontSize: "0.875rem",
                fontWeight: 600,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxSizing: "border-box",
                transition: "opacity 0.15s ease",
              }}
            >
              <LogIn size={15} />
              <span>Masuk ke Akun</span>
              <ArrowRight size={14} />
            </Link>

            <Link
              href={registerHref}
              style={{
                width: "100%",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: "#f8f7f5",
                border: "1px solid rgba(0, 0, 0, 0.1)",
                color: "#111111",
                fontSize: "0.875rem",
                fontWeight: 600,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxSizing: "border-box",
                transition: "background-color 0.15s ease",
              }}
            >
              <UserPlus size={15} />
              <span>Daftar Akun Baru</span>
            </Link>

            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                fontSize: "0.75rem",
                color: "#888888",
                textDecoration: "none",
                marginTop: "0.5rem",
              }}
            >
              <Home size={13} />
              <span>Kembali ke Halaman Utama</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Role mismatch (admins can access everything)
  const roleMatches =
    !normalizedRequiredRole ||
    user.role === normalizedRequiredRole ||
    user.role === "ADMIN";

  if (!roleMatches) {
    const userDashboard =
      user.role === "BRAND" ? "/brand/campaigns" : "/clipper";
    const requiredLabel =
      normalizedRequiredRole === "BRAND"
        ? "Brand / Sponsor"
        : normalizedRequiredRole === "ADMIN"
        ? "Superadmin"
        : "Clipper";

    return (
      <div
        style={{
          minHeight: "calc(100vh - 80px)",
          backgroundColor: "#f6f5f3",
          paddingTop: "7rem",
          paddingBottom: "4.5rem",
          paddingLeft: "1rem",
          paddingRight: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
          fontFamily: "var(--font-inter), sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "460px",
            backgroundColor: "#ffffff",
            borderRadius: "24px",
            border: "1px solid rgba(0, 0, 0, 0.08)",
            boxShadow: "0 20px 50px -10px rgba(0, 0, 0, 0.07)",
            padding: "clamp(1.75rem, 4vw, 2.5rem)",
            textAlign: "center",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "16px",
              backgroundColor: "#fef3c7",
              border: "1px solid #fde68a",
              color: "#b45309",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem auto",
            }}
          >
            <AlertTriangle size={24} />
          </div>

          <h2
            style={{
              fontSize: "1.375rem",
              fontWeight: 700,
              color: "#111111",
              letterSpacing: "-0.025em",
              lineHeight: 1.25,
              margin: "0 0 0.5rem 0",
            }}
          >
            Peran Tidak Sesuai
          </h2>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#666666",
              lineHeight: 1.45,
              margin: "0 0 1.5rem 0",
            }}
          >
            Anda saat ini masuk sebagai <strong style={{ color: "#111" }}>{user.role}</strong>. Halaman ini khusus untuk peran <strong style={{ color: "#e8400d" }}>{requiredLabel}</strong>.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            <Link
              href={userDashboard}
              style={{
                width: "100%",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: "#111111",
                color: "#ffffff",
                fontSize: "0.875rem",
                fontWeight: 600,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxSizing: "border-box",
              }}
            >
              <span>Buka Dashboard Anda ({user.role})</span>
              <ArrowRight size={14} />
            </Link>

            <Link
              href={`/login?role=${normalizedRequiredRole}`}
              style={{
                width: "100%",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: "#f8f7f5",
                border: "1px solid rgba(0, 0, 0, 0.1)",
                color: "#666666",
                fontSize: "0.8125rem",
                fontWeight: 600,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                boxSizing: "border-box",
              }}
            >
              <span>Ganti Akun ke {requiredLabel}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Fully authorized
  return <>{children}</>;
}
