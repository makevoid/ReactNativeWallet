import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function SendScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Send</Text>
      <Text style={styles.placeholder}>Send screen coming soon...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
  },
  placeholder: {
    fontSize: 16,
    color: "#666",
  },
});