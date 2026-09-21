"use client";

import {
  formatUsdt,
  formatIdr,
  formatViews,
  formatDateTime,
  txExplorerUrl,
  usdtWeiToFloat,
} from "@/lib/format";
import { CheckCircle2, Clock, ExternalLink, HelpCircle } from "lucide-react";
import { useState } from "react";

interface PayoutBreakdownProps {
  views: number;
  cpmRate: string | bigint;
  releasedAmount?: string | bigint;
  holdbackAmount?: string | bigint;
  holdbackUnlockAt?: string | Date | null;
  txHash?: string | null;
  className?: string;
}

export function PayoutBreakdown({
  views,
  cpmRate,
  releasedAmount,
  holdbackAmount,
  holdbackUnlockAt,
  txHash,
  className = "",
}: PayoutBreakdownProps) {
  const [showHoldbackExplainer, setShowHoldbackExplainer] = useState(false);

  const cpmWei = typeof cpmRate === "string" ? BigInt(cpmRate) : cpmRate;
  const grossWei = (BigInt(views) * cpmWei) / BigInt(1000);

  const releasedWei =
    releasedAmount !== undefined
      ? typeof releasedAmount === "string"
        ? BigInt(releasedAmount)
        : releasedAmount
      : (grossWei * BigInt(7000)) / BigInt(10000);

  const holdbackWei =
    holdbackAmount !== undefined
      ? typeof holdbackAmount === "string"
        ? BigInt(holdbackAmount)
        : holdbackAmount
      : grossWei - releasedWei;

  const cpmFloat = usdtWeiToFloat(cpmWei);
  const grossFloat = usdtWeiToFloat(grossWei);
  const releasedFloat = usdtWeiToFloat(releasedWei);
  const holdbackFloat = usdtWeiToFloat(holdbackWei);

  return (
    <div
      className={`card p-6 bg-white border border-[rgba(17,17,17,0.08)] rounded-xl ${className}`}
    >
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[rgba(17,17,17,0.06)]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ash)]">
            Rincian Pembayaran (UX2)
          </span>
          <h4 className="text-lg font-normal text-[var(--color-ink)] mt-0.5">
            Kalkulasi Transparan
          </h4>
        </div>
        {txHash && (
          <a
            href={txExplorerUrl(txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-[var(--color-pearl)] text-[var(--color-ink)] rounded-full hover:bg-[var(--color-stone)] transition-colors"
            style={{ textDecoration: "none" }}
          >
            <span>Explorer</span>
            <ExternalLink size={12} />
          </a>
        )}
      </div>

      {/* Formula breakdown */}
      <div className="bg-[var(--color-cream-wash)] p-4 rounded-lg mb-4 text-sm">
        <div className="text-xs text-[var(--color-ash)] mb-1">Rumus hitung:</div>
        <div className="font-mono text-[var(--color-ink)] flex flex-wrap items-center gap-2">
          <span>{formatViews(views)} views</span>
          <span className="text-[var(--color-ash)]">×</span>
          <span>{cpmFloat.toFixed(3)} USDT / 1k</span>
          <span className="text-[var(--color-ash)]">=</span>
          <span className="font-semibold text-base">
            {formatUsdt(grossWei)} USDT
          </span>
          <span className="text-xs text-[var(--color-ash)]">
            (≈ {formatIdr(grossWei)} estimasi)
          </span>
        </div>
      </div>

      {/* Split details */}
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between py-2 border-b border-[rgba(17,17,17,0.05)]">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#1a7f37]" />
            <span className="text-[var(--color-ink)]">Cair langsung (70%)</span>
          </div>
          <div className="text-right">
            <span className="font-medium text-[var(--color-ink)]">
              {formatUsdt(releasedWei)} USDT
            </span>
            <div className="text-xs text-[var(--color-ash)]">
              ≈ {formatIdr(releasedWei)} (estimasi)
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-[rgba(17,17,17,0.05)]">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#9a6700]" />
            <div>
              <span className="text-[var(--color-ink)]">Tertahan (30%)</span>
              {holdbackUnlockAt && (
                <div className="text-xs text-[var(--color-ash)]">
                  Cair: {formatDateTime(holdbackUnlockAt)}
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className="font-medium text-[var(--color-ink)]">
              {formatUsdt(holdbackWei)} USDT
            </span>
            <div className="text-xs text-[var(--color-ash)]">
              ≈ {formatIdr(holdbackWei)} (estimasi)
            </div>
          </div>
        </div>
      </div>

      {/* Explainer toggle */}
      <div className="mt-4 pt-2">
        <button
          type="button"
          onClick={() => setShowHoldbackExplainer((v) => !v)}
          className="text-xs text-[var(--color-ash)] hover:text-[var(--color-ink)] flex items-center gap-1.5 transition-colors cursor-pointer bg-transparent border-none p-0"
        >
          <HelpCircle size={14} />
          <span>Kenapa ada yang tertahan?</span>
        </button>

        {showHoldbackExplainer && (
          <div className="mt-2.5 p-3.5 bg-white border border-[rgba(17,17,17,0.08)] rounded-lg text-xs text-[var(--color-ash)] leading-relaxed animate-fade-in-up">
            Sebagian kecil (30%) ditahan selama 3 hari untuk memastikan pola
            views stabil dan bebas dari spam. Setelah masa holdback selesai,
            dana otomatis cair ke saldo kamu tanpa bisa dibatalkan atau ditarik
            kembali secara sepihak oleh pihak mana pun karena dijamin oleh smart
            contract.
          </div>
        )}
      </div>
    </div>
  );
}
