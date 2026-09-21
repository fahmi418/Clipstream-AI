"use client";

import { createContext, useContext } from "react";
import type { User } from "./api";

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isNewUser: boolean;
  login: () => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthState>({
  user: null,
  isLoading: true,
  isNewUser: false,
  login: () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}
