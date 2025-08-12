import { useAuthContext } from '@/components/AuthProvider';
import { useTheme } from '@/components/ThemeProvider';
import { Colors } from '@/constants/Colors';
import { Shadows } from '@/constants/Design';
import { getCurrentFarmId } from '@/lib/data';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FarmData {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export default function FarmDetailsScreen() {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const shadow = Shadows(isDark);
  const { user } = useAuthContext();

  const [farmData, setFarmData] = useState<FarmData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFarmData();
  }, []);

  const loadFarmData = async () => {
    try {
      setLoading(true);
      const { farmId, error: fe } = await getCurrentFarmId();
      if (fe) throw fe;
      if (!farmId) throw new Error('No farm assigned to your profile');

      // Import supabase to fetch farm data
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .eq('id', farmId)
        .single();

      if (error) throw error;
      setFarmData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Farm Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.icon }]}>Loading farm details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Farm Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color={colors.error} />
            <Text style={[styles.errorTitle, { color: colors.text }]}>Error Loading Farm</Text>
            <Text style={[styles.errorMessage, { color: colors.icon }]}>{error}</Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={loadFarmData}
            >
              <Text style={[styles.retryButtonText, { color: '#fff' }]}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : farmData ? (
          <>
            {/* Farm Header Card */}
            <View style={[styles.headerCard, { backgroundColor: colors.primary }, shadow]}>
              <View style={styles.farmIcon}>
                <Ionicons name="business" size={32} color="#fff" />
              </View>
              <Text style={[styles.farmName, { color: '#fff' }]}>{farmData.name}</Text>
              <Text style={[styles.farmSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>
                Farm Management System
              </Text>
            </View>

            {/* Farm Information */}
            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }, shadow]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Farm Information</Text>
              
              <View style={styles.infoRow}>
                <View style={[styles.infoIcon, { backgroundColor: colors.secondary }]}>
                  <Ionicons name="business" size={16} color={colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.icon }]}>Farm Name</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{farmData.name}</Text>
                </View>
              </View>

              {farmData.address && (
                <View style={styles.infoRow}>
                  <View style={[styles.infoIcon, { backgroundColor: colors.secondary }]}>
                    <Ionicons name="location" size={16} color={colors.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: colors.icon }]}>Address</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>{farmData.address}</Text>
                  </View>
                </View>
              )}

              {farmData.phone && (
                <View style={styles.infoRow}>
                  <View style={[styles.infoIcon, { backgroundColor: colors.secondary }]}>
                    <Ionicons name="call" size={16} color={colors.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: colors.icon }]}>Phone</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>{farmData.phone}</Text>
                  </View>
                </View>
              )}

              {farmData.email && (
                <View style={styles.infoRow}>
                  <View style={[styles.infoIcon, { backgroundColor: colors.secondary }]}>
                    <Ionicons name="mail" size={16} color={colors.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: colors.icon }]}>Email</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>{farmData.email}</Text>
                  </View>
                </View>
              )}

              {farmData.description && (
                <View style={styles.infoRow}>
                  <View style={[styles.infoIcon, { backgroundColor: colors.secondary }]}>
                    <Ionicons name="document-text" size={16} color={colors.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: colors.icon }]}>Description</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>{farmData.description}</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Farm Statistics */}
            <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }, shadow]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Farm Statistics</Text>
              
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: colors.success }]}>
                    <Ionicons name="calendar" size={20} color="#fff" />
                  </View>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {formatDate(farmData.created_at)}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.icon }]}>Created</Text>
                </View>
                
                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: colors.primary }]}>
                    <Ionicons name="refresh" size={20} color="#fff" />
                  </View>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {formatDate(farmData.updated_at)}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.icon }]}>Last Updated</Text>
                </View>
              </View>
            </View>

            {/* Actions */}
            <View style={[styles.actionsCard, { backgroundColor: colors.card, borderColor: colors.border }, shadow]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Actions</Text>
              
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <Ionicons name="create" size={20} color={colors.primary} />
                <Text style={[styles.actionButtonText, { color: colors.text }]}>Edit Farm Details</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.icon} />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <Ionicons name="settings" size={20} color={colors.primary} />
                <Text style={[styles.actionButtonText, { color: colors.text }]}>Farm Settings</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.icon} />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <Ionicons name="people" size={20} color={colors.primary} />
                <Text style={[styles.actionButtonText, { color: colors.text }]}>Manage Team</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.icon} />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="business-outline" size={64} color={colors.icon} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Farm Data</Text>
            <Text style={[styles.emptyMessage, { color: colors.icon }]}>
              Farm details could not be loaded. Please try again.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  farmIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  farmName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  farmSubtitle: {
    fontSize: 14,
  },
  infoCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  statsCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  actionsCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
  },
});
