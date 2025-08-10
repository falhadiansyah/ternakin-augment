import AuthGuard from '@/components/AuthGuard';
import FarmGuard from '@/components/FarmGuard';
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
      {/* FarmGuard ensures users without farm_id cannot enter tabs */}
      <FarmGuard>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: colors.tint,
            tabBarInactiveTintColor: colors.tabIconDefault,
            headerShown: false,
            tabBarStyle: {
              backgroundColor: colors.card,
              borderTopColor: colors.border,
              borderTopWidth: 1,
              height: 60,
            },
            tabBarLabelStyle: {
              fontSize: 11,
            },
          }}>
          <Tabs.Screen
            name="dashboard"
            options={{
              title: t('nav.dashboard'),
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? 'analytics' : 'analytics-outline'} size={22} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="livestock"
            options={{
              title: t('nav.livestock'),
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? 'paw' : 'paw-outline'} size={22} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="feeding"
            options={{
              title: t('nav.feeding'),
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? 'nutrition' : 'nutrition-outline'} size={22} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="financial"
            options={{
              title: t('nav.financial'),
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? 'wallet' : 'wallet-outline'} size={22} color={color} />
              ),
            }}
          />
        </Tabs>
      </FarmGuard>
    </AuthGuard>
  );
}
