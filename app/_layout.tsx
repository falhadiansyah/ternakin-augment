import { AuthProvider } from "@/components/AuthProvider";

import { FontProvider } from "@/components/FontProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <FontProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="auth/login" options={{ presentation: "modal" }} />
              <Stack.Screen name="farm/select" options={{ presentation: "modal" }} />
              <Stack.Screen name="profile/index" options={{ presentation: "modal" }} />
              <Stack.Screen name="profile/farm-details" options={{ presentation: "modal" }} />
            </Stack>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </FontProvider>
  );
}
