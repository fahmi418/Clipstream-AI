"use client";

import { useState, useEffect } from "react";
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
  RotateCcw,
} from "lucide-react";
import { PokoOffRampModal } from "@/components/PokoOffRampModal";

import { EWALLET_PROVIDERS, BANK_PROVIDERS } from "@/data/payment-providers";

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

  const [availableUsdc, setAvailableUsdc] = useState<number>(() => {
    if (typeof window === "undefined") return 54.2;
    return parseFloat(localStorage.getItem("demo_availableUsdc") ?? "54.2");
  });
  const [holdbackUsdc, setHoldbackUsdc] = useState<number>(() => {
    if (typeof window === "undefined") return 7.04;
    return parseFloat(localStorage.getItem("demo_holdbackUsdc") ?? "7.04");
  });
  const [totalWithdrawnUsdc, setTotalWithdrawnUsdc] = useState<number>(() => {
    if (typeof window === "undefined") return 48.5;
    return parseFloat(localStorage.getItem("demo_totalWithdrawnUsdc") ?? "48.5");
  });

  const [activeTab, setActiveTab] = useState<"FIAT" | "CRYPTO" | "HISTORY">("FIAT");
  const [fiatType, setFiatType] = useState<"EWALLET" | "BANK">("EWALLET");
  const [selectedProvider, setSelectedProvider] = useState<string>("DANA");

  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState(user?.displayName || "");
  const [amountInput, setAmountInput] = useState<string>("20.00");
  const [cryptoAddress, setCryptoAddress] = useState("");

  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPokoModal, setShowPokoModal] = useState(false);
  const [faucetToast, setFaucetToast] = useState<string | null>(null);

  const handleTopUpFaucet = (amount: number = 100) => {
    setAvailableUsdc((prev) => {
      const next = prev + amount;
      localStorage.setItem("demo_availableUsdc", String(next));
      return next;
    });
    setFaucetToast(`+ $${amount}.00 Demo USDT berhasil ditambahkan ke saldo!`);
    setTimeout(() => setFaucetToast(null), 3500);
  };

  const handleResetDemoBalance = () => {
    setAvailableUsdc(54.2);
    setHoldbackUsdc(7.04);
    setTotalWithdrawnUsdc(48.5);
    localStorage.setItem("demo_availableUsdc", "54.2");
    localStorage.setItem("demo_holdbackUsdc", "7.04");
    localStorage.setItem("demo_totalWithdrawnUsdc", "48.5");
    setFaucetToast("Saldo demo direset ke default ($54.20 USDT)");
    setTimeout(() => setFaucetToast(null), 3500);
  };

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
      setErrorMsg(`Saldo tidak mencukupi. Maksimal saldo tersedia adalah $${availableUsdc.toFixed(2)} USDT.`);
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
      setAvailableUsdc((prev) => {
        const next = Math.max(0, prev - numAmount);
        localStorage.setItem("demo_availableUsdc", String(next));
        return next;
      });
      setTotalWithdrawnUsdc((prev) => {
        const next = prev + numAmount;
        localStorage.setItem("demo_totalWithdrawnUsdc", String(next));
        return next;
      });

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

          {/* Hackathon Sandbox Faucet Control Bar */}
          <div
            style={{
              backgroundColor: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
              borderRadius: "16px",
              padding: "12px 18px",
              border: "1px solid rgba(17, 142, 234, 0.25)",
              marginBottom: "1.5rem",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.02)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "10px",
                  backgroundColor: "#eef7fe",
                  color: "#118eea",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Sparkles size={16} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "0.8125rem", fontWeight: 800, color: "#0f172a" }}>
                    Hackathon Sandbox Environment
                  </span>
                  <span
                    style={{
                      fontSize: "0.5625rem",
                      fontWeight: 800,
                      color: "#118eea",
                      backgroundColor: "#eef7fe",
                      padding: "1px 6px",
                      borderRadius: "9999px",
                      border: "1px solid rgba(17, 142, 234, 0.3)",
                    }}
                  >
                    opBNB TESTNET
                  </span>
                </div>
                <div style={{ fontSize: "0.6875rem", color: "#64748b" }}>
                  Simulasi penarikan Poko Off-Ramp aktif. Coba transaksi berkali-kali menggunakan tombol Faucet.
                </div>
              </div>
            </div>

            {/* Faucet Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                type="button"
                onClick={() => handleTopUpFaucet(100)}
                style={{
                  padding: "7px 14px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "#ffffff",
                  border: "none",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 2px 8px rgba(16, 185, 129, 0.25)",
                  transition: "transform 0.15s ease",
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
                onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
              >
                <Coins size={14} />
                <span>+ Faucet $100 Demo USDT</span>
              </button>

              <button
                type="button"
                onClick={handleResetDemoBalance}
                title="Reset saldo ke default"
                style={{
                  padding: "7px 10px",
                  borderRadius: "10px",
                  backgroundColor: "#ffffff",
                  color: "#64748b",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Faucet Toast Feedback */}
          {faucetToast && (
            <div
              style={{
                marginBottom: "1rem",
                padding: "8px 14px",
                borderRadius: "10px",
                backgroundColor: "#ecfdf5",
                border: "1px solid #a7f3d0",
                color: "#065f46",
                fontSize: "0.75rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                animation: "fadeIn 0.3s ease",
              }}
            >
              <CheckCircle2 size={15} color="#10b981" />
              <span>{faucetToast}</span>
            </div>
          )}

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
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      backgroundColor: "rgba(16, 185, 129, 0.2)",
                      color: "#34d399",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "9999px",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#34d399", display: "inline-block" }} />
                    Otomatis Aktif
                  </span>
                </div>

                <div style={{ fontSize: "2.25rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
                  ${availableUsdc.toFixed(2)}{" "}
                  <span style={{ fontSize: "1.125rem", fontWeight: 600, color: "#34d399" }}>USDT</span>
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
                  <span style={{ fontSize: "1.125rem", fontWeight: 600, color: "#d97706" }}>USDT</span>
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
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                }}
              >
                <Clock size={12} />
                <span>Otomatis cair setelah masa holdback 72 jam</span>
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
                  <span style={{ fontSize: "1.125rem", fontWeight: 600, color: "#059669" }}>USDT</span>
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
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Form Penarikan & Riwayat */}
            <div className="w-full lg:col-span-7 bg-white rounded-3xl border border-black/10 p-5 sm:p-7 shadow-sm">
              {/* Sleek Tab Selector */}
              <div className="flex items-center gap-1 p-1 bg-[#f4f3f0] rounded-2xl mb-6 border border-black/5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("FIAT");
                    setErrorMsg(null);
                    setSuccessReceipt(null);
                  }}
                  className={`flex-1 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === "FIAT"
                      ? "bg-white text-sky-600 shadow-sm border border-black/5"
                      : "text-neutral-500 hover:text-neutral-800"
                  }`}
                >
                  <Zap size={14} />
                  <span className="truncate">DANA / Bank</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("CRYPTO");
                    setErrorMsg(null);
                    setSuccessReceipt(null);
                  }}
                  className={`flex-1 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === "CRYPTO"
                      ? "bg-white text-neutral-900 shadow-sm border border-black/5"
                      : "text-neutral-500 hover:text-neutral-800"
                  }`}
                >
                  <Wallet size={14} />
                  <span className="truncate">MetaMask</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("HISTORY");
                    setErrorMsg(null);
                    setSuccessReceipt(null);
                  }}
                  className={`flex-1 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === "HISTORY"
                      ? "bg-white text-neutral-900 shadow-sm border border-black/5"
                      : "text-neutral-500 hover:text-neutral-800"
                  }`}
                >
                  <History size={14} />
                  <span className="truncate">Riwayat</span>
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
                      <strong>${successReceipt.amountUsdc.toFixed(2)} USDT</strong>
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
                  {/* TAB 1: UNIFIED POKO OFF-RAMP HUB */}
                  {activeTab === "FIAT" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                      {/* Poko Spotlight Header */}
                      <div
                        style={{
                          backgroundColor: "#f8fafc",
                          borderRadius: "16px",
                          padding: "16px",
                          border: "1px solid rgba(17, 142, 234, 0.2)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "8px",
                                backgroundColor: "#118eea",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Zap size={15} />
                            </div>
                            <div>
                              <div style={{ fontSize: "0.875rem", fontWeight: 800, color: "#0f172a" }}>
                                Poko SDK Instant Off-Ramp
                              </div>
                              <div style={{ fontSize: "0.6875rem", color: "#64748b" }}>
                                Konversi instan USDT opBNB ke Rupiah (DANA, GoPay, OVO &amp; Bank Lokal)
                              </div>
                            </div>
                          </div>

                          <span
                            style={{
                              fontSize: "0.625rem",
                              fontWeight: 800,
                              color: "#059669",
                              backgroundColor: "#ecfdf5",
                              padding: "2px 8px",
                              borderRadius: "9999px",
                              border: "1px solid rgba(5, 150, 105, 0.2)",
                            }}
                          >
                            BI-FAST 0 DETIK
                          </span>
                        </div>

                        {/* Live Conversion Rate Banner */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            backgroundColor: "#ffffff",
                            padding: "10px 14px",
                            borderRadius: "12px",
                            border: "1px solid rgba(0, 0, 0, 0.06)",
                            fontSize: "0.75rem",
                          }}
                        >
                          <span style={{ color: "#64748b" }}>Kurs Real-Time:</span>
                          <span style={{ fontWeight: 800, color: "#0f172a" }}>
                            1 USDT = Rp {idrRate.toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>

                      {/* Quick 1-Click Sandbox Presets */}
                      <div>
                        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                          Pilihan Cepat Akun E-Wallet / Bank:
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProvider("DANA");
                              setAccountNumber("081298765432");
                              setShowPokoModal(true);
                            }}
                            style={{
                              padding: "8px 6px",
                              borderRadius: "10px",
                              border: "1px solid #118eea",
                              backgroundColor: "#eef7fe",
                              color: "#118eea",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              cursor: "pointer",
                              textAlign: "center",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "4px",
                            }}
                          >
                            <Smartphone size={13} />
                            <span>DANA: 0812-9876-5432</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProvider("GOPAY");
                              setAccountNumber("081311223344");
                              setShowPokoModal(true);
                            }}
                            style={{
                              padding: "8px 6px",
                              borderRadius: "10px",
                              border: "1px solid #00aed6",
                              backgroundColor: "#e6f8fc",
                              color: "#00aed6",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              cursor: "pointer",
                              textAlign: "center",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "4px",
                            }}
                          >
                            <CheckCircle2 size={13} />
                            <span>GoPay: 0813-1122-3344</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProvider("BCA");
                              setAccountNumber("8830192812");
                              setShowPokoModal(true);
                            }}
                            style={{
                              padding: "8px 6px",
                              borderRadius: "10px",
                              border: "1px solid #005baa",
                              backgroundColor: "#e6eff7",
                              color: "#005baa",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              cursor: "pointer",
                              textAlign: "center",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "4px",
                            }}
                          >
                            <Building size={13} />
                            <span>BCA: 8830-1928-12</span>
                          </button>
                        </div>
                      </div>

                      {/* Main Launch CTA Button */}
                      <button
                        type="button"
                        onClick={() => setShowPokoModal(true)}
                        style={{
                          width: "100%",
                          padding: "14px",
                          borderRadius: "14px",
                          background: "linear-gradient(135deg, #118eea 0%, #00aed6 100%)",
                          color: "#ffffff",
                          fontSize: "0.9375rem",
                          fontWeight: 800,
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "10px",
                          boxShadow: "0 4px 16px rgba(17, 142, 234, 0.35)",
                          transition: "transform 0.15s ease",
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
                        onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                      >
                        <Zap size={18} />
                        <span>Buka Poko Off-Ramp Gateway</span>
                        <ArrowRight size={16} />
                      </button>

                      <div style={{ textAlign: "center", fontSize: "0.6875rem", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                        <Lock size={11} />
                        <span>Didukung oleh Poko On/Off Ramp SDK • Terkoneksi ke BI-FAST Switcher</span>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: CRYPTO / METAMASK FORM */}
                  {activeTab === "CRYPTO" && (
                    <form onSubmit={handleWithdrawSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
                      <div style={{ padding: "0.75rem 1rem", borderRadius: "12px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", fontSize: "0.8125rem", color: "#166534", lineHeight: 1.4, display: "flex", alignItems: "flex-start", gap: "8px" }}>
                        <Info size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                        <span>Penarikan on-chain akan dikirimkan dalam bentuk <strong>USDT (BEP-20) di BNB Chain</strong> ke alamat wallet eksternal Anda.</span>
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
                            Jumlah Penarikan (USDT)
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
                                ${w.amountUsdc.toFixed(2)} USDT
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
            <div className="w-full lg:col-span-5 flex flex-col gap-5">
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
        holdbackUsdc={holdbackUsdc}
        totalWithdrawnUsdc={totalWithdrawnUsdc}
        userWalletAddress={currentWalletAddress}
        userDisplayName={user?.displayName || "Clipper"}
        onWithdrawSuccess={(withdrawnUsdc, receiptData) => {
          setAvailableUsdc((prev) => {
            const next = Math.max(0, prev - withdrawnUsdc);
            localStorage.setItem("demo_availableUsdc", String(next));
            return next;
          });
          setTotalWithdrawnUsdc((prev) => {
            const next = prev + withdrawnUsdc;
            localStorage.setItem("demo_totalWithdrawnUsdc", String(next));
            return next;
          });
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
