import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, StyleSheet } from 'react-native';

interface IconButtonProps extends TouchableOpacityProps {
  icon: string;
  label?: string;
  variant?: 'primary' | 'glass' | 'secondary';
  size?: 'small' | 'medium' | 'large';
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  variant = 'glass',
  size = 'medium',
  disabled,
  className = '',
  style,
  ...props
}) => {
  const getButtonStyle = () => {
    const baseStyle = [fallbackStyles.base];
    
    if (variant === 'glass') {
      baseStyle.push(fallbackStyles.glass);
    } else if (variant === 'primary') {
      baseStyle.push(fallbackStyles.primary);
    } else if (variant === 'secondary') {
      baseStyle.push(fallbackStyles.secondary);
    }

    if (size === 'small') {
      baseStyle.push(fallbackStyles.small);
    } else if (size === 'large') {
      baseStyle.push(fallbackStyles.large);
    } else {
      baseStyle.push(fallbackStyles.medium);
    }

    if (disabled) {
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
      className={`rounded-xl items-center justify-center ${variant === 'glass' ? 'bg-glass-light backdrop-blur-glass border border-glass-border' : ''} ${size === 'small' ? 'p-2' : size === 'large' ? 'p-4' : 'p-3'} ${disabled ? 'opacity-50' : ''} ${className}`}
      style={[...getButtonStyle(), style]}
      disabled={disabled}
      {...props}
    >
      <Text 
        className={`text-white ${size === 'small' ? 'text-base' : 'text-lg'} font-medium`}
        style={getTextStyle()}
      >
        {icon}
      </Text>
      {label && (
        <Text 
          className={`text-white text-xs mt-1 font-medium`}
          style={[fallbackStyles.text, fallbackStyles.labelText]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const fallbackStyles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
  small: {
    padding: 8,
  },
  medium: {
    padding: 12,
  },
  large: {
    padding: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: 'white',
    fontWeight: '500',
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
  labelText: {
    fontSize: 12,
    marginTop: 4,
  },
});