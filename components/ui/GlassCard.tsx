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
  const baseClasses = 'bg-white/25 border-2 border-white/40 rounded-2xl shadow-xl';
  
  const variantClasses = {
    default: 'p-6',
    large: 'p-8',
    small: 'p-4'
  };

  // Fallback styles in case NativeWind isn't working
  const fallbackStyles = StyleSheet.create({
    glass: {
      backgroundColor: 'rgba(255, 255, 255, 0.25)', // Less transparent
      borderRadius: 16, // Slightly smaller radius
      borderWidth: 1.5, // Thicker border
      borderColor: 'rgba(255, 255, 255, 0.4)', // More visible border
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15, // Stronger shadow
      shadowRadius: 24,
      elevation: 12, // Higher elevation on Android
      // Add subtle backdrop blur effect simulation
      backdropFilter: 'blur(20px)',
    },
    default: { padding: 20 },
    large: { padding: 28 },
    small: { padding: 14 },
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