import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    useFonts,
} from '@expo-google-fonts/inter';
import React from 'react';
import { ActivityIndicator, Text as RNText, View } from 'react-native';

export function FontProvider({ children }: { children: React.ReactNode }) {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  // Set default font for all <Text/> components (avoid TS defaultProps usage)
  try {
    // @ts-expect-error runtime patch for RN web compat
    if (!RNText.defaultProps) RNText.defaultProps = {};
    // @ts-expect-error runtime patch for RN web compat
    RNText.defaultProps.style = [RNText.defaultProps.style, { fontFamily: 'Inter_500Medium' }];
  } catch {}

  return <>{children}</>;
}

