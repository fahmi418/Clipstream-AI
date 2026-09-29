// ── Currency formatting ────────────────────────────────────────────────

// 1 USDT = 6 decimals on BSC (using tether's ERC-20 standard)
const USDT_DECIMALS = BigInt(6);
const USDT_FACTOR = BigInt(10) ** USDT_DECIMALS;

// Approximate IDR/USDT rate — fetched from chain in practice, hardcoded fallback
const IDR_PER_USDT_FALLBACK = 16_300;

export function usdtWeiToFloat(wei: bigint | string | number): number {
  if (!wei) return 0;
  try {
    if (typeof wei === "number") {
      return wei > 1e12 ? wei / 1e18 : wei >= 10000 ? wei / 1e6 : wei;
    }
    const str = String(wei).trim();
    if (str.includes(".")) {
      const parsed = parseFloat(str);
      return parsed > 1e12 ? parsed / 1e18 : parsed >= 10000 ? parsed / 1e6 : parsed;
    }
    const n = BigInt(str);
    // If standard 18-decimal EVM wei (length >= 14 or > 1e12)
    if (str.length >= 14 || n > BigInt(10) ** BigInt(12)) {
      return Number(n) / 1e18;
    }
    // If 6-decimal USDT micro-units (e.g. 10990000 -> 10.99 USDT)
    if (str.length >= 6 || n >= BigInt(10000)) {
      return Number(n) / Number(USDT_FACTOR);
    }
    return Number(n);
  } catch {
    return 0;
  }
}

export function formatUsdt(wei: bigint | string, decimals = 2): string {
  const amount = usdtWeiToFloat(wei);
  return amount.toLocaleString("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatIdr(wei: bigint | string, idrRate = IDR_PER_USDT_FALLBACK): string {
  const usdt = usdtWeiToFloat(wei);
  const idr = usdt * idrRate;
  return `Rp ${idr.toLocaleString("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

// CPM is stored in USDT wei per 1000 views
export function formatCpm(cpmWei: bigint | string): string {
  const usdt = usdtWeiToFloat(cpmWei);
  const idr = usdt * IDR_PER_USDT_FALLBACK;
  return `Rp ${idr.toLocaleString("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })} / 1.000 views`;
}

// Convert IDR amount to USDT wei
export function idrToUsdtWei(idr: number, idrRate = IDR_PER_USDT_FALLBACK): bigint {
  const usdt = idr / idrRate;
  return BigInt(Math.round(usdt * Number(USDT_FACTOR)));
}

// ── View count formatting ──────────────────────────────────────────────

export function formatViews(views: number): string {
  if (views >= 1_000_000) {
    return `${(views / 1_000_000).toFixed(1).replace(".", ",")} juta`;
  }
  if (views >= 1_000) {
    return views.toLocaleString("id-ID");
  }
  return String(views);
}

// ── Date formatting ────────────────────────────────────────────────────

export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = Date.now();
  const diff = d.getTime() - now;
  const absDiff = Math.abs(diff);

  const minutes = Math.floor(absDiff / 60_000);
  const hours = Math.floor(absDiff / 3_600_000);
  const days = Math.floor(absDiff / 86_400_000);

  if (days > 0) {
    return diff > 0 ? `${days} hari lagi` : `${days} hari lalu`;
  }
  if (hours > 0) {
    return diff > 0 ? `${hours} jam lagi` : `${hours} jam lalu`;
  }
  return diff > 0 ? `${minutes} menit lagi` : `${minutes} menit lalu`;
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
    timeZoneName: "short",
  });
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ── Address truncation ─────────────────────────────────────────────────

export function truncateAddress(address?: string | null): string {
  if (!address || typeof address !== "string") return "";
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

// ── Block explorer URL ─────────────────────────────────────────────────

const EXPLORER_BASE = process.env.NEXT_PUBLIC_EXPLORER_URL ?? "https://testnet.bscscan.com";

export function txExplorerUrl(txHash?: string | null): string {
  if (!txHash) return EXPLORER_BASE;
  return `${EXPLORER_BASE}/tx/${txHash}`;
}

export function addressExplorerUrl(address?: string | null): string {
  if (!address) return EXPLORER_BASE;
  return `${EXPLORER_BASE}/address/${address}`;
}

export function ipfsGatewayUrl(cid: string): string {
  const gateway =
    process.env.NEXT_PUBLIC_IPFS_GATEWAY ?? "https://w3s.link/ipfs";
  return `${gateway}/${cid}`;
}

// ── Payout calculation ────────────────────────────────────────────────

// Calculates gross payout: views * cpmRate / 1000
// cpmRate is in USDT wei per 1000 views
export function calcGrossPayout(views: number, cpmWei: bigint | string): bigint {
  const cpm = typeof cpmWei === "string" ? BigInt(cpmWei) : cpmWei;
  return (BigInt(views) * cpm) / BigInt(1000);
}

// 30% holdback by default
export function splitHoldback(
  gross: bigint,
  holdbackBps = BigInt(3000)
): { immediate: bigint; holdback: bigint } {
  const holdback = (gross * holdbackBps) / BigInt(10000);
  return { immediate: gross - holdback, holdback };
}
