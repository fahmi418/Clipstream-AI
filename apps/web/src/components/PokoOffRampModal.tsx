"use client";

import { useState } from "react";
import {
  X,
  Zap,
  Coins,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Loader2,
  ArrowRight,
  Smartphone,
  Building,
  Lock,
  Sparkles,
  Info,
  Copy,
  Check,
} from "lucide-react";
import { authApi } from "@/lib/api";

export interface PokoOffRampModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalanceUsdc: number;
  userWalletAddress?: string;
  userDisplayName?: string;
  onWithdrawSuccess?: (withdrawnUsdc: number, receiptData: any) => void;
}

const SUPPORTED_EWALLETS = [
  { id: "DANA", name: "DANA", color: "#118eea", bg: "#eef7fe" },
  { id: "GOPAY", name: "GoPay", color: "#00aed6", bg: "#e6f8fc" },
  { id: "OVO", name: "OVO", color: "#4c2a86", bg: "#f3effa" },
  { id: "SHOPEEPAY", name: "ShopeePay", color: "#ee4d2d", bg: "#feeeea" },
];

const SUPPORTED_BANKS = [
  { id: "BCA", name: "BCA", color: "#005baa", bg: "#e6eff7" },
  { id: "MANDIRI", name: "Mandiri", color: "#003d79", bg: "#e6ecf2" },
  { id: "BRI", name: "BRI", color: "#00529c", bg: "#e6eef5" },
  { id: "BNI", name: "BNI", color: "#f15a24", bg: "#feefe9" },
];

export function PokoOffRampModal({
  isOpen,
  onClose,
  availableBalanceUsdc,
  userWalletAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  userDisplayName = "Clipper",
  onWithdrawSuccess,
}: PokoOffRampModalProps) {
  const [method, setMethod] = useState<"EWALLET" | "BANK">("EWALLET");
  const [provider, setProvider] = useState("DANA");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState(userDisplayName);
  const [amountUsdt, setAmountUsdt] = useState<string>(
    availableBalanceUsdc > 0 ? availableBalanceUsdc.toFixed(2) : "10"
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<"INPUT" | "PROCESSING" | "SUCCESS">("INPUT");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<any | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  if (!isOpen) return null;

  const rawAmount = parseFloat(amountUsdt) || 0;
  const idrRate = 16300;
  const grossIdr = Math.round(rawAmount * idrRate);

  // Financial Fee Structure
  const platformFeeBps = 0.05; // 5.00%
  const pokoGatewayFeeBps = 0.012; // 1.20%

  const platformFeeIdr = Math.round(grossIdr * platformFeeBps);
  const pokoFeeIdr = Math.round(grossIdr * pokoGatewayFeeBps);
  const netIdrReceived = Math.max(0, grossIdr - platformFeeIdr - pokoFeeIdr);

  const handleStartWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (rawAmount < 1) {
      setErrorMsg("Minimal pencairan via Poko adalah $1.00 USDT.");
      return;
    }

    if (rawAmount > availableBalanceUsdc) {
      setErrorMsg(`Saldo tidak mencukupi. Saldo tersedia: $${availableBalanceUsdc.toFixed(2)} USDT.`);
      return;
    }

    if (!accountNumber.trim()) {
      setErrorMsg(
        `Harap isi ${method === "EWALLET" ? "nomor HP DANA/GoPay" : "nomor rekening bank"}.`
      );
      return;
    }

    try {
      setIsProcessing(true);
      setStep("PROCESSING");

      // Call backend withdrawal API
      const res = await authApi.withdraw({
        type: method,
        provider,
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim() || undefined,
        amountUsdc: rawAmount,
      });

      const receiptPayload = {
        orderId: `POKO-IDR-${Date.now().toString(36).toUpperCase()}`,
        amountUsdt: rawAmount,
        grossIdr,
        platformFeeIdr,
        pokoFeeIdr,
        netIdrReceived,
        provider,
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim() || "Clipper Account",
        txHash: res.txHash || `0x${Math.random().toString(16).slice(2, 66)}`,
        timestamp: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      };

      setReceipt(receiptPayload);
      setStep("SUCCESS");
      onWithdrawSuccess?.(rawAmount, receiptPayload);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal memproses penarikan via Poko SDK");
      setStep("INPUT");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyHash = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        boxSizing: "border-box",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          backgroundColor: "#ffffff",
          borderRadius: "24px",
          border: "1px solid rgba(0, 0, 0, 0.08)",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          position: "relative",
          boxSizing: "border-box",
          fontFamily: "var(--font-inter), sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Accent */}
        <div
          style={{
            height: "4px",
            background: "linear-gradient(90deg, #118eea 0%, #00aed6 50%, #10b981 100%)",
          }}
        />

        {/* Modal Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "#eef7fe",
                color: "#118eea",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Zap size={20} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#111",
                    margin: 0,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Poko Off-Ramp Instan
                </h3>
                <span
                  style={{
                    fontSize: "0.625rem",
                    fontWeight: 700,
                    color: "#118eea",
                    backgroundColor: "#eef7fe",
                    padding: "2px 6px",
                    borderRadius: "9999px",
                  }}
                >
                  WEB3 SDK
                </span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "#666", margin: 0 }}>
                USDT opBNB → Rupiah DANA/GoPay/Bank dalam hitungan detik
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              border: "1px solid rgba(0,0,0,0.06)",
              backgroundColor: "#f5f5f5",
              color: "#666",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "1.5rem", maxHeight: "80vh", overflowY: "auto" }}>
          {step === "INPUT" && (
            <form onSubmit={handleStartWithdrawal}>
              {/* Method Switcher */}
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  padding: "4px",
                  backgroundColor: "#f5f4f0",
                  borderRadius: "12px",
                  marginBottom: "1.25rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setMethod("EWALLET");
                    setProvider("DANA");
                  }}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    padding: "8px 12px",
                    borderRadius: "10px",
                    border: "none",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    backgroundColor: method === "EWALLET" ? "#ffffff" : "transparent",
                    color: method === "EWALLET" ? "#111" : "#777",
                    boxShadow: method === "EWALLET" ? "0 2px 6px rgba(0,0,0,0.05)" : "none",
                  }}
                >
                  <Smartphone size={15} />
                  <span>E-Wallet (DANA/GoPay)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMethod("BANK");
                    setProvider("BCA");
                  }}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    padding: "8px 12px",
                    borderRadius: "10px",
                    border: "none",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    backgroundColor: method === "BANK" ? "#ffffff" : "transparent",
                    color: method === "BANK" ? "#111" : "#777",
                    boxShadow: method === "BANK" ? "0 2px 6px rgba(0,0,0,0.05)" : "none",
                  }}
                >
                  <Building size={15} />
                  <span>Rekening Bank</span>
                </button>
              </div>

              {/* Provider Selection */}
              <div style={{ marginBottom: "1.25rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#333",
                    marginBottom: "8px",
                  }}
                >
                  Pilih Tujuan Pencairan:
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                  {(method === "EWALLET" ? SUPPORTED_EWALLETS : SUPPORTED_BANKS).map((p) => {
                    const isSelected = provider === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setProvider(p.id)}
                        style={{
                          padding: "10px 6px",
                          borderRadius: "12px",
                          border: isSelected ? `2px solid ${p.color}` : "1px solid rgba(0,0,0,0.08)",
                          backgroundColor: isSelected ? p.bg : "#ffffff",
                          cursor: "pointer",
                          textAlign: "center",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "0.8125rem",
                            fontWeight: 700,
                            color: isSelected ? p.color : "#333",
                          }}
                        >
                          {p.name}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nominal Penarikan */}
              <div style={{ marginBottom: "1.25rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#333",
                    marginBottom: "6px",
                  }}
                >
                  <span>Nominal Penarikan (USDT):</span>
                  <span style={{ color: "#666" }}>
                    Tersedia: <strong>${availableBalanceUsdc.toFixed(2)} USDT</strong>
                  </span>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={availableBalanceUsdc}
                    value={amountUsdt}
                    onChange={(e) => setAmountUsdt(e.target.value)}
                    style={{
                      width: "100%",
                      height: "46px",
                      borderRadius: "12px",
                      border: "1px solid rgba(0,0,0,0.12)",
                      paddingLeft: "14px",
                      paddingRight: "65px",
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: "#111",
                      boxSizing: "border-box",
                      outline: "none",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setAmountUsdt(availableBalanceUsdc.toFixed(2))}
                    style={{
                      position: "absolute",
                      right: "8px",
                      top: "8px",
                      bottom: "8px",
                      padding: "0 10px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: "#111",
                      color: "#fff",
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    MAX
                  </button>
                </div>
              </div>

              {/* No HP / Rekening */}
              <div style={{ marginBottom: "1.25rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#333",
                    marginBottom: "6px",
                  }}
                >
                  {method === "EWALLET" ? "Nomor Handphone Terdaftar:" : "Nomor Rekening Bank:"}
                </label>
                <input
                  type="text"
                  placeholder={method === "EWALLET" ? "Contoh: 081234567890" : "Contoh: 8830192831"}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  style={{
                    width: "100%",
                    height: "46px",
                    borderRadius: "12px",
                    border: "1px solid rgba(0,0,0,0.12)",
                    paddingLeft: "14px",
                    paddingRight: "14px",
                    fontSize: "0.875rem",
                    color: "#111",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    backgroundColor: "#fef2f2",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    color: "#dc2626",
                    fontSize: "0.75rem",
                    marginBottom: "1rem",
                  }}
                >
                  {errorMsg}
                </div>
              )}

              {/* Fee Breakdown Card */}
              <div
                style={{
                  padding: "12px 14px",
                  backgroundColor: "#faf8f5",
                  borderRadius: "14px",
                  border: "1px solid rgba(0,0,0,0.06)",
                  marginBottom: "1.25rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.75rem",
                    color: "#666",
                    marginBottom: "6px",
                  }}
                >
                  <span>Kurs Estimasi (1 USDT)</span>
                  <span style={{ fontWeight: 600, color: "#111" }}>Rp {idrRate.toLocaleString("id-ID")}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.75rem",
                    color: "#666",
                    marginBottom: "6px",
                  }}
                >
                  <span>Gross Estimasi</span>
                  <span style={{ fontWeight: 600, color: "#111" }}>Rp {grossIdr.toLocaleString("id-ID")}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.75rem",
                    color: "#b44800",
                    marginBottom: "6px",
                  }}
                >
                  <span>Biaya Platform ClipStream (5%)</span>
                  <span style={{ fontWeight: 600 }}>- Rp {platformFeeIdr.toLocaleString("id-ID")}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.75rem",
                    color: "#666",
                    marginBottom: "8px",
                  }}
                >
                  <span>Gateway Fee Poko (~1.2%)</span>
                  <span style={{ fontWeight: 600 }}>- Rp {pokoFeeIdr.toLocaleString("id-ID")}</span>
                </div>
                <div
                  style={{
                    height: "1px",
                    backgroundColor: "rgba(0,0,0,0.06)",
                    marginBottom: "8px",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#111" }}>
                    Bersih Diterima di {provider}
                  </span>
                  <span style={{ fontSize: "1rem", fontWeight: 800, color: "#10b981" }}>
                    Rp {netIdrReceived.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                style={{
                  width: "100%",
                  height: "46px",
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
                }}
              >
                <Zap size={16} />
                <span>Konfirmasi & Tarik ke {provider}</span>
                <ArrowRight size={15} />
              </button>
            </form>
          )}

          {step === "PROCESSING" && (
            <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  backgroundColor: "#eef7fe",
                  color: "#118eea",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.25rem",
                }}
              >
                <Loader2 size={30} className="animate-spin" />
              </div>
              <h4 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#111", margin: "0 0 0.5rem 0" }}>
                Memproses Poko Off-Ramp...
              </h4>
              <p style={{ fontSize: "0.8125rem", color: "#666", lineHeight: 1.5, margin: 0 }}>
                Menghubungkan liquidity pool opBNB & mengarahkan transfer Rupiah ke {provider} ({accountNumber}).
              </p>
            </div>
          )}

          {step === "SUCCESS" && receipt && (
            <div style={{ textAlign: "center", padding: "0.5rem 0" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  backgroundColor: "#e6f4ea",
                  color: "#137333",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem",
                }}
              >
                <CheckCircle2 size={32} />
              </div>
              <h4 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#111", margin: "0 0 0.25rem 0" }}>
                Pencairan Berhasil Diproses! 🎉
              </h4>
              <p style={{ fontSize: "0.8125rem", color: "#666", margin: "0 0 1.25rem 0" }}>
                Dana telah dikirim via jaringan BI-FAST ke akun kamu.
              </p>

              <div
                style={{
                  backgroundColor: "#faf8f5",
                  borderRadius: "16px",
                  border: "1px solid rgba(0,0,0,0.06)",
                  padding: "1rem",
                  textAlign: "left",
                  marginBottom: "1.25rem",
                  fontSize: "0.8125rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ color: "#777" }}>Order ID:</span>
                  <span style={{ fontWeight: 600, fontFamily: "monospace" }}>{receipt.orderId}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ color: "#777" }}>Tujuan:</span>
                  <span style={{ fontWeight: 600 }}>{receipt.provider} - {receipt.accountNumber}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ color: "#777" }}>Nominal Ditarik:</span>
                  <span style={{ fontWeight: 600 }}>${receipt.amountUsdt.toFixed(2)} USDT</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ color: "#777" }}>Fee Platform (5%):</span>
                  <span style={{ fontWeight: 600, color: "#b44800" }}>- Rp {receipt.platformFeeIdr.toLocaleString("id-ID")}</span>
                </div>
                <div
                  style={{
                    height: "1px",
                    backgroundColor: "rgba(0,0,0,0.06)",
                    margin: "8px 0",
                  }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, color: "#111" }}>Total Masuk ke Rekening:</span>
                  <span style={{ fontWeight: 800, color: "#10b981", fontSize: "1rem" }}>
                    Rp {receipt.netIdrReceived.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                style={{
                  width: "100%",
                  height: "44px",
                  borderRadius: "12px",
                  backgroundColor: "#111111",
                  color: "#ffffff",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Selesai & Tutup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
