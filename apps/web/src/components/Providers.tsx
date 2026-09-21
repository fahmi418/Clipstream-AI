"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { PrivyProvider, usePrivy } from "@privy-io/react-auth";
import { useState, useEffect, useRef, type ReactNode } from "react";
import { wagmiConfig } from "@/lib/wagmi-config";
import { AuthContext, type AuthState } from "@/lib/auth-context";
import { createSession, type User } from "@/lib/api";

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "cm00000000000000000000000";

let browserQueryClient: QueryClient | undefined;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
      },
    },
  });
}

function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const { authenticated, user: privyUser, ready, login: privyLogin } = usePrivy();
  const sessionSyncRef = useRef<string | null>(null);

  // Restore session from cookie on mount
  useEffect(() => {
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/api/auth/me`,
      { credentials: "include" }
    )
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) setUser(json.data.user);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Sync session when Privy authenticates
  useEffect(() => {
    if (!ready || !authenticated || !privyUser) return;
    if (sessionSyncRef.current === privyUser.id) return;
    sessionSyncRef.current = privyUser.id;

    const wallet = privyUser.linkedAccounts?.find(
      (a) => a.type === "wallet"
    ) as { address?: string } | undefined;

    const displayName =
      privyUser.google?.name ??
      privyUser.email?.address ??
      wallet?.address;

    createSession({
      privyToken: privyUser.id,
      walletAddress: wallet?.address,
      displayName,
    })
      .then((res) => {
        setUser(res.user);
        setIsNewUser(res.isNewUser);
      })
      .catch(() => {});
  }, [ready, authenticated, privyUser]);

  const login = () => {
    try {
      if (ready && privyLogin) {
        privyLogin();
      } else {
        // Fallback quick dev session if Privy is not initialized
        createSession({
          privyToken: "dev-session-" + Date.now(),
          walletAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          displayName: "Demo Creator",
        }).then((res) => {
          setUser(res.user);
          setIsNewUser(res.isNewUser);
        }).catch(() => {});
      }
    } catch {
      createSession({
        privyToken: "dev-session-" + Date.now(),
        walletAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        displayName: "Demo Creator",
      }).then((res) => {
        setUser(res.user);
        setIsNewUser(res.isNewUser);
      }).catch(() => {});
    }
  };

  const logout = () => {
    try {
      if (authenticated && logout) logout();
    } catch {}
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/api/auth/logout`,
      { method: "POST", credentials: "include" }
    )
      .catch(() => {})
      .finally(() => setUser(null));
  };

  const value: AuthState = { user, isLoading, isNewUser, login, logout };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        loginMethods: ["google", "email"],
        appearance: {
          theme: "light",
          accentColor: "#111111",
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
      }}
    >
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </PrivyProvider>
  );
}
