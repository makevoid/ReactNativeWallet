import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  Alert,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useWallet } from "@/contexts/WalletContext";
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
      <View style={styles.container}>
        <Text style={styles.placeholder}>Please authenticate your wallet to send transactions</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Send POL</Text>

        {wallet && (
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Available Balance:</Text>
            <Text style={styles.balanceValue}>{parseFloat(wallet.balance).toFixed(4)} POL</Text>
          </View>
        )}

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Recipient Address</Text>
          <View style={styles.addressInputContainer}>
            <TextInput
              style={styles.addressInput}
              value={recipientAddress}
              onChangeText={setRecipientAddress}
              placeholder="0x..."
              autoCapitalize="none"
              autoCorrect={false}
              multiline={true}
              numberOfLines={2}
            />
            <TouchableOpacity style={styles.pasteButton} onPress={pasteAddress}>
              <Text style={styles.pasteButtonText}>Paste</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Amount (POL)</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.0"
            keyboardType="decimal-pad"
            autoCorrect={false}
          />
        </View>

        {gasEstimate && (
          <View style={styles.gasSection}>
            <Text style={styles.gasLabel}>Estimated Gas:</Text>
            <Text style={styles.gasValue}>{parseInt(gasEstimate).toLocaleString()} units</Text>
          </View>
        )}

        {isEstimating && (
          <View style={styles.estimatingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.estimatingText}>Estimating gas...</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title={isLoading ? "Sending..." : "Send Transaction"}
            onPress={handleSend}
            disabled={isLoading || !recipientAddress.trim() || !amount.trim()}
            color="#007AFF"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  placeholder: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 100,
  },
  balanceContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 14,
    color: "#666",
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  addressInputContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  addressInput: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: "top",
    marginRight: 10,
  },
  pasteButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 15,
    justifyContent: "center",
  },
  pasteButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  amountInput: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    fontSize: 16,
  },
  gasSection: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gasLabel: {
    fontSize: 14,
    color: "#666",
  },
  gasValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  estimatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  estimatingText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  buttonContainer: {
    marginBottom: 20,
  },
  warningContainer: {
    backgroundColor: "#FFF3CD",
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: "#FFEAA7",
  },
  warningText: {
    fontSize: 12,
    color: "#856404",
    textAlign: "center",
    lineHeight: 16,
  },
});
