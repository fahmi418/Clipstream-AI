/**
 * Utility to detect and retrieve any injected EVM provider (Trust Wallet, MetaMask, Rabby, OKX, etc.)
 */
export function getInjectedProvider(): any {
  if (typeof window === "undefined") return undefined;
  const w = window as any;

  // 1. Check explicit Trust Wallet provider (extension or mobile DApp)
  if (w.trustwallet?.ethereum) return w.trustwallet.ethereum;
  if (w.trustWallet?.ethereum) return w.trustWallet.ethereum;
  if (w.trustwallet) return w.trustwallet;

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
      "Wallet EVM (Trust Wallet / MetaMask) tidak terdeteksi di browser ini. Jika di HP, buka link ini di DApp Browser aplikasi Trust Wallet, atau masukkan alamat wallet 0x Anda secara manual."
    );
  }
  return await provider.request({ method: "eth_requestAccounts" });
}
