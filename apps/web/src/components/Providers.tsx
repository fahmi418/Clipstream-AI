"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { PrivySafeProvider, usePrivy } from "@/lib/privy-safe";
import { useState, useEffect, useRef, type ReactNode } from "react";
import { wagmiConfig } from "@/lib/wagmi-config";
import { AuthContext, type AuthState } from "@/lib/auth-context";
import {
  authApi,
  getAuthToken,
  setAuthToken,
  type User,
  type LoginPayload,
  type RegisterPayload,
  type WalletLoginPayload,
} from "@/lib/api";

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
  const { authenticated, user: privyUser, ready } = usePrivy();
  const sessionSyncRef = useRef<string | null>(null);

  // 1. Restore session on mount via /api/auth/me if token exists
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    authApi
      .getMe()
      .then((me) => {
        setUser(me);
      })
      .catch(() => {
        // Invalid or expired token
        setAuthToken(null);
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // 2. Sync session if Privy is used
  useEffect(() => {
    if (!ready || !authenticated || !privyUser) return;
    if (sessionSyncRef.current === privyUser.id) return;
    sessionSyncRef.current = privyUser.id;

    const wallet = privyUser.linkedAccounts?.find(
      (a: any) => a.type === "wallet"
    ) as { address?: string } | undefined;

    const displayName =
      privyUser.google?.name ??
      privyUser.email?.address ??
      wallet?.address;

    authApi
      .walletLogin({
        walletAddress: wallet?.address || "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        displayName,
        role: "CLIPPER",
      })
      .then((res) => {
        setUser(res.user);
        setIsNewUser(!!res.isNewUser);
      })
      .catch(() => {});
  }, [ready, authenticated, privyUser]);

  const login = async (payload: LoginPayload): Promise<User> => {
    const res = await authApi.login(payload);
    setUser(res.user);
    return res.user;
  };

  const register = async (payload: RegisterPayload): Promise<User> => {
    const res = await authApi.register(payload);
    setUser(res.user);
    setIsNewUser(true);
    return res.user;
  };

  const loginWithWallet = async (payload: WalletLoginPayload): Promise<User> => {
    const res = await authApi.walletLogin(payload);
    setUser(res.user);
    setIsNewUser(!!res.isNewUser);
    return res.user;
  };

  const logout = async (): Promise<void> => {
    await authApi.logout();
    setUser(null);
    setIsNewUser(false);
  };

  const refreshUser = async (): Promise<User | null> => {
    try {
      const u = await authApi.getMe();
      setUser(u);
      return u;
    } catch {
      setUser(null);
      return null;
    }
  };

  const value: AuthState = {
    user,
    role: user?.role || null,
    isLoading,
    isAuthenticated: !!user,
    isNewUser,
    login,
    register,
    loginWithWallet,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <PrivySafeProvider
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
    </PrivySafeProvider>
  );
}

export default Providers;
