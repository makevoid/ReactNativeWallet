import React, { useState } from "react";
import { View, Text, ScrollView, Alert, TextInput, Modal, ActivityIndicator } from "react-native";
import { useWallet } from "@/contexts/WalletContext";
import { GlassCard, Button, Title, Input } from '@/components/ui';
import * as Clipboard from 'expo-clipboard';

export default function HomeScreen() {
  const { 
    wallet, 
    isLoading, 
    isAuthenticated, 
    error, 
    authenticateWallet, 
    refreshBalance, 
    exportPrivateKey,
    restoreFromPrivateKey
  } = useWallet();

  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [privateKeyInput, setPrivateKeyInput] = useState('');

  const handleExportPrivateKey = async () => {
    try {
      const privateKey = await exportPrivateKey();
      
      Alert.alert(
        "Export Private Key",
        "Choose how to export your private key:",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Copy to Clipboard", 
            onPress: () => {
              Clipboard.setStringAsync(privateKey);
              Alert.alert("Copied", "Private key copied to clipboard");
            }
          },
          {
            text: "Show Key",
            onPress: () => {
              Alert.alert(
                "Private Key",
                privateKey,
                [{ text: "OK" }],
                { cancelable: true }
              );
            }
          }
        ]
      );
    } catch (err) {
      Alert.alert("Export Failed", err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handleRestoreWallet = async () => {
    if (!privateKeyInput.trim()) {
      Alert.alert("Error", "Please enter a private key");
      return;
    }

    try {
      await restoreFromPrivateKey(privateKeyInput.trim());
      setShowRestoreModal(false);
      setPrivateKeyInput('');
      Alert.alert("Success", "Wallet restored successfully");
    } catch (err) {
      Alert.alert("Restore Failed", err instanceof Error ? err.message : "Unknown error");
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 justify-center items-center">
        <GlassCard variant="large" className="items-center">
          <ActivityIndicator size="large" color="white" />
          <Text className="text-white text-lg mt-4 font-medium">Loading wallet...</Text>
        </GlassCard>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 justify-center items-center px-6">
        <GlassCard variant="large" className="w-full max-w-sm items-center">
          <Title level={2} variant="glass" className="text-center mb-2">
            Welcome to Your Wallet
          </Title>
          <Text className="text-white/80 text-center mb-8 text-base">
            Authenticate to access your secure wallet
          </Text>
          <Button
            title="🔐 Authenticate"
            variant="glass"
            size="large"
            fullWidth
            onPress={authenticateWallet}
          />
        </GlassCard>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
        <Title level={1} variant="glass" className="text-center mb-8">
          💎 Your Wallet
        </Title>

        {wallet && (
          <GlassCard className="mb-8">
            <Text className="text-white/70 text-sm font-medium mb-2">Balance</Text>
            <Text className="text-white text-4xl font-bold mb-4">
              {parseFloat(wallet.balance).toFixed(4)} POL
            </Text>
            <Text className="text-white/60 text-sm font-mono">
              {wallet.address.slice(0, 10)}...{wallet.address.slice(-8)}
            </Text>
            <View className="mt-4">
              <Button
                title="🔄 Refresh Balance"
                variant="glass"
                size="small"
                onPress={refreshBalance}
              />
            </View>
          </GlassCard>
        )}

        <Title level={3} variant="glass" className="mb-4">
          ⚙️ Settings
        </Title>

        <GlassCard className="mb-6">
          <View className="space-y-3">
            <Button
              title="📤 Export Private Key"
              variant="glass"
              size="medium"
              fullWidth
              onPress={handleExportPrivateKey}
              className="mb-3"
            />

            <Button
              title="🔄 Restore Wallet"
              variant="glass"
              size="medium"
              fullWidth
              onPress={() => setShowRestoreModal(true)}
            />
          </View>
        </GlassCard>

        {error && (
          <GlassCard className="bg-red-500/20 border-red-400/30">
            <Text className="text-red-200 text-center font-medium">{error}</Text>
          </GlassCard>
        )}
      </ScrollView>

      <Modal
        visible={showRestoreModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowRestoreModal(false)}
      >
        <View className="flex-1 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500">
          <View className="flex-row justify-between items-center p-6 pt-12">
            <Title level={2} variant="glass">Restore Wallet</Title>
            <Button
              title="Cancel"
              variant="glass"
              size="small"
              onPress={() => setShowRestoreModal(false)}
            />
          </View>
          
          <View className="flex-1 p-6">
            <GlassCard className="mb-6">
              <Text className="text-white/80 text-base mb-4 leading-6">
                Enter your private key to restore a different wallet. This will replace your current wallet.
              </Text>
              
              <Input
                variant="glass"
                value={privateKeyInput}
                onChangeText={setPrivateKeyInput}
                placeholder="Enter private key (0x...)"
                multiline
                numberOfLines={3}
                autoCapitalize="none"
                autoCorrect={false}
              />
              
              <Button
                title="🔄 Restore Wallet"
                variant="glass"
                size="large"
                fullWidth
                onPress={handleRestoreWallet}
                disabled={!privateKeyInput.trim() || isLoading}
              />
            </GlassCard>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardCenter: {
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 16,
    fontWeight: '500',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  authCard: {
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
  },
  authTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  authSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 32,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
  },
  mainTitle: {
    textAlign: 'center',
    marginBottom: 32,
  },
  balanceCard: {
    marginBottom: 32,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  balanceValue: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  addressText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  refreshContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  settingsCard: {
    marginBottom: 24,
  },
  buttonSpacing: {
    marginBottom: 12,
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(248, 113, 113, 0.3)',
  },
  errorText: {
    color: 'rgba(254, 202, 202, 1)',
    textAlign: 'center',
    fontWeight: '500',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 48,
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  modalDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 24,
  },
});