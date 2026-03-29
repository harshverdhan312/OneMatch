import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      profile: null,
      isAuthenticated: false,

      setAuth: (user, tokens) => set({ user, tokens, isAuthenticated: true }),
      setProfile: (profile) => set({ profile }),
      setTokens: (tokens) => set({ tokens }),
      logout: () => set({ user: null, tokens: null, profile: null, isAuthenticated: false }),
    }),
    {
      name: 'onematch-auth',
    }
  )
);

export default useAuthStore;
