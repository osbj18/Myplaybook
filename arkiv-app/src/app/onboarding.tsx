import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProfileForm } from '../components/ProfileForm';
import { useAuth } from '../lib/auth';
import { C } from '../theme';

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 22, paddingTop: insets.top + 30, paddingBottom: insets.bottom + 30 }} keyboardShouldPersistTaps="handled">
        <Text style={{ fontSize: 26, fontWeight: '700', color: C.ink, marginBottom: 6 }}>Välkommen till ARKIV</Text>
        <Text style={{ fontSize: 15, color: C.soft, lineHeight: 21, marginBottom: 26 }}>Skapa din profil. Den blir din butik och din garderob.</Text>
        <ProfileForm cta="Skapa profil" onSaved={() => {}} />
        <Pressable onPress={signOut} style={{ alignSelf: 'center', marginTop: 20 }}><Text style={{ color: C.muted, fontSize: 15 }}>Logga ut</Text></Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
