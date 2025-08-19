import React from "react";
import { View, Text, StyleSheet, ScrollView, Button, Alert } from "react-native";
import { useWallet } from "@/contexts/WalletContext";

export default function HomeScreen() {
  const { 
    wallet, 
    isLoading, 
    isAuthenticated, 
    error, 
    authenticateWallet, 
    refreshBalance, 
    deleteWallet 
  } = useWallet();

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

            <View style={styles.buttonContainer}>
              <Button title="Delete Wallet" onPress={handleDeleteWallet} color="#FF3B30" />
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
  statusContainer: {
    padding: 20,
    alignItems: "center",
  },
  statusText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});