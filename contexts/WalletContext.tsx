import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import WalletManagerService from '../services/WalletManagerService';
import { WalletData } from '../services/base/BaseService';

interface WalletContextType {
  wallet: WalletData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  initializeWallet: () => Promise<void>;
  authenticateWallet: () => Promise<void>;
  sendTransaction: (to: string, amount: string) => Promise<string>;
  refreshBalance: () => Promise<void>;
  exportPrivateKey: () => Promise<string>;
  restoreFromPrivateKey: (privateKey: string) => Promise<void>;
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
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeWallet = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await WalletManagerService.initialize();
      
      if (WalletManagerService.isWalletLoaded()) {
        const walletData = await WalletManagerService.getWalletData();
        setWallet(walletData);
        setIsAuthenticated(true);
      } else {
        // Create a new wallet if none exists
        const walletData = await WalletManagerService.createWallet();
        setWallet(walletData);
        setIsAuthenticated(true);
      }
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
      const walletData = await WalletManagerService.authenticateAndGetWallet();
      if (walletData) {
        setWallet(walletData);
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
      const txHash = await WalletManagerService.sendTransaction({ to, amount });
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
      const balance = await WalletManagerService.getBalance();
      setWallet(prev => prev ? { ...prev, balance } : null);
    } catch (err) {
      console.error('Failed to refresh balance:', err);
    }
  };

  // Auto-initialize on mount
  useEffect(() => {
    initializeWallet();
  }, []);

  const exportPrivateKey = async (): Promise<string> => {
    if (!isAuthenticated) {
      throw new Error('Wallet not authenticated');
    }
    
    setError(null);
    
    try {
      return await WalletManagerService.exportPrivateKey();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const restoreFromPrivateKey = async (privateKey: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const walletData = await WalletManagerService.restoreWallet(privateKey);
      setWallet(walletData);
      setIsAuthenticated(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Restore failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const value: WalletContextType = {
    wallet,
    isLoading,
    isAuthenticated,
    error,
    initializeWallet,
    authenticateWallet,
    sendTransaction,
    refreshBalance,
    exportPrivateKey,
    restoreFromPrivateKey,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};