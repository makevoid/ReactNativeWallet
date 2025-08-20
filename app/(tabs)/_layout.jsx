import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            borderTopColor: 'rgba(255, 255, 255, 0.3)',
            borderTopWidth: 1,
          },
          default: {
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            borderTopColor: 'rgba(255, 255, 255, 0.3)',
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>◈</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="send"
        options={{
          title: 'Send',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>↗</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>⬢</Text>
          ),
        }}
      />
    </Tabs>
  );
}