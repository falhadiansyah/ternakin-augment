import { Header } from '@/components/Header';
import { useTheme } from '@/components/ThemeProvider';
import { Colors } from '@/constants/Colors';
import { Radii, Shadows, Spacing } from '@/constants/Design';
import { Typography } from '@/constants/Typography';
import { createBatch, getBatchById, updateBatch } from '@/lib/data';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { showToast } from '@/utils/toast';


const animals = ['chicken'] as const; //,'duck','bird','rabbit','fish','sheep','cattle','cow'
const breeds = ['kub_2','broiler','layer'] as const;

export default function BatchFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const shadow = Shadows(isDark);

  const [name, setName] = useState('');
  const [entryDate, setEntryDate] = useState<Date>(new Date());
  const [showDate, setShowDate] = useState(false);
  const [animal, setAnimal] = useState<typeof animals[number]>('chicken');
  const [breed, setBreed] = useState<typeof breeds[number]>('kub_2');
  const [startingCount, setStartingCount] = useState<string>('');
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string,string>>({});

  useEffect(() => {
    (async () => {
      if (!isEdit) return;
      const { data, error } = await getBatchById(id!);
      if (error) { Alert.alert('Error', error.message); return; }
      if (data) {
        setName(data.name);
        setEntryDate(data.entry_date ? new Date(data.entry_date) : new Date());
        setAnimal((data.animal as any) || 'chicken');
        setBreed((data.breed as any) || 'kub_2');
        setStartingCount((data.starting_count ?? '').toString());
        setSource(data.source ?? '');
      }
    })();
  }, [id, isEdit]);

  const validate = () => {
    const e: Record<string,string> = {};
    if (!name.trim()) e.name = 'Nama wajib diisi / Name is required';
    const sc = Number(startingCount);
    if (!startingCount || isNaN(sc) || sc < 1) e.startingCount = 'Jumlah awal minimal 1 / Starting count >= 1';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      const payload = {
        name: name.trim(),
        entry_date: entryDate.toISOString().slice(0,10),
        starting_count: Number(startingCount),
        source: source.trim() || null,
        animal,
        breed,
      };
      if (isEdit) {
        const { error } = await updateBatch(id!, payload as any);
        if (error) throw error;
      } else {
        const { error } = await createBatch(payload);
        if (error) throw error;
      }
      showToast('Batch saved', 'success');
      router.back();
    } catch (e: any) {
      showToast(e?.message || 'Failed to save batch', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openDate = () => setShowDate(true);
  const onChangeDate = (_: any, date?: Date) => {
    setShowDate(false); // always close on Android
    if (date) setEntryDate(date);
  };

  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top','bottom']}>
        <Header title={isEdit ? 'Edit Batch' : 'Add Batch'} showBackButton onBackPress={() => router.back()} />
        <ScrollView contentContainerStyle={{ padding: Spacing.md, paddingBottom: Spacing.xl + insets.bottom }}>
          <LabeledInput label="Name" error={errors.name}>
            <TextInput value={name} onChangeText={setName} placeholder="Batch name" placeholderTextColor={colors.icon}
              style={[styles.input, { borderColor: colors.border, color: colors.text }]} />
          </LabeledInput>

          <LabeledInput label="Entry Date">
            <TouchableOpacity onPress={openDate} style={[styles.input, { borderColor: colors.border, justifyContent:'center' }]}>
              <Text style={{ color: colors.text }}>{entryDate.toISOString().slice(0,10)}</Text>
            </TouchableOpacity>
            {showDate && (
              <DateTimePicker value={entryDate} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onChangeDate} />
            )}
          </LabeledInput>

          <LabeledInput label="Animal">
            <Picker value={animal} options={animals} onChange={setAnimal} />
          </LabeledInput>

          <LabeledInput label="Breed">
            <Picker value={breed} options={breeds} onChange={setBreed} />
          </LabeledInput>

          <LabeledInput label="Starting Count" error={errors.startingCount}>
            <TextInput value={startingCount} onChangeText={setStartingCount} keyboardType="numeric" placeholder="1" placeholderTextColor={colors.icon}
              style={[styles.input, { borderColor: colors.border, color: colors.text }]} />
          </LabeledInput>

          <LabeledInput label="Source (optional)">
            <TextInput value={source} onChangeText={setSource} placeholder="Supplier" placeholderTextColor={colors.icon}
              style={[styles.input, { borderColor: colors.border, color: colors.text }]} />
          </LabeledInput>

          <View style={{ flexDirection:'row', justifyContent:'flex-end', gap: 8, marginTop: Spacing.md }}>
            <TouchableOpacity onPress={() => router.back()} style={[styles.btn, { backgroundColor: colors.secondary }]}>
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity disabled={loading} onPress={submit} style={[styles.btn, { backgroundColor: colors.primary }]}>
              {loading ? <Ionicons name="hourglass" color="#fff" size={16} /> : <Ionicons name="save" color="#fff" size={16} />}
              <Text style={styles.btnText}>{isEdit ? 'Save' : 'Add'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

function LabeledInput({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];
  return (
    <View style={{ marginBottom: Spacing.sm }}>
      <Text style={{ color: colors.text, fontWeight: Typography.weight.medium, marginBottom: 6 }}>{label}</Text>
      {children}
      {!!error && <Text style={{ color: colors.error, marginTop: 4 }}>{error}</Text>}
    </View>
  );
}

function Picker<T extends string>({ value, options, onChange }: { value: T; options: readonly T[]; onChange: (v: T) => void }) {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];
  return (
    <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: Radii.sm, paddingHorizontal: 8 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8 }}>
        {options.map(opt => (
          <TouchableOpacity key={opt} onPress={() => onChange(opt)} style={{ paddingHorizontal: 10, paddingVertical: 6, backgroundColor: opt===value? colors.primary: 'transparent', borderRadius: Radii.pill, marginRight: 6, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: opt===value ? '#fff' : colors.text }}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  input: { borderWidth: 1, borderRadius: Radii.sm, paddingHorizontal: Spacing.sm, paddingVertical: 10 },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: Radii.sm },
  btnText: { color: '#fff', fontWeight: Typography.weight.bold, marginLeft: 6 },
});

