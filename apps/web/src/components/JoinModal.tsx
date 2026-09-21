"use client";

import { useState } from "react";
import { Copy, Check, X, Play, ArrowRight, ShieldAlert } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in-up">
      <div className="card bg-white max-w-lg w-full p-6 md:p-8 rounded-2xl shadow-xl relative border border-[rgba(17,17,17,0.08)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--color-ash)] hover:text-[var(--color-ink)] p-2 rounded-full hover:bg-[var(--color-pearl)] transition-colors"
          aria-label="Tutup"
        >
          <X size={18} />
        </button>

        <div className="text-xs uppercase tracking-wider font-semibold text-[#1a7f37] mb-1 flex items-center gap-1.5">
          <span>✓ Berhasil Bergabung</span>
        </div>
        <h3 className="text-2xl font-normal text-[var(--color-ink)] mb-2">
          Ambil Kode Verifikasi Kamu
        </h3>
        <p className="text-sm text-[var(--color-ash)] mb-5">
          Campaign: <span className="text-[var(--color-ink)]">{campaignTitle}</span>
        </p>

        {/* Code Box */}
        <div className="bg-[var(--color-cream-wash)] p-4 rounded-xl border border-[rgba(17,17,17,0.08)] mb-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-[var(--color-ash)] uppercase tracking-wider mb-0.5">
              Kode Unik Kamu
            </div>
            <div className="font-mono text-xl font-semibold text-[var(--color-ink)] tracking-wide">
              {verificationCode}
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? "Tersalin!" : "Salin Kode"}</span>
          </button>
        </div>

        {/* Reason notice */}
        <div className="bg-[#fff9e6] border border-[#f0df95] p-3.5 rounded-lg mb-5 text-xs text-[#6e5600] flex items-start gap-2.5">
          <ShieldAlert size={16} className="flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-medium">Kenapa perlu kode ini?</span> Supaya AI
            tahu video yang kamu submit benar-benar diunggah oleh kamu. Tanpa kode
            ini di deskripsi video, klip kamu tidak bisa diverifikasi dan tidak
            akan dibayar.
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-2 mb-6 text-xs text-[var(--color-ink)]">
          <div className="font-medium text-[var(--color-ash)] uppercase tracking-wider text-[11px] mb-1">
            Langkah selanjutnya:
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono font-semibold text-[var(--color-ash)]">1.</span>
            <span>Tonton video sumber, pilih bagian paling menarik atau lucu.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono font-semibold text-[var(--color-ash)]">2.</span>
            <span>Edit jadi klip menarik (maksimal 3 menit).</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono font-semibold text-[var(--color-ash)]">3.</span>
            <span>Upload ke YouTube Shorts.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono font-semibold text-[var(--color-ash)]">4.</span>
            <span>Tempelkan kode <code className="bg-black/5 px-1 py-0.5 rounded">{verificationCode}</code> di deskripsi video.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono font-semibold text-[var(--color-ash)]">5.</span>
            <span>Kembali ke sini dan submit link YouTube Shorts kamu.</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-pearl w-full sm:w-1/2 text-center flex items-center justify-center gap-2 py-2.5"
            style={{ textDecoration: "none" }}
          >
            <Play size={14} />
            <span>Tonton Video Sumber</span>
          </a>
          <Link
            href={`/clipper/submit?campaignId=${campaignId}`}
            className="btn-primary w-full sm:w-1/2 text-center flex items-center justify-center gap-2 py-2.5"
            style={{ textDecoration: "none" }}
          >
            <span>Saya Sudah Siap</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
