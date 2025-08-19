import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
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
      <View className="flex-1 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 justify-center items-center px-6">
        <GlassCard variant="large" className="items-center">
          <Title level={2} variant="glass" className="text-center mb-4">
            🔐 Authentication Required
          </Title>
          <Text className="text-white/80 text-center">
            Please authenticate your wallet to send transactions
          </Text>
        </GlassCard>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
        <Title level={1} variant="glass" className="text-center mb-8">
          💸 Send POL
        </Title>

        {wallet && (
          <GlassCard className="mb-6">
            <View className="flex-row justify-between items-center">
              <Text className="text-white/70 text-sm font-medium">Available Balance:</Text>
              <Text className="text-white text-lg font-bold">
                {parseFloat(wallet.balance).toFixed(4)} POL
              </Text>
            </View>
          </GlassCard>
        )}

        <GlassCard className="mb-6">
          <Text className="text-white text-lg font-semibold mb-4">📍 Recipient Address</Text>
          <View className="flex-row items-start mb-4">
            <View className="flex-1 mr-3">
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
              icon="📋"
              variant="glass"
              size="medium"
              onPress={pasteAddress}
            />
          </View>
        </GlassCard>

        <GlassCard className="mb-6">
          <Text className="text-white text-lg font-semibold mb-4">💰 Amount (POL)</Text>
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
          <GlassCard className="mb-6">
            <View className="flex-row justify-between items-center">
              <Text className="text-white/70 text-sm font-medium">⛽ Estimated Gas:</Text>
              <Text className="text-white text-base font-semibold">
                {parseInt(gasEstimate).toLocaleString()} units
              </Text>
            </View>
          </GlassCard>
        )}

        {isEstimating && (
          <GlassCard className="mb-6">
            <View className="flex-row items-center justify-center">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white/70 ml-3 font-medium">
                Estimating gas...
              </Text>
            </View>
          </GlassCard>
        )}

        <GlassCard>
          <Button
            title={isLoading ? "⏳ Sending..." : "🚀 Send Transaction"}
            variant="glass"
            size="large"
            fullWidth
            onPress={handleSend}
            disabled={isLoading || !recipientAddress.trim() || !amount.trim()}
          />
        </GlassCard>
      </ScrollView>
    </View>
  );
}