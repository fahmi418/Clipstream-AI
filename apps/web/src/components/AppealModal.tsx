"use client";

import { useState } from "react";
import { X, HelpCircle, Send, Loader2 } from "lucide-react";
import { appealClip } from "@/lib/api";

interface AppealModalProps {
  isOpen: boolean;
  onClose: () => void;
  clipId: string;
  clipTitle?: string;
  rejectionReason?: string;
  onSuccess?: () => void;
}

export function AppealModal({
  isOpen,
  onClose,
  clipId,
  clipTitle,
  rejectionReason,
  onSuccess,
}: AppealModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 10) {
      setError("Ceritakan alasan banding minimal 10 karakter.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await appealClip(clipId, reason.trim());
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Gagal mengirim banding");
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

        <div className="flex items-center gap-2 text-[var(--color-ink)] mb-1">
          <HelpCircle size={18} />
          <span className="text-xs uppercase tracking-wider font-semibold">
            Hak Clipper
          </span>
        </div>
        <h3 className="text-xl font-normal text-[var(--color-ink)] mb-2">
          Ajukan Banding
        </h3>

        {clipTitle && (
          <p className="text-xs text-[var(--color-ash)] mb-1">
            Klip: <span className="text-[var(--color-ink)]">{clipTitle}</span>
          </p>
        )}
        {rejectionReason && (
          <p className="text-xs text-[#cf222e] mb-4">
            Alasan penolakan: <span>{rejectionReason}</span>
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-ink)] mb-1">
              Ceritakan kenapa kamu rasa penolakan ini keliru
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Jelaskan timestamp video sumber yang kamu gunakan atau klarifikasi konteks..."
              className="textarea text-sm"
              rows={4}
              required
            />
            {error && (
              <div className="text-xs text-[#cf222e] mt-1">{error}</div>
            )}
          </div>

          <div className="bg-[var(--color-cream-wash)] p-3 rounded-lg text-xs text-[var(--color-ash)] space-y-1">
            <div>• Kami tinjau dalam 2×24 jam bersama reviewer independen.</div>
            <div>• Satu klip hanya bisa diajukan banding satu kali.</div>
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
              className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              <span>{loading ? "Mengirim..." : "Kirim Banding"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
