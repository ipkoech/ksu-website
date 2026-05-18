import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, Service, AuthState } from "./types";

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void;
  setActiveService: (service: Service | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  reset: () => void;
}

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  activeService: null,
  error: null,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
          error: null,
        }),

      setActiveService: (service) =>
        set({ activeService: service }),

      setLoading: (isLoading) =>
        set({ isLoading }),

      setError: (error) =>
        set({ error, isLoading: false }),

      logout: () =>
        set({
          ...initialState,
          isLoading: false,
        }),

      reset: () => set(initialState),
    }),
    {
      name: "ksu-auth",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        activeService: state.activeService,
      }),
    }
  )
);
