import React from 'react';
import { View, Text } from 'react-native';

export const TestComponent: React.FC = () => {
  return (
    <View className="bg-red-500 p-4 m-4">
      <Text className="text-white text-xl font-bold">
        NativeWind Test - This should have red background
      </Text>
    </View>
  );
};