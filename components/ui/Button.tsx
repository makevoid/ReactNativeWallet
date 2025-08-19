import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, ActivityIndicator, StyleSheet, View } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'glass' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  style,
  ...props
}) => {
  const baseClasses = 'rounded-xl items-center justify-center flex-row';
  
  const variantClasses = {
    primary: 'bg-blue-600 active:bg-blue-700',
    secondary: 'bg-gray-200 active:bg-gray-300',
    glass: 'bg-white/10 border border-white/30',
    danger: 'bg-red-600 active:bg-red-700'
  };

  const sizeClasses = {
    small: 'py-2 px-4',
    medium: 'py-3 px-6',
    large: 'py-4 px-8'
  };

  const textVariantClasses = {
    primary: 'text-white font-semibold',
    secondary: 'text-gray-800 font-semibold',
    glass: 'text-white font-semibold',
    danger: 'text-white font-semibold'
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const opacityClass = (disabled || loading) ? 'opacity-50' : '';

  // Fallback styles
  const fallbackStyles = StyleSheet.create({
    base: {
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    primary: {
      backgroundColor: '#2563eb',
    },
    secondary: {
      backgroundColor: '#e5e7eb',
    },
    glass: {
      backgroundColor: 'rgba(255, 255, 255, 0.13)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    danger: {
      backgroundColor: '#dc2626',
    },
    small: {
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    medium: {
      paddingVertical: 12,
      paddingHorizontal: 24,
    },
    large: {
      paddingVertical: 16,
      paddingHorizontal: 32,
    },
    fullWidth: {
      width: '100%',
    },
    disabled: {
      opacity: 0.5,
    },
    text: {
      fontWeight: '600',
      color: 'white',
    },
    textSecondary: {
      color: '#374151',
    },
  });

  const buttonStyle = [
    fallbackStyles.base,
    fallbackStyles[variant],
    fallbackStyles[size],
    fullWidth && fallbackStyles.fullWidth,
    (disabled || loading) && fallbackStyles.disabled,
    style,
  ];

  return (
    <TouchableOpacity
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${opacityClass} ${className}`}
      style={buttonStyle}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <ActivityIndicator color="white" size="small" style={{ marginRight: 8 }} />
      )}
      <Text 
        className={`${textVariantClasses[variant]} ${textSizeClasses[size]}`}
        style={[
          fallbackStyles.text,
          variant === 'secondary' && fallbackStyles.textSecondary,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};