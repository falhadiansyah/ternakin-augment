import { supabase } from './supabase';

export async function createFarmAndAssignCurrentUser(farm: { name: string; address?: string | null; phone?: string | null; email?: string | null; }) {
  const { data: dup, error: de } = await supabase.from('farms').select('id').eq('name', farm.name).limit(1);
  if (de) throw de;
  if ((dup || []).length > 0) throw new Error('Farm name already in use');

  const { data: newFarm, error } = await supabase.from('farms').insert({
    name: farm.name.trim(), address: farm.address ?? null, phone: farm.phone ?? null, email: farm.email ?? null,
  }).select('*').single();
  if (error) throw error;

  const { data: userRes } = await supabase.auth.getUser();
  const uid = userRes.user?.id;
  if (!uid) throw new Error('No user');
  const { error: pe } = await supabase.from('profiles').update({ farm_id: newFarm.id }).eq('user_id', uid);
  if (pe) throw pe;
  return newFarm;
}

export async function assignCurrentUserToFarmById(farmId: string) {
  const { data: farm, error } = await supabase.from('farms').select('id').eq('id', farmId).single();
  if (error) throw error;
  const { data: userRes } = await supabase.auth.getUser();
  const uid = userRes.user?.id;
  if (!uid) throw new Error('No user');
  const { error: pe } = await supabase.from('profiles').update({ farm_id: farm.id }).eq('user_id', uid);
  if (pe) throw pe;
  return farm;
}

