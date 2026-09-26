"use client";

import { useEffect, useState } from "react";
import { Smartphone, X, ArrowUpRight, CheckCircle2 } from "lucide-react";

export interface MobilePushNotificationProps {
  show: boolean;
  onClose: () => void;
  onOpenPhoneSimulator?: () => void;
  provider: string;
  amountIdr: number;
  accountNumber: string;
  accountName: string;
}

export function MobilePushNotification({
  show,
  onClose,
  onOpenPhoneSimulator,
  provider,
  amountIdr,
  accountNumber,
  accountName,
}: MobilePushNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, 10000); // 10s auto-dismiss
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [show, onClose]);

  if (!show && !isVisible) return null;

  // Provider branding config
  const getProviderInfo = () => {
    switch (provider.toUpperCase()) {
      case "DANA":
        return {
          name: "DANA ID",
          color: "#118eea",
          bg: "#118eea",
          textColor: "#ffffff",
          badge: "E-WALLET",
        };
      case "GOPAY":
        return {
          name: "GoPay",
          color: "#00aed6",
          bg: "#00aed6",
          textColor: "#ffffff",
          badge: "E-WALLET",
        };
      case "OVO":
        return {
          name: "OVO",
          color: "#4c2a86",
          bg: "#4c2a86",
          textColor: "#ffffff",
          badge: "E-WALLET",
        };
      case "SHOPEEPAY":
        return {
          name: "ShopeePay",
          color: "#ee4d2d",
          bg: "#ee4d2d",
          textColor: "#ffffff",
          badge: "E-WALLET",
        };
      case "BCA":
        return {
          name: "myBCA Notifikasi",
          color: "#005baa",
          bg: "#005baa",
          textColor: "#ffffff",
          badge: "BANK BI-FAST",
        };
      case "MANDIRI":
        return {
          name: "Livin' by Mandiri",
          color: "#003d79",
          bg: "#003d79",
          textColor: "#ffffff",
          badge: "BANK BI-FAST",
        };
      case "BRI":
        return {
          name: "BRImo Notifikasi",
          color: "#00529c",
          bg: "#00529c",
          textColor: "#ffffff",
          badge: "BANK BI-FAST",
        };
      default:
        return {
          name: `${provider} Notifikasi`,
          color: "#118eea",
          bg: "#118eea",
          textColor: "#ffffff",
          badge: "BI-FAST RAIL",
        };
    }
  };

  const pInfo = getProviderInfo();

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 100000,
        maxWidth: "400px",
        width: "calc(100vw - 40px)",
        transform: isVisible ? "translateY(0) scale(1)" : "translateY(-20px) scale(0.95)",
        opacity: isVisible ? 1 : 0,
        transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        pointerEvents: isVisible ? "auto" : "none",
        fontFamily: "var(--font-inter), system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(23, 23, 23, 0.94)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          color: "#ffffff",
          borderRadius: "20px",
          padding: "14px 16px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.12)",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          border: "1px solid rgba(255, 255, 255, 0.15)",
        }}
      >
        {/* App Title & Time */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "7px",
                backgroundColor: pInfo.bg,
                color: pInfo.textColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "11px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              }}
            >
              {provider.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#fff" }}>
                {pInfo.name}
              </span>
              <span
                style={{
                  fontSize: "0.5625rem",
                  fontWeight: 700,
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  color: "#cbd5e1",
                  padding: "1px 5px",
                  borderRadius: "4px",
                  letterSpacing: "0.02em",
                }}
              >
                {pInfo.badge}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.6875rem", color: "#94a3b8" }}>Baru saja</span>
            <button
              type="button"
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
                padding: "2px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Notification Body */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
          <div
            style={{
              marginTop: "2px",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              backgroundColor: "rgba(16, 185, 129, 0.2)",
              color: "#34d399",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CheckCircle2 size={13} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "#ffffff",
                lineHeight: 1.3,
                marginBottom: "3px",
              }}
            >
              Transfer Dana Masuk:{" "}
              <span style={{ color: "#34d399", fontWeight: 700 }}>
                Rp {amountIdr.toLocaleString("id-ID")}
              </span>
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "#cbd5e1",
                lineHeight: 1.35,
              }}
            >
              Dari <b>PT Poko Finansial Indonesia</b> (ClipStream Escrow) ke{" "}
              <span style={{ color: "#f1f5f9", fontWeight: 500 }}>
                {accountName} ({accountNumber})
              </span>
            </div>
          </div>
        </div>

        {/* Action Button: Open Virtual Phone Mockup */}
        {onOpenPhoneSimulator && (
          <button
            type="button"
            onClick={() => {
              setIsVisible(false);
              onOpenPhoneSimulator();
            }}
            style={{
              marginTop: "2px",
              width: "100%",
              padding: "7px 12px",
              borderRadius: "10px",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#ffffff",
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              transition: "background-color 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
            }}
          >
            <Smartphone size={13} />
            <span>Lihat Layar Resi HP Virtual</span>
            <ArrowUpRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
