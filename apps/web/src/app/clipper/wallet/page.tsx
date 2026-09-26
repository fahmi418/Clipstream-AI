"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { AuthGate } from "@/components/AuthGate";
import { authApi } from "@/lib/api";
import {
  Wallet,
  ArrowLeft,
  ArrowRight,
  Coins,
  Lock,
  CheckCircle2,
  Copy,
  Check,
  Building,
  Smartphone,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  Loader2,
  AlertCircle,
  TrendingUp,
  History,
  ExternalLink,
  Clock,
  ChevronRight,
  Info,
  Zap,
} from "lucide-react";
import { PokoOffRampModal } from "@/components/PokoOffRampModal";

const EWALLET_PROVIDERS = [
  { id: "DANA", name: "DANA", color: "#118eea", bg: "#eef7fe" },
  { id: "GOPAY", name: "GoPay", color: "#00aed6", bg: "#e6f8fc" },
  { id: "OVO", name: "OVO", color: "#4c2a86", bg: "#f3effa" },
  { id: "SHOPEEPAY", name: "ShopeePay", color: "#ee4d2d", bg: "#feeeea" },
];

const BANK_PROVIDERS = [
  { id: "BCA", name: "Bank BCA", color: "#005baa", bg: "#e6eff7" },
  { id: "MANDIRI", name: "Bank Mandiri", color: "#003d79", bg: "#e6ecf2" },
  { id: "BRI", name: "Bank BRI", color: "#00529c", bg: "#e6eef5" },
  { id: "BNI", name: "Bank BNI", color: "#f15a24", bg: "#feefe9" },
];

interface WithdrawalHistoryItem {
  id: string;
  provider: string;
  accountNumber: string;
  amountUsdc: number;
  amountIdr: number;
  date: string;
  status: "COMPLETED" | "PROCESSING";
  type: "EWALLET" | "BANK" | "CRYPTO";
}

export default function ClipperWalletPage() {
  const { user } = useAuth();

  const [availableUsdc, setAvailableUsdc] = useState(16.43);
  const [holdbackUsdc, setHoldbackUsdc] = useState(7.04);
  const [totalWithdrawnUsdc, setTotalWithdrawnUsdc] = useState(48.5);

  const [activeTab, setActiveTab] = useState<"FIAT" | "CRYPTO" | "HISTORY">("FIAT");
  const [fiatType, setFiatType] = useState<"EWALLET" | "BANK">("EWALLET");
  const [selectedProvider, setSelectedProvider] = useState<string>("DANA");

  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState(user?.displayName || "");
  const [amountInput, setAmountInput] = useState<string>("16.43");
  const [cryptoAddress, setCryptoAddress] = useState("");

  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPokoModal, setShowPokoModal] = useState(false);

  const [recentWithdrawals, setRecentWithdrawals] = useState<WithdrawalHistoryItem[]>([
    {
      id: "WD-891023",
      provider: "DANA",
      accountNumber: "0812****7890",
      amountUsdc: 25.0,
      amountIdr: 407500,
      date: "Kemarin, 14:32",
      status: "COMPLETED",
      type: "EWALLET",
    },
    {
      id: "WD-771829",
      provider: "BCA",
      accountNumber: "8830****12",
      amountUsdc: 23.5,
      amountIdr: 383050,
      date: "3 hari lalu",
      status: "COMPLETED",
      type: "BANK",
    },
  ]);

  const [successReceipt, setSuccessReceipt] = useState<{
    id: string;
    amountUsdc: number;
    amountIdr: number;
    provider: string;
    accountNumber: string;
    message: string;
  } | null>(null);

  const currentWalletAddress = user?.walletAddress || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  const idrRate = 16300;
  const numAmount = parseFloat(amountInput) || 0;
  const estimatedIdr = Math.round(numAmount * idrRate);

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(currentWalletAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (numAmount <= 0) {
      setErrorMsg("Jumlah penarikan harus lebih dari 0.");
      return;
    }

    if (numAmount > availableUsdc) {
      setErrorMsg(`Saldo tidak mencukupi. Maksimal saldo tersedia adalah $${availableUsdc.toFixed(2)} USDC.`);
      return;
    }

    if (activeTab === "FIAT") {
      if (!accountNumber.trim()) {
        setErrorMsg(`Harap masukkan ${fiatType === "EWALLET" ? "Nomor HP E-Wallet" : "Nomor Rekening Bank"}.`);
        return;
      }
    } else if (activeTab === "CRYPTO") {
      if (!/^0x[a-fA-F0-9]{40}$/.test(cryptoAddress.trim())) {
        setErrorMsg("Alamat wallet Web3 tujuan tidak valid. Harus format EVM (0x...).");
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const res = await authApi.withdraw({
        type: activeTab === "CRYPTO" ? "CRYPTO" : fiatType,
        provider: activeTab === "CRYPTO" ? "BNB_CHAIN" : selectedProvider,
        accountNumber: activeTab === "CRYPTO" ? cryptoAddress.trim() : accountNumber.trim(),
        accountName: accountName.trim() || undefined,
        amountUsdc: numAmount,
      });

      const receipt = {
        id: res.withdrawalId,
        amountUsdc: res.amountUsdc,
        amountIdr: res.amountIdr,
        provider: res.provider,
        accountNumber: res.accountNumber,
        message: res.message,
      };

      setSuccessReceipt(receipt);
      setAvailableUsdc((prev) => Math.max(0, prev - numAmount));
      setTotalWithdrawnUsdc((prev) => prev + numAmount);

      // Add to history
      setRecentWithdrawals((prev) => [
        {
          id: res.withdrawalId,
          provider: res.provider,
          accountNumber: res.accountNumber,
          amountUsdc: res.amountUsdc,
          amountIdr: res.amountIdr,
          date: "Baru saja",
          status: "COMPLETED",
          type: activeTab === "CRYPTO" ? "CRYPTO" : fiatType,
        },
        ...prev,
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memproses penarikan. Silakan coba lagi.";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthGate
      requiredRole="clipper"
      title="Masuk ke Halaman Dompet"
      description="Silakan masuk untuk mengelola saldo dan melakukan pencairan dana reward video klip Anda."
    >
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f6f5f3",
          paddingTop: "6.5rem",
          paddingBottom: "5rem",
          fontFamily: "var(--font-inter), sans-serif",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: "68rem",
            margin: "0 auto",
            padding: "0 1.5rem",
          }}
        >
          {/* Breadcrumb Navigation */}
          <div style={{ marginBottom: "1.5rem" }}>
            <Link
              href="/clipper"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.4rem 0.85rem",
                borderRadius: "9999px",
                backgroundColor: "#ffffff",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "#111111",
                textDecoration: "none",
                transition: "all 0.15s ease",
              }}
            >
              <ArrowLeft size={14} />
              <span>Kembali ke Dashboard Clipper</span>
            </Link>
          </div>

          {/* Page Header */}
          <div style={{ marginBottom: "2rem" }}>
            <h1
              style={{
                fontSize: "clamp(1.75rem, 3.5vw, 2.25rem)",
                fontWeight: 700,
                color: "#111111",
                letterSpacing: "-0.03em",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Dompet &amp; Pencairan Saldo
            </h1>
            <p
              style={{
                fontSize: "0.9375rem",
                color: "#666666",
                marginTop: "0.4rem",
                maxWidth: "42rem",
                lineHeight: 1.5,
              }}
            >
              Tarik reward video klip kamu langsung ke DANA, GoPay, OVO, ShopeePay, Rekening Bank, atau Web3 Wallet.
            </p>
          </div>

          {/* Top 3 Financial Summary Bento Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "1rem",
              marginBottom: "2rem",
            }}
          >
            {/* Card 1: Saldo Siap Tarik (Hero) */}
            <div
              style={{
                backgroundColor: "#161514",
                color: "#ffffff",
                borderRadius: "20px",
                padding: "1.5rem",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "rgba(255,255,255,0.6)" }}>
                    Saldo Siap Ditarik
                  </span>
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      backgroundColor: "rgba(16, 185, 129, 0.2)",
                      color: "#34d399",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "9999px",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                    }}
                  >
                    ● Otomatis Aktif
                  </span>
                </div>

                <div style={{ fontSize: "2.25rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
                  ${availableUsdc.toFixed(2)}{" "}
                  <span style={{ fontSize: "1.125rem", fontWeight: 600, color: "#34d399" }}>USDC</span>
                </div>

                <div style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.7)", marginTop: "0.25rem" }}>
                  ≈ Rp {(availableUsdc * idrRate).toLocaleString("id-ID")}
                </div>
              </div>

              {/* On-Chain Address Pill */}
              <div
                style={{
                  marginTop: "1.25rem",
                  paddingTop: "0.875rem",
                  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "0.75rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "rgba(255,255,255,0.6)" }}>
                  <Wallet size={13} />
                  <span>
                    Alamat On-Chain:{" "}
                    <strong style={{ color: "#ffffff", fontFamily: "monospace" }}>
                      {currentWalletAddress.slice(0, 6)}...{currentWalletAddress.slice(-4)}
                    </strong>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyWallet}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    padding: "0.25rem 0.6rem",
                    borderRadius: "6px",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {copiedAddress ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                  <span>{copiedAddress ? "Tersalin" : "Salin"}</span>
                </button>
              </div>

              {/* Poko Instant Off-Ramp CTA (Option B) */}
              <button
                type="button"
                onClick={() => setShowPokoModal(true)}
                style={{
                  marginTop: "1rem",
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #118eea 0%, #00aed6 100%)",
                  color: "#ffffff",
                  border: "none",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 4px 14px rgba(17, 142, 234, 0.3)",
                  transition: "transform 0.15s ease",
                }}
              >
                <Zap size={15} />
                <span>Tarik Instan ke DANA / Bank (Poko SDK)</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Card 2: Saldo Tertahan (Holdback 30%) */}
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "20px",
                padding: "1.5rem",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "#888888" }}>
                    Saldo Tertahan (30%)
                  </span>
                  <Lock size={16} color="#d97706" />
                </div>

                <div style={{ fontSize: "2.25rem", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em" }}>
                  ${holdbackUsdc.toFixed(2)}{" "}
                  <span style={{ fontSize: "1.125rem", fontWeight: 600, color: "#d97706" }}>USDC</span>
                </div>

                <div style={{ fontSize: "0.875rem", color: "#666666", marginTop: "0.25rem" }}>
                  ≈ Rp {(holdbackUsdc * idrRate).toLocaleString("id-ID")}
                </div>
              </div>

              <div
                style={{
                  marginTop: "1.25rem",
                  paddingTop: "0.875rem",
                  borderTop: "1px solid rgba(0, 0, 0, 0.06)",
                  fontSize: "0.75rem",
                  color: "#d97706",
                  fontWeight: 600,
                }}
              >
                ⏳ Otomatis cair setelah masa holdback 72 jam
              </div>
            </div>

            {/* Card 3: Total Telah Ditarik */}
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "20px",
                padding: "1.5rem",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "#888888" }}>
                    Total Telah Ditarik
                  </span>
                  <TrendingUp size={16} color="#059669" />
                </div>

                <div style={{ fontSize: "2.25rem", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em" }}>
                  ${totalWithdrawnUsdc.toFixed(2)}{" "}
                  <span style={{ fontSize: "1.125rem", fontWeight: 600, color: "#059669" }}>USDC</span>
                </div>

                <div style={{ fontSize: "0.875rem", color: "#666666", marginTop: "0.25rem" }}>
                  ≈ Rp {(totalWithdrawnUsdc * idrRate).toLocaleString("id-ID")}
                </div>
              </div>

              <div
                style={{
                  marginTop: "1.25rem",
                  paddingTop: "0.875rem",
                  borderTop: "1px solid rgba(0, 0, 0, 0.06)",
                  fontSize: "0.75rem",
                  color: "#059669",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <CheckCircle2 size={13} />
                <span>{recentWithdrawals.length} kali penarikan sukses</span>
              </div>
            </div>
          </div>

          {/* Main 2-Column Section */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
              gap: "1.5rem",
              alignItems: "start",
            }}
            className="flex-col md:grid"
          >
            {/* Left Column: Form Penarikan & Riwayat */}
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "24px",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                padding: "clamp(1.25rem, 3vw, 2rem)",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
              }}
            >
              {/* Poko Featured Banner */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #eef7fe 0%, #e6f8fc 100%)",
                  border: "1px solid rgba(17, 142, 234, 0.2)",
                  marginBottom: "1.25rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      backgroundColor: "#118eea",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Zap size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#111" }}>
                      Pencairan Instan Web3 via Poko
                    </div>
                    <div style={{ fontSize: "0.6875rem", color: "#555" }}>
                      DANA, GoPay, OVO, QRIS &amp; Bank transfer dalam hitungan detik
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPokoModal(true)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    backgroundColor: "#118eea",
                    color: "#fff",
                    border: "none",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    flexShrink: 0,
                  }}
                >
                  <span>Buka Poko</span>
                  <ArrowRight size={12} />
                </button>
              </div>

              {/* Tab Selector */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  padding: "4px",
                  backgroundColor: "#f0eeea",
                  borderRadius: "12px",
                  gap: "3px",
                  marginBottom: "1.5rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("FIAT");
                    setErrorMsg(null);
                    setSuccessReceipt(null);
                  }}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "9px",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    backgroundColor: activeTab === "FIAT" ? "#ffffff" : "transparent",
                    color: activeTab === "FIAT" ? "#111111" : "#777777",
                    boxShadow: activeTab === "FIAT" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  DANA / Bank
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("CRYPTO");
                    setErrorMsg(null);
                    setSuccessReceipt(null);
                  }}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "9px",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    backgroundColor: activeTab === "CRYPTO" ? "#ffffff" : "transparent",
                    color: activeTab === "CRYPTO" ? "#111111" : "#777777",
                    boxShadow: activeTab === "CRYPTO" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  MetaMask / Web3
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("HISTORY");
                    setErrorMsg(null);
                    setSuccessReceipt(null);
                  }}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "9px",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    backgroundColor: activeTab === "HISTORY" ? "#ffffff" : "transparent",
                    color: activeTab === "HISTORY" ? "#111111" : "#777777",
                    boxShadow: activeTab === "HISTORY" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  Riwayat
                </button>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "12px",
                    backgroundColor: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#b91c1c",
                    fontSize: "0.8125rem",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                    marginBottom: "1.25rem",
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Success Receipt View */}
              {successReceipt ? (
                <div
                  style={{
                    padding: "1.5rem",
                    borderRadius: "16px",
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      backgroundColor: "#dcfce7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 1rem auto",
                    }}
                  >
                    <CheckCircle2 size={26} color="#16a34a" />
                  </div>

                  <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#166534", margin: "0 0 0.25rem 0" }}>
                    Penarikan Berhasil Diproses!
                  </h3>
                  <p style={{ fontSize: "0.8125rem", color: "#15803d", margin: "0 0 1.25rem 0" }}>
                    {successReceipt.message}
                  </p>

                  <div
                    style={{
                      backgroundColor: "#ffffff",
                      borderRadius: "12px",
                      padding: "1rem",
                      border: "1px solid #bbf7d0",
                      textAlign: "left",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      fontSize: "0.8125rem",
                      marginBottom: "1.25rem",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#666" }}>ID Transaksi</span>
                      <strong style={{ fontFamily: "monospace" }}>{successReceipt.id}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#666" }}>Tujuan ({successReceipt.provider})</span>
                      <strong>{successReceipt.accountNumber}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#666" }}>Nominal USDT</span>
                      <strong>${successReceipt.amountUsdc.toFixed(2)} USDC</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "0.5rem", borderTop: "1px solid #eee" }}>
                      <span style={{ color: "#111", fontWeight: 700 }}>Total Diterima (IDR)</span>
                      <strong style={{ color: "#16a34a", fontSize: "0.9375rem" }}>
                        Rp {successReceipt.amountIdr.toLocaleString("id-ID")}
                      </strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSuccessReceipt(null)}
                    style={{
                      padding: "0.625rem 1.5rem",
                      borderRadius: "10px",
                      backgroundColor: "#111111",
                      color: "#ffffff",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Tarik Saldo Lagi
                  </button>
                </div>
              ) : (
                <>
                  {/* TAB 1: DANA / BANK WITHDRAWAL FORM */}
                  {activeTab === "FIAT" && (
                    <form onSubmit={handleWithdrawSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
                      {/* E-Wallet vs Bank Sub-toggle */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "0.5rem",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setFiatType("EWALLET");
                            setSelectedProvider("DANA");
                          }}
                          style={{
                            padding: "0.625rem",
                            borderRadius: "10px",
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                            border: fiatType === "EWALLET" ? "2px solid #e8400d" : "1px solid rgba(0,0,0,0.1)",
                            backgroundColor: fiatType === "EWALLET" ? "#fff8f5" : "#ffffff",
                            color: fiatType === "EWALLET" ? "#e8400d" : "#555555",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.4rem",
                          }}
                        >
                          <Smartphone size={15} />
                          <span>E-Wallet (DANA/GoPay/OVO)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setFiatType("BANK");
                            setSelectedProvider("BCA");
                          }}
                          style={{
                            padding: "0.625rem",
                            borderRadius: "10px",
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                            border: fiatType === "BANK" ? "2px solid #2563eb" : "1px solid rgba(0,0,0,0.1)",
                            backgroundColor: fiatType === "BANK" ? "#f0f6ff" : "#ffffff",
                            color: fiatType === "BANK" ? "#2563eb" : "#555555",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.4rem",
                          }}
                        >
                          <Building size={15} />
                          <span>Transfer Bank (BCA/Mandiri/BRI)</span>
                        </button>
                      </div>

                      {/* Provider Selection Pills */}
                      <div>
                        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#333", marginBottom: "0.4rem" }}>
                          Pilih {fiatType === "EWALLET" ? "E-Wallet" : "Bank"} Tujuan:
                        </label>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem" }}>
                          {(fiatType === "EWALLET" ? EWALLET_PROVIDERS : BANK_PROVIDERS).map((p) => {
                            const isSelected = selectedProvider === p.id;
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => setSelectedProvider(p.id)}
                                style={{
                                  padding: "0.5rem 0.25rem",
                                  borderRadius: "10px",
                                  border: isSelected ? `2px solid ${p.color}` : "1px solid rgba(0,0,0,0.1)",
                                  backgroundColor: isSelected ? p.bg : "#faf9f6",
                                  color: isSelected ? p.color : "#444444",
                                  fontSize: "0.75rem",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  textAlign: "center",
                                  transition: "all 0.15s ease",
                                }}
                              >
                                {p.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Nomor Rekening / HP & Nama Pemilik */}
                      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "0.75rem" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#333", marginBottom: "4px" }}>
                            {fiatType === "EWALLET" ? "Nomor HP Akun" : "Nomor Rekening"} <span style={{ color: "#e8400d" }}>*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder={fiatType === "EWALLET" ? "081234567890" : "8830123456"}
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            style={{
                              width: "100%",
                              height: "42px",
                              padding: "0 12px",
                              borderRadius: "10px",
                              border: "1px solid rgba(0,0,0,0.14)",
                              backgroundColor: "#ffffff",
                              fontSize: "0.875rem",
                              color: "#111111",
                              outline: "none",
                              boxSizing: "border-box",
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#333", marginBottom: "4px" }}>
                            Nama Pemilik (Opsional)
                          </label>
                          <input
                            type="text"
                            placeholder="Sesuai rekening"
                            value={accountName}
                            onChange={(e) => setAccountName(e.target.value)}
                            style={{
                              width: "100%",
                              height: "42px",
                              padding: "0 12px",
                              borderRadius: "10px",
                              border: "1px solid rgba(0,0,0,0.14)",
                              backgroundColor: "#ffffff",
                              fontSize: "0.875rem",
                              color: "#111111",
                              outline: "none",
                              boxSizing: "border-box",
                            }}
                          />
                        </div>
                      </div>

                      {/* Amount Input */}
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#333" }}>
                            Jumlah Penarikan (USDC)
                          </label>
                          <button
                            type="button"
                            onClick={() => setAmountInput(availableUsdc.toString())}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#e8400d",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              cursor: "pointer",
                              padding: 0,
                            }}
                          >
                            Tarik Semua (${availableUsdc.toFixed(2)})
                          </button>
                        </div>

                        <div style={{ position: "relative" }}>
                          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#888", fontWeight: 700 }}>
                            $
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0.5"
                            max={availableUsdc}
                            value={amountInput}
                            onChange={(e) => setAmountInput(e.target.value)}
                            style={{
                              width: "100%",
                              height: "44px",
                              padding: "0 12px 0 28px",
                              borderRadius: "10px",
                              border: "1px solid rgba(0,0,0,0.14)",
                              backgroundColor: "#ffffff",
                              fontSize: "1rem",
                              fontWeight: 700,
                              color: "#111111",
                              outline: "none",
                              boxSizing: "border-box",
                            }}
                          />
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginTop: "6px" }}>
                          <span style={{ color: "#777" }}>Kurs: 1 USDC = Rp {idrRate.toLocaleString("id-ID")}</span>
                          <span style={{ color: "#059669", fontWeight: 700 }}>
                            Kamu terima: Rp {estimatedIdr.toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                          marginTop: "0.5rem",
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
                          transition: "opacity 0.15s ease",
                          opacity: isSubmitting ? 0.7 : 1,
                        }}
                      >
                        {isSubmitting ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <>
                            <span>Tarik Rp {estimatedIdr.toLocaleString("id-ID")} Sekarang</span>
                            <ArrowRight size={15} />
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {/* TAB 2: CRYPTO / METAMASK FORM */}
                  {activeTab === "CRYPTO" && (
                    <form onSubmit={handleWithdrawSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
                      <div style={{ padding: "0.75rem 1rem", borderRadius: "12px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", fontSize: "0.8125rem", color: "#166534", lineHeight: 1.4 }}>
                        💡 Penarikan on-chain akan dikirimkan dalam bentuk <strong>USDT / USDC (BEP-20) di BNB Chain</strong> ke alamat wallet eksternal Anda.
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#333", marginBottom: "4px" }}>
                          Alamat Wallet Web3 Penerima (0x...) <span style={{ color: "#e8400d" }}>*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
                          value={cryptoAddress}
                          onChange={(e) => setCryptoAddress(e.target.value)}
                          style={{
                            width: "100%",
                            height: "42px",
                            padding: "0 12px",
                            borderRadius: "10px",
                            border: "1px solid rgba(0,0,0,0.14)",
                            backgroundColor: "#ffffff",
                            fontSize: "0.875rem",
                            color: "#111111",
                            outline: "none",
                            boxSizing: "border-box",
                            fontFamily: "monospace",
                          }}
                        />
                      </div>

                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#333" }}>
                            Jumlah Penarikan (USDC)
                          </label>
                          <button
                            type="button"
                            onClick={() => setAmountInput(availableUsdc.toString())}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#e8400d",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              cursor: "pointer",
                              padding: 0,
                            }}
                          >
                            Tarik Semua (${availableUsdc.toFixed(2)})
                          </button>
                        </div>

                        <div style={{ position: "relative" }}>
                          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#888", fontWeight: 700 }}>
                            $
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0.5"
                            max={availableUsdc}
                            value={amountInput}
                            onChange={(e) => setAmountInput(e.target.value)}
                            style={{
                              width: "100%",
                              height: "44px",
                              padding: "0 12px 0 28px",
                              borderRadius: "10px",
                              border: "1px solid rgba(0,0,0,0.14)",
                              backgroundColor: "#ffffff",
                              fontSize: "1rem",
                              fontWeight: 700,
                              color: "#111111",
                              outline: "none",
                              boxSizing: "border-box",
                            }}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                          marginTop: "0.5rem",
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
                          opacity: isSubmitting ? 0.7 : 1,
                        }}
                      >
                        {isSubmitting ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <>
                            <Wallet size={15} />
                            <span>Kirim ke Wallet Web3</span>
                            <ArrowRight size={15} />
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {/* TAB 3: RIWAYAT PENARIKAN */}
                  {activeTab === "HISTORY" && (
                    <div>
                      <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#111", marginBottom: "0.75rem" }}>
                        Riwayat Penarikan Dana
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {recentWithdrawals.map((w) => (
                          <div
                            key={w.id}
                            style={{
                              padding: "0.875rem 1rem",
                              borderRadius: "12px",
                              backgroundColor: "#faf9f6",
                              border: "1px solid rgba(0,0,0,0.08)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                              <div
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  borderRadius: "10px",
                                  backgroundColor: "#ecfdf5",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#059669",
                                }}
                              >
                                <CheckCircle2 size={18} />
                              </div>
                              <div>
                                <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#111" }}>
                                  {w.provider} • {w.accountNumber}
                                </div>
                                <div style={{ fontSize: "0.6875rem", color: "#888", marginTop: "2px" }}>
                                  {w.id} • {w.date}
                                </div>
                              </div>
                            </div>

                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#059669" }}>
                                +Rp {w.amountIdr.toLocaleString("id-ID")}
                              </div>
                              <div style={{ fontSize: "0.6875rem", color: "#888" }}>
                                ${w.amountUsdc.toFixed(2)} USDC
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Right Column: Panduan K.I.S.S. & Edukasi Dompet */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Box 1: Keamanan & Non-Custodial Smart Contract */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "20px",
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  padding: "1.25rem 1.5rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <ShieldCheck size={18} color="#059669" />
                  <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#111" }}>
                    Dompet Otomatis &amp; Escrow Anti-Fraud
                  </span>
                </div>
                <p style={{ fontSize: "0.8125rem", color: "#666", lineHeight: 1.5, margin: 0 }}>
                  Dompet Anda terhubung langsung ke smart contract escrow di <strong>BNB Chain</strong>. Setiap reward views video dikunci secara on-chain dan dicairkan otomatis setelah lolos verifikasi AI.
                </p>
              </div>

              {/* Box 2: FAQ Pemula (K.I.S.S.) */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "20px",
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  padding: "1.25rem 1.5rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                  <HelpCircle size={18} color="#e8400d" />
                  <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#111" }}>
                    Pertanyaan Umum (FAQ)
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", fontSize: "0.8125rem" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "#111", marginBottom: "2px" }}>
                      Apakah saya wajib punya MetaMask / Web3?
                    </div>
                    <div style={{ color: "#666", lineHeight: 1.4 }}>
                      Tidak wajib! Sistem dompet kami otomatis mengelola saldo dan Anda bisa mencairkan langsung ke DANA, GoPay, OVO, atau Rekening Bank lokal.
                    </div>
                  </div>

                  <div style={{ paddingTop: "0.5rem", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                    <div style={{ fontWeight: 700, color: "#111", marginBottom: "2px" }}>
                      Berapa lama uang masuk ke rekening / DANA?
                    </div>
                    <div style={{ color: "#666", lineHeight: 1.4 }}>
                      Proses pencairan diproses secara instan (1 - 5 menit) setelah Anda menekan tombol tarik saldo.
                    </div>
                  </div>

                  <div style={{ paddingTop: "0.5rem", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                    <div style={{ fontWeight: 700, color: "#111", marginBottom: "2px" }}>
                      Apa itu Saldo Tertahan (Holdback 30%)?
                    </div>
                    <div style={{ color: "#666", lineHeight: 1.4 }}>
                      30% saldo ditahan sementara selama 72 jam sebagai jaminan anti-bot views. Begitu cooldown selesai, saldo otomatis berpindah ke Saldo Siap Tarik.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Poko Off-Ramp SDK Modal (Option B) */}
      <PokoOffRampModal
        isOpen={showPokoModal}
        onClose={() => setShowPokoModal(false)}
        availableBalanceUsdc={availableUsdc}
        userWalletAddress={currentWalletAddress}
        userDisplayName={user?.displayName || "Clipper"}
        onWithdrawSuccess={(withdrawnUsdc, receiptData) => {
          setAvailableUsdc((prev) => Math.max(0, prev - withdrawnUsdc));
          setTotalWithdrawnUsdc((prev) => prev + withdrawnUsdc);
          setRecentWithdrawals((prev) => [
            {
              id: receiptData.orderId,
              provider: receiptData.provider,
              accountNumber: receiptData.accountNumber,
              amountUsdc: withdrawnUsdc,
              amountIdr: receiptData.netIdrReceived,
              date: "Baru saja (Poko)",
              status: "COMPLETED",
              type: "EWALLET",
            },
            ...prev,
          ]);
        }}
      />
    </AuthGate>
  );
}
