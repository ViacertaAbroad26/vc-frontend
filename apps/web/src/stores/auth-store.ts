import { authStorage } from "@viacerta/api-client";
import type { AuthUser } from "@viacerta/utils";
import { create } from "zustand";

export type { AuthUser };

type AuthState = {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (u: AuthUser | null) => void;
  setLoading: (b: boolean) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => {
    authStorage.clear();
    set({ user: null });
  },
}));
