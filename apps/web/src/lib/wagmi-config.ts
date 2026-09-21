import { createConfig, http } from "wagmi";
import { bscTestnet } from "wagmi/chains";

// BSC Testnet — required by hackathon track (Binance BNB)
export const wagmiConfig = createConfig({
  chains: [bscTestnet],
  transports: {
    [bscTestnet.id]: http(
      process.env.NEXT_PUBLIC_BSC_RPC ?? "https://data-seed-prebsc-1-s1.binance.org:8545"
    ),
  },
});

export { bscTestnet };
