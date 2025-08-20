import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Alert, StyleSheet, ImageBackground } from "react-native";
import { useWallet } from "@/contexts/WalletContext";
import { GlassCard, Button, Title, Input } from '@/components/ui';

export default function SendScreen() {
  const { 
    wallet, 
    isLoading, 
    isAuthenticated, 
    error, 
    sendTransaction 
  } = useWallet();

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isValidAddress, setIsValidAddress] = useState(true);
  const [estimatedGas, setEstimatedGas] = useState('');
  const [isSending, setIsSending] = useState(false);

  const validateAddress = (address) => {
    // Basic Ethereum address validation
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethAddressRegex.test(address);
  };

  useEffect(() => {
    if (recipient) {
      setIsValidAddress(validateAddress(recipient));
    }
  }, [recipient]);

  const handleSend = async () => {
    if (!recipient || !amount) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!validateAddress(recipient)) {
      Alert.alert("Error", "Please enter a valid Ethereum address");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (wallet && numAmount > parseFloat(wallet.balance)) {
      Alert.alert("Error", "Insufficient balance");
      return;
    }

    try {
      setIsSending(true);
      
      Alert.alert(
        "Confirm Transaction",
        `Send ${amount} POL to ${recipient.slice(0, 10)}...${recipient.slice(-8)}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Send",
            onPress: async () => {
              try {
                const txHash = await sendTransaction(recipient, amount);
                Alert.alert(
                  "Success",
                  `Transaction sent! Hash: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`,
                  [{ text: "OK" }]
                );
                setRecipient('');
                setAmount('');
              } catch (err) {
                Alert.alert("Transaction Failed", err.message || "Unknown error occurred");
              }
            }
          }
        ]
      );
    } catch (err) {
      Alert.alert("Error", err.message || "Transaction preparation failed");
    } finally {
      setIsSending(false);
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
          <GlassCard>
            <Text style={styles.messageText}>Please authenticate first</Text>
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
            <Text style={styles.balanceLabel}>
              Available Balance:
            </Text>
            <Text style={styles.balanceValue}>
              {parseFloat(wallet.balance).toFixed(4)} POL
            </Text>
          </GlassCard>
        )}

        <GlassCard style={styles.formCard}>
          <Text style={styles.fieldLabel}>⬡ Recipient Address</Text>
          <Input
            variant="glass"
            value={recipient}
            onChangeText={setRecipient}
            placeholder="0x..."
            autoCapitalize="none"
            autoCorrect={false}
            style={[
              styles.input,
              !isValidAddress && recipient ? styles.inputError : {}
            ]}
          />
          {!isValidAddress && recipient && (
            <Text style={styles.errorText}>Invalid Ethereum address</Text>
          )}

          <Text style={styles.fieldLabel}>◉ Amount (POL)</Text>
          <Input
            variant="glass"
            value={amount}
            onChangeText={setAmount}
            placeholder="0.0"
            keyboardType="decimal-pad"
            style={styles.input}
          />

          {estimatedGas && (
            <View style={styles.gasContainer}>
              <Text style={styles.gasLabel}>Estimated Gas:</Text>
              <Text style={styles.gasValue}>{estimatedGas}</Text>
            </View>
          )}

          <Button
            title={isSending ? "Sending..." : "→ Send Transaction"}
            variant="glass"
            size="large"
            fullWidth
            loading={isSending}
            disabled={!recipient || !amount || !isValidAddress || isSending}
            onPress={handleSend}
            style={styles.sendButton}
          />
        </GlassCard>

        {error && (
          <GlassCard style={styles.errorCard}>
            <Text style={styles.errorMessage}>{error}</Text>
          </GlassCard>
        )}

        <GlassCard style={styles.warningCard}>
          <Text style={styles.warningText}>
            ⚠️ Double-check the recipient address. Transactions on the blockchain are irreversible.
          </Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 100, // Account for translucent tab bar
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  mainTitle: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 35,
  },
  balanceCard: {
    marginBottom: 25,
    alignItems: 'center',
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  balanceValue: {
    color: '#86efac',
    fontSize: 24,
    fontWeight: 'bold',
  },
  formCard: {
    marginBottom: 25,
  },
  fieldLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 16,
  },
  input: {
    marginBottom: 8,
  },
  inputError: {
    borderColor: 'rgba(248, 113, 113, 0.6)',
    borderWidth: 1,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 12,
    marginBottom: 16,
  },
  gasContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  gasLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  gasValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  sendButton: {
    marginTop: 20,
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(248, 113, 113, 0.3)',
    marginBottom: 20,
  },
  errorMessage: {
    color: 'rgba(254, 202, 202, 1)',
    textAlign: 'center',
    fontWeight: '500',
  },
  warningCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  warningText: {
    color: 'rgba(254, 243, 199, 1)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  messageText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});