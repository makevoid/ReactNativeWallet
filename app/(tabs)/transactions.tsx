import React from "react";
import { View, Text, ScrollView, StyleSheet, ImageBackground } from "react-native";
import { GlassCard, Title } from '@/components/ui';

export default function TransactionsScreen() {
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

        <GlassCard style={styles.comingSoonCard}>
          <Text style={styles.iconText}>⬡</Text>
          <Title level={2} variant="glass" style={styles.comingSoonTitle}>
            Coming Soon
          </Title>
          <Text style={styles.comingSoonText}>
            Transaction history will be available in a future update
          </Text>
        </GlassCard>

        {/* Mock transaction cards for future implementation */}
        <View style={styles.transactionsList}>
          <GlassCard style={styles.transactionCard}>
            <View style={styles.transactionRow}>
              <Text style={styles.transactionType}>↗ Sent</Text>
              <Text style={styles.transactionDate}>2024-01-15</Text>
            </View>
            <View style={styles.transactionRow}>
              <Text style={styles.transactionAddress}>To: 0x1234...5678</Text>
              <Text style={styles.transactionAmountOut}>-1.5 POL</Text>
            </View>
          </GlassCard>

          <GlassCard style={styles.transactionCard}>
            <View style={styles.transactionRow}>
              <Text style={styles.transactionType}>↘ Received</Text>
              <Text style={styles.transactionDate}>2024-01-14</Text>
            </View>
            <View style={styles.transactionRow}>
              <Text style={styles.transactionAddress}>From: 0x9876...4321</Text>
              <Text style={styles.transactionAmountIn}>+5.0 POL</Text>
            </View>
          </GlassCard>

          <GlassCard style={styles.transactionCard}>
            <View style={styles.transactionRow}>
              <Text style={styles.transactionType}>↗ Sent</Text>
              <Text style={styles.transactionDate}>2024-01-13</Text>
            </View>
            <View style={styles.transactionRow}>
              <Text style={styles.transactionAddress}>To: 0xabcd...efgh</Text>
              <Text style={styles.transactionAmountOut}>-0.25 POL</Text>
            </View>
          </GlassCard>
        </View>

        <View style={styles.previewContainer}>
          <Text style={styles.previewText}>
            Preview - These are example transactions
          </Text>
        </View>
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
    paddingBottom: 100, // Account for translucent tab bar
  },
  mainTitle: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 35,
  },
  comingSoonCard: {
    alignItems: 'center',
    marginBottom: 35,
  },
  iconText: {
    fontSize: 60,
    color: 'white',
    marginBottom: 16,
  },
  comingSoonTitle: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  comingSoonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontSize: 16,
  },
  transactionsList: {
    marginTop: 30,
  },
  transactionCard: {
    marginBottom: 16,
    opacity: 0.5,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  previewContainer: {
    marginTop: 24,
  },
  previewText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});