"use client";

import { useState } from "react";
import {
  X,
  CheckCircle2,
  Share2,
  Download,
  ShieldCheck,
  Zap,
  ArrowDownLeft,
  ChevronRight,
  Sparkles,
  Smartphone,
  Copy,
  Check,
} from "lucide-react";

export interface VirtualPhoneSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: {
    orderId?: string;
    amountUsdt?: number;
    amountIdr?: number;
    grossIdr?: number;
    platformFeeIdr?: number;
    pokoFeeIdr?: number;
    netIdrReceived: number;
    provider: string;
    accountNumber: string;
    accountName: string;
    txHash?: string;
    timestamp?: string;
  } | null;
}

export function VirtualPhoneSimulatorModal({
  isOpen,
  onClose,
  receiptData,
}: VirtualPhoneSimulatorModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen || !receiptData) return null;

  const provider = (receiptData.provider || "DANA").toUpperCase();
  const netIdr = receiptData.netIdrReceived || 0;
  const orderId = receiptData.orderId || `POKO-IDR-${Date.now().toString(36).toUpperCase()}`;
  const biFastRef = `BIFAST-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${Math.floor(100000 + Math.random() * 900000)}`;
  const timeFormatted = receiptData.timestamp || new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  const dateFormatted = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  const handleCopy = (val: string, field: string) => {
    navigator.clipboard.writeText(val);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Provider branding theme
  const getTheme = () => {
    switch (provider) {
      case "DANA":
        return {
          headerBg: "linear-gradient(135deg, #118eea 0%, #0077c8 100%)",
          accentColor: "#118eea",
          appName: "DANA",
          category: "Saldo DANA",
          iconChar: "D",
        };
      case "GOPAY":
        return {
          headerBg: "linear-gradient(135deg, #00aed6 0%, #008fae 100%)",
          accentColor: "#00aed6",
          appName: "GoPay",
          category: "Saldo GoPay",
          iconChar: "G",
        };
      case "OVO":
        return {
          headerBg: "linear-gradient(135deg, #4c2a86 0%, #351c61 100%)",
          accentColor: "#4c2a86",
          appName: "OVO Cash",
          category: "Saldo OVO",
          iconChar: "O",
        };
      case "SHOPEEPAY":
        return {
          headerBg: "linear-gradient(135deg, #ee4d2d 0%, #c4381b 100%)",
          accentColor: "#ee4d2d",
          appName: "ShopeePay",
          category: "Saldo ShopeePay",
          iconChar: "S",
        };
      case "BCA":
        return {
          headerBg: "linear-gradient(135deg, #005baa 0%, #003e75 100%)",
          accentColor: "#005baa",
          appName: "myBCA",
          category: "Transfer Masuk BI-FAST",
          iconChar: "BCA",
        };
      case "MANDIRI":
        return {
          headerBg: "linear-gradient(135deg, #003d79 0%, #00264d 100%)",
          accentColor: "#003d79",
          appName: "Livin' Mandiri",
          category: "Transfer Masuk BI-FAST",
          iconChar: "M",
        };
      default:
        return {
          headerBg: "linear-gradient(135deg, #118eea 0%, #0077c8 100%)",
          accentColor: "#118eea",
          appName: provider,
          category: "Transfer Masuk",
          iconChar: provider.slice(0, 2),
        };
    }
  };

  const theme = getTheme();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100001,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(8px)",
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
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          maxWidth: "380px",
          width: "100%",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Smartphone Chassis Frame */}
        <div
          style={{
            width: "100%",
            backgroundColor: "#111111",
            borderRadius: "44px",
            padding: "10px",
            boxShadow:
              "0 25px 70px -10px rgba(0, 0, 0, 0.7), 0 0 0 4px #2c2c2e, 0 0 0 6px #1c1c1e",
            position: "relative",
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          {/* Top Dynamic Island / Speaker */}
          <div
            style={{
              position: "absolute",
              top: "14px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "100px",
              height: "22px",
              backgroundColor: "#000000",
              borderRadius: "14px",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 10px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#1c1c1e",
              }}
            />
            <div
              style={{
                width: "9px",
                height: "9px",
                borderRadius: "50%",
                backgroundColor: "#0b2038",
                border: "1.5px solid #1a3a60",
              }}
            />
          </div>

          {/* Smartphone Inner Screen */}
          <div
            style={{
              backgroundColor: "#f8f9fa",
              borderRadius: "36px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              height: "580px",
              position: "relative",
              fontFamily: "var(--font-inter), system-ui, sans-serif",
            }}
          >
            {/* Status Bar */}
            <div
              style={{
                height: "40px",
                padding: "0 22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "0.6875rem",
                fontWeight: 700,
                color: "#ffffff",
                background: theme.headerBg,
                position: "relative",
                zIndex: 5,
              }}
            >
              <span>{timeFormatted}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>

            {/* App Header Banner */}
            <div
              style={{
                background: theme.headerBg,
                padding: "10px 18px 20px 18px",
                color: "#ffffff",
                textAlign: "center",
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "6px",
                      backgroundColor: "rgba(255,255,255,0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10px",
                      fontWeight: 800,
                    }}
                  >
                    {theme.iconChar}
                  </div>
                  <span style={{ fontSize: "0.8125rem", fontWeight: 700 }}>
                    {theme.appName}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "0.625rem",
                    backgroundColor: "rgba(255,255,255,0.2)",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontWeight: 600,
                  }}
                >
                  BI-FAST LIVE
                </span>
              </div>

              {/* Verified Icon & Main Status */}
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "#ffffff",
                  color: "#10b981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 8px auto",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                }}
              >
                <CheckCircle2 size={32} />
              </div>

              <div style={{ fontSize: "0.875rem", fontWeight: 700, letterSpacing: "-0.01em" }}>
                Transaksi Berhasil
              </div>
              <div style={{ fontSize: "0.6875rem", opacity: 0.9, marginTop: "2px" }}>
                {dateFormatted}, {timeFormatted} WIB
              </div>

              {/* Large Net Amount */}
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  marginTop: "8px",
                  letterSpacing: "-0.02em",
                }}
              >
                Rp {netIdr.toLocaleString("id-ID")}
              </div>
            </div>

            {/* Receipt Card Body (Scrollable) */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "14px 16px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {/* Detail Transaksi Card */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "14px",
                  padding: "12px 14px",
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "9px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    color: "#888",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Rincian Penerimaan
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                  <span style={{ color: "#666" }}>Jenis Transaksi</span>
                  <span style={{ fontWeight: 600, color: "#111" }}>{theme.category}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                  <span style={{ color: "#666" }}>Pengirim</span>
                  <span style={{ fontWeight: 700, color: "#118eea" }}>
                    PT Poko Finansial (ClipStream)
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                  <span style={{ color: "#666" }}>Penerima</span>
                  <span style={{ fontWeight: 600, color: "#111" }}>{receiptData.accountName}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                  <span style={{ color: "#666" }}>No. Tujuan</span>
                  <span style={{ fontWeight: 600, color: "#111", fontFamily: "monospace" }}>
                    {receiptData.accountNumber}
                  </span>
                </div>

                <div
                  style={{
                    height: "1px",
                    backgroundColor: "rgba(0,0,0,0.06)",
                    margin: "2px 0",
                  }}
                />

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                  <span style={{ color: "#666" }}>No. Ref BI-FAST</span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      cursor: "pointer",
                    }}
                    onClick={() => handleCopy(biFastRef, "bifast")}
                  >
                    <span style={{ fontWeight: 600, color: "#444", fontFamily: "monospace", fontSize: "0.6875rem" }}>
                      {biFastRef}
                    </span>
                    {copiedField === "bifast" ? (
                      <Check size={11} color="#10b981" />
                    ) : (
                      <Copy size={11} color="#888" />
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                  <span style={{ color: "#666" }}>Poko Order ID</span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      cursor: "pointer",
                    }}
                    onClick={() => handleCopy(orderId, "orderId")}
                  >
                    <span style={{ fontWeight: 600, color: "#118eea", fontFamily: "monospace", fontSize: "0.6875rem" }}>
                      {orderId}
                    </span>
                    {copiedField === "orderId" ? (
                      <Check size={11} color="#10b981" />
                    ) : (
                      <Copy size={11} color="#888" />
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                  <span style={{ color: "#666" }}>Metode Jaringan</span>
                  <span style={{ fontWeight: 600, color: "#10b981" }}>
                    opBNB Smart Escrow → Poko FX Rail
                  </span>
                </div>
              </div>

              {/* Guarantee Seal Box */}
              <div
                style={{
                  backgroundColor: "#ecfdf5",
                  borderRadius: "12px",
                  padding: "10px 12px",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <ShieldCheck size={18} color="#10b981" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: "0.6875rem", color: "#065f46", lineHeight: 1.3 }}>
                  Transaksi ini dijamin resmi oleh BI-FAST rail berlisensi Bank Indonesia &amp; Smart Contract Escrow opBNB.
                </div>
              </div>
            </div>

            {/* Bottom App Navigation Bar Simulation */}
            <div
              style={{
                backgroundColor: "#ffffff",
                borderTop: "1px solid rgba(0,0,0,0.06)",
                padding: "8px 16px 14px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxSizing: "border-box",
              }}
            >
              <button
                type="button"
                onClick={onClose}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "12px",
                  backgroundColor: theme.accentColor,
                  color: "#ffffff",
                  border: "none",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Tutup Layar Simulasi HP
              </button>
            </div>

            {/* iPhone Home Bar Indicator */}
            <div
              style={{
                position: "absolute",
                bottom: "4px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "120px",
                height: "4px",
                backgroundColor: "#000000",
                borderRadius: "9999px",
                opacity: 0.6,
              }}
            />
          </div>
        </div>

        {/* Outer Close / Dismiss Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: "8px 18px",
            borderRadius: "9999px",
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            color: "#ffffff",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            fontSize: "0.8125rem",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            backdropFilter: "blur(4px)",
          }}
        >
          <X size={15} />
          <span>Tutup Simulasi HP (Kembali ke App)</span>
        </button>
      </div>
    </div>
  );
}
