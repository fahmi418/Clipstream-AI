"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { useAuth } from "@/lib/auth-context";
import { RoleSelectModal } from "@/components/RoleSelectModal";
import { ShieldAlert, Lock, Sparkles, Home, LogIn, AlertTriangle } from "lucide-react";

interface AuthGateProps {
  children: ReactNode;
  requiredRole?: "clipper" | "brand" | "admin";
  title?: string;
  description?: string;
}

export function AuthGate({
  children,
  requiredRole,
  title = "Akses Khusus Pengguna Terdaftar",
  description = "Silakan masuk dengan akun atau hubungkan wallet kamu untuk mengakses dashboard performa, analitik earnings, dan pencairan escrow on-chain.",
}: AuthGateProps) {
  const { authenticated } = usePrivy();
  const { user } = useAuth();
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("clipstream_user_role");
      if (stored) {
        setCurrentRole(stored);
      }
      setIsReady(true);
    }
  }, []);

  // ── Authorization logic ────────────────────────────────────
  // 1. Must be logged in (any role set in localStorage OR privy auth)
  const isLoggedIn = Boolean(authenticated || user || currentRole);

  // 2. If a requiredRole is set, stored role must match (admins can access everything)
  const roleMatches =
    !requiredRole ||
    currentRole === requiredRole ||
    currentRole === "admin";

  if (!isReady) {
    return (
      <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "32px", height: "32px", border: "3px solid #e5e7eb", borderTopColor: "#111", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  // ── Wrong role: logged in but accessing the wrong portal ────
  if (isLoggedIn && !roleMatches) {
    const roleLabel = currentRole === "clipper" ? "Clipper" : currentRole === "brand" ? "Brand" : "Superadmin";
    const roleDashboard = currentRole === "clipper" ? "/clipper" : currentRole === "brand" ? "/brand/campaigns" : "/admin";
    const requiredLabel = requiredRole === "brand" ? "Portal Brand" : requiredRole === "admin" ? "Portal Superadmin" : "Dashboard Clipper";
    return (
      <div
        style={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "4rem 1.5rem",
          background: "#f6f5f3",
        }}
      >
        <div
          style={{
            maxWidth: "28rem",
            width: "100%",
            background: "#fff",
            borderRadius: "20px",
            border: "1px solid rgba(17,17,17,0.08)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
            padding: "2.5rem 2rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "#fef9c3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem",
            }}
          >
            <AlertTriangle size={24} style={{ color: "#ca8a04" }} />
          </div>

          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "#111",
              margin: "0 0 0.5rem",
              letterSpacing: "-0.02em",
            }}
          >
            Akses Ditolak
          </h2>
          <p
            style={{
              fontSize: "0.875rem",
              color: "rgba(17,17,17,0.5)",
              lineHeight: 1.55,
              margin: "0 0 0.5rem",
            }}
          >
            Kamu sedang login sebagai <strong>{roleLabel}</strong>, tapi halaman ini hanya bisa diakses oleh <strong>{requiredLabel}</strong>.
          </p>
          <p style={{ fontSize: "0.8125rem", color: "rgba(17,17,17,0.4)", margin: "0 0 2rem" }}>
            Ganti peran atau kembali ke dashboard kamu.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <Link
              href={roleDashboard}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "7px",
                padding: "11px 20px",
                borderRadius: "10px",
                background: "#111",
                color: "#fff",
                fontWeight: 600,
                fontSize: "0.875rem",
                textDecoration: "none",
              }}
            >
              Ke Dashboard {roleLabel}
            </Link>
            <button
              type="button"
              onClick={() => setShowRoleModal(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "7px",
                padding: "10px 20px",
                borderRadius: "10px",
                border: "1px solid rgba(17,17,17,0.1)",
                background: "#fff",
                color: "#111",
                fontWeight: 500,
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              Ganti Peran
            </button>
          </div>
        </div>

        <RoleSelectModal
          isOpen={showRoleModal}
          onClose={() => setShowRoleModal(false)}
          onSelectRole={(role) => { setCurrentRole(role); setShowRoleModal(false); }}
        />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <div
          style={{
            minHeight: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "4rem 1.5rem",
            backgroundColor: "#ffffff",
          }}
        >
          <div
            style={{
              maxWidth: "32rem",
              width: "100%",
              backgroundColor: "#ffffff",
              borderRadius: "24px",
              border: "1px solid rgba(17,17,17,0.08)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.08)",
              padding: "2.5rem 2rem",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* Lock Badge */}
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "#fff0ec",
                color: "#e8400d",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.25rem",
                boxShadow: "0 4px 14px rgba(232, 64, 13, 0.15)",
              }}
            >
              <Lock size={26} />
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.25rem 0.625rem",
                borderRadius: "9999px",
                backgroundColor: "rgba(17,17,17,0.04)",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "rgba(17,17,17,0.7)",
                marginBottom: "0.75rem",
              }}
            >
              <Sparkles size={13} style={{ color: "#e8400d" }} />
              <span>
                {requiredRole === "admin"
                  ? "Portal Superadmin & DAO"
                  : requiredRole === "brand"
                  ? "Portal Manajemen Brand"
                  : "Dashboard Clipper Terverifikasi"}
              </span>
            </div>

            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#111111",
                marginBottom: "0.5rem",
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </h2>

            <p
              style={{
                fontSize: "0.875rem",
                color: "rgba(17,17,17,0.65)",
                lineHeight: 1.55,
                marginBottom: "2rem",
                maxWidth: "26rem",
              }}
            >
              {description}
            </p>

            {/* Actions */}
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={() => setShowRoleModal(true)}
                className="am-nav-btn"
                style={{
                  width: "100%",
                  height: "44px",
                  backgroundColor: "#111111",
                  color: "#ffffff",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  borderRadius: "9999px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                }}
              >
                <LogIn size={16} />
                <span>Masuk / Pilih Peran Akun</span>
              </button>

              <Link
                href="/"
                className="am-nav-btn is-secondary"
                style={{
                  width: "100%",
                  height: "44px",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  borderRadius: "9999px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  textDecoration: "none",
                }}
              >
                <Home size={15} />
                <span>Kembali ke Halaman Utama</span>
              </Link>
            </div>
          </div>
        </div>

        <RoleSelectModal
          isOpen={showRoleModal}
          onClose={() => setShowRoleModal(false)}
          onSelectRole={(role) => {
            setCurrentRole(role);
            setShowRoleModal(false);
          }}
        />
      </>
    );
  }

  // Fully authorized
  return <>{children}</>;
}
