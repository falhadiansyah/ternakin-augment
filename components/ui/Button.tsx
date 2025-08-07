import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ButtonProps } from '@/types/app';

export default function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  disabled = false, 
  loading = false 
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getButtonStyle = () => {
    const baseStyle = [styles.button];
    
    if (disabled || loading) {
      baseStyle.push({ opacity: 0.6 });
    }

    switch (variant) {
      case 'primary':
        baseStyle.push({ backgroundColor: colors.primary });
        break;
      case 'secondary':
        baseStyle.push({ 
          backgroundColor: colors.secondary, 
          borderWidth: 1, 
          borderColor: colors.border 
        });
        break;
      case 'danger':
        baseStyle.push({ backgroundColor: colors.error });
        break;
      default:
        baseStyle.push({ backgroundColor: colors.primary });
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text];
    
    switch (variant) {
      case 'primary':
        baseStyle.push({ color: 'white' });
        break;
      case 'secondary':
        baseStyle.push({ color: colors.text });
        break;
      case 'danger':
        baseStyle.push({ color: 'white' });
        break;
      default:
        baseStyle.push({ color: 'white' });
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'secondary' ? colors.primary : 'white'} 
          size="small" 
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
