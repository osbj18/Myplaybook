import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import { demoFetch, demoUrl, isDemo, memoryStorage } from './demo';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** Sant när appen har nycklar till ett Supabase-projekt (se README). */
export const isConfigured = isDemo || (/^https:\/\/.+/.test(url) && anonKey.length > 20);

const real = !isDemo && isConfigured;
export const supabase = createClient(real ? url : 'https://testlage.arkiv.app', real ? anonKey : 'testlage-anon-key', {
  global: isDemo ? { fetch: demoFetch } : undefined,
  auth: {
    storage: isDemo ? memoryStorage : AsyncStorage,
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
export const publicUrl = (path?: string | null) => (!path ? undefined : isDemo ? demoUrl(path) : supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
