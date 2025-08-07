import { useAuthContext } from '@/components/AuthProvider';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuthContext();

  const handleProfilePress = () => {
    router.push('/profile/index');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.title, { color: colors.text }]}>
              Livestock Dashboard
            </Text>
            <Text style={[styles.subtitle, { color: colors.icon }]}>
              Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.profileButton, { backgroundColor: colors.primary }]}
            onPress={handleProfilePress}
          >
            <Ionicons name="person" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Key Metrics
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.icon }]}>
              Total livestock, expenses, income, and profit
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Income vs Expenses
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.icon }]}>
              Chart comparing income and expenses over time
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Recent Activity
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.icon }]}>
              Latest livestock transactions and activities
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 10,
  },
  headerLeft: {
    flex: 1,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  content: {
    padding: 20,
    paddingTop: 10,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
  },
});
