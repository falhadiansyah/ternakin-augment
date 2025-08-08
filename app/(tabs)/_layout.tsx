import AuthGuard from '@/components/AuthGuard';
import { useLanguage } from '@/components/LanguageProvider';
import { useTheme } from '@/components/ThemeProvider';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const colors = Colors[isDark ? 'dark' : 'light'];

  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.tint,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopColor: colors.tabIconDefault,
            borderTopWidth: 1,
          },
        }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t('nav.dashboard'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'analytics' : 'analytics-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="livestock"
        options={{
          title: t('nav.livestock'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'paw' : 'paw-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="feeding"
        options={{
          title: t('nav.feeding'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'nutrition' : 'nutrition-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="financial"
        options={{
          title: t('nav.financial'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'wallet' : 'wallet-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      </Tabs>
    </AuthGuard>
  );
}
