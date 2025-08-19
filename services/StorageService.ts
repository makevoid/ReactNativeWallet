import * as SecureStore from 'expo-secure-store';
import { BaseService, StorageError } from './base/BaseService';
import AuthenticationService from './AuthenticationService';

export interface SecureStorageOptions {
  requireAuthentication?: boolean;
  authenticationPrompt?: string;
  keychainService?: string;
}

export class StorageService extends BaseService {
  private readonly DEFAULT_KEYCHAIN_SERVICE = 'wallet-keychain';

  async initialize(): Promise<void> {
    try {
      // AuthenticationService should already be initialized by WalletManagerService
      this.isInitialized = true;
    } catch (error) {
      await this.handleError(error, 'Storage service initialization');
    }
  }

  async setSecureItem(
    key: string, 
    value: string, 
    options: SecureStorageOptions = {}
  ): Promise<void> {
    this.validateInitialized();

    const {
      requireAuthentication,
      authenticationPrompt = 'Authenticate to save secure data',
      keychainService = this.DEFAULT_KEYCHAIN_SERVICE
    } = options;

    try {
      const storeOptions: SecureStore.SecureStoreOptions = {};

      // For Expo Go, use simpler storage options
      if (SecureStore.isAvailableAsync()) {
        // Only add keychain service on device builds, not Expo Go
        try {
          storeOptions.keychainService = keychainService;
        } catch (e) {
          // Ignore keychain service errors in Expo Go
        }

        // Only require authentication if biometrics are available and requested
        if (requireAuthentication && AuthenticationService.isBiometricsAvailable()) {
          try {
            storeOptions.requireAuthentication = true;
            storeOptions.authenticationPrompt = authenticationPrompt;
          } catch (e) {
            // Ignore authentication requirements in Expo Go
          }
        }
      }

      await SecureStore.setItemAsync(key, value, storeOptions);
    } catch (error) {
      console.warn('SecureStore error:', error);
      await this.handleError(
        new StorageError(`Failed to store item with key: ${key}`), 
        'Setting secure item'
      );
    }
  }

  async getSecureItem(
    key: string, 
    options: SecureStorageOptions = {}
  ): Promise<string | null> {
    this.validateInitialized();

    const {
      requireAuthentication,
      authenticationPrompt = 'Authenticate to access secure data',
      keychainService = this.DEFAULT_KEYCHAIN_SERVICE
    } = options;

    try {
      const storeOptions: SecureStore.SecureStoreOptions = {};

      // For Expo Go, use simpler storage options
      if (SecureStore.isAvailableAsync()) {
        // Only add keychain service on device builds, not Expo Go
        try {
          storeOptions.keychainService = keychainService;
        } catch (e) {
          // Ignore keychain service errors in Expo Go
        }

        // Only require authentication if biometrics are available and requested
        if (requireAuthentication && AuthenticationService.isBiometricsAvailable()) {
          try {
            storeOptions.requireAuthentication = true;
            storeOptions.authenticationPrompt = authenticationPrompt;
          } catch (e) {
            // Ignore authentication requirements in Expo Go
          }
        }
      }

      return await SecureStore.getItemAsync(key, storeOptions);
    } catch (error) {
      console.warn('SecureStore error:', error);
      await this.handleError(
        new StorageError(`Failed to retrieve item with key: ${key}`), 
        'Getting secure item'
      );
    }
  }

  async deleteSecureItem(
    key: string, 
    options: Omit<SecureStorageOptions, 'requireAuthentication' | 'authenticationPrompt'> = {}
  ): Promise<void> {
    this.validateInitialized();

    const { keychainService = this.DEFAULT_KEYCHAIN_SERVICE } = options;

    try {
      await SecureStore.deleteItemAsync(key, { keychainService });
    } catch (error) {
      await this.handleError(
        new StorageError(`Failed to delete item with key: ${key}`), 
        'Deleting secure item'
      );
    }
  }

  async itemExists(key: string, keychainService?: string): Promise<boolean> {
    this.validateInitialized();

    try {
      const item = await SecureStore.getItemAsync(key, { 
        keychainService: keychainService || this.DEFAULT_KEYCHAIN_SERVICE 
      });
      return item !== null;
    } catch (error) {
      // If item doesn't exist or can't be accessed, return false
      return false;
    }
  }

  async clearAll(keychainService?: string): Promise<void> {
    this.validateInitialized();
    
    try {
      // Note: SecureStore doesn't have a clear all method
      // This would need to be implemented by tracking stored keys
      console.warn('clearAll not implemented - SecureStore does not support bulk operations');
    } catch (error) {
      await this.handleError(error, 'Clearing all secure items');
    }
  }

  // Helper methods for common wallet storage operations
  async storePrivateKey(privateKey: string): Promise<void> {
    await this.setSecureItem('wallet_private_key', privateKey, {
      requireAuthentication: true,
      authenticationPrompt: 'Authenticate to save your wallet'
    });
  }

  async getPrivateKey(): Promise<string | null> {
    return await this.getSecureItem('wallet_private_key', {
      requireAuthentication: true,
      authenticationPrompt: 'Authenticate to access your wallet'
    });
  }

  async deletePrivateKey(): Promise<void> {
    await this.deleteSecureItem('wallet_private_key');
  }
}

export default new StorageService();