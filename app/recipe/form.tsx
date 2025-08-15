import { Header } from '@/components/Header';
import { useTheme } from '@/components/ThemeProvider';
import { Colors } from '@/constants/Colors';
import { Radii, Spacing } from '@/constants/Design';
import { Typography } from '@/constants/Typography';
import { useCurrency } from '@/hooks/useCurrency';
import { canAddRecipe, createRecipe, getRecipeById, getRecipeItems, replaceRecipeItems, updateRecipe } from '@/lib/data';
import { formatIDR } from '@/utils/currency';
import { showToast } from '@/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const types = ['custom_mix','commercial'] as const;
const usedFor = ['starter','grower','finisher'] as const;

export default function RecipeFormScreen() {
  // subscribe to currency changes for re-render
  useCurrency();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];

  const [name, setName] = useState('');
  const [type, setType] = useState<typeof types[number]>('custom_mix');
  const [used, setUsed] = useState<typeof usedFor[number]>('grower');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<Array<{ name: string; percentages: string; price_kg: string }>>([{ name: '', percentages: '', price_kg: '' }]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string,string>>({});


  const [dbTotalPriceKg, setDbTotalPriceKg] = useState<number | null>(null);
  const liveTotalPriceKg = useMemo(() => {
    if (!items || items.length === 0) return null;
    const allValid = items.every(it => isFinite(Number(it.percentages)) && isFinite(Number(it.price_kg)));
    if (!allValid) return null;
    const total = items.reduce((sum, it) => sum + ((Number(it.percentages) || 0) / 100) * (Number(it.price_kg) || 0), 0);
    return Number(total.toFixed(4));
  }, [items]);

  useEffect(() => {
    (async () => {
      if (!isEdit) return;
      const { data, error } = await getRecipeById(id!);
      if (error) { Alert.alert('Error', error.message); return; }
      if (data) {
        setName(data.name);
        setType((data.type as any) || 'custom_mix');
        setUsed((data.used_for as any) || 'grower');
        setDescription(data.description ?? '');
        setDbTotalPriceKg(data.total_price_kg ?? null);
        const { data: itemRows } = await getRecipeItems(id!);
        setItems((itemRows || []).map(r => ({ name: r.name, percentages: String(r.percentages ?? ''), price_kg: String(r.price_kg ?? '') })));
      }
    })();
  }, [id, isEdit]);

  const totalPercent = useMemo(() => items.reduce((acc, it) => acc + (Number(it.percentages)||0), 0), [items]);

  const validate = () => {
    const e: Record<string,string> = {};
    if (!name.trim()) e.name = 'Nama wajib / Name is required';
    if (!type) e.type = 'Tipe wajib / Type is required';
    if (!used) e.used = 'Digunakan untuk wajib / Used For is required';
    if (items.length === 0) e.items = 'Minimal 1 item';
    items.forEach((it, idx) => {
      if (!it.name.trim()) e[`item_${idx}_name`] = 'Nama item wajib';
      const p = Number(it.percentages);
      if (isNaN(p) || p < 0 || p > 100) e[`item_${idx}_percent`] = 'Persentase 0-100';
      const pr = Number(it.price_kg);
      if (isNaN(pr) || pr <= 0) e[`item_${idx}_price`] = 'Harga/kg > 0';
    });
    if (totalPercent !== 100) e.total = 'Total persentase harus 100%';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;

    // Check subscription limit for new recipes
    if (!isEdit) {
      const subscriptionCheck = await canAddRecipe();
      if (!subscriptionCheck.canAdd) {
        showToast(`Cannot add more recipes. Upgrade to Pro plan for unlimited recipes.`, 'error');
        return;
      }
    }

    try {
      setLoading(true);
      if (isEdit) {
        const { error } = await updateRecipe(id!, { name: name.trim(), type, used_for: used, description: description.trim() || null });
        if (error) throw error;
        const { error: ie } = await replaceRecipeItems(id!, items.map(it => ({ name: it.name.trim(), percentages: Number(it.percentages), price_kg: Number(it.price_kg) })));
        if (ie) throw ie;
      } else {
        const { data, error } = await createRecipe({ name: name.trim(), type, used_for: used, description: description.trim() || null });
        if (error) throw error;
        // if created, insert items
        if (data) {
          const { error: ie } = await replaceRecipeItems(data.id, items.map(it => ({ name: it.name.trim(), percentages: Number(it.percentages), price_kg: Number(it.price_kg) })));
          if (ie) throw ie;
        }
      }
      showToast('Recipe saved', 'success');
      router.back();
    } catch (e: any) {
      showToast(e?.message || 'Failed to save recipe', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => setItems(prev => [...prev, { name: '', percentages: '', price_kg: '' }]);
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top','bottom']}>
        <Header title={isEdit ? 'Edit Recipe' : 'Add Recipe'} showBackButton onBackPress={() => router.back()} />
        <ScrollView contentContainerStyle={{ padding: Spacing.md, paddingBottom: Spacing.xl + insets.bottom }}>
          <LabeledInput label="Name" error={errors.name}>
            <TextInput value={name} onChangeText={setName} placeholder="Recipe name" placeholderTextColor={colors.icon}
              style={[styles.input, { borderColor: colors.border, color: colors.text }]} />
          </LabeledInput>


          {/* Live summary for total price per kg */}
          <View style={[styles.card, { borderColor: colors.border }]}>
            <Text style={{ color: colors.text, fontWeight: Typography.weight.bold, marginBottom: 4 }}>Summary</Text>
            {isEdit && dbTotalPriceKg != null && (
              <Text style={{ color: colors.icon, marginBottom: 2 }}>Saved price: {`${formatIDR(Number(dbTotalPriceKg))} / kg`}</Text>
            )}
            <Text style={{ color: colors.icon }}>Estimated price: {liveTotalPriceKg != null ? `${formatIDR(Number(liveTotalPriceKg))} / kg` : '-'}</Text>
          </View>

          <LabeledInput label="Type" error={errors.type}>
            <Picker value={type} options={types} onChange={setType} />
          </LabeledInput>

          <LabeledInput label="Used For" error={errors.used}>
            <Picker value={used} options={usedFor} onChange={setUsed} />
          </LabeledInput>

          <LabeledInput label="Description">
            <TextInput value={description} onChangeText={setDescription} placeholder="Description" placeholderTextColor={colors.icon}
              style={[styles.input, { borderColor: colors.border, color: colors.text, minHeight: 80 }]} multiline />
          </LabeledInput>

          <Text style={{ color: colors.text, fontWeight: 'bold', marginTop: Spacing.md, marginBottom: 6 }}>Recipe Items</Text>
          {!!errors.items && <Text style={{ color: colors.error, marginBottom: 6 }}>{errors.items}</Text>}
          {items.map((it, idx) => (
            <View key={idx} style={[styles.card, { borderColor: colors.border }]}>
              <LabeledInput label={`Item Name #${idx+1}`} error={errors[`item_${idx}_name`]}>
                <TextInput value={it.name} onChangeText={t => setItems(p => p.map((x,i)=> i===idx?{...x,name:t}:x))} placeholder="Item name" placeholderTextColor={colors.icon}
                  style={[styles.input, { borderColor: colors.border, color: colors.text }]} />
              </LabeledInput>
              <LabeledInput label="Percentage" error={errors[`item_${idx}_percent`]}>
                <TextInput value={it.percentages} onChangeText={t => setItems(p => p.map((x,i)=> i===idx?{...x,percentages:t}:x))} keyboardType="numeric" placeholder="0-100" placeholderTextColor={colors.icon}
                  style={[styles.input, { borderColor: colors.border, color: colors.text }]} />
              </LabeledInput>
              <LabeledInput label="Price / kg" error={errors[`item_${idx}_price`]}>
                <TextInput value={it.price_kg} onChangeText={t => setItems(p => p.map((x,i)=> i===idx?{...x,price_kg:t}:x))} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.icon}
                  style={[styles.input, { borderColor: colors.border, color: colors.text }]} />
              </LabeledInput>
              <View style={{ alignItems: 'flex-end' }}>
                <TouchableOpacity onPress={() => removeItem(idx)} style={[styles.smallBtn, { backgroundColor: '#ef4444' }]}>
                  <Ionicons name="trash" color="#fff" size={14} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <TouchableOpacity onPress={addItem} style={[styles.btn, { backgroundColor: colors.primary }]}>
            <Ionicons name="add" color="#fff" size={16} />
            <Text style={styles.btnText}>Add Item</Text>
          </TouchableOpacity>
          <Text style={{ color: totalPercent===100? colors.success: colors.error }}>Total: {totalPercent}% (harus 100%)</Text>

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

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { borderWidth: 1, borderRadius: Radii.md, padding: Spacing.sm, marginBottom: Spacing.xs },
  input: { borderWidth: 1, borderRadius: Radii.sm, paddingHorizontal: Spacing.sm, paddingVertical: 10 },
  smallBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radii.sm },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: Radii.sm },
  btnText: { color: '#fff', fontWeight: Typography.weight.bold, marginLeft: 6 },
});

