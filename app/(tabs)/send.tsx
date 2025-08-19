import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { useWallet } from "@/contexts/WalletContext";
import { GlassCard, Button, Title, Input, IconButton } from '@/components/ui';
import BlockchainService from "@/services/BlockchainService";
import * as Clipboard from "expo-clipboard";

export default function SendScreen() {
  const { wallet, isAuthenticated, sendTransaction } = useWallet();
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [gasEstimate, setGasEstimate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);

  const validateAddress = async (address: string): Promise<boolean> => {
    if (!address.trim()) return false;
    return await BlockchainService.isValidAddress(address);
  };

  const validateAmount = (amount: string): boolean => {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0;
  };

  const estimateGas = async () => {
    if (!recipientAddress.trim() || !amount.trim()) return;

    const isValidAddress = await validateAddress(recipientAddress);
    const isValidAmount = validateAmount(amount);

    if (!isValidAddress || !isValidAmount) return;

    setIsEstimating(true);
    try {
      const estimate = await BlockchainService.estimateGas({
        to: recipientAddress,
        value: amount,
      });
      setGasEstimate(estimate);
    } catch (error) {
      console.error("Gas estimation failed:", error);
      setGasEstimate("");
    } finally {
      setIsEstimating(false);
    }
  };

  // Auto-estimate gas when address and amount change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      estimateGas();
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [recipientAddress, amount]);

  const pasteAddress = async () => {
    try {
      const clipboardText = await Clipboard.getStringAsync();
      if (clipboardText) {
        setRecipientAddress(clipboardText);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to paste from clipboard");
    }
  };

  const handleSend = async () => {
    if (!isAuthenticated) {
      Alert.alert("Error", "Please authenticate your wallet first");
      return;
    }

    if (!recipientAddress.trim()) {
      Alert.alert("Error", "Please enter a recipient address");
      return;
    }

    if (!amount.trim()) {
      Alert.alert("Error", "Please enter an amount");
      return;
    }

    const isValidAddress = await validateAddress(recipientAddress);
    if (!isValidAddress) {
      Alert.alert("Error", "Please enter a valid Ethereum address");
      return;
    }

    const isValidAmount = validateAmount(amount);
    if (!isValidAmount) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    // Check if user has enough balance
    if (wallet && parseFloat(amount) > parseFloat(wallet.balance)) {
      Alert.alert("Error", "Insufficient balance");
      return;
    }

    // Show confirmation dialog
    Alert.alert(
      "Confirm Transaction",
      `Send ${amount} POL to:\n${recipientAddress.slice(0, 10)}...${recipientAddress.slice(-8)}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          style: "default",
          onPress: () => executeSend(),
        },
      ],
    );
  };

  const executeSend = async () => {
    setIsLoading(true);

    try {
      const txHash = await sendTransaction(recipientAddress, amount);

      Alert.alert("Transaction Sent", `Transaction Hash:\n${txHash}`, [
        {
          text: "Copy Hash",
          onPress: () => Clipboard.setStringAsync(txHash),
        },
        { text: "OK" },
      ]);

      // Clear form after successful send
      setRecipientAddress("");
      setAmount("");
      setGasEstimate("");
    } catch (error) {
      Alert.alert(
        "Transaction Failed",
        error instanceof Error ? error.message : "Unknown error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <ImageBackground
        source={require('../../assets/images/background2.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <View style={styles.centered}>
          <GlassCard variant="large">
            <View style={styles.cardCenter}>
              <Title level={2} variant="glass" style={styles.authTitle}>
                ◉ Authentication Required
              </Title>
              <Text style={styles.authSubtitle}>
                Please authenticate your wallet to send transactions
              </Text>
            </View>
          </GlassCard>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/images/background2.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Title level={1} variant="glass" style={styles.mainTitle}>
          ⟠ Send POL
        </Title>

        {wallet && (
          <GlassCard style={styles.balanceCard}>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Available Balance:</Text>
              <Text style={styles.balanceValue}>
                {parseFloat(wallet.balance).toFixed(4)} POL
              </Text>
            </View>
          </GlassCard>
        )}

        <GlassCard style={styles.inputCard}>
          <Text style={styles.sectionLabel}>⬡ Recipient Address</Text>
          <View style={styles.addressRow}>
            <View style={styles.addressInputContainer}>
              <Input
                variant="glass"
                value={recipientAddress}
                onChangeText={setRecipientAddress}
                placeholder="0x..."
                autoCapitalize="none"
                autoCorrect={false}
                multiline={true}
                numberOfLines={2}
              />
            </View>
            <IconButton
              icon="⎘"
              variant="glass"
              size="medium"
              onPress={pasteAddress}
            />
          </View>
        </GlassCard>

        <GlassCard style={styles.inputCard}>
          <Text style={styles.sectionLabel}>◉ Amount (POL)</Text>
          <Input
            variant="glass"
            value={amount}
            onChangeText={setAmount}
            placeholder="0.0"
            keyboardType="decimal-pad"
            autoCorrect={false}
          />
        </GlassCard>

        {gasEstimate && (
          <GlassCard style={styles.gasCard}>
            <View style={styles.gasRow}>
              <Text style={styles.gasLabel}>⬢ Estimated Gas:</Text>
              <Text style={styles.gasValue}>
                {parseInt(gasEstimate).toLocaleString()} units
              </Text>
            </View>
          </GlassCard>
        )}

        {isEstimating && (
          <GlassCard style={styles.gasCard}>
            <View style={styles.estimatingRow}>
              <ActivityIndicator size="small" color="white" />
              <Text style={styles.estimatingText}>
                Estimating gas...
              </Text>
            </View>
          </GlassCard>
        )}

        <GlassCard style={styles.buttonCard}>
          <Button
            title={isLoading ? "◎ Sending..." : "→ Send Transaction"}
            variant="glass"
            size="large"
            fullWidth
            onPress={handleSend}
            disabled={isLoading || !recipientAddress.trim() || !amount.trim()}
          />
        </GlassCard>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  cardCenter: {
    alignItems: 'center',
  },
  authTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  authSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontSize: 16,
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
  balanceCard: {
    marginBottom: 25,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  balanceValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputCard: {
    marginBottom: 25,
  },
  sectionLabel: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressInputContainer: {
    flex: 1,
    marginRight: 12,
  },
  gasCard: {
    marginBottom: 20,
  },
  gasRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gasLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  gasValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  estimatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  estimatingText: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 12,
    fontWeight: '500',
  },
  buttonCard: {
    marginBottom: 20,
  },
});