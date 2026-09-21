"use client";

import { useRouter } from "next/navigation";
import { Scissors, Megaphone, X, ArrowRight } from "lucide-react";

interface RoleSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RoleSelectModal({ isOpen, onClose }: RoleSelectModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

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

        <div className="text-center mb-6">
          <h3 className="text-2xl font-normal text-[var(--color-ink)] mb-2">
            Selamat Datang di ClipStream
          </h3>
          <p className="text-sm text-[var(--color-ash)]">
            Pilih apa yang ingin kamu lakukan hari ini:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Clipper card */}
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push("/campaigns");
            }}
            className="card p-5 text-left border border-[rgba(17,17,17,0.08)] hover:border-[var(--color-ink)] bg-[var(--color-cream-wash)] hover:bg-white transition-all group cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[var(--color-mint-green)] text-[#1a4d17] flex items-center justify-center mb-3">
                <Scissors size={20} />
              </div>
              <h4 className="text-base font-medium text-[var(--color-ink)] mb-1">
                Saya Clipper
              </h4>
              <p className="text-xs text-[var(--color-ash)] leading-relaxed">
                Potong video podcast/webinar, upload Shorts, dan dapatkan bayaran otomatis tiap views masuk.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[rgba(17,17,17,0.06)] flex items-center justify-between text-xs font-medium text-[var(--color-ink)]">
              <span>Mulai Cari Campaign</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Brand card */}
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push("/brand/new");
            }}
            className="card p-5 text-left border border-[rgba(17,17,17,0.08)] hover:border-[var(--color-ink)] bg-[var(--color-cream-wash)] hover:bg-white transition-all group cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[var(--color-canary-yellow)] text-[#5a4a00] flex items-center justify-center mb-3">
                <Megaphone size={20} />
              </div>
              <h4 className="text-base font-medium text-[var(--color-ink)] mb-1">
                Saya Brand / Kreator
              </h4>
              <p className="text-xs text-[var(--color-ash)] leading-relaxed">
                Kunci budget di smart contract dan biarkan ratusan clipper mempromosikan video kamu.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[rgba(17,17,17,0.06)] flex items-center justify-between text-xs font-medium text-[var(--color-ink)]">
              <span>Buat Campaign Baru</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        <div className="text-center text-[11px] text-[var(--color-ash)]">
          Pemilihan peran ini fleksibel. Kamu bisa berganti kapan saja melalui menu akun.
        </div>
      </div>
    </div>
  );
}
