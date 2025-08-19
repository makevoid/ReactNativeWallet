import 'react-native-get-random-values';
import { ethers } from 'ethers';
import { BaseService, ServiceError, WalletData } from './base/BaseService';
import AuthenticationService from './AuthenticationService';
import StorageService from './StorageService';
import BlockchainService from './BlockchainService';

export interface WalletCreationOptions {
  entropy?: string;
  mnemonic?: string;
  privateKey?: string;
}

export interface TransactionOptions {
  to: string;
  amount: string;
  gasLimit?: string;
  gasPrice?: string;
}

export class WalletManagerService extends BaseService {
  private wallet: ethers.Wallet | null = null;
  private readonly PRIVATE_KEY_PATTERN = /^0x[a-fA-F0-9]{64}$/;

  async initialize(): Promise<void> {
    try {
      // Initialize all dependency services in order
      if (!AuthenticationService.getInitializationStatus()) {
        await AuthenticationService.initialize();
      }
      if (!StorageService.getInitializationStatus()) {
        await StorageService.initialize();
      }
      if (!BlockchainService.getInitializationStatus()) {
        await BlockchainService.initialize();
      }

      // Try to load existing wallet
      await this.loadExistingWallet();
      
      this.isInitialized = true;
    } catch (error) {
      await this.handleError(error, 'Wallet manager initialization');
    }
  }

  async createWallet(options: WalletCreationOptions = {}): Promise<WalletData> {
    this.validateInitialized();

    try {
      let newWallet: ethers.Wallet;

      if (options.privateKey) {
        newWallet = await this.createFromPrivateKey(options.privateKey);
      } else if (options.mnemonic) {
        newWallet = await this.createFromMnemonic(options.mnemonic);
      } else {
        newWallet = await this.generateRandomWallet(options.entropy);
      }

      // Connect to blockchain provider
      const provider = BlockchainService.getProvider();
      if (provider) {
        newWallet = newWallet.connect(provider);
      }

      // Store wallet securely
      await StorageService.storePrivateKey(newWallet.privateKey);
      
      this.wallet = newWallet;
      
      return await this.getWalletData();
    } catch (error) {
      await this.handleError(error, 'Wallet creation');
    }
  }

  async restoreWallet(privateKey: string): Promise<WalletData> {
    this.validateInitialized();

    try {
      if (!this.isValidPrivateKey(privateKey)) {
        throw new ServiceError('Invalid private key format', 'INVALID_KEY', 'WalletManager');
      }

      const restoredWallet = await this.createFromPrivateKey(privateKey);
      
      // Connect to blockchain provider
      const provider = BlockchainService.getProvider();
      if (provider) {
        this.wallet = restoredWallet.connect(provider);
      } else {
        this.wallet = restoredWallet;
      }

      // Store new wallet securely (replaces existing)
      await StorageService.storePrivateKey(privateKey);
      
      return await this.getWalletData();
    } catch (error) {
      await this.handleError(error, 'Wallet restoration');
    }
  }

  async exportPrivateKey(): Promise<string> {
    this.validateInitialized();

    if (!this.wallet) {
      throw new ServiceError('No wallet loaded', 'NO_WALLET', 'WalletManager');
    }

    try {
      // Require authentication before export
      await AuthenticationService.requireAuthentication('Authenticate to export your private key');
      
      return this.wallet.privateKey;
    } catch (error) {
      await this.handleError(error, 'Private key export');
    }
  }

  async sendTransaction(options: TransactionOptions): Promise<string> {
    this.validateInitialized();

    if (!this.wallet) {
      throw new ServiceError('No wallet loaded', 'NO_WALLET', 'WalletManager');
    }

    try {
      const tx = await this.wallet.sendTransaction({
        to: options.to,
        value: ethers.parseEther(options.amount),
        gasLimit: options.gasLimit ? BigInt(options.gasLimit) : undefined,
        gasPrice: options.gasPrice ? BigInt(options.gasPrice) : undefined,
      });

      return tx.hash;
    } catch (error) {
      await this.handleError(error, 'Transaction sending');
    }
  }

  async getBalance(): Promise<string> {
    this.validateInitialized();

    if (!this.wallet) {
      throw new ServiceError('No wallet loaded', 'NO_WALLET', 'WalletManager');
    }

    try {
      return await BlockchainService.getBalance(this.wallet.address);
    } catch (error) {
      await this.handleError(error, 'Balance retrieval');
    }
  }

  async getWalletData(): Promise<WalletData> {
    this.validateInitialized();

    if (!this.wallet) {
      throw new ServiceError('No wallet loaded', 'NO_WALLET', 'WalletManager');
    }

    try {
      const balance = await this.getBalance();
      
      return {
        address: this.wallet.address,
        privateKey: this.wallet.privateKey,
        balance
      };
    } catch (error) {
      await this.handleError(error, 'Getting wallet data');
    }
  }

  async authenticateAndGetWallet(): Promise<WalletData | null> {
    this.validateInitialized();

    try {
      const success = await AuthenticationService.authenticate({
        promptMessage: 'Authenticate to access your wallet'
      });

      if (!success) {
        return null;
      }

      if (!this.wallet) {
        await this.loadExistingWallet();
      }

      return this.wallet ? await this.getWalletData() : null;
    } catch (error) {
      await this.handleError(error, 'Wallet authentication');
    }
  }

  isWalletLoaded(): boolean {
    return this.wallet !== null;
  }

  getAddress(): string {
    if (!this.wallet) {
      throw new ServiceError('No wallet loaded', 'NO_WALLET', 'WalletManager');
    }
    return this.wallet.address;
  }

  async getTransactionHistory(address: string): Promise<{ transactions: import('./BlockchainService').ProcessedTransaction[]; nextPageToken?: string }> {
    this.validateInitialized();
    
    try {
      return await BlockchainService.getTransactionHistory(address);
    } catch (error) {
      await this.handleError(error, 'Getting transaction history');
      return { transactions: [] };
    }
  }

  // Private helper methods
  private async loadExistingWallet(): Promise<void> {
    try {
      const storedPrivateKey = await StorageService.getPrivateKey();
      
      if (storedPrivateKey) {
        const restoredWallet = new ethers.Wallet(storedPrivateKey);
        const provider = BlockchainService.getProvider();
        
        this.wallet = provider ? restoredWallet.connect(provider) : restoredWallet;
      }
    } catch (error) {
      // Wallet doesn't exist or can't be loaded - this is acceptable
      console.warn('No existing wallet found or failed to load');
    }
  }

  private async generateRandomWallet(entropy?: string): Promise<ethers.Wallet> {
    try {
      return ethers.Wallet.createRandom(entropy ? { entropy } : undefined);
    } catch (error) {
      throw new ServiceError('Failed to generate random wallet', 'GENERATION_ERROR', 'WalletManager');
    }
  }

  private async createFromPrivateKey(privateKey: string): Promise<ethers.Wallet> {
    try {
      return new ethers.Wallet(privateKey);
    } catch (error) {
      throw new ServiceError('Invalid private key', 'INVALID_KEY', 'WalletManager');
    }
  }

  private async createFromMnemonic(mnemonic: string): Promise<ethers.Wallet> {
    try {
      return ethers.Wallet.fromPhrase(mnemonic);
    } catch (error) {
      throw new ServiceError('Invalid mnemonic phrase', 'INVALID_MNEMONIC', 'WalletManager');
    }
  }

  private isValidPrivateKey(privateKey: string): boolean {
    return this.PRIVATE_KEY_PATTERN.test(privateKey);
  }
}

export default new WalletManagerService();