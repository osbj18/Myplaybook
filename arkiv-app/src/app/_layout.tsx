import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Toast } from '../components/ui';
import { AuthProvider, useAuth } from '../lib/auth';
import { isConfigured } from '../lib/supabase';
import { C, T } from '../theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

function SetupNeeded() {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 24, paddingTop: insets.top + 40 }}>
      <Text style={[T.logo, { marginBottom: 24 }]}>ARKIV</Text>
      <Text style={{ fontSize: 20, fontWeight: '600', color: C.ink, marginBottom: 10 }}>Koppla appen till Supabase</Text>
      <Text style={{ fontSize: 15, lineHeight: 22, color: C.soft }}>
        Appen saknar nycklar till databasen. Skapa en fil som heter .env i mappen arkiv-app med EXPO_PUBLIC_SUPABASE_URL och
        EXPO_PUBLIC_SUPABASE_ANON_KEY från ditt Supabase-projekt. Starta sedan om appen. Hela instruktionen finns i README.md.
      </Text>
    </ScrollView>
  );
}

function Root() {
  const { ready, session, profile } = useAuth();
  useEffect(() => { if (ready) SplashScreen.hideAsync().catch(() => {}); }, [ready]);
  if (!isConfigured) return <SetupNeeded />;
  if (!ready) return null;
  const signedIn = !!session;
  const hasProfile = signedIn && !!profile;
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg } }}>
        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="login" />
        </Stack.Protected>
        <Stack.Protected guard={signedIn && !hasProfile}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>
        <Stack.Protected guard={hasProfile}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="item/[id]" />
          <Stack.Screen name="reels" options={{ animation: 'fade', contentStyle: { backgroundColor: '#000' } }} />
          <Stack.Screen name="chat/[id]" />
          <Stack.Screen name="user/[id]" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="camera" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom', contentStyle: { backgroundColor: C.black } }} />
          <Stack.Screen name="compose" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
        </Stack.Protected>
        <Stack.Screen name="terms" options={{ presentation: 'modal' }} />
      </Stack>
      <Toast />
    </>
  );
}

export default function RootLayout() {
  const [qc] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } }));
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={qc}>
        <AuthProvider>
          <View style={{ flex: 1, backgroundColor: C.bg }}>
            <Root />
          </View>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
