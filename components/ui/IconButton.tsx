import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';

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
  ...props
}) => {
  const baseClasses = 'rounded-xl items-center justify-center';
  
  const variantClasses = {
    primary: 'bg-primary-600 active:bg-primary-700',
    glass: 'bg-glass-light backdrop-blur-glass border border-glass-border',
    secondary: 'bg-gray-200 active:bg-gray-300'
  };

  const sizeClasses = {
    small: 'p-2',
    medium: 'p-3',
    large: 'p-4'
  };

  const textVariantClasses = {
    primary: 'text-white',
    glass: 'text-white',
    secondary: 'text-gray-800'
  };

  const opacityClass = disabled ? 'opacity-50' : '';

  return (
    <TouchableOpacity
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${opacityClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      <Text className={`${textVariantClasses[variant]} text-lg font-medium`}>
        {icon}
      </Text>
      {label && (
        <Text className={`${textVariantClasses[variant]} text-xs mt-1 font-medium`}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};