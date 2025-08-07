import AuthGuard from '@/components/AuthGuard';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].background,
            borderTopColor: Colors[colorScheme ?? 'light'].tabIconDefault,
            borderTopWidth: 1,
          },
        }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
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
          title: 'Livestock',
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
          title: 'Feeding',
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
          title: 'Financial',
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
