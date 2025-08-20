import React from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';

export const Input = ({
  label,
  error,
  variant = 'default',
  fullWidth = true,
  className = '',
  style,
  ...props
}) => {
  const baseClasses = 'rounded-xl py-4 px-4 text-base';
  
  const variantClasses = {
    default: 'bg-white border border-gray-200 text-gray-900',
    glass: 'bg-white/20 border-2 border-white/40 text-white placeholder:text-gray-300'
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const errorClass = error ? 'border-red-500' : '';

  // Fallback styles
  const fallbackStyles = StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    label: {
      marginBottom: 8,
      fontSize: 14,
      fontWeight: '500',
    },
    labelDefault: {
      color: '#374151',
    },
    labelGlass: {
      color: 'white',
    },
    input: {
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 16,
      fontSize: 16,
    },
    inputDefault: {
      backgroundColor: 'white',
      borderWidth: 1,
      borderColor: '#e5e7eb',
      color: '#111827',
    },
    inputGlass: {
      backgroundColor: 'rgba(255, 255, 255, 0.20)',
      borderWidth: 1.5,
      borderColor: 'rgba(255, 255, 255, 0.4)',
      color: 'white',
    },
    error: {
      marginTop: 4,
      fontSize: 14,
      color: '#ef4444',
    },
  });

  return (
    <View style={fallbackStyles.container}>
      {label && (
        <Text 
          className={`mb-2 text-sm font-medium ${variant === 'glass' ? 'text-white' : 'text-gray-700'}`}
          style={[
            fallbackStyles.label,
            variant === 'glass' ? fallbackStyles.labelGlass : fallbackStyles.labelDefault
          ]}
        >
          {label}
        </Text>
      )}
      <TextInput
        className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${errorClass} ${className}`}
        style={[
          fallbackStyles.input,
          variant === 'glass' ? fallbackStyles.inputGlass : fallbackStyles.inputDefault,
          error && { borderColor: '#ef4444' },
          style,
        ]}
        placeholderTextColor={variant === 'glass' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.4)'}
        {...props}
      />
      {error && (
        <Text style={fallbackStyles.error}>
          {error}
        </Text>
      )}
    </View>
  );
};