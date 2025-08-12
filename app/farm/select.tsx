import { useAuthContext } from '@/components/AuthProvider';
import { Header } from '@/components/Header';
import { useTheme } from '@/components/ThemeProvider';
import { Colors } from '@/constants/Colors';
import { Radii, Shadows, Spacing } from '@/constants/Design';
import { Typography } from '@/constants/Typography';
import { getMyProfile } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FarmSelectScreen() {
  const { isAuthenticated } = useAuthContext();
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const shadow = Shadows(isDark);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profileFarmId, setProfileFarmId] = useState<string | null>(null);

  const [newFarm, setNewFarm] = useState({ name: '', address: '', phone: '' });
  const [existingFarmId, setExistingFarmId] = useState('');
  const validNewFarm = useMemo(() => newFarm.name.trim().length > 0, [newFarm]);

  useEffect(() => {
    (async () => {
      const { profile } = await getMyProfile();
      setProfileFarmId(profile?.farm_id ?? null);
      setLoading(false);
    })();
  }, []);

  if (!isAuthenticated) return <Redirect href="/auth/login" />;
  if (loading) return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Select Farm" />
      <View style={{ padding: Spacing.md }}><Text style={{ color: colors.icon }}>Loading...</Text></View>
    </SafeAreaView>
  );
  if (profileFarmId) return <Redirect href="/(tabs)/dashboard" />;

  async function createFarm() {
    if (!validNewFarm) return;
    try {
      // Get current user's email
      const { data: userRes } = await supabase.auth.getUser();
      const userEmail = userRes.user?.email;
      
      // RPC handles insert + assignment with proper auth context
      const { data: farm, error } = await supabase.rpc('create_farm_and_assign', {
        p_name: newFarm.name.trim(),
        p_address: newFarm.address.trim() || null,
        p_phone: newFarm.phone.trim() || null,
        p_email: userEmail || null, // Auto-populate with current user's email
      });
      if (error) throw error;
      router.replace('/(tabs)/dashboard');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to create farm');
    }
  }

  async function joinFarm() {
    try {
      if (!existingFarmId) return;
      const { data: farm, error } = await supabase.from('farms').select('*').eq('id', existingFarmId).single();
      if (error) throw error;
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      if (!uid) throw new Error('No user');
      const { error: pe } = await supabase.from('profiles').update({ farm_id: farm.id }).eq('user_id', uid);
      if (pe) throw pe;
      router.replace('/(tabs)/dashboard');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to join farm');
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Select Farm" />
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: Spacing.xl }}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Create New Farm</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, shadow]}>
            <TextInput placeholder="Farm Name" placeholderTextColor={colors.icon} value={newFarm.name}
              onChangeText={(text) => setNewFarm({ ...newFarm, name: text })}
              style={[styles.input, { borderColor: colors.border, color: colors.text }]} />
            <TextInput placeholder="Address" placeholderTextColor={colors.icon} value={newFarm.address}
              onChangeText={(text) => setNewFarm({ ...newFarm, address: text })}
              style={[styles.input, { borderColor: colors.border, color: colors.text }]} />
            <TextInput placeholder="Phone" placeholderTextColor={colors.icon} value={newFarm.phone}
              onChangeText={(text) => setNewFarm({ ...newFarm, phone: text })}
              style={[styles.input, { borderColor: colors.border, color: colors.text }]} />
            <TouchableOpacity disabled={!validNewFarm} onPress={createFarm}
              style={[styles.btn, { backgroundColor: validNewFarm ? colors.primary : colors.secondary }]}>
              <Ionicons name="checkmark" color="#fff" size={16} />
              <Text style={styles.btnText}>Create Farm</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Join Existing Farm</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, shadow]}>
            <TextInput placeholder="Farm ID" placeholderTextColor={colors.icon}
              value={existingFarmId}
              onChangeText={setExistingFarmId}
              style={[styles.input, { borderColor: colors.border, color: colors.text }]} />
            <TouchableOpacity disabled={!existingFarmId} onPress={joinFarm}
              style={[styles.btn, { backgroundColor: existingFarmId ? colors.primary : colors.secondary }]}>
              <Ionicons name="arrow-forward" color="#fff" size={16} />
              <Text style={styles.btnText}>Join Farm</Text>
            </TouchableOpacity>
            <Text style={{ color: colors.icon, marginTop: 6 }}>Tip: Owners can share Farm ID or a QR code.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  section: { padding: Spacing.md },
  sectionTitle: { fontSize: Typography.title, fontWeight: Typography.weight.bold, marginBottom: Spacing.xs },
  card: { borderWidth: 1, borderRadius: Radii.md, padding: Spacing.md },
  input: { borderWidth: 1, borderRadius: Radii.sm, paddingHorizontal: Spacing.sm, paddingVertical: 10, marginBottom: Spacing.xs },
  btn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs as any, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: Radii.sm, alignSelf: 'flex-start' },
  btnText: { color: '#fff', fontWeight: Typography.weight.bold, marginLeft: 6 },
});

