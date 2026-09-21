"use client";

import { useState } from "react";
import { X, AlertTriangle, ShieldAlert, Loader2 } from "lucide-react";
import { flagClip } from "@/lib/api";

interface FlagModalProps {
  isOpen: boolean;
  onClose: () => void;
  clipId: string;
  clipTitle?: string;
  holdbackUsdt?: string;
  onSuccess?: () => void;
}

export function FlagModal({
  isOpen,
  onClose,
  clipId,
  clipTitle,
  holdbackUsdt = "4.71",
  onSuccess,
}: FlagModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 10) {
      setError("Alasan flag wajib diisi minimal 10 karakter.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await flagClip(clipId, reason.trim());
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Gagal mengajukan flag");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in-up">
      <div className="card bg-white max-w-md w-full p-6 rounded-2xl shadow-xl relative border border-[rgba(17,17,17,0.08)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--color-ash)] hover:text-[var(--color-ink)] p-2 rounded-full hover:bg-[var(--color-pearl)] transition-colors"
          aria-label="Tutup"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 text-[#cf222e] mb-1">
          <AlertTriangle size={18} />
          <span className="text-xs uppercase tracking-wider font-semibold">
            Tindakan Brand
          </span>
        </div>
        <h3 className="text-xl font-normal text-[var(--color-ink)] mb-2">
          Flag Klip Ini?
        </h3>
        {clipTitle && (
          <p className="text-xs text-[var(--color-ash)] mb-4">
            Klip: <span className="text-[var(--color-ink)]">{clipTitle}</span>
          </p>
        )}

        <form onSubmit={handleFlag} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-ink)] mb-1">
              Alasan Flag (Wajib)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Klip memotong konteks penting sehingga membuat klaim palsu..."
              className="textarea text-sm"
              rows={3}
              required
            />
            {error && (
              <div className="text-xs text-[#cf222e] mt-1">{error}</div>
            )}
          </div>

          {/* Legal / Smart Contract notice */}
          <div className="bg-[var(--color-cream-wash)] p-3.5 rounded-lg text-xs space-y-1.5 text-[var(--color-ink)]">
            <div className="font-medium text-[var(--color-ash)] uppercase tracking-wider text-[10px]">
              Yang akan terjadi:
            </div>
            <div className="flex items-start gap-1.5">
              <span>•</span>
              <span>
                Dana tertahan (holdback) ditunda sampai proses peninjauan
                selesai.
              </span>
            </div>
            <div className="flex items-start gap-1.5">
              <span>•</span>
              <span>
                Dana yang sudah cair <strong>TIDAK</strong> bisa ditarik kembali
                karena dijamin oleh smart contract.
              </span>
            </div>
            <div className="flex items-start gap-1.5">
              <span>•</span>
              <span>
                Clipper mendapat notifikasi dan berhak mengajukan banding.
              </span>
            </div>
            <div className="flex items-start gap-1.5">
              <span>•</span>
              <span>Alasan kamu akan dicatat transparan di audit log.</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost text-xs py-2 px-4"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || reason.trim().length < 10}
              className="btn-primary bg-[#cf222e] hover:bg-[#a41a23] text-xs py-2 px-4 flex items-center gap-1.5"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ShieldAlert size={14} />
              )}
              <span>{loading ? "Memproses..." : "Flag Klip"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
