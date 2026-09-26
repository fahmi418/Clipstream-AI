import { createConfig, http } from "wagmi";
import { defineChain } from "viem";

// Lean, direct BSC Testnet definition to avoid loading 400+ unused chains into memory
export const bscTestnet = defineChain({
  id: 97,
  name: "BNB Smart Chain Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "tBNB",
    symbol: "tBNB",
  },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_BSC_RPC ?? "https://data-seed-prebsc-1-s1.binance.org:8545",
      ],
    },
  },
  blockExplorers: {
    default: { name: "BscScan", url: "https://testnet.bscscan.com" },
  },
  testnet: true,
});

export const wagmiConfig = createConfig({
  chains: [bscTestnet],
  transports: {
    [bscTestnet.id]: http(
      process.env.NEXT_PUBLIC_BSC_RPC ?? "https://data-seed-prebsc-1-s1.binance.org:8545"
    ),
  },
});
