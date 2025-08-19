import React, { useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, ImageBackground, ActivityIndicator } from "react-native";
import { GlassCard, Title, Button } from '@/components/ui';
import { useWallet } from "@/contexts/WalletContext";

export default function TransactionsScreen() {
  const { 
    wallet,
    transactions, 
    isLoadingTransactions, 
    loadTransactionHistory, 
    error 
  } = useWallet();

  useEffect(() => {
    if (wallet?.address) {
      loadTransactionHistory();
    }
  }, [wallet?.address]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatAmount = (value: string) => {
    return parseFloat(value).toFixed(4);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getTransactionIcon = (type: 'sent' | 'received') => {
    return type === 'sent' ? '↗' : '↘';
  };

  return (
    <ImageBackground
      source={require('../../assets/images/background3.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Title level={1} variant="glass" style={styles.mainTitle}>
          ⬢ Transactions
        </Title>

        {isLoadingTransactions ? (
          <GlassCard style={styles.loadingCard}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Loading transactions...</Text>
          </GlassCard>
        ) : transactions.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <Text style={styles.iconText}>⬡</Text>
            <Title level={3} variant="glass" style={styles.emptyTitle}>
              No Transactions Yet
            </Title>
            <Text style={styles.emptyText}>
              Your transaction history will appear here once you send or receive POL
            </Text>
            <Button
              title="↻ Refresh"
              variant="glass"
              size="small"
              onPress={loadTransactionHistory}
            />
          </GlassCard>
        ) : (
          <View style={styles.transactionsList}>
            {transactions.map((tx, index) => (
              <GlassCard key={tx.hash} style={styles.transactionCard}>
                <View style={styles.transactionRow}>
                  <Text style={styles.transactionType}>
                    {getTransactionIcon(tx.type)} {tx.type === 'sent' ? 'Sent' : 'Received'}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {formatDate(tx.timestamp)}
                  </Text>
                </View>
                <View style={styles.transactionRow}>
                  <Text style={styles.transactionAddress}>
                    {tx.type === 'sent' ? 'To: ' : 'From: '}
                    {formatAddress(tx.type === 'sent' ? tx.to : tx.from)}
                  </Text>
                  <Text 
                    style={tx.type === 'sent' ? styles.transactionAmountOut : styles.transactionAmountIn}
                  >
                    {tx.type === 'sent' ? '-' : '+'}
                    {formatAmount(tx.value)} POL
                  </Text>
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionHash}>
                    Hash: {formatAddress(tx.hash)}
                  </Text>
                  <Text style={[
                    styles.transactionStatus, 
                    tx.status === 'success' ? styles.statusSuccess : styles.statusFailed
                  ]}>
                    {tx.status}
                  </Text>
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        {error && (
          <GlassCard style={styles.errorCard}>
            <Text style={styles.errorText}>
              Failed to load transactions: {error}
            </Text>
            <Button
              title="↻ Retry"
              variant="glass"
              size="small"
              onPress={loadTransactionHistory}
            />
          </GlassCard>
        )}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 100,
  },
  mainTitle: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 35,
  },
  loadingCard: {
    alignItems: 'center',
    marginBottom: 35,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
  emptyCard: {
    alignItems: 'center',
    marginBottom: 35,
  },
  iconText: {
    fontSize: 60,
    color: 'white',
    marginBottom: 16,
  },
  emptyTitle: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 24,
  },
  transactionsList: {
    marginTop: 0,
  },
  transactionCard: {
    marginBottom: 16,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  transactionType: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  transactionDate: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  transactionAddress: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  transactionAmountOut: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  transactionAmountIn: {
    color: '#86efac',
    fontWeight: 'bold',
    fontSize: 16,
  },
  transactionHash: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  transactionStatus: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  statusSuccess: {
    color: '#86efac',
  },
  statusFailed: {
    color: '#fca5a5',
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(248, 113, 113, 0.3)',
    alignItems: 'center',
    marginTop: 20,
  },
  errorText: {
    color: 'rgba(254, 202, 202, 1)',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 16,
  },
});