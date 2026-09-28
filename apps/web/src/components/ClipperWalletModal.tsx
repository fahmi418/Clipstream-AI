"use client";

import { useState } from "react";
import {
  Wallet,
  X,
  Coins,
  ArrowRight,
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
  Zap,
  Info,
  Lock,
} from "lucide-react";
import { authApi, type User } from "@/lib/api";
import { PokoOffRampModal } from "@/components/PokoOffRampModal";

interface ClipperWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  availableBalanceUsdc?: number;
  onWithdrawSuccess?: (newBalance: number) => void;
}

import { EWALLET_PROVIDERS, BANK_PROVIDERS } from "@/data/payment-providers";

export function ClipperWalletModal({
  isOpen,
  onClose,
  user,
  availableBalanceUsdc = 16.43,
  onWithdrawSuccess,
}: ClipperWalletModalProps) {
  const [activeTab, setActiveTab] = useState<"WITHDRAW" | "CRYPTO" | "FAQ">("WITHDRAW");
  const [withdrawType, setWithdrawType] = useState<"EWALLET" | "BANK">("EWALLET");
  const [selectedProvider, setSelectedProvider] = useState<string>("DANA");

  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState(user?.displayName || "");
  const [amountUsdc, setAmountUsdc] = useState<string>(availableBalanceUsdc.toString());
  const [cryptoAddress, setCryptoAddress] = useState("");

  const [copiedAddress, setCopiedCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPokoModal, setShowPokoModal] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<{
    id: string;
    amountUsdc: number;
    amountIdr: number;
    provider: string;
    accountNumber: string;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const currentWalletAddress = user?.walletAddress || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  const idrRate = 16300;
  const numAmount = parseFloat(amountUsdc) || 0;
  const estimatedIdr = Math.round(numAmount * idrRate);

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(currentWalletAddress);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (numAmount <= 0) {
      setErrorMsg("Jumlah penarikan harus lebih dari 0.");
      return;
    }

    if (numAmount > availableBalanceUsdc) {
      setErrorMsg(`Saldo tidak mencukupi. Maksimal saldo tersedia adalah $${availableBalanceUsdc.toFixed(2)} USDT.`);
      return;
    }

    if (activeTab === "WITHDRAW") {
      if (!accountNumber.trim()) {
        setErrorMsg(`Harap masukkan ${withdrawType === "EWALLET" ? "Nomor HP E-Wallet" : "Nomor Rekening Bank"}.`);
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
        type: activeTab === "CRYPTO" ? "CRYPTO" : withdrawType,
        provider: activeTab === "CRYPTO" ? "BNB_CHAIN" : selectedProvider,
        accountNumber: activeTab === "CRYPTO" ? cryptoAddress.trim() : accountNumber.trim(),
        accountName: accountName.trim() || undefined,
        amountUsdc: numAmount,
      });

      setSuccessReceipt({
        id: res.withdrawalId,
        amountUsdc: res.amountUsdc,
        amountIdr: res.amountIdr,
        provider: res.provider,
        accountNumber: res.accountNumber,
        message: res.message,
      });

      if (onWithdrawSuccess) {
        onWithdrawSuccess(Math.max(0, availableBalanceUsdc - numAmount));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memproses penarikan. Silakan coba lagi.";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSuccessReceipt(null);
    setErrorMsg(null);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        boxSizing: "border-box",
        fontFamily: "var(--font-inter), sans-serif",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          backgroundColor: "#ffffff",
          borderRadius: "24px",
          border: "1px solid rgba(0, 0, 0, 0.08)",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.15)",
          maxHeight: "92vh",
          overflowY: "auto",
          position: "relative",
          boxSizing: "border-box",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gradient Accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "2rem",
            right: "2rem",
            height: "3px",
            background: "linear-gradient(90deg, #10b981 0%, #f59e0b 50%, #e8400d 100%)",
            borderRadius: "9999px",
          }}
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            backgroundColor: "rgba(0,0,0,0.04)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#666",
            transition: "all 0.15s ease",
          }}
        >
          <X size={16} />
        </button>

        <div style={{ padding: "clamp(1.25rem, 4vw, 2rem)" }}>
          {/* Modal Header */}
          <div style={{ marginBottom: "1.25rem" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "3px 10px",
                borderRadius: "9999px",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                color: "#059669",
                fontSize: "0.6875rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.6px",
                marginBottom: "0.5rem",
              }}
            >
              <ShieldCheck size={13} />
              <span>Dompet Reward Kreator</span>
            </div>
            <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#111111", margin: 0 }}>
              Dompet &amp; Pencairan Saldo
            </h2>
            <p style={{ fontSize: "0.8125rem", color: "#666666", margin: "4px 0 0 0" }}>
              Tarik reward video klip kamu langsung ke DANA, GoPay, Bank, atau Web3 Wallet.
            </p>
          </div>

          {/* Balance Overview Card */}
          <div
            style={{
              padding: "1.125rem",
              borderRadius: "18px",
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
              color: "#ffffff",
              marginBottom: "1.25rem",
              boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.2)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "rgba(255,255,255,0.7)", textTransform: "uppercase" }}>
                Saldo Reward Siap Tarik
              </span>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(16, 185, 129, 0.2)",
                  color: "#34d399",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                }}
              >
                <CheckCircle2 size={11} />
                <span>Otomatis Aktif</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
                ${availableBalanceUsdc.toFixed(2)}
              </span>
              <span style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#34d399" }}>USDT</span>
            </div>

            <div style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.7)", marginTop: "2px" }}>
              ≈ Rp {(availableBalanceUsdc * idrRate).toLocaleString("id-ID")}
            </div>

            {/* Wallet address bar */}
            <div
              style={{
                marginTop: "0.875rem",
                paddingTop: "0.75rem",
                borderTop: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "0.75rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "rgba(255,255,255,0.6)" }}>
                <Wallet size={13} />
                <span>Alamat On-Chain:</span>
                <span style={{ color: "#fff", fontFamily: "monospace", fontWeight: 600 }}>
                  {currentWalletAddress.slice(0, 6)}...{currentWalletAddress.slice(-4)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyWallet}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  color: "#fff",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {copiedAddress ? <Check size={11} color="#34d399" /> : <Copy size={11} />}
                <span>{copiedAddress ? "Tersalin!" : "Salin"}</span>
              </button>
            </div>
          </div>

          {/* Poko Instant Off-Ramp CTA (Option B) */}
          <button
            type="button"
            onClick={() => setShowPokoModal(true)}
            style={{
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
              marginBottom: "1.25rem",
              boxShadow: "0 4px 14px rgba(17, 142, 234, 0.25)",
            }}
          >
            <Zap size={15} />
            <span>Tarik Instan ke DANA / Bank via Poko (1-Klik)</span>
            <ArrowRight size={14} />
          </button>

          {/* Success Receipt State */}
          {successReceipt ? (
            <div
              style={{
                padding: "1.25rem",
                borderRadius: "16px",
                backgroundColor: "#ecfdf5",
                border: "1px solid #a7f3d0",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "#10b981",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 0.75rem auto",
                }}
              >
                <Check size={24} strokeWidth={3} />
              </div>

              <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#065f46", margin: "0 0 4px 0" }}>
                Permintaan Penarikan Berhasil!
              </h3>
              <p style={{ fontSize: "0.8125rem", color: "#047857", margin: "0 0 1rem 0" }}>
                {successReceipt.message}
              </p>

              <div
                style={{
                  backgroundColor: "#ffffff",
                  padding: "0.875rem",
                  borderRadius: "12px",
                  textAlign: "left",
                  fontSize: "0.8125rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  border: "1px solid #d1fae5",
                  marginBottom: "1rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#666" }}>ID Transaksi:</span>
                  <span style={{ fontWeight: 700, fontFamily: "monospace" }}>{successReceipt.id}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#666" }}>Penerima:</span>
                  <span style={{ fontWeight: 700 }}>
                    {successReceipt.provider} ({successReceipt.accountNumber})
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#666" }}>Total Dicairkan:</span>
                  <span style={{ fontWeight: 800, color: "#059669" }}>
                    Rp {successReceipt.amountIdr.toLocaleString("id-ID")} (${successReceipt.amountUsdc} USDT)
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#666" }}>Estimasi Masuk:</span>
                  <span style={{ fontWeight: 600, color: "#111" }}>1 - 5 Menit</span>
                </div>
              </div>

              <button
                type="button"
                onClick={resetForm}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "10px",
                  backgroundColor: "#059669",
                  color: "#fff",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Tutup / Tarik Lagi
              </button>
            </div>
          ) : (
            <>
              {/* Navigation Tabs */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  padding: "4px",
                  backgroundColor: "#f1f0ec",
                  borderRadius: "14px",
                  gap: "4px",
                  marginBottom: "1.25rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("WITHDRAW");
                    setErrorMsg(null);
                  }}
                  style={{
                    padding: "7px 10px",
                    borderRadius: "10px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: activeTab === "WITHDRAW" ? "#ffffff" : "transparent",
                    color: activeTab === "WITHDRAW" ? "#111111" : "#666666",
                    boxShadow: activeTab === "WITHDRAW" ? "0 2px 5px rgba(0,0,0,0.05)" : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                  }}
                >
                  <Smartphone size={13} />
                  <span>DANA / Bank</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("CRYPTO");
                    setErrorMsg(null);
                  }}
                  style={{
                    padding: "7px 10px",
                    borderRadius: "10px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: activeTab === "CRYPTO" ? "#ffffff" : "transparent",
                    color: activeTab === "CRYPTO" ? "#111111" : "#666666",
                    boxShadow: activeTab === "CRYPTO" ? "0 2px 5px rgba(0,0,0,0.05)" : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                  }}
                >
                  <Wallet size={13} />
                  <span>MetaMask / Web3</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("FAQ");
                    setErrorMsg(null);
                  }}
                  style={{
                    padding: "7px 10px",
                    borderRadius: "10px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: activeTab === "FAQ" ? "#ffffff" : "transparent",
                    color: activeTab === "FAQ" ? "#111111" : "#666666",
                    boxShadow: activeTab === "FAQ" ? "0 2px 5px rgba(0,0,0,0.05)" : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                  }}
                >
                  <HelpCircle size={13} />
                  <span>Bantuan</span>
                </button>
              </div>

              {/* Error Banner */}
              {errorMsg && (
                <div
                  style={{
                    marginBottom: "1rem",
                    padding: "0.75rem",
                    borderRadius: "10px",
                    backgroundColor: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#b91c1c",
                    fontSize: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* TAB 1: E-Wallet / Bank Withdrawal */}
              {activeTab === "WITHDRAW" && (
                <form onSubmit={handleWithdrawSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {/* Sub-selector: E-Wallet vs Bank */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setWithdrawType("EWALLET");
                        setSelectedProvider("DANA");
                      }}
                      style={{
                        flex: "1 1 160px",
                        padding: "8px",
                        borderRadius: "10px",
                        border: withdrawType === "EWALLET" ? "2px solid #e8400d" : "1px solid rgba(0,0,0,0.1)",
                        backgroundColor: withdrawType === "EWALLET" ? "#fff8f5" : "#faf9f6",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: withdrawType === "EWALLET" ? "#e8400d" : "#666",
                        cursor: "pointer",
                        textAlign: "center",
                        lineHeight: 1.35,
                      }}
                    >
                      E-Wallet (DANA/GoPay/OVO)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setWithdrawType("BANK");
                        setSelectedProvider("BCA");
                      }}
                      style={{
                        flex: "1 1 160px",
                        padding: "8px",
                        borderRadius: "10px",
                        border: withdrawType === "BANK" ? "2px solid #005baa" : "1px solid rgba(0,0,0,0.1)",
                        backgroundColor: withdrawType === "BANK" ? "#eef6fc" : "#faf9f6",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: withdrawType === "BANK" ? "#005baa" : "#666",
                        cursor: "pointer",
                        textAlign: "center",
                        lineHeight: 1.35,
                      }}
                    >
                      Transfer Bank (BCA/Mandiri/BRI)
                    </button>
                  </div>

                  {/* Provider Pills */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#333", marginBottom: "6px" }}>
                      Pilih {withdrawType === "EWALLET" ? "E-Wallet Tujuan" : "Bank Tujuan"}
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "6px" }}>
                      {(withdrawType === "EWALLET" ? EWALLET_PROVIDERS : BANK_PROVIDERS).map((p) => {
                        const isSelected = selectedProvider === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setSelectedProvider(p.id)}
                            style={{
                              padding: "8px 4px",
                              borderRadius: "10px",
                              border: isSelected ? `2px solid ${p.color}` : "1px solid rgba(0,0,0,0.08)",
                              backgroundColor: isSelected ? p.bg : "#faf9f6",
                              color: isSelected ? p.color : "#555",
                              fontSize: "0.75rem",
                              fontWeight: isSelected ? 800 : 600,
                              cursor: "pointer",
                              textAlign: "center",
                            }}
                          >
                            {p.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Account Number & Name */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "8px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#333", marginBottom: "4px" }}>
                        {withdrawType === "EWALLET" ? "Nomor HP Akun" : "Nomor Rekening"} <span style={{ color: "#e8400d" }}>*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={withdrawType === "EWALLET" ? "081234567890" : "1234567890"}
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        style={{
                          width: "100%",
                          height: "40px",
                          padding: "0 10px",
                          borderRadius: "10px",
                          border: "1px solid rgba(0,0,0,0.12)",
                          fontSize: "0.8125rem",
                          color: "#111",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#333", marginBottom: "4px" }}>
                        Nama Pemilik
                      </label>
                      <input
                        type="text"
                        placeholder="Nama Akun"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        style={{
                          width: "100%",
                          height: "40px",
                          padding: "0 10px",
                          borderRadius: "10px",
                          border: "1px solid rgba(0,0,0,0.12)",
                          fontSize: "0.8125rem",
                          color: "#111",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>

                  {/* Amount to withdraw */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#333" }}>
                        Jumlah Penarikan (USDT)
                      </label>
                      <button
                        type="button"
                        onClick={() => setAmountUsdc(availableBalanceUsdc.toString())}
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
                        Tarik Semua (${availableBalanceUsdc.toFixed(2)})
                      </button>
                    </div>

                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontWeight: 700, color: "#666" }}>
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.5"
                        max={availableBalanceUsdc}
                        value={amountUsdc}
                        onChange={(e) => setAmountUsdc(e.target.value)}
                        style={{
                          width: "100%",
                          height: "42px",
                          padding: "0 12px 0 26px",
                          borderRadius: "10px",
                          border: "1px solid rgba(0,0,0,0.14)",
                          fontSize: "0.9375rem",
                          fontWeight: 700,
                          color: "#111",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    {/* Conversion info */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "0.75rem", color: "#666" }}>
                      <span>Kurs: 1 USDT = Rp {idrRate.toLocaleString("id-ID")}</span>
                      <span style={{ fontWeight: 700, color: "#059669" }}>
                        Kamu terima: Rp {estimatedIdr.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || availableBalanceUsdc < 0.5}
                    style={{
                      width: "100%",
                      height: "46px",
                      borderRadius: "12px",
                      backgroundColor: availableBalanceUsdc >= 0.5 ? "#111111" : "#cccccc",
                      color: "#ffffff",
                      fontSize: "0.875rem",
                      fontWeight: 700,
                      border: "none",
                      cursor: availableBalanceUsdc >= 0.5 ? "pointer" : "not-allowed",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      marginTop: "4px",
                    }}
                  >
                    {isSubmitting ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        <span>Tarik Rp {estimatedIdr.toLocaleString("id-ID")}</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* TAB 2: Direct Web3 / Crypto Transfer */}
              {activeTab === "CRYPTO" && (
                <form onSubmit={handleWithdrawSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ padding: "0.75rem", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", color: "#166534", fontSize: "0.75rem", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <Info size={15} style={{ flexShrink: 0, marginTop: "2px" }} />
                    <span>Transfer USDT langsung ke MetaMask, TrustWallet, Binance, atau Indodax Anda melalui jaringan <strong>BNB Chain (BEP-20)</strong> dengan biaya gas nol (gasless).</span>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#333", marginBottom: "4px" }}>
                      Alamat Wallet EVM Penerima (0x...) <span style={{ color: "#e8400d" }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="0x..."
                      value={cryptoAddress}
                      onChange={(e) => setCryptoAddress(e.target.value)}
                      style={{
                        width: "100%",
                        height: "42px",
                        padding: "0 10px",
                        borderRadius: "10px",
                        border: "1px solid rgba(0,0,0,0.12)",
                        fontSize: "0.8125rem",
                        color: "#111",
                        outline: "none",
                        boxSizing: "border-box",
                        fontFamily: "monospace",
                      }}
                    />
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#333" }}>
                        Jumlah USDT
                      </label>
                      <button
                        type="button"
                        onClick={() => setAmountUsdc(availableBalanceUsdc.toString())}
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
                        Maksimal (${availableBalanceUsdc.toFixed(2)})
                      </button>
                    </div>

                    <input
                      type="number"
                      step="0.01"
                      min="0.5"
                      max={availableBalanceUsdc}
                      value={amountUsdc}
                      onChange={(e) => setAmountUsdc(e.target.value)}
                      style={{
                        width: "100%",
                        height: "42px",
                        padding: "0 12px",
                        borderRadius: "10px",
                        border: "1px solid rgba(0,0,0,0.14)",
                        fontSize: "0.9375rem",
                        fontWeight: 700,
                        color: "#111",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || availableBalanceUsdc < 0.5}
                    style={{
                      width: "100%",
                      height: "46px",
                      borderRadius: "12px",
                      backgroundColor: availableBalanceUsdc >= 0.5 ? "#111111" : "#cccccc",
                      color: "#ffffff",
                      fontSize: "0.875rem",
                      fontWeight: 700,
                      border: "none",
                      cursor: availableBalanceUsdc >= 0.5 ? "pointer" : "not-allowed",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    {isSubmitting ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        <Wallet size={16} />
                        <span>Kirim {numAmount} USDT On-Chain</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* TAB 3: Beginner FAQ (K.I.S.S.) */}
              {activeTab === "FAQ" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.8125rem" }}>
                  <div style={{ padding: "0.75rem", borderRadius: "10px", backgroundColor: "#faf9f6", border: "1px solid rgba(0,0,0,0.06)" }}>
                    <div style={{ fontWeight: 700, color: "#111", marginBottom: "3px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <HelpCircle size={14} color="#e8400d" />
                      <span>Apakah saya butuh aplikasi MetaMask untuk mulai?</span>
                    </div>
                    <div style={{ color: "#666", lineHeight: 1.45 }}>
                      <strong>Tidak perlu!</strong> Akun Clipstream kamu otomatis dibuatkan dompet pintar di BNB Chain. Kamu bisa langsung menarik hasil klip ke <strong>DANA, GoPay, OVO, atau Rekening Bank</strong> dalam bentuk Rupiah.
                    </div>
                  </div>

                  <div style={{ padding: "0.75rem", borderRadius: "10px", backgroundColor: "#faf9f6", border: "1px solid rgba(0,0,0,0.06)" }}>
                    <div style={{ fontWeight: 700, color: "#111", marginBottom: "3px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Coins size={14} color="#e8400d" />
                      <span>Berapa minimal penarikan?</span>
                    </div>
                    <div style={{ color: "#666", lineHeight: 1.45 }}>
                      Minimal penarikan hanya <strong>$0.50 USDT (~Rp 8.150)</strong>. Proses penarikan otomatis diproses dalam 1-5 menit.
                    </div>
                  </div>

                  <div style={{ padding: "0.75rem", borderRadius: "10px", backgroundColor: "#faf9f6", border: "1px solid rgba(0,0,0,0.06)" }}>
                    <div style={{ fontWeight: 700, color: "#111", marginBottom: "3px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Lock size={14} color="#e8400d" />
                      <span>Bagaimana jika saya ingin ekspor ke wallet pribadi?</span>
                    </div>
                    <div style={{ color: "#666", lineHeight: 1.45 }}>
                      Kamu bisa menggunakan opsi <em>MetaMask / Web3</em> di atas untuk mentransfer saldo kripto kamu ke wallet pribadi atau exchange lokal kapan saja.
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Poko Off-Ramp SDK Modal (Option B) */}
      <PokoOffRampModal
        isOpen={showPokoModal}
        onClose={() => setShowPokoModal(false)}
        availableBalanceUsdc={availableBalanceUsdc}
        userWalletAddress={currentWalletAddress}
        userDisplayName={user?.displayName || "Clipper"}
        onWithdrawSuccess={(withdrawnUsdc) => {
          onWithdrawSuccess?.(Math.max(0, availableBalanceUsdc - withdrawnUsdc));
        }}
      />
    </div>
  );
}
