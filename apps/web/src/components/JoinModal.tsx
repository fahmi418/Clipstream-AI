"use client";

import { useState } from "react";
import { Copy, Check, X, Play, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  campaignTitle: string;
  sourceUrl: string;
  verificationCode: string;
}

export function JoinModal({
  isOpen,
  onClose,
  campaignId,
  campaignTitle,
  sourceUrl,
  verificationCode,
}: JoinModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(verificationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          maxWidth: "32rem",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "2rem",
          borderRadius: "24px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          position: "relative",
          border: "1px solid rgba(17, 17, 17, 0.1)",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1.25rem",
            right: "1.25rem",
            color: "#6d6c6b",
            background: "#f4f3f0",
            border: "none",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          aria-label="Tutup"
        >
          <X size={18} />
        </button>

        <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, color: "#059669", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <CheckCircle2 size={14} />
          <span>Berhasil Bergabung</span>
        </div>
        <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111111", letterSpacing: "-0.02em", margin: "0 0 0.5rem" }}>
          Ambil Kode Verifikasi Kamu
        </h3>
        <p style={{ fontSize: "0.875rem", color: "#6d6c6b", margin: "0 0 1.25rem" }}>
          Campaign: <strong style={{ color: "#111111" }}>{campaignTitle}</strong>
        </p>

        {/* Code Box */}
        <div
          style={{
            backgroundColor: "#f4f3f0",
            padding: "1rem 1.25rem",
            borderRadius: "16px",
            border: "1px solid rgba(17,17,17,0.08)",
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <div>
            <div style={{ fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, color: "#6d6c6b", marginBottom: "0.25rem" }}>
              Kode Unik Kamu
            </div>
            <div style={{ fontFamily: "monospace", fontSize: "1.375rem", fontWeight: 800, color: "#111111", letterSpacing: "0.05em" }}>
              {verificationCode}
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            style={{
              padding: "0.6rem 1rem",
              borderRadius: "10px",
              backgroundColor: "#111111",
              color: "#ffffff",
              fontSize: "0.75rem",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            }}
          >
            {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
            <span>{copied ? "Tersalin!" : "Salin Kode"}</span>
          </button>
        </div>

        {/* Reason notice */}
        <div
          style={{
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            padding: "0.875rem 1rem",
            borderRadius: "12px",
            marginBottom: "1.25rem",
            fontSize: "0.75rem",
            color: "#065f46",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.6rem",
            lineHeight: 1.5,
          }}
        >
          <ShieldAlert size={16} color="#059669" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            <strong style={{ color: "#065f46" }}>Kenapa perlu kode ini?</strong> Supaya sistem AI
            dapat memverifikasi bahwa klip yang disubmit benar-benar dipublikasikan oleh akun Anda. Tempelkan kode ini di deskripsi video YouTube Shorts / TikTok.
          </div>
        </div>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.5rem", fontSize: "0.75rem", color: "#111111" }}>
          <div style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6d6c6b" }}>
            Langkah selanjutnya:
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
            <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#6d6c6b" }}>1.</span>
            <span>Tonton video sumber, pilih segmen paling menarik atau memiliki hook kuat.</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
            <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#6d6c6b" }}>2.</span>
            <span>Edit menjadi klip vertikal 9:16 (durasi 30-90 detik).</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
            <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#6d6c6b" }}>3.</span>
            <span>Upload ke YouTube Shorts / TikTok / Reels.</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
            <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#6d6c6b" }}>4.</span>
            <span>Tempelkan kode <code style={{ backgroundColor: "#eeedea", padding: "0.15rem 0.4rem", borderRadius: "4px", fontWeight: 700 }}>{verificationCode}</code> di caption/deskripsi video.</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
            <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#6d6c6b" }}>5.</span>
            <span>Kembali ke dashboard dan submit link video Anda untuk verifikasi otomatis AI.</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: "1 1 140px",
              padding: "0.75rem 1rem",
              borderRadius: "12px",
              backgroundColor: "#eeedea",
              color: "#111111",
              fontSize: "0.8125rem",
              fontWeight: 700,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
            }}
          >
            <Play size={14} />
            <span>Tonton Video</span>
          </a>
          <Link
            href={`/clipper/submit?campaignId=${campaignId}`}
            style={{
              flex: "1 1 140px",
              padding: "0.75rem 1rem",
              borderRadius: "12px",
              backgroundColor: "#111111",
              color: "#ffffff",
              fontSize: "0.8125rem",
              fontWeight: 700,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            <span>Submit Link Klip</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
