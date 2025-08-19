import React from 'react';
import { TextInput, TextInputProps, View, Text } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  variant?: 'default' | 'glass';
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  variant = 'default',
  fullWidth = true,
  className = '',
  ...props
}) => {
  const baseClasses = 'rounded-xl py-4 px-4 text-base';
  
  const variantClasses = {
    default: 'bg-white border border-gray-200 text-gray-900',
    glass: 'bg-glass-light backdrop-blur-glass border border-glass-border text-white placeholder:text-gray-300'
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const errorClass = error ? 'border-red-500' : '';

  return (
    <View className="mb-4">
      {label && (
        <Text className={`mb-2 text-sm font-medium ${variant === 'glass' ? 'text-white' : 'text-gray-700'}`}>
          {label}
        </Text>
      )}
      <TextInput
        className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${errorClass} ${className}`}
        placeholderTextColor={variant === 'glass' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.4)'}
        {...props}
      />
      {error && (
        <Text className="mt-1 text-sm text-red-500">
          {error}
        </Text>
      )}
    </View>
  );
};