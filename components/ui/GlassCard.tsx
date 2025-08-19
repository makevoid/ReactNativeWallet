import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'large' | 'small';
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  variant = 'default', 
  className = '',
  style,
  ...props 
}) => {
  const baseClasses = 'bg-white/10 border border-white/30 rounded-3xl shadow-lg';
  
  const variantClasses = {
    default: 'p-6',
    large: 'p-8',
    small: 'p-4'
  };

  // Fallback styles in case NativeWind isn't working
  const fallbackStyles = StyleSheet.create({
    glass: {
      backgroundColor: 'rgba(255, 255, 255, 0.13)',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 32,
      elevation: 8,
    },
    default: { padding: 24 },
    large: { padding: 32 },
    small: { padding: 16 },
  });

  return (
    <View 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={[fallbackStyles.glass, fallbackStyles[variant], style]}
      {...props}
    >
      {children}
    </View>
  );
};