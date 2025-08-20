import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';

export const Button = ({
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
    glass: 'bg-white/20 border-2 border-white/40',
    danger: 'bg-red-600 active:bg-red-700'
  };

  const sizeClasses = {
    small: 'px-3 py-2',
    medium: 'px-4 py-3',
    large: 'px-6 py-4'
  };

  const textVariantClasses = {
    primary: 'text-white',
    secondary: 'text-gray-800', 
    glass: 'text-white',
    danger: 'text-white'
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const opacityClass = (disabled || loading) ? 'opacity-50' : '';

  const getButtonStyle = () => {
    const baseStyle = [fallbackStyles.base];
    
    if (variant === 'glass') {
      baseStyle.push(fallbackStyles.glass);
    } else if (variant === 'primary') {
      baseStyle.push(fallbackStyles.primary);
    } else if (variant === 'secondary') {
      baseStyle.push(fallbackStyles.secondary);
    } else if (variant === 'danger') {
      baseStyle.push(fallbackStyles.danger);
    }

    if (size === 'small') {
      baseStyle.push(fallbackStyles.small);
    } else if (size === 'large') {
      baseStyle.push(fallbackStyles.large);
    } else {
      baseStyle.push(fallbackStyles.medium);
    }

    if (fullWidth) {
      baseStyle.push(fallbackStyles.fullWidth);
    }

    if (disabled || loading) {
      baseStyle.push(fallbackStyles.disabled);
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const textStyle = [fallbackStyles.text];
    
    if (variant === 'secondary') {
      textStyle.push(fallbackStyles.textSecondary);
    }

    if (size === 'small') {
      textStyle.push(fallbackStyles.textSmall);
    } else if (size === 'large') {
      textStyle.push(fallbackStyles.textLarge);
    }

    return textStyle;
  };

  return (
    <TouchableOpacity
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${opacityClass} ${className}`}
      style={[...getButtonStyle(), style]}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <ActivityIndicator 
          size="small" 
          color={variant === 'secondary' ? '#374151' : 'white'} 
          style={fallbackStyles.loader}
        />
      )}
      <Text 
        className={`${textVariantClasses[variant]} ${textSizeClasses[size]}`}
        style={[
          fallbackStyles.text,
          fallbackStyles[`text${size.charAt(0).toUpperCase() + size.slice(1)}`],
          variant === 'secondary' ? fallbackStyles.textSecondary : {},
          loading ? fallbackStyles.textWithLoader : {}
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const fallbackStyles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  primary: {
    backgroundColor: '#2563eb',
  },
  secondary: {
    backgroundColor: '#e5e7eb',
  },
  danger: {
    backgroundColor: '#dc2626',
  },
  small: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  large: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  textSmall: {
    fontSize: 16,
  },
  textLarge: {
    fontSize: 20,
  },
  textSecondary: {
    color: '#374151',
  },
  loader: {
    marginRight: 8,
  },
  textWithLoader: {
    marginLeft: 4,
  },
});