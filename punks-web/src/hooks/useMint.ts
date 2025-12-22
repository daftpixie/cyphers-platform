'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { api } from '@/lib/api';
import type { MintSession, MintStatus, CypherNFT } from '@/types';

interface UseMintReturn {
  session: MintSession | null;
  cypher: CypherNFT | null;
  isLoading: boolean;
  error: string | null;
  startMint: () => Promise<void>;
  confirmPayment: (txHash: string) => Promise<void>;
  cancelMint: () => Promise<void>;
  reset: () => void;
}

const POLL_INTERVAL = 2000; // 2 seconds

export function useMint(): UseMintReturn {
  const [session, setSession] = useState<MintSession | null>(null);
  const [cypher, setCypher] = useState<CypherNFT | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { wallet, token, setMintSession } = useStore();

  // Clear polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Poll for status updates
  const pollStatus = useCallback(async (sessionId: string) => {
    try {
      const response = await api.getMintStatus(sessionId);
      
      if (response.success && response.data) {
        const updatedSession = response.data.session;
        setSession(updatedSession);
        setMintSession(updatedSession);
        
        // If minting is complete or failed, stop polling
        if (
          updatedSession.status === 'CONFIRMED' ||
          updatedSession.status === 'FAILED' ||
          updatedSession.status === 'CANCELLED'
        ) {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          
          // If confirmed, fetch the cypher
          if (updatedSession.status === 'CONFIRMED' && updatedSession.cypherId) {
            const cypherResponse = await api.getCypher(updatedSession.cypherId);
            if (cypherResponse.success && cypherResponse.data) {
              setCypher(cypherResponse.data);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error polling status:', err);
    }
  }, [setMintSession]);

  // Start polling
  const startPolling = useCallback((sessionId: string) => {
    // Clear any existing interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    
    // Initial poll
    pollStatus(sessionId);
    
    // Set up interval
    pollIntervalRef.current = setInterval(() => {
      pollStatus(sessionId);
    }, POLL_INTERVAL);
  }, [pollStatus]);

  // Start minting process
  const startMint = useCallback(async () => {
    if (!wallet?.connected || !token) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.requestMint();
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to start minting');
      }

      const newSession = response.data.session;
      setSession(newSession);
      setMintSession(newSession);
      
      // Start polling for updates
      startPolling(newSession.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start minting';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [wallet, token, setMintSession, startPolling]);

  // Confirm payment
  const confirmPayment = useCallback(async (txHash: string) => {
    if (!session) {
      setError('No active minting session');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.confirmPayment(session.id, txHash);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to confirm payment');
      }

      const updatedSession = response.data.session;
      setSession(updatedSession);
      setMintSession(updatedSession);
      
      // Continue polling for inscription status
      startPolling(session.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to confirm payment';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [session, setMintSession, startPolling]);

  // Cancel minting
  const cancelMint = useCallback(async () => {
    if (!session) {
      return;
    }

    // Stop polling
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.cancelMint(session.id);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to cancel minting');
      }

      setSession(null);
      setMintSession(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel minting';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [session, setMintSession]);

  // Reset state
  const reset = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    
    setSession(null);
    setCypher(null);
    setError(null);
    setMintSession(null);
  }, [setMintSession]);

  return {
    session,
    cypher,
    isLoading,
    error,
    startMint,
    confirmPayment,
    cancelMint,
    reset,
  };
}

// Status helpers
export function getStatusLabel(status: MintStatus): string {
  const labels: Record<MintStatus, string> = {
    PENDING: 'Initializing...',
    GENERATING: 'Generating your Cypher...',
    AWAITING_PAYMENT: 'Awaiting DOGE payment...',
    INSCRIBING: 'Inscribing on Dogecoin...',
    CONFIRMED: 'Complete!',
    FAILED: 'Failed',
    CANCELLED: 'Cancelled',
  };
  return labels[status] || status;
}

export function getStatusColor(status: MintStatus): string {
  const colors: Record<MintStatus, string> = {
    PENDING: 'text-text-secondary',
    GENERATING: 'text-neon-cyan',
    AWAITING_PAYMENT: 'text-neon-orange',
    INSCRIBING: 'text-neon-magenta',
    CONFIRMED: 'text-neon-green',
    FAILED: 'text-red-500',
    CANCELLED: 'text-text-muted',
  };
  return colors[status] || 'text-text-primary';
}

export function isTerminalStatus(status: MintStatus): boolean {
  return ['CONFIRMED', 'FAILED', 'CANCELLED'].includes(status);
}
