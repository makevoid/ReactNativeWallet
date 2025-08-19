import React from "react";
import { View, Text, StyleSheet, ScrollView, Button } from "react-native";
import { AppKitButton } from "@reown/appkit-wagmi-react-native";
import { useAccount, useBalance, useDisconnect, useEnsName, useEnsAvatar } from "wagmi";

export default function HomeScreen() {
  const { address, isConnecting, isDisconnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName ?? undefined });
  const { data: balance } = useBalance({ address });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Wallet</Text>
        
        <View style={styles.connectionSection}>
          <AppKitButton />
        </View>

        {address && (
          <View style={styles.walletInfo}>
            <Text style={styles.sectionTitle}>Wallet Information</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Address:</Text>
              <Text style={styles.value}>{address.slice(0, 6)}...{address.slice(-4)}</Text>
            </View>

            {ensName && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>ENS Name:</Text>
                <Text style={styles.value}>{ensName}</Text>
              </View>
            )}

            {balance && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Balance:</Text>
                <Text style={styles.value}>
                  {balance.formatted} {balance.symbol}
                </Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <Button title="Disconnect" onPress={() => disconnect()} color="#FF3B30" />
            </View>
          </View>
        )}

        {isConnecting && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>Connecting...</Text>
          </View>
        )}

        {isDisconnected && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>Connect your wallet to get started</Text>
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
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  connectionSection: {
    marginBottom: 30,
    alignItems: "center",
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
    marginTop: 20,
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