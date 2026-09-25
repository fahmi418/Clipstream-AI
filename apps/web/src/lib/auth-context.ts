"use client";

import { createContext, useContext } from "react";
import type {
  User,
  UserRole,
  LoginPayload,
  RegisterPayload,
  WalletLoginPayload,
} from "./api";

export interface AuthState {
  user: User | null;
  role: UserRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isNewUser: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  loginWithWallet: (payload: WalletLoginPayload) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
}

export const AuthContext = createContext<AuthState>({
  user: null,
  role: null,
  isLoading: true,
  isAuthenticated: false,
  isNewUser: false,
  login: async () => {
    throw new Error("AuthProvider not mounted");
  },
  register: async () => {
    throw new Error("AuthProvider not mounted");
  },
  loginWithWallet: async () => {
    throw new Error("AuthProvider not mounted");
  },
  logout: async () => {},
  refreshUser: async () => null,
});

export function useAuth() {
  return useContext(AuthContext);
}
