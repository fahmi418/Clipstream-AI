"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Scissors,
  Megaphone,
  Mail,
  Lock,
  User as UserIcon,
  Wallet,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  ShieldCheck,
  Check,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import type { UserRole } from "@/lib/api";
import { requestAccounts, getInjectedProvider } from "@/lib/wallet-helper";

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlRole = searchParams.get("role") as UserRole | null;

  const { isAuthenticated, user, register, loginWithWallet, isLoading: isAuthLoading } = useAuth();

  // Form State
  const [role, setRole] = useState<UserRole>(urlRole || "CLIPPER");
  const [method, setMethod] = useState<"email" | "wallet">("email");

  // Email form fields
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [optionalWallet, setOptionalWallet] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Wallet form fields
  const [manualWallet, setManualWallet] = useState("");
  const [walletDisplayName, setWalletDisplayName] = useState("");
  const [hasEthereum, setHasEthereum] = useState(false);

  // Status state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as unknown as { ethereum?: unknown }).ethereum) {
      setHasEthereum(true);
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user && !isAuthLoading) {
      if (user.role === "BRAND") {
        router.push("/brand/campaigns");
      } else if (user.role === "ADMIN") {
        router.push("/admin/appeals");
      } else {
        router.push("/clipper");
      }
    }
  }, [isAuthenticated, user, isAuthLoading, router]);

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg("Email dan kata sandi wajib diisi.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Kata sandi minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    if (optionalWallet && !/^0x[a-fA-F0-9]{40}$/.test(optionalWallet.trim())) {
      setErrorMsg("Format wallet address tidak valid. Harus format EVM (0x...)");
      return;
    }

    try {
      setLoading(true);
      const newUser = await register({
        email: email.trim().toLowerCase(),
        password,
        role,
        displayName: displayName.trim() || undefined,
        walletAddress: optionalWallet.trim() || undefined,
      });

      setSuccessMsg(`Pendaftaran berhasil! Selamat datang, ${newUser.displayName}!`);
      setTimeout(() => {
        if (role === "BRAND") {
          router.push("/brand/campaigns");
        } else {
          router.push("/clipper");
        }
      }, 600);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mendaftar. Silakan coba lagi.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleWalletRegister = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      setLoading(true);
      let address = manualWallet.trim();

      const provider = getInjectedProvider();
      if (provider) {
        const accounts = await requestAccounts();
        if (!accounts || accounts.length === 0) {
          throw new Error("Tidak ada akun Web3 wallet (Trust Wallet / MetaMask) yang dipilih.");
        }
        address = accounts[0];
      } else {
        if (!address) {
          throw new Error("Browser wallet tidak terdeteksi. Silakan masukkan alamat wallet EVM publik Anda di bawah.");
        }
      }

      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        throw new Error("Format wallet tidak valid. Harus alamat EVM (0x...)");
      }

      const loggedUser = await loginWithWallet({
        walletAddress: address,
        role,
        displayName: walletDisplayName.trim() || undefined,
      });

      setSuccessMsg(`Akun terdaftar dengan wallet ${address.slice(0, 6)}...${address.slice(-4)}`);
      setTimeout(() => {
        if (role === "BRAND") {
          router.push("/brand/campaigns");
        } else {
          router.push("/clipper");
        }
      }, 600);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghubungkan wallet.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 80px)",
        backgroundColor: "#f6f5f3",
        paddingTop: "6.5rem",
        paddingBottom: "4rem",
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
          borderRadius: "20px",
          border: "1px solid rgba(0, 0, 0, 0.08)",
          boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.05)",
          padding: "clamp(1.5rem, 3.5vw, 2.25rem)",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#111111",
              letterSpacing: "-0.025em",
              margin: "0 0 0.35rem 0",
              lineHeight: 1.25,
            }}
          >
            Daftar Akun Baru
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#666666",
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            Pilih peran Anda untuk mulai menggunakan Clipstream.
          </p>
        </div>

        {/* Role Selection */}
        <div style={{ marginBottom: "1.25rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.5rem",
            }}
          >
            <button
              type="button"
              onClick={() => setRole("CLIPPER")}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                padding: "0.75rem 0.875rem",
                borderRadius: "12px",
                border: role === "CLIPPER" ? "2px solid #111111" : "1px solid rgba(0,0,0,0.1)",
                backgroundColor: role === "CLIPPER" ? "#fafafa" : "#ffffff",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", width: "100%", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#111111" }}>
                  Clipper
                </span>
                {role === "CLIPPER" && (
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#111111" }} />
                )}
              </div>
              <span style={{ fontSize: "0.75rem", color: "#666666", marginTop: "2px" }}>
                Kreator &amp; Editor Video
              </span>
            </button>

            <button
              type="button"
              onClick={() => setRole("BRAND")}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                padding: "0.75rem 0.875rem",
                borderRadius: "12px",
                border: role === "BRAND" ? "2px solid #111111" : "1px solid rgba(0,0,0,0.1)",
                backgroundColor: role === "BRAND" ? "#fafafa" : "#ffffff",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", width: "100%", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#111111" }}>
                  Brand
                </span>
                {role === "BRAND" && (
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#111111" }} />
                )}
              </div>
              <span style={{ fontSize: "0.75rem", color: "#666666", marginTop: "2px" }}>
                Sponsor &amp; Pengiklan
              </span>
            </button>
          </div>
        </div>

        {/* Method Toggle */}
        <div style={{ marginBottom: "1.25rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              padding: "3px",
              backgroundColor: "#f0eeea",
              borderRadius: "10px",
              gap: "2px",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMethod("email");
                setErrorMsg(null);
              }}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "0.8125rem",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                transition: "all 0.15s ease",
                backgroundColor: method === "email" ? "#ffffff" : "transparent",
                color: method === "email" ? "#111111" : "#777777",
                boxShadow: method === "email" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
              }}
            >
              Email &amp; Sandi
            </button>

            <button
              type="button"
              onClick={() => {
                setMethod("wallet");
                setErrorMsg(null);
              }}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "0.8125rem",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                transition: "all 0.15s ease",
                backgroundColor: method === "wallet" ? "#ffffff" : "transparent",
                color: method === "wallet" ? "#111111" : "#777777",
                boxShadow: method === "wallet" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
              }}
            >
              Web3 Wallet
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "0.75rem 1rem",
              borderRadius: "12px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              fontSize: "0.8125rem",
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Notification */}
        {successMsg && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "0.75rem 1rem",
              borderRadius: "12px",
              backgroundColor: "#ecfdf5",
              border: "1px solid #a7f3d0",
              color: "#047857",
              fontSize: "0.8125rem",
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form: Email */}
        {method === "email" && (
          <form onSubmit={handleEmailRegister} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#333333", marginBottom: "4px" }}>
                Nama Tampilan / Alias
              </label>
              <div style={{ position: "relative" }}>
                <UserIcon size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#999999" }} />
                <input
                  type="text"
                  placeholder={role === "BRAND" ? "mis. Ethermind Studios" : "mis. Alex Clipper"}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  style={{
                    width: "100%",
                    height: "42px",
                    padding: "0 12px 0 36px",
                    borderRadius: "12px",
                    border: "1px solid rgba(0, 0, 0, 0.14)",
                    backgroundColor: "#ffffff",
                    fontSize: "0.875rem",
                    color: "#111111",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#333333", marginBottom: "4px" }}>
                Alamat Email <span style={{ color: "#e8400d" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#999999" }} />
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    height: "42px",
                    padding: "0 12px 0 36px",
                    borderRadius: "12px",
                    border: "1px solid rgba(0, 0, 0, 0.14)",
                    backgroundColor: "#ffffff",
                    fontSize: "0.875rem",
                    color: "#111111",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#333333", marginBottom: "4px" }}>
                  Kata Sandi <span style={{ color: "#e8400d" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#999999" }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Min. 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: "100%",
                      height: "42px",
                      padding: "0 34px 0 36px",
                      borderRadius: "12px",
                      border: "1px solid rgba(0, 0, 0, 0.14)",
                      backgroundColor: "#ffffff",
                      fontSize: "0.875rem",
                      color: "#111111",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#888",
                      padding: 0,
                    }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#333333", marginBottom: "4px" }}>
                  Konfirmasi Sandi <span style={{ color: "#e8400d" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#999999" }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Ulangi sandi"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      width: "100%",
                      height: "42px",
                      padding: "0 12px 0 36px",
                      borderRadius: "12px",
                      border: "1px solid rgba(0, 0, 0, 0.14)",
                      backgroundColor: "#ffffff",
                      fontSize: "0.875rem",
                      color: "#111111",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
            </div>

            {role === "CLIPPER" ? (
              <div
                style={{
                  padding: "0.625rem 0.875rem",
                  borderRadius: "10px",
                  backgroundColor: "#f8f7f5",
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  fontSize: "0.75rem",
                  color: "#555555",
                  lineHeight: 1.4,
                }}
              >
                Saldo reward video dapat ditarik langsung ke DANA, GoPay, atau Rekening Bank.
              </div>
            ) : (
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#333333", marginBottom: "4px" }}>
                  Alamat Wallet EVM Brand (Opsional)
                </label>
                <div style={{ position: "relative" }}>
                  <Wallet size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#999999" }} />
                  <input
                    type="text"
                    placeholder="0x... (untuk escrow dana kampanye)"
                    value={optionalWallet}
                    onChange={(e) => setOptionalWallet(e.target.value)}
                    style={{
                      width: "100%",
                      height: "42px",
                      padding: "0 12px 0 36px",
                      borderRadius: "12px",
                      border: "1px solid rgba(0, 0, 0, 0.14)",
                      backgroundColor: "#ffffff",
                      fontSize: "0.875rem",
                      color: "#111111",
                      outline: "none",
                      boxSizing: "border-box",
                      fontFamily: "monospace",
                    }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "0.35rem",
                width: "100%",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: "#111111",
                color: "#ffffff",
                fontSize: "0.875rem",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "opacity 0.15s ease",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <span>Daftar Akun</span>
              )}
            </button>
          </form>
        )}

        {/* Form: Web3 Wallet */}
        {method === "wallet" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#333333", marginBottom: "4px" }}>
                Nama Tampilan / Alias (Opsional)
              </label>
              <div style={{ position: "relative" }}>
                <UserIcon size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#999999" }} />
                <input
                  type="text"
                  placeholder="mis. Satoshi Clipper"
                  value={walletDisplayName}
                  onChange={(e) => setWalletDisplayName(e.target.value)}
                  style={{
                    width: "100%",
                    height: "42px",
                    padding: "0 12px 0 36px",
                    borderRadius: "12px",
                    border: "1px solid rgba(0, 0, 0, 0.14)",
                    backgroundColor: "#ffffff",
                    fontSize: "0.875rem",
                    color: "#111111",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {hasEthereum ? (
              <div>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleWalletRegister}
                  style={{
                    width: "100%",
                    height: "46px",
                    borderRadius: "12px",
                    backgroundColor: "#111111",
                    color: "#ffffff",
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
                    transition: "all 0.15s ease",
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Wallet size={16} />
                      <span>Hubungkan & Daftar dengan Wallet Browser</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
                <div style={{ textAlign: "center", fontSize: "0.75rem", color: "#777777", marginTop: "6px" }}>
                  Mendukung MetaMask, Rabby, Coinbase Wallet, dan browser EVM
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ padding: "0.75rem", backgroundColor: "#fffbeb", border: "1px solid #fef3c7", borderRadius: "12px", color: "#92400e", fontSize: "0.75rem" }}>
                  Ekstensi browser Web3 tidak terdeteksi. Silakan masukkan alamat wallet EVM publik Anda di bawah:
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#333333", marginBottom: "4px" }}>
                    Alamat Wallet EVM (0x...)
                  </label>
                  <input
                    type="text"
                    placeholder="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
                    value={manualWallet}
                    onChange={(e) => setManualWallet(e.target.value)}
                    style={{
                      width: "100%",
                      height: "42px",
                      padding: "0 12px",
                      borderRadius: "12px",
                      border: "1px solid rgba(0, 0, 0, 0.14)",
                      backgroundColor: "#ffffff",
                      fontSize: "0.875rem",
                      color: "#111111",
                      outline: "none",
                      boxSizing: "border-box",
                      fontFamily: "monospace",
                    }}
                  />
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleWalletRegister}
                  style={{
                    width: "100%",
                    height: "44px",
                    borderRadius: "12px",
                    backgroundColor: "#111111",
                    color: "#ffffff",
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <span>Daftarkan Alamat Wallet</span>}
                </button>
              </div>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                fontSize: "0.75rem",
                color: "#777777",
                paddingTop: "0.5rem",
                borderTop: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <ShieldCheck size={14} style={{ color: "#059669" }} />
              <span>Privasi aman non-custodial. Kami tidak meminta private key.</span>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div
          style={{
            marginTop: "1.75rem",
            paddingTop: "1rem",
            borderTop: "1px solid rgba(0, 0, 0, 0.08)",
            textAlign: "center",
            fontSize: "0.8125rem",
            color: "#666666",
          }}
        >
          Sudah memiliki akun Clipstream?{" "}
          <Link
            href={`/login${role ? `?role=${role}` : ""}`}
            style={{ color: "#e8400d", fontWeight: 700, textDecoration: "none" }}
          >
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", backgroundColor: "#f6f5f3", display: "flex", alignItems: "center", justifyContent: "center" }}><Loader2 className="animate-spin" style={{ color: "#e8400d" }} /></div>}>
      <RegisterFormContent />
    </Suspense>
  );
}
