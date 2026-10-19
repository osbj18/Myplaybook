import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** Sant när appen har nycklar till ett Supabase-projekt (se README). */
export const isConfigured = /^https:\/\/.+/.test(url) && anonKey.length > 20;

export const supabase = createClient(isConfigured ? url : 'https://example.supabase.co', isConfigured ? anonKey : 'public-anon-key', {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Förnya inloggningen bara när appen är i förgrunden.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}

export const BUCKET = 'media';
export const publicUrl = (path?: string | null) => (path ? supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl : undefined);
