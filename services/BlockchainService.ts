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

export interface AnkrTransaction {
  blockHash: string;
  blockNumber: string;
  blockchain: string;
  cumulativeGasUsed: string;
  from: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  hash: string;
  input: string;
  nonce: string;
  r: string;
  s: string;
  status: string;
  timestamp: string;
  to: string;
  transactionIndex: string;
  type: string;
  v: string;
  value: string;
}

export interface AnkrTransactionResponse {
  id: number;
  jsonrpc: string;
  result: {
    transactions: AnkrTransaction[];
    nextPageToken?: string;
  };
}

export interface ProcessedTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  status: 'success' | 'failed';
  type: 'sent' | 'received';
  gasUsed: string;
  gasPrice: string;
  blockNumber: number;
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

  async getTransactionHistory(
    address: string, 
    pageSize: number = 20,
    pageToken?: string
  ): Promise<{ transactions: ProcessedTransaction[]; nextPageToken?: string }> {
    this.validateInitialized();

    try {
      const requestBody = {
        id: 1,
        jsonrpc: '2.0',
        method: 'ankr_getTransactionsByAddress',
        params: {
          address,
          blockchain: 'polygon',
          pageSize,
          descOrder: true,
          includeLogs: false,
          ...(pageToken && { pageToken })
        }
      };

      console.log('Making Ankr API request:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(RPC_ENDPOINTS.ANKR_MULTICHAIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response body:', responseText);

      if (!response.ok) {
        throw new BlockchainError(`HTTP error! status: ${response.status}, body: ${responseText}`);
      }

      const data = JSON.parse(responseText);
      
      if (data.error) {
        throw new BlockchainError(`Ankr API error: ${data.error.message || 'Unknown error'}`);
      }
      
      if (!data.result) {
        console.log('No result in response, returning empty transactions');
        return { transactions: [] };
      }

      if (!data.result.transactions) {
        console.log('No transactions in result, returning empty transactions');
        return { transactions: [] };
      }

      console.log('Found transactions:', data.result.transactions.length);

      const processedTransactions = data.result.transactions.map((tx: AnkrTransaction) => {
        const isReceived = tx.to.toLowerCase() === address.toLowerCase();
        const valueInEther = ethers.formatEther(tx.value || '0');
        
        return {
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: valueInEther,
          timestamp: parseInt(tx.timestamp) * 1000, // Convert to milliseconds
          status: tx.status === '1' ? 'success' : 'failed' as 'success' | 'failed',
          type: isReceived ? 'received' : 'sent' as 'sent' | 'received',
          gasUsed: tx.gasUsed,
          gasPrice: tx.gasPrice,
          blockNumber: parseInt(tx.blockNumber, 16) // Convert hex to decimal
        } as ProcessedTransaction;
      });

      return {
        transactions: processedTransactions,
        nextPageToken: data.result.nextPageToken
      };
    } catch (error) {
      console.error('Transaction history error:', error);
      throw new BlockchainError(`Failed to get transaction history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default new BlockchainService();