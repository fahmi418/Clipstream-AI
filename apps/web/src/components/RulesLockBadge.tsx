"use client";

import { ShieldCheck, ExternalLink } from "lucide-react";
import { txExplorerUrl, addressExplorerUrl } from "@/lib/format";

interface RulesLockBadgeProps {
  txHash?: string | null;
  onchainId?: string | null;
  contractAddress?: string;
  className?: string;
}

export function RulesLockBadge({
  txHash,
  onchainId,
  contractAddress,
  className = "",
}: RulesLockBadgeProps) {
  const explorerHref = txHash
    ? txExplorerUrl(txHash)
    : contractAddress
    ? addressExplorerUrl(contractAddress)
    : "https://testnet.bscscan.com";

  return (
    <a
      href={explorerHref}
      target="_blank"
      rel="noopener noreferrer"
      title="Aturan ini dikunci secara permanen di smart contract BNB Chain. Klik untuk verifikasi di BscScan."
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white text-[var(--color-ink)] border border-[rgba(17,17,17,0.08)] hover:bg-[var(--color-pearl)] transition-colors text-decoration-none group ${className}`}
      style={{ textDecoration: "none" }}
    >
      <ShieldCheck size={13} className="text-[#1a7f37]" />
      <span>Dikunci di kontrak</span>
      {onchainId && (
        <span className="text-[var(--color-ash)] font-mono text-[11px]">
          #{onchainId}
        </span>
      )}
      <ExternalLink
        size={11}
        className="text-[var(--color-ash)] group-hover:text-[var(--color-ink)] transition-colors"
      />
    </a>
  );
}
