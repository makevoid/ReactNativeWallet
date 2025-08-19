import React, { useState } from "react";
import { View, Text, ScrollView, Alert, TextInput, Modal, ActivityIndicator, StyleSheet, ImageBackground } from "react-native";
import { useWallet } from "@/contexts/WalletContext";
import { GlassCard, Button, Title, Input, IconButton, SettingsModal } from '@/components/ui';
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
  const [showSettingsModal, setShowSettingsModal] = useState(false);
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
      <ImageBackground
        source={require('../../assets/images/background1.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <View style={styles.centered}>
          <GlassCard variant="large">
            <View style={styles.cardCenter}>
              <ActivityIndicator size="large" color="white" />
              <Text style={styles.loadingText}>Loading wallet...</Text>
            </View>
          </GlassCard>
        </View>
      </ImageBackground>
    );
  }

  if (!isAuthenticated) {
    return (
      <ImageBackground
        source={require('../../assets/images/background1.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <View style={styles.authContainer}>
          <GlassCard variant="large" style={styles.authCard}>
            <Title level={2} variant="glass" style={styles.authTitle}>
              Welcome to Your Wallet
            </Title>
            <Text style={styles.authSubtitle}>
              Authenticate to access your secure wallet
            </Text>
            <Button
              title="◉ Authenticate"
              variant="glass"
              size="large"
              fullWidth
              onPress={authenticateWallet}
            />
          </GlassCard>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/images/background1.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <Title level={1} variant="glass" style={styles.mainTitle}>
            ◈ Your Wallet
          </Title>
          <IconButton
            icon="⬢"
            variant="glass"
            size="small"
            onPress={() => setShowSettingsModal(true)}
            style={styles.settingsButton}
          />
        </View>

        {wallet && (
          <GlassCard style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Balance</Text>
            <Text style={styles.balanceValue}>
              {parseFloat(wallet.balance).toFixed(4)} POL
            </Text>
            <Text style={styles.addressText}>
              {wallet.address.slice(0, 10)}...{wallet.address.slice(-8)}
            </Text>
            <View style={styles.refreshContainer}>
              <Button
                title="↻ Refresh Balance"
                variant="glass"
                size="small"
                onPress={refreshBalance}
              />
            </View>
          </GlassCard>
        )}


        {error && (
          <GlassCard className="bg-red-500/20 border-red-400/30">
            <Text className="text-red-200 text-center font-medium">{error}</Text>
          </GlassCard>
        )}
      </ScrollView>

      <SettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onExportPrivateKey={handleExportPrivateKey}
        onRestoreWallet={() => {
          setShowSettingsModal(false);
          setShowRestoreModal(true);
        }}
      />

      <Modal
        visible={showRestoreModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowRestoreModal(false)}
      >
        <ImageBackground
          source={require('../../assets/images/background1.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.overlay} />
          <View style={styles.modalHeader}>
            <Title level={2} variant="glass">Restore Wallet</Title>
            <Button
              title="Cancel"
              variant="glass"
              size="small"
              onPress={() => setShowRestoreModal(false)}
            />
          </View>
          
          <View style={styles.modalContent}>
            <GlassCard>
              <Text style={styles.modalDescription}>
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
                title="↻ Restore Wallet"
                variant="glass"
                size="large"
                fullWidth
                onPress={handleRestoreWallet}
                disabled={!privateKeyInput.trim() || isLoading}
              />
            </GlassCard>
          </View>
        </ImageBackground>
      </Modal>
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
    paddingBottom: 100, // Account for translucent tab bar
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  mainTitle: {
    color: 'white',
    flex: 1,
    textAlign: 'center',
    marginBottom: 0,
  },
  settingsButton: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  balanceCard: {
    marginBottom: 40,
    marginHorizontal: 0,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
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
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  refreshContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    color: 'white',
    marginBottom: 20,
    marginTop: 10,
  },
  settingsCard: {
    marginBottom: 30,
    marginHorizontal: 0,
  },
  buttonSpacing: {
    marginBottom: 16,
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