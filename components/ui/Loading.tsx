import { useTheme } from '@/components/ThemeProvider';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface LoadingProps {
  message?: string;
}

export default function Loading({ message = 'Loading...' }: LoadingProps) {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    marginTop: 16,
    fontSize: 16,
  },
});
