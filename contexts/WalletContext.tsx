import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import WalletService, { WalletInfo } from '../services/WalletService';

interface WalletContextType {
  wallet: WalletInfo | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  initializeWallet: () => Promise<void>;
  authenticateWallet: () => Promise<void>;
  sendTransaction: (to: string, amount: string) => Promise<string>;
  refreshBalance: () => Promise<void>;
  deleteWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeWallet = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const walletInfo = await WalletService.initializeWallet();
      setWallet(walletInfo);
      setIsAuthenticated(!!walletInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const authenticateWallet = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const walletInfo = await WalletService.authenticateAndGetWallet();
      if (walletInfo) {
        setWallet(walletInfo);
        setIsAuthenticated(true);
      } else {
        setError('Authentication failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const sendTransaction = async (to: string, amount: string): Promise<string> => {
    if (!isAuthenticated) {
      throw new Error('Wallet not authenticated');
    }
    
    setError(null);
    
    try {
      const txHash = await WalletService.sendTransaction(to, amount);
      // Refresh balance after sending transaction
      await refreshBalance();
      return txHash;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const refreshBalance = async () => {
    if (!wallet) return;
    
    try {
      const balance = await WalletService.getBalance();
      setWallet(prev => prev ? { ...prev, balance } : null);
    } catch (err) {
      console.error('Failed to refresh balance:', err);
    }
  };

  const deleteWallet = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await WalletService.deleteWallet();
      setWallet(null);
      setIsAuthenticated(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete wallet');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-initialize on mount
  useEffect(() => {
    initializeWallet();
  }, []);

  const value: WalletContextType = {
    wallet,
    isLoading,
    isAuthenticated,
    error,
    initializeWallet,
    authenticateWallet,
    sendTransaction,
    refreshBalance,
    deleteWallet,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};