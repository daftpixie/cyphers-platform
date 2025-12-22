'use client';

import { useState, useCallback, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { api } from '@/lib/api';
import type { DogeWallet, AuthChallenge } from '@/types';

// Check if DogeLabs wallet is available
declare global {
  interface Window {
    dogeLabs?: {
      requestAccounts: () => Promise<string[]>;
      getAccounts: () => Promise<string[]>;
      signMessage: (message: string) => Promise<string>;
      disconnect?: () => Promise<void>;
    };
    unisat?: {
      requestAccounts: () => Promise<string[]>;
      getAccounts: () => Promise<string[]>;
      signMessage: (message: string) => Promise<string>;
    };
  }
}

export function useWallet() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    wallet, 
    setWallet, 
    clearWallet, 
    token, 
    setToken, 
    clearToken,
    user,
    setUser,
  } = useStore();

  // Check for existing connection on mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      if (token) {
        try {
          const response = await api.getMe();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            // Token invalid, clear it
            clearToken();
            clearWallet();
          }
        } catch (err) {
          clearToken();
          clearWallet();
        }
      }
    };
    
    checkExistingConnection();
  }, [token, setUser, clearToken, clearWallet]);

  // Detect available wallet provider
  const detectProvider = useCallback((): DogeWallet['provider'] | null => {
    if (typeof window === 'undefined') return null;
    if (window.dogeLabs) return 'dogelabs';
    if (window.unisat) return 'unisat';
    return null;
  }, []);

  // Connect wallet
  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const provider = detectProvider();
      
      if (!provider) {
        throw new Error('No Dogecoin wallet detected. Please install DogeLabs or UniSat wallet.');
      }

      let addresses: string[] = [];
      
      if (provider === 'dogelabs' && window.dogeLabs) {
        addresses = await window.dogeLabs.requestAccounts();
      } else if (provider === 'unisat' && window.unisat) {
        addresses = await window.unisat.requestAccounts();
      }

      if (!addresses || addresses.length === 0) {
        throw new Error('No accounts found. Please create or unlock your wallet.');
      }

      const address = addresses[0];

      // Get challenge from backend
      const challengeResponse = await api.getChallenge(address);
      if (!challengeResponse.success || !challengeResponse.data) {
        throw new Error(challengeResponse.error || 'Failed to get challenge');
      }

      const challenge: AuthChallenge = challengeResponse.data;

      // Sign message
      let signature: string;
      if (provider === 'dogelabs' && window.dogeLabs) {
        signature = await window.dogeLabs.signMessage(challenge.message);
      } else if (provider === 'unisat' && window.unisat) {
        signature = await window.unisat.signMessage(challenge.message);
      } else {
        throw new Error('Failed to sign message');
      }

      // Verify with backend
      const verifyResponse = await api.verifySignature({
        address,
        signature,
        nonce: challenge.nonce,
      });

      if (!verifyResponse.success || !verifyResponse.data) {
        throw new Error(verifyResponse.error || 'Failed to verify signature');
      }

      // Store wallet and auth data
      setWallet({
        address,
        connected: true,
        provider,
      });
      
      setToken(verifyResponse.data.token);
      setUser(verifyResponse.data.user);

      return { address, user: verifyResponse.data.user };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(message);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, [detectProvider, setWallet, setToken, setUser]);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    try {
      if (wallet?.provider === 'dogelabs' && window.dogeLabs?.disconnect) {
        await window.dogeLabs.disconnect();
      }
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
    }
    
    clearWallet();
    clearToken();
    setError(null);
  }, [wallet, clearWallet, clearToken]);

  // Manual address entry (for testing/development)
  const connectManual = useCallback(async (address: string) => {
    setIsConnecting(true);
    setError(null);

    try {
      // Validate address format
      if (!/^[Dn][1-9A-HJ-NP-Za-km-z]{25,34}$/.test(address)) {
        throw new Error('Invalid Dogecoin address format');
      }

      setWallet({
        address,
        connected: true,
        provider: 'manual',
      });

      // Note: Manual connection can't verify signature
      // This is for development/testing only
      return { address };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect';
      setError(message);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, [setWallet]);

  return {
    wallet,
    user,
    isConnecting,
    isConnected: wallet?.connected ?? false,
    error,
    hasProvider: detectProvider() !== null,
    connect,
    disconnect,
    connectManual,
  };
}
