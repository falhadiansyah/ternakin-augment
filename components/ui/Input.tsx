import { useTheme } from '@/components/ThemeProvider';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address';
}

export default function Input({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  error, 
  multiline = false,
  keyboardType = 'default'
}: InputProps) {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          { 
            backgroundColor: colors.card,
            borderColor: error ? '#dc2626' : colors.border,
            color: colors.text,
          }
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.icon}
        multiline={multiline}
        keyboardType={keyboardType}
      />
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 48,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginTop: 4,
  },
});
