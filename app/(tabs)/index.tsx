import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Button, Alert, TextInput, Modal } from "react-native";
import { useWallet } from "@/contexts/WalletContext";
import * as Clipboard from 'expo-clipboard';

export default function HomeScreen() {
  const { 
    wallet, 
    isLoading, 
    isAuthenticated, 
    error, 
    authenticateWallet, 
    refreshBalance, 
    deleteWallet,
    exportPrivateKey,
    restoreFromPrivateKey
  } = useWallet();

  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [privateKeyInput, setPrivateKeyInput] = useState('');

  const handleDeleteWallet = () => {
    Alert.alert(
      "Delete Wallet",
      "Are you sure you want to delete your wallet? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: deleteWallet }
      ]
    );
  };

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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {!isAuthenticated && (
          <View style={styles.connectionSection}>
            <Button
              title={isLoading ? "Loading..." : "Unlock Wallet"}
              onPress={authenticateWallet}
              disabled={isLoading}
            />
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {isAuthenticated && wallet && (
          <View style={styles.walletInfo}>
            <Text style={styles.sectionTitle}>Wallet Information</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Address:</Text>
              <Text style={styles.value}>
                {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Balance:</Text>
              <Text style={styles.value}>
                {parseFloat(wallet.balance).toFixed(4)} POL
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <Button title="Refresh Balance" onPress={refreshBalance} />
            </View>

            <View style={styles.settingsSection}>
              <Text style={styles.settingsTitle}>Wallet Settings</Text>
              
              <View style={styles.buttonContainer}>
                <Button 
                  title="Export Private Key" 
                  onPress={handleExportPrivateKey} 
                  color="#FF9500" 
                />
              </View>

              <View style={styles.buttonContainer}>
                <Button 
                  title="Restore Different Wallet" 
                  onPress={() => setShowRestoreModal(true)} 
                  color="#007AFF" 
                />
              </View>

            </View>
          </View>
        )}

        {isLoading && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>Loading...</Text>
          </View>
        )}

        {!isAuthenticated && !isLoading && !wallet && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>Authenticate to access your wallet</Text>
          </View>
        )}
      </View>

      <Modal
        visible={showRestoreModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowRestoreModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Restore Wallet</Text>
            <Button title="Cancel" onPress={() => setShowRestoreModal(false)} />
          </View>
          
          <View style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              Enter your private key to restore a different wallet. This will replace your current wallet.
            </Text>
            
            <TextInput
              style={styles.privateKeyInput}
              value={privateKeyInput}
              onChangeText={setPrivateKeyInput}
              placeholder="Enter private key (0x...)"
              multiline
              numberOfLines={3}
              secureTextEntry={false}
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            <View style={styles.modalButtons}>
              <Button
                title="Restore Wallet"
                onPress={handleRestoreWallet}
                disabled={!privateKeyInput.trim() || isLoading}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  connectionSection: {
    marginBottom: 30,
    alignItems: "center",
  },
  errorContainer: {
    backgroundColor: "#FFE5E5",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: "#D32F2F",
    textAlign: "center",
    fontSize: 14,
  },
  walletInfo: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  label: {
    fontSize: 14,
    color: "#666",
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  buttonContainer: {
    marginTop: 15,
  },
  settingsSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 15,
    color: "#333",
  },
  statusContainer: {
    padding: 20,
    alignItems: "center",
  },
  statusText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    lineHeight: 20,
  },
  privateKeyInput: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  modalButtons: {
    marginTop: 20,
  },
});