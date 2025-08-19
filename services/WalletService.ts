import 'react-native-get-random-values';
import { ethers } from 'ethers';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { RPC_ENDPOINTS } from '../config/api-keys';

export interface WalletInfo {
  address: string;
  privateKey: string;
  balance: string;
}

class WalletService {
  private wallet: ethers.Wallet | null = null;
  private provider: ethers.JsonRpcProvider | null = null;
  private readonly KEYCHAIN_KEY = 'wallet_private_key';

  constructor() {
    // Initialize provider for Polygon mainnet using Ankr RPC with API key
    this.provider = new ethers.JsonRpcProvider(RPC_ENDPOINTS.POLYGON_MAINNET);
    
    // Set polling interval for better mobile performance
    this.provider.pollingInterval = 10000; // 10 seconds
  }

  async initializeWallet(): Promise<WalletInfo | null> {
    try {
      const existingKey = await this.getPrivateKeyFromStorage();
      
      if (existingKey) {
        this.wallet = new ethers.Wallet(existingKey, this.provider);
      } else {
        await this.generateNewWallet();
      }

      if (this.wallet) {
        const balance = await this.getBalance();
        return {
          address: this.wallet.address,
          privateKey: this.wallet.privateKey,
          balance
        };
      }
      
      return null;
    } catch (error) {
      console.error('Failed to initialize wallet:', error);
      throw error;
    }
  }

  private async generateNewWallet(): Promise<void> {
    try {
      // Generate new wallet
      this.wallet = ethers.Wallet.createRandom();
      
      // Save private key to secure storage
      await this.savePrivateKeyToStorage(this.wallet.privateKey);
      
      // Connect to provider
      this.wallet = this.wallet.connect(this.provider!);
    } catch (error) {
      console.error('Failed to generate new wallet:', error);
      throw error;
    }
  }

  private async savePrivateKeyToStorage(privateKey: string): Promise<void> {
    try {
      // Check if biometric authentication is available
      const biometricResult = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      const options: SecureStore.SecureStoreOptions = {
        keychainService: 'wallet-keychain',
      };
      
      // Only require authentication if biometrics are available and enrolled
      if (biometricResult && isEnrolled) {
        options.requireAuthentication = true;
        options.authenticationPrompt = 'Authenticate to save your wallet';
      }
      
      await SecureStore.setItemAsync(this.KEYCHAIN_KEY, privateKey, options);
    } catch (error) {
      console.error('Failed to save private key:', error);
      throw error;
    }
  }

  private async getPrivateKeyFromStorage(): Promise<string | null> {
    try {
      // Check if biometric authentication is available
      const biometricResult = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      const options: SecureStore.SecureStoreOptions = {
        keychainService: 'wallet-keychain',
      };
      
      // Only require authentication if biometrics are available and enrolled
      if (biometricResult && isEnrolled) {
        options.requireAuthentication = true;
        options.authenticationPrompt = 'Authenticate to access your wallet';
      } else {
        console.warn('Biometric authentication not available, using standard secure storage');
      }

      const privateKey = await SecureStore.getItemAsync(this.KEYCHAIN_KEY, options);
      
      return privateKey;
    } catch (error) {
      console.error('Failed to retrieve private key:', error);
      return null;
    }
  }

  async authenticateAndGetWallet(): Promise<WalletInfo | null> {
    try {
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access your wallet',
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false,
      });

      if (authResult.success) {
        return await this.initializeWallet();
      } else {
        console.log('Authentication failed');
        return null;
      }
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  async getBalance(): Promise<string> {
    if (!this.wallet || !this.provider) {
      return '0.0';
    }

    try {
      const balance = await this.provider.getBalance(this.wallet.address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get balance:', error);
      return '0.0';
    }
  }

  async sendTransaction(to: string, amount: string): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }

    try {
      const tx = await this.wallet.sendTransaction({
        to,
        value: ethers.parseEther(amount),
      });

      return tx.hash;
    } catch (error) {
      console.error('Failed to send transaction:', error);
      throw error;
    }
  }

  getAddress(): string {
    return this.wallet?.address || '';
  }

  isWalletInitialized(): boolean {
    return this.wallet !== null;
  }

  async deleteWallet(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.KEYCHAIN_KEY, {
        keychainService: 'wallet-keychain',
      });
      this.wallet = null;
    } catch (error) {
      console.error('Failed to delete wallet:', error);
      throw error;
    }
  }
}

export default new WalletService();