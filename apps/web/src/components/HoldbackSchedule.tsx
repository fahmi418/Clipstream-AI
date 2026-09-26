"use client";

import { useState, useEffect } from "react";
import {
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Coins,
  ArrowRight,
  X,
} from "lucide-react";
import { formatUsdt, formatIdr, txExplorerUrl } from "@/lib/format";

export interface HoldbackItem {
  id: string;
  clipId: string;
  clipTitle: string;
  amountUsdt: number;
  unlockAt: Date;
  txHash?: string;
  onchainId?: string;
  status: "LOCKED" | "UNLOCKED" | "CLAIMED";
}

interface HoldbackScheduleProps {
  items: HoldbackItem[];
  onClaimItem?: (id: string) => Promise<string>;
  onClaimAll?: () => Promise<string>;
}

export function HoldbackSchedule({
  items,
  onClaimItem,
  onClaimAll,
}: HoldbackScheduleProps) {
  const [now, setNow] = useState<Date>(new Date());
  const [selectedClaim, setSelectedClaim] = useState<HoldbackItem | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimTxHash, setClaimTxHash] = useState<string | null>(null);

  // Tick countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalLocked = items
    .filter((i) => i.status === "LOCKED" && i.unlockAt.getTime() > now.getTime())
    .reduce((acc, i) => acc + i.amountUsdt, 0);

  const totalReadyToClaim = items
    .filter(
      (i) =>
        i.status !== "CLAIMED" &&
        (i.status === "UNLOCKED" || i.unlockAt.getTime() <= now.getTime())
    )
    .reduce((acc, i) => acc + i.amountUsdt, 0);

  const formatCountdown = (unlockDate: Date) => {
    const diff = unlockDate.getTime() - now.getTime();
    if (diff <= 0) return "Siap Dicairkan";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      const remHours = hours % 24;
      return `${days}h ${remHours}j ${minutes}m ${seconds}d`;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleExecuteClaim = async (item: HoldbackItem) => {
    setClaiming(true);
    try {
      let tx = "0x";
      if (onClaimItem) {
        tx = await onClaimItem(item.id);
      } else {
        // Simulated smart contract execution delay
        await new Promise((r) => setTimeout(r, 1600));
        tx = "0x892a0192384719283748192039485719283746152435465769c1e44af2817263";
      }
      setClaimTxHash(tx);
    } catch {
      // Handle error
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "18px",
        padding: "1.5rem",
        border: "1px solid rgba(17,17,17,0.08)",
        boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
        marginBottom: "2.5rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem",
          marginBottom: "1.25rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              backgroundColor: "#fffbeb",
              color: "#d97706",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Lock size={15} />
          </div>
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#111", margin: 0 }}>
              Jadwal Unlock Saldo Holdback 30%
            </h3>
            <p style={{ fontSize: "0.75rem", color: "rgba(17,17,17,0.5)", margin: "2px 0 0" }}>
              Perlindungan anti-sybil &amp; kestabilan views 72 jam di BNB Chain
            </p>
          </div>
        </div>

        {totalReadyToClaim > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.35rem 0.75rem",
              borderRadius: "9999px",
              backgroundColor: "#ecfdf5",
              border: "1px solid #a7f3d0",
              color: "#065f46",
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
            <Unlock size={13} color="#059669" />
            <span>{totalReadyToClaim.toFixed(2)} USDT Siap Dicairkan!</span>
          </div>
        )}
      </div>

      {/* List of Holdback Items */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "0.875rem",
        }}
      >
        {items.map((item) => {
          const isReady =
            item.status === "UNLOCKED" || item.unlockAt.getTime() <= now.getTime();
          const isClaimed = item.status === "CLAIMED";
          const countdown = formatCountdown(item.unlockAt);

          return (
            <div
              key={item.id}
              style={{
                padding: "1rem",
                borderRadius: "14px",
                backgroundColor: isClaimed
                  ? "rgba(17,17,17,0.02)"
                  : isReady
                  ? "#f0fdf4"
                  : "#fbfaf9",
                border: `1px solid ${
                  isClaimed
                    ? "rgba(17,17,17,0.04)"
                    : isReady
                    ? "#bbf7d0"
                    : "rgba(17,17,17,0.06)"
                }`,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "0.75rem",
                transition: "all 0.2s ease",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "0.35rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 700,
                      color: isClaimed ? "rgba(17,17,17,0.4)" : "#111",
                    }}
                  >
                    {item.amountUsdt.toFixed(2)} USDT
                  </span>

                  {isClaimed ? (
                    <span
                      style={{
                        fontSize: "0.6875rem",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "9999px",
                        backgroundColor: "rgba(17,17,17,0.06)",
                        color: "rgba(17,17,17,0.5)",
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <CheckCircle2 size={11} /> Sudah Dicairkan
                    </span>
                  ) : isReady ? (
                    <span
                      style={{
                        fontSize: "0.6875rem",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "9999px",
                        backgroundColor: "#dcfce7",
                        color: "#166534",
                        fontWeight: 700,
                      }}
                    >
                      ● Siap Klaim
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: "0.6875rem",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "9999px",
                        backgroundColor: "#fffbeb",
                        color: "#b45309",
                        fontWeight: 600,
                        fontFamily: "monospace",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <Clock size={11} /> {countdown}
                    </span>
                  )}
                </div>

                <div
                  style={{
                    fontSize: "0.8125rem",
                    color: isClaimed ? "rgba(17,17,17,0.4)" : "#111",
                    fontWeight: 500,
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.clipTitle}
                </div>

                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "rgba(17,17,17,0.45)",
                    marginTop: "2px",
                  }}
                >
                  Jadwal: {item.unlockAt.toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })} WIB
                </div>
              </div>

              {/* Action */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "0.5rem",
                  borderTop: "1px solid rgba(17,17,17,0.05)",
                }}
              >
                <span style={{ fontSize: "0.6875rem", color: "rgba(17,17,17,0.5)" }}>
                  Contract: CampaignEscrow
                </span>

                {!isClaimed && (
                  <button
                    type="button"
                    disabled={!isReady}
                    onClick={() => {
                      setSelectedClaim(item);
                      setClaimTxHash(null);
                    }}
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      padding: "0.35rem 0.85rem",
                      borderRadius: "9999px",
                      backgroundColor: isReady ? "#111111" : "#e5e5e5",
                      color: isReady ? "#ffffff" : "rgba(17,17,17,0.4)",
                      border: "none",
                      cursor: isReady ? "pointer" : "not-allowed",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {isReady ? "Cairkan On-Chain" : "Terkunci"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Claim Modal Confirmation */}
      {selectedClaim && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              padding: "1.75rem",
              maxWidth: "28rem",
              width: "100%",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              border: "1px solid rgba(17,17,17,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Coins size={18} color="#059669" />
                <h4 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111", margin: 0 }}>
                  Klaim Saldo Holdback
                </h4>
              </div>

              <button
                type="button"
                onClick={() => setSelectedClaim(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(17,17,17,0.4)",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {!claimTxHash ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div
                  style={{
                    backgroundColor: "#fbfaf9",
                    padding: "1rem",
                    borderRadius: "12px",
                    border: "1px solid rgba(17,17,17,0.06)",
                  }}
                >
                  <div style={{ fontSize: "0.75rem", color: "rgba(17,17,17,0.5)" }}>
                    Nominal yang akan dicairkan:
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111", marginTop: "2px" }}>
                    {selectedClaim.amountUsdt.toFixed(2)} USDT
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#059669", marginTop: "2px" }}>
                    ≈ Rp {(selectedClaim.amountUsdt * 16300).toLocaleString("id-ID")}
                  </div>
                </div>

                <div style={{ fontSize: "0.8125rem", color: "rgba(17,17,17,0.65)", lineHeight: 1.5 }}>
                  Transaksi akan memanggil metode <code style={{ backgroundColor: "#f3f4f6", padding: "2px 4px", borderRadius: "4px" }}>claimHoldback()</code> pada smart contract <strong>CampaignEscrow.sol</strong> di opBNB Network. Dana langsung ditransfer ke wallet kamu.
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: "0.5rem",
                    marginTop: "0.5rem",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedClaim(null)}
                    style={{
                      padding: "0.625rem 1rem",
                      borderRadius: "9999px",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      backgroundColor: "transparent",
                      border: "1px solid rgba(17,17,17,0.12)",
                      color: "#111",
                      cursor: "pointer",
                    }}
                  >
                    Batal
                  </button>

                  <button
                    type="button"
                    disabled={claiming}
                    onClick={() => handleExecuteClaim(selectedClaim)}
                    style={{
                      padding: "0.625rem 1.25rem",
                      borderRadius: "9999px",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      backgroundColor: "#111111",
                      color: "#ffffff",
                      border: "none",
                      cursor: claiming ? "default" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                    }}
                  >
                    {claiming ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Mengirim Transaksi...</span>
                      </>
                    ) : (
                      <span>Konfirmasi Klaim</span>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", textAlign: "center" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    backgroundColor: "#ecfdf5",
                    color: "#059669",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                  }}
                >
                  <CheckCircle2 size={24} />
                </div>

                <div>
                  <h5 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111", margin: 0 }}>
                    Klaim Holdback Berhasil!
                  </h5>
                  <p style={{ fontSize: "0.8125rem", color: "rgba(17,17,17,0.6)", marginTop: "4px" }}>
                    Dana sebesar {selectedClaim.amountUsdt.toFixed(2)} USDT telah berhasil ditransfer ke wallet kamu.
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: "#fbfaf9",
                    padding: "0.75rem",
                    borderRadius: "10px",
                    fontSize: "0.75rem",
                    fontFamily: "monospace",
                    wordBreak: "break-all",
                    color: "rgba(17,17,17,0.7)",
                  }}
                >
                  Tx: {claimTxHash}
                </div>

                <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
                  <a
                    href={txExplorerUrl(claimTxHash)}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      padding: "0.5rem 1rem",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      backgroundColor: "#f3f4f6",
                      color: "#111",
                      textDecoration: "none",
                    }}
                  >
                    <span>Lihat di opBNB Scan</span>
                    <ExternalLink size={12} />
                  </a>

                  <button
                    type="button"
                    onClick={() => setSelectedClaim(null)}
                    style={{
                      padding: "0.5rem 1.25rem",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      backgroundColor: "#111111",
                      color: "#ffffff",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Selesai
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
