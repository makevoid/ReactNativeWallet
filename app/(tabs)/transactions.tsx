import React from "react";
import { View, Text, ScrollView } from "react-native";
import { GlassCard, Title } from '@/components/ui';

export default function TransactionsScreen() {
  return (
    <View className="flex-1 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
        <Title level={1} variant="glass" className="text-center mb-8">
          📊 Transactions
        </Title>

        <GlassCard className="items-center">
          <Text className="text-6xl mb-4">🏗️</Text>
          <Title level={2} variant="glass" className="text-center mb-2">
            Coming Soon
          </Title>
          <Text className="text-white/70 text-center text-base">
            Transaction history will be available in a future update
          </Text>
        </GlassCard>

        {/* Mock transaction cards for future implementation */}
        <View className="mt-8 space-y-4">
          <GlassCard className="opacity-50">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-white font-semibold">🔄 Sent</Text>
              <Text className="text-white/70 text-sm">2024-01-15</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-white/70">To: 0x1234...5678</Text>
              <Text className="text-white font-bold">-1.5 POL</Text>
            </View>
          </GlassCard>

          <GlassCard className="opacity-50">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-white font-semibold">📨 Received</Text>
              <Text className="text-white/70 text-sm">2024-01-14</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-white/70">From: 0x9876...4321</Text>
              <Text className="text-white font-bold text-green-300">+5.0 POL</Text>
            </View>
          </GlassCard>

          <GlassCard className="opacity-50">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-white font-semibold">🔄 Sent</Text>
              <Text className="text-white/70 text-sm">2024-01-13</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-white/70">To: 0xabcd...efgh</Text>
              <Text className="text-white font-bold">-0.25 POL</Text>
            </View>
          </GlassCard>
        </View>

        <View className="mt-6">
          <Text className="text-white/50 text-xs text-center italic">
            Preview - These are example transactions
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}