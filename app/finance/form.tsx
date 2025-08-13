import { Header } from '@/components/Header';
import { useTheme } from '@/components/ThemeProvider';
import { Colors } from '@/constants/Colors';
import { Radii, Spacing } from '@/constants/Design';
import { Typography } from '@/constants/Typography';
import { createTransaction, getTransactionById, listBatches, updateTransaction, type BatchRow } from '@/lib/data';
import { showToast } from '@/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';



export default function FinanceFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];

  const [isCredit, setIsCredit] = useState(true);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [showDate, setShowDate] = useState(false);
  const [type, setType] = useState<'income' | 'expenses'>('income');
  const [notes, setNotes] = useState('');
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string,string>>({});

  useEffect(() => {
    (async () => {
      const { data } = await listBatches();
      setBatches(data || []);
      if (isEdit) {
        const { data: tx, error } = await getTransactionById(id!);
        if (error) { Alert.alert('Error', error.message); return; }
        if (tx) {
          const credit = (tx.credit || 0) > 0;
          setIsCredit(credit);
          setAmount(String(credit ? tx.credit : tx.debit || ''));
          setDate(tx.transaction_date ? new Date(tx.transaction_date) : new Date());
          setType((tx.debit || 0) > 0 ? 'income' : 'expenses');
          setNotes(tx.notes || '');
          setBatchId(tx.batches_id || null);
        }
      }
    })();
  }, [id, isEdit]);

  const validate = () => {
    const e: Record<string,string> = {};
    const amt = Number(amount);
    if (isNaN(amt) || amt < 0.01) e.amount = 'Minimal 0.01';
    if (!notes.trim()) e.notes = 'Notes are required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      const payload = {
        debit: isCredit ? 0 : Number(amount),
        credit: isCredit ? Number(amount) : 0,
        transaction_date: date.toISOString().slice(0,10),
        type: type,
        notes: notes.trim() || null,
        batches_id: batchId || null,
      };
      if (isEdit) {
        const { error } = await updateTransaction(id!, payload);
        if (error) throw error;
        showToast('Transaction updated successfully', 'success');
      } else {
        const { error } = await createTransaction(payload);
        if (error) throw error;
        showToast('Transaction created successfully', 'success');
      }
      router.back();
    } catch (e: any) {
      showToast(e?.message || 'Failed to save transaction', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openDate = () => setShowDate(true);
  const onChangeDate = (_: any, d?: Date) => { setShowDate(false); if (d) setDate(d); };

  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top','bottom']}>
        <Header title={isEdit ? 'Edit Transaction' : 'Add Transaction'} showBackButton onBackPress={() => router.back()} />
        <ScrollView contentContainerStyle={{ padding: Spacing.md, paddingBottom: Spacing.xl + insets.bottom }}>
          <LabeledInput label="Type">
            <View style={{ flexDirection:'row', gap: 8 }}>
              <Chip label="Income" selected={!isCredit} onPress={() => setIsCredit(false)} />
              <Chip label="Expenses" selected={isCredit} onPress={() => setIsCredit(true)} />
            </View>
          </LabeledInput>

          <LabeledInput label="Amount" error={errors.amount}>
            <TextInput value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.icon}
              style={[styles.input, { borderColor: colors.border, color: colors.text }]} />
          </LabeledInput>

          <LabeledInput label="Transaction Date">
            <TouchableOpacity onPress={openDate} style={[styles.input, { borderColor: colors.border, justifyContent:'center' }]}>
              <Text style={{ color: colors.text }}>{date.toISOString().slice(0,10)}</Text>
            </TouchableOpacity>
            {showDate && (
              <DateTimePicker value={date} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onChangeDate} />
            )}
          </LabeledInput>

          <LabeledInput label="Notes" error={errors.notes}>
            <TextInput value={notes} onChangeText={setNotes} placeholder="Transaction description" placeholderTextColor={colors.icon}
              style={[styles.input, { borderColor: colors.border, color: colors.text }]} />
          </LabeledInput>

          <LabeledInput label="Batch (optional)">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8 }}>
              {batches.map(b => (
                <TouchableOpacity key={b.id} onPress={() => setBatchId(b.id)} style={{ paddingHorizontal: 10, paddingVertical: 6, backgroundColor: batchId===b.id? colors.primary: 'transparent', borderRadius: Radii.pill, marginRight: 6, borderWidth: 1, borderColor: colors.border }}>
                  <Text style={{ color: batchId===b.id ? '#fff' : colors.text }}>{b.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </LabeledInput>

          <View style={{ flexDirection:'row', justifyContent:'flex-end', gap: 8, marginTop: Spacing.md }}>
            <TouchableOpacity onPress={() => router.back()} style={[styles.btn, { backgroundColor: colors.secondary }]}>
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity disabled={loading} onPress={submit} style={[styles.btn, { backgroundColor: colors.primary }]}>
              <Ionicons name="save" color="#fff" size={16} />
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

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];
  return (
    <TouchableOpacity onPress={onPress} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radii.pill, backgroundColor: selected? colors.primary: 'transparent', borderWidth: 1, borderColor: colors.border }}>
      <Text style={{ color: selected? '#fff': colors.text }}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  input: { borderWidth: 1, borderRadius: Radii.sm, paddingHorizontal: Spacing.sm, paddingVertical: 10 },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: Radii.sm },
  btnText: { color: '#fff', fontWeight: Typography.weight.bold, marginLeft: 6 },
});

