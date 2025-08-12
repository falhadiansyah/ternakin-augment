import { AuthProvider } from "@/components/AuthProvider";

import { FontProvider } from "@/components/FontProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <FontProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <SafeAreaProvider>
              <StatusBar style="auto" />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="auth/login" options={{ presentation: "modal" }} />
                <Stack.Screen name="farm/select" options={{ presentation: "modal" }} />
                <Stack.Screen name="batch/form" options={{ presentation: "modal" }} />
                <Stack.Screen name="recipe/form" options={{ presentation: "modal" }} />
                <Stack.Screen name="finance/form" options={{ presentation: "modal" }} />
                <Stack.Screen name="profile/index" options={{ presentation: "modal" }} />
                <Stack.Screen name="profile/farm-details" options={{ presentation: "modal" }} />
              </Stack>
            </SafeAreaProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </FontProvider>
  );
}
