/**
 * Utility to detect and retrieve any injected EVM provider (Trust Wallet, MetaMask, Rabby, OKX, etc.)
 * Supports EIP-6963 multi-wallet discovery.
 */

const eip6963Providers: Array<{ info: { name: string; rdns: string; icon: string }; provider: any }> = [];

if (typeof window !== "undefined") {
  window.addEventListener("eip6963:announceProvider", (event: any) => {
    if (event?.detail?.provider) {
      const exists = eip6963Providers.some(
        (p) => p.info?.rdns === event.detail.info?.rdns || p.info?.name === event.detail.info?.name
      );
      if (!exists) {
        eip6963Providers.push(event.detail);
      }
    }
  });
  try {
    window.dispatchEvent(new Event("eip6963:requestProvider"));
  } catch {}
}

export function getInjectedProvider(): any {
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(new Event("eip6963:requestProvider"));
    } catch {}
  }

  // 0. Check EIP-6963 discovered providers (Modern standard)
  if (eip6963Providers.length > 0) {
    const trust = eip6963Providers.find(
      (p) =>
        p.info?.name?.toLowerCase().includes("trust") ||
        p.info?.rdns?.toLowerCase().includes("trust")
    );
    if (trust) return trust.provider;
    return eip6963Providers[0].provider;
  }

  if (typeof window === "undefined") return undefined;
  const w = window as any;

  // 1. Check explicit Trust Wallet provider (extension or mobile DApp)
  if (w.trustwallet?.ethereum) return w.trustwallet.ethereum;
  if (w.trustWallet?.ethereum) return w.trustWallet.ethereum;
  if (w.trustwallet) return w.trustwallet;
  if (w.trustWallet) return w.trustWallet;

  // 2. Check multi-provider array (when multiple wallet extensions are installed)
  if (Array.isArray(w.ethereum?.providers)) {
    const trust = w.ethereum.providers.find(
      (p: any) => p.isTrust || p.isTrustWallet || p.isTrustWalletExtension
    );
    if (trust) return trust;
    return w.ethereum.providers[0];
  }

  // 3. Standard window.ethereum (Trust Wallet, MetaMask, Rabby, Brave, Coinbase, etc.)
  if (w.ethereum) return w.ethereum;

  // 4. Other popular EVM providers
  if (w.okxwallet) return w.okxwallet;
  if (w.bitkeep?.ethereum) return w.bitkeep.ethereum;
  if (w.phantom?.ethereum) return w.phantom.ethereum;
  if (w.coinbaseWalletExtension) return w.coinbaseWalletExtension;

  return undefined;
}

export async function requestAccounts(): Promise<string[]> {
  const provider = getInjectedProvider();
  if (!provider || typeof provider.request !== "function") {
    throw new Error(
      "Wallet EVM (Trust Wallet / MetaMask) belum aktif di situs ini. Silakan klik ikon ekstensi Trust Wallet di Chrome dan izinkan akses (Site Access), atau masukkan alamat 0x Anda."
    );
  }
  return await provider.request({ method: "eth_requestAccounts" });
}
