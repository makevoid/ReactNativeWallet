import React from "react";
import { View, StyleSheet } from "react-native";
import { AppKitButton } from "@reown/appkit-wagmi-react-native";

export default function ConnectView() {
  return (
    <View style={styles.container}>
      <AppKitButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});