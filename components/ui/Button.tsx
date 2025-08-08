import { useTheme } from '@/components/ThemeProvider';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
}

export default function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  disabled = false,
  loading = false 
}: ButtonProps) {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];

  const getButtonStyle = () => {
    if (disabled) {
      return [styles.button, { backgroundColor: colors.border }];
    }

    switch (variant) {
      case 'secondary':
        return [styles.button, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }];
      case 'danger':
        return [styles.button, { backgroundColor: '#dc2626' }];
      default:
        return [styles.button, { backgroundColor: colors.primary }];
    }
  };

  const getTextStyle = () => {
    if (disabled) {
      return [styles.text, { color: colors.icon }];
    }

    switch (variant) {
      case 'secondary':
        return [styles.text, { color: colors.text }];
      default:
        return [styles.text, { color: 'white' }];
    }
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
