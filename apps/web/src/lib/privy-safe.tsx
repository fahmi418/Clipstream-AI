"use client";

import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { PrivyProvider as RealPrivyProvider, usePrivy as useRealPrivy } from "@privy-io/react-auth";

export interface SafePrivyContextValue {
  ready: boolean;
  authenticated: boolean;
  user: any | null;
  login: () => void;
  logout: () => Promise<void>;
  linkWallet?: () => void;
  unlinkWallet?: (address: string) => Promise<void>;
}

const SafePrivyContext = createContext<SafePrivyContextValue>({
  ready: true,
  authenticated: false,
  user: null,
  login: () => {
    if (typeof window !== "undefined") window.location.href = "/login";
  },
  logout: async () => {},
});

export function PrivySafeProvider({
  children,
  appId,
  config,
}: {
  children: ReactNode;
  appId: string;
  config?: any;
}) {
  const [isClient, setIsClient] = useState(false);
  const [isSecure, setIsSecure] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const secure =
      window.location.protocol === "https:" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    setIsSecure(secure);
  }, []);

  // During SSR or on insecure non-localhost HTTP origins, use the safe fallback context
  if (!isClient || !isSecure || !appId || appId === "cm00000000000000000000000") {
    return (
      <SafePrivyContext.Provider
        value={{
          ready: true,
          authenticated: false,
          user: null,
          login: () => {
            if (typeof window !== "undefined") window.location.href = "/login";
          },
          logout: async () => {},
        }}
      >
        {children}
      </SafePrivyContext.Provider>
    );
  }

  // When on HTTPS or localhost with valid appId, use the full Privy Provider
  return (
    <RealPrivyProvider appId={appId} config={config}>
      {children}
    </RealPrivyProvider>
  );
}

export function usePrivy(): SafePrivyContextValue {
  const fallback = useContext(SafePrivyContext);
  try {
    const real = useRealPrivy();
    if (real && typeof real.ready !== "undefined") {
      return real as any;
    }
  } catch {
    // If called outside RealPrivyProvider, return the safe fallback
  }
  return fallback;
}
