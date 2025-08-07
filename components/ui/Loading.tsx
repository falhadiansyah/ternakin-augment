import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
  overlay?: boolean;
}

export default function Loading({ 
  message = 'Loading...', 
  size = 'large', 
  overlay = false 
}: LoadingProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const containerStyle = overlay 
    ? [styles.overlay, { backgroundColor: colors.background + '80' }]
    : styles.container;

  return (
    <View style={containerStyle}>
      <ActivityIndicator size={size} color={colors.primary} />
      {message && (
        <Text style={[styles.message, { color: colors.text }]}>
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
});
