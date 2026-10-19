import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProfileForm } from '../components/ProfileForm';
import { Avatar, BackBtn, Btn, TopBar } from '../components/ui';
import { deleteAccount, useMyBlocks, useProfile, useToggleBlock } from '../lib/api';
import { useAuth, useMe } from '../lib/auth';
import { errorText, toast } from '../lib/toast';
import { C, T } from '../theme';

function BlockedRow({ id }: { id: string }) {
  const p = useProfile(id);
  const unblock = useToggleBlock();
  return (
    <View style={styles.row}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Avatar profile={p.data} size={32} />
        <Text style={{ fontSize: 16, color: C.ink }}>{p.data?.name ?? '…'}</Text>
      </View>
      <Pressable onPress={() => { unblock.mutate({ id, on: false }); toast('Avblockerad'); }}><Text style={{ color: C.accent, fontSize: 15, fontWeight: '600' }}>Avblockera</Text></Pressable>
    </View>
  );
}

export default function Settings() {
  const insets = useSafeAreaInsets();
  const { me, uid } = useMe();
  const { signOut, session } = useAuth();
  const blocks = useMyBlocks();
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = () => Alert.alert('Radera kontot?', 'Din profil, alla inlägg, annonser, meddelanden och bilder raderas permanent. Det går inte att ångra.', [
    { text: 'Avbryt', style: 'cancel' },
    { text: 'Radera', style: 'destructive', onPress: async () => {
      setDeleting(true);
      try { await deleteAccount(uid); toast('Kontot är raderat'); } catch (e) { toast(errorText(e)); setDeleting(false); }
    } },
  ]);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TopBar left={<BackBtn />} center={<Text style={T.title}>Inställningar</Text>} />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 30 }} keyboardShouldPersistTaps="handled">
        <Text style={[T.label, styles.h]}>PROFIL</Text>
        <ProfileForm initial={me} cta="Spara profil" onSaved={() => { toast('Profilen är sparad'); router.back(); }} />

        <Text style={[T.label, styles.h]}>BLOCKERADE</Text>
        {blocks.data?.size ? [...blocks.data].map((id) => <BlockedRow key={id} id={id} />) : <Text style={{ color: C.muted, fontSize: 15 }}>Du har inte blockerat någon.</Text>}

        <Text style={[T.label, styles.h]}>KONTO</Text>
        <Text style={{ color: C.soft, fontSize: 14, marginBottom: 12 }}>Inloggad som {session?.user.email}</Text>
        <Pressable style={styles.row} onPress={() => router.push('/terms')}><Text style={{ fontSize: 16, color: C.ink }}>Användarvillkor</Text><Text style={{ color: C.muted }}>›</Text></Pressable>
        <Btn title="Logga ut" variant="ghost" onPress={signOut} style={{ marginTop: 16 }} />
        <Btn title="Radera konto" variant="ghost" textStyle={{ color: '#b3261e' }} onPress={confirmDelete} loading={deleting} style={{ marginTop: 10 }} />
        <Text style={{ color: C.muted, fontSize: 12.5, textAlign: 'center', marginTop: 28 }}>ARKIV {Constants.expoConfig?.version ?? ''}</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  h: { marginTop: 26, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.line },
});
