import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { handleTaken, saveProfile } from '../lib/api';
import { useAuth } from '../lib/auth';
import { prepare, uploadFile } from '../lib/media';
import { errorText } from '../lib/toast';
import type { Profile } from '../lib/types';
import { C } from '../theme';
import { Avatar, Btn, Img } from './ui';

const cleanHandle = (v: string) => v.toLowerCase().replace(/[^a-z0-9_.]/g, '').slice(0, 24);

/** Formulär för att skapa eller redigera sin profil. */
export function ProfileForm({ initial, cta, onSaved }: { initial?: Profile | null; cta: string; onSaved: () => void }) {
  const { userId, reloadProfile } = useAuth();
  const [handle, setHandle] = useState(initial?.handle ?? '');
  const [name, setName] = useState(initial?.name ?? '');
  const [city, setCity] = useState(initial?.city ?? '');
  const [bio, setBio] = useState(initial?.bio ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const ok = /^[a-z0-9_.]{3,24}$/.test(handle) && name.trim().length > 0;

  const pickAvatar = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 1 });
    if (!res.canceled) setAvatarUri((await prepare({ uri: res.assets[0].uri, type: 'image' })).uri);
  };

  const save = async () => {
    setBusy(true); setError('');
    try {
      if (await handleTaken(handle, userId!)) { setError('Användarnamnet är upptaget'); return; }
      const avatar_path = avatarUri ? await uploadFile(userId!, avatarUri, 'image') : initial?.avatar_path ?? null;
      await saveProfile({ id: userId!, handle, name: name.trim(), city: city.trim(), bio: bio.trim(), avatar_path });
      await reloadProfile();
      onSaved();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View>
      <Pressable onPress={pickAvatar} style={{ alignSelf: 'center', alignItems: 'center', marginBottom: 22 }} accessibilityLabel="Välj profilbild">
        {avatarUri ? <Img uri={avatarUri} style={{ width: 96, height: 96, borderRadius: 48 }} /> : <Avatar profile={initial ?? ({ name: name || '?' } as Profile)} size={96} />}
        <Text style={{ color: C.accent, fontSize: 15, fontWeight: '600', marginTop: 10 }}>{avatarUri || initial?.avatar_path ? 'Byt bild' : 'Lägg till profilbild'}</Text>
      </Pressable>
      <Field label="Användarnamn">
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.at}>@</Text>
          <TextInput value={handle} onChangeText={(v) => setHandle(cleanHandle(v))} autoCapitalize="none" autoCorrect={false} placeholder="dittnamn" placeholderTextColor="#9d9a94" style={[styles.input, { flex: 1 }]} />
        </View>
      </Field>
      <Field label="Namn"><TextInput value={name} onChangeText={setName} placeholder="För- och efternamn" placeholderTextColor="#9d9a94" style={styles.input} maxLength={40} /></Field>
      <Field label="Stad"><TextInput value={city} onChangeText={setCity} placeholder="t.ex. Stockholm" placeholderTextColor="#9d9a94" style={styles.input} maxLength={40} /></Field>
      <Field label="Om dig"><TextInput value={bio} onChangeText={setBio} placeholder="Vad delar eller säljer du?" placeholderTextColor="#9d9a94" style={[styles.input, { minHeight: 56 }]} multiline maxLength={160} /></Field>
      <Text style={{ color: C.muted, fontSize: 12.5, marginBottom: 16 }}>3–24 tecken: små bokstäver, siffror, punkt och understreck.</Text>
      {error ? <Text style={{ color: '#b3261e', fontSize: 14, marginBottom: 12 }}>{error}</Text> : null}
      <Btn title={cta} onPress={save} disabled={!ok} loading={busy} style={{ paddingVertical: 16 }} />
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={{ color: C.muted, fontSize: 13 }}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { backgroundColor: '#fff', borderWidth: 1, borderColor: C.line, borderRadius: 7, paddingVertical: 9, paddingHorizontal: 13, marginBottom: 10 },
  input: { fontSize: 16.5, color: C.ink, paddingTop: 3, paddingBottom: 0 },
  at: { fontSize: 16.5, color: C.muted, paddingTop: 3 },
});
