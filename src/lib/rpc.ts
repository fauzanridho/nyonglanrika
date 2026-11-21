import { createClient } from './supabase/client';

const supabase = createClient();

/**
 * Helper untuk memanggil Supabase RPC dengan error handling
 */
async function callRpc<T = unknown>(fn: string, params?: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.rpc(fn, params as any);
  if (error) {
    // Supabase wraps RPC exceptions in error.message
    throw new Error(error.message);
  }
  return data as T;
}

// ---- Auth ----
export async function signInAnonymously() {
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data;
}

export async function linkWithGoogle() {
  const redirectUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/auth/callback?next=/play`
    : '/play';
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: redirectUrl },
  });
  if (error) throw error;
  return data;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ---- Character ----
export function createCharacter(name: string, look: Record<string, string>) {
  return callRpc<string>('create_character', { p_name: name, p_look: look });
}

export function updateCharacterLook(look: Record<string, string>) {
  return callRpc('update_character_look', { p_look: look });
}

// ---- State ----
export function saveState(zone: string, x: number, y: number) {
  return callRpc('save_state', { p_zone: zone, p_x: x, p_y: y });
}

// ---- Weather ----
export function getWeather() {
  return callRpc<{ weather: string; intensity: number; hour: number; date: string }>('get_weather');
}

// ---- Economy ----
export function sellItem(item: string, qty: number) {
  return callRpc<number>('sell_item', { p_item: item, p_qty: qty });
}

export function buyItem(item: string, qty: number) {
  return callRpc<number>('buy_item', { p_item: item, p_qty: qty });
}

// ---- Fishing ----
export function startCast(spot: string) {
  return callRpc<string>('start_cast', { p_spot: spot });
}

export function catchFish(spot: string) {
  return callRpc<{ caught: boolean; fish_id?: string; name?: string; rarity?: string }>(
    'catch_fish', { p_spot: spot }
  );
}

// ---- House & Plots ----
export function getMyHouse() {
  return callRpc<{
    id: string;
    kind: string;
    tier: number;
    plots: Array<{
      slot: number;
      crop_id: string | null;
      planted_at: string | null;
      last_watered: string | null;
    }>;
  }>('get_my_house');
}

export function plantCrop(houseId: string, slot: number, cropId: string) {
  return callRpc('plant_crop', { p_house_id: houseId, p_slot: slot, p_crop_id: cropId });
}

export function waterPlot(houseId: string, slot: number) {
  return callRpc('water_plot', { p_house_id: houseId, p_slot: slot });
}

export function harvestPlot(houseId: string, slot: number) {
  return callRpc<{ crop_id: string; yield: number }>('harvest_plot', { p_house_id: houseId, p_slot: slot });
}

// ---- Cooking ----
export function cook(recipe: string) {
  return callRpc<{ cooked: string; name: string }>('cook', { p_recipe: recipe });
}

// ---- Furniture ----
export function placeFurniture(houseId: string, itemId: string, x: number, y: number, rot = 0) {
  return callRpc<string>('place_furniture', {
    p_house_id: houseId, p_item_id: itemId, p_x: x, p_y: y, p_rot: rot,
  });
}

export function removeFurniture(itemUuid: string) {
  return callRpc('remove_furniture', { p_item_uuid: itemUuid });
}

// ---- Party ----
export function getMyParty() {
  return callRpc<{
    party_id: string;
    party_name: string;
    owner_id: string;
    is_owner: boolean;
    members: Array<{ player_id: string; name: string; is_owner: boolean }>;
    shared_house_id: string | null;
    house_items: Array<{
      id: string;
      item_id: string;
      x: number;
      y: number;
      rot: number;
      placed_by: string;
    }>;
  } | null>('get_my_party');
}

export function createParty(name: string) {
  return callRpc<string>('create_party', { p_name: name });
}

export function createInvite(partyId: string) {
  return callRpc<string>('create_invite', { p_party_id: partyId });
}

export function joinParty(code: string) {
  return callRpc<string>('join_party', { p_code: code });
}

export function leaveParty() {
  return callRpc('leave_party');
}

export function dissolveParty() {
  return callRpc('dissolve_party');
}

// ---- Quests & Discoveries ----
export function getQuestsAndDiscoveries() {
  return callRpc<{
    quests: Array<{ quest_id: string; state: Record<string, unknown>; done: boolean }>;
    discoveries: Array<{ hint_id: string; found_at: string }>;
  }>('get_quests_and_discoveries');
}

export function completeQuest(questId: string) {
  return callRpc<{ success: boolean; reward_coins: number }>('complete_quest', { p_quest_id: questId });
}

export function discoverHint(hintId: string, zone: string, x: number, y: number) {
  return callRpc<string>('discover_hint', { p_hint_id: hintId, p_zone: zone, p_x: x, p_y: y });
}

// ---- Data fetching ----
export async function getPlayer() {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getInventory() {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .order('item_id');
  if (error) throw error;
  return data ?? [];
}

export async function getCatalog(kind?: string) {
  let query = supabase.from('catalog').select('*');
  if (kind) query = query.eq('kind', kind);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getCollection() {
  const { data, error } = await supabase
    .from('collection')
    .select('*')
    .order('first_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
