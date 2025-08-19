import 'react-native-get-random-values';
import { ethers } from 'ethers';
import { BaseService, BlockchainError } from './base/BaseService';
import { RPC_ENDPOINTS } from '../config/rpc-endpoints';

export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  symbol: string;
  explorer?: string;
}

export interface TransactionParams {
  to: string;
  value: string;
  gasLimit?: string;
  gasPrice?: string;
}

export interface TransactionResult {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed?: string;
  blockNumber?: number;
}

export class BlockchainService extends BaseService {
  private provider: ethers.JsonRpcProvider | null = null;
  private currentNetwork: NetworkConfig | null = null;
  
  // Default network configurations
  private readonly NETWORKS: Record<string, NetworkConfig> = {
    polygon: {
      name: 'Polygon',
      chainId: 137,
      rpcUrl: RPC_ENDPOINTS.POLYGON_MAINNET,
      symbol: 'POL',
      explorer: 'https://polygonscan.com'
    }
  };

  async initialize(networkKey: string = 'polygon'): Promise<void> {
    try {
      const network = this.NETWORKS[networkKey];
      if (!network) {
        throw new BlockchainError(`Network ${networkKey} not supported`);
      }

      await this.switchNetwork(networkKey);
      this.isInitialized = true;
    } catch (error) {
      await this.handleError(error, 'Blockchain service initialization');
    }
  }

  async switchNetwork(networkKey: string): Promise<void> {

    const network = this.NETWORKS[networkKey];
    if (!network) {
      throw new BlockchainError(`Network ${networkKey} not supported`);
    }

    try {
      this.provider = new ethers.JsonRpcProvider(network.rpcUrl);
      this.provider.pollingInterval = 10000; // 10 seconds for mobile optimization
      this.currentNetwork = network;
      
      // Test connection
      await this.provider.getBlockNumber();
    } catch (error) {
      await this.handleError(
        new BlockchainError(`Failed to connect to ${network.name} network`), 
        'Network switching'
      );
    }
  }

  async getBalance(address: string): Promise<string> {
    this.validateInitialized();
    
    if (!this.provider) {
      throw new BlockchainError('Provider not initialized');
    }

    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      await this.handleError(
        new BlockchainError(`Failed to get balance for address: ${address}`), 
        'Getting balance'
      );
    }
  }

  async estimateGas(params: TransactionParams): Promise<string> {
    this.validateInitialized();
    
    if (!this.provider) {
      throw new BlockchainError('Provider not initialized');
    }

    try {
      const gasEstimate = await this.provider.estimateGas({
        to: params.to,
        value: ethers.parseEther(params.value)
      });
      
      return gasEstimate.toString();
    } catch (error) {
      await this.handleError(
        new BlockchainError('Failed to estimate gas'), 
        'Gas estimation'
      );
    }
  }

  async getGasPrice(): Promise<string> {
    this.validateInitialized();
    
    if (!this.provider) {
      throw new BlockchainError('Provider not initialized');
    }

    try {
      const gasPrice = await this.provider.getFeeData();
      return gasPrice.gasPrice?.toString() || '0';
    } catch (error) {
      await this.handleError(
        new BlockchainError('Failed to get gas price'), 
        'Getting gas price'
      );
    }
  }

  async getTransactionReceipt(txHash: string): Promise<ethers.TransactionReceipt | null> {
    this.validateInitialized();
    
    if (!this.provider) {
      throw new BlockchainError('Provider not initialized');
    }

    try {
      return await this.provider.getTransactionReceipt(txHash);
    } catch (error) {
      await this.handleError(
        new BlockchainError(`Failed to get transaction receipt: ${txHash}`), 
        'Getting transaction receipt'
      );
    }
  }

  async waitForTransaction(txHash: string, confirmations: number = 1): Promise<TransactionResult> {
    this.validateInitialized();
    
    if (!this.provider) {
      throw new BlockchainError('Provider not initialized');
    }

    try {
      const receipt = await this.provider.waitForTransaction(txHash, confirmations);
      
      if (!receipt) {
        throw new BlockchainError('Transaction receipt not found');
      }

      return {
        hash: receipt.hash,
        from: receipt.from,
        to: receipt.to || '',
        value: receipt.value?.toString() || '0',
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      await this.handleError(
        new BlockchainError(`Failed to wait for transaction: ${txHash}`), 
        'Waiting for transaction'
      );
    }
  }

  getCurrentNetwork(): NetworkConfig | null {
    return this.currentNetwork;
  }

  getSupportedNetworks(): Record<string, NetworkConfig> {
    return { ...this.NETWORKS };
  }

  getProvider(): ethers.JsonRpcProvider | null {
    this.validateInitialized();
    return this.provider;
  }

  async isValidAddress(address: string): Promise<boolean> {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  }

  async getBlockNumber(): Promise<number> {
    this.validateInitialized();
    
    if (!this.provider) {
      throw new BlockchainError('Provider not initialized');
    }

    try {
      return await this.provider.getBlockNumber();
    } catch (error) {
      await this.handleError(
        new BlockchainError('Failed to get block number'), 
        'Getting block number'
      );
    }
  }
}

export default new BlockchainService();