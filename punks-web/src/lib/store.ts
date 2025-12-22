/**
 * Global Store - Zustand State Management
 * Handles wallet connection, auth, and minting state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from './api';
import type { User, MintSession, DogeWallet } from '@/types';

interface StoreState {
  // Wallet state
  wallet: DogeWallet | null;
  
  // Auth state
  user: User | null;
  token: string | null;
  
  // Minting state
  mintSession: MintSession | null;
  
  // Actions
  setWallet: (wallet: DogeWallet | null) => void;
  clearWallet: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  clearToken: () => void;
  setMintSession: (session: MintSession | null) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      wallet: null,
      user: null,
      token: null,
      mintSession: null,
      
      // Wallet actions
      setWallet: (wallet) => {
        set({ wallet });
      },
      
      clearWallet: () => {
        set({ wallet: null, user: null });
      },
      
      // User actions
      setUser: (user) => {
        set({ user });
      },
      
      // Token actions
      setToken: (token) => {
        if (token) {
          api.setToken(token);
        }
        set({ token });
      },
      
      clearToken: () => {
        api.setToken(null);
        set({ token: null, user: null });
      },
      
      // Mint session actions
      setMintSession: (session) => {
        set({ mintSession: session });
      },
    }),
    {
      name: 'cyphers-storage',
      partialize: (state) => ({
        wallet: state.wallet,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        // Rehydrate the API token on app load
        if (state?.token) {
          api.setToken(state.token);
        }
      },
    }
  )
);

export default useStore;
