import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackBtn, Btn, TopBar } from '../components/ui';
import { useStore } from '../store';
import { C, T } from '../theme';

export default function Settings() {
  const { state, user, updateMe, unblock, reset, toast } = useStore();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(state.me.name);
  const [bio, setBio] = useState(state.me.bio);
  const blocked = Object.keys(state.blocked);
  const dirty = name !== state.me.name || bio !== state.me.bio;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top }}>
      <TopBar left={<BackBtn />} center={<Text style={T.title}>Inställningar</Text>} />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 30 }} keyboardShouldPersistTaps="handled">
        <Text style={[T.label, styles.h]}>PROFIL</Text>
        <View style={styles.field}>
          <Text style={styles.label}>Namn</Text>
          <TextInput value={name} onChangeText={setName} style={styles.input} maxLength={40} />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Om dig</Text>
          <TextInput value={bio} onChangeText={setBio} style={[styles.input, { minHeight: 60 }]} multiline maxLength={160} />
        </View>
        <Btn title="Spara" disabled={!dirty || !name.trim()} onPress={() => { updateMe({ name: name.trim(), bio: bio.trim() }); toast('Profilen är sparad'); router.back(); }} />

        <Text style={[T.label, styles.h]}>BLOCKERADE</Text>
        {blocked.length ? blocked.map((h) => (
          <View key={h} style={styles.row}>
            <Text style={{ fontSize: 16, color: C.ink }}>{user(h).name}</Text>
            <Pressable onPress={() => { unblock(h); toast(`${user(h).name} är avblockerad`); }}><Text style={{ color: C.accent, fontSize: 15, fontWeight: '600' }}>Avblockera</Text></Pressable>
          </View>
        )) : <Text style={{ color: C.muted, fontSize: 15 }}>Du har inte blockerat någon.</Text>}

        <Text style={[T.label, styles.h]}>DATA</Text>
        <Text style={{ color: C.soft, fontSize: 14, lineHeight: 20, marginBottom: 12 }}>
          Allt du skapar sparas bara på den här enheten. ARKIV skickar inga uppgifter till någon server.
        </Text>
        <Btn
          title="Radera all min data"
          variant="ghost"
          textStyle={{ color: '#b3261e' }}
          onPress={() => Alert.alert('Radera all data?', 'Dina inlägg, annonser, meddelanden och inställningar tas bort från enheten.', [
            { text: 'Avbryt', style: 'cancel' },
            { text: 'Radera', style: 'destructive', onPress: () => { reset(); router.dismissAll(); toast('All data är raderad'); } },
          ])}
        />
        <Text style={{ color: C.muted, fontSize: 12.5, textAlign: 'center', marginTop: 28 }}>ARKIV {Constants.expoConfig?.version ?? ''}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  h: { marginTop: 26, marginBottom: 12 },
  field: { backgroundColor: '#fff', borderWidth: 1, borderColor: C.line, borderRadius: 7, paddingVertical: 9, paddingHorizontal: 13, marginBottom: 10 },
  label: { color: C.muted, fontSize: 13 },
  input: { fontSize: 16.5, color: C.ink, paddingTop: 3, paddingBottom: 0 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.line },
});
