import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '../../components/Icon';
import { Avatar, IconBtn, Logo, TopBar } from '../../components/ui';
import type { Thread } from '../../data/seed';
import { useStore } from '../../store';
import { C } from '../../theme';

const TABS = ['Alla', 'Köpare', 'Säljare'] as const;

function lastLine(t: Thread) {
  const m = t.messages[t.messages.length - 1];
  if (!m) return '';
  if (m.system) return m.system;
  if (m.offer) return m.from === 'me' ? `Du skickade ett ${m.offer.kind.toLowerCase()}` : 'Skickade ett bud';
  return (m.from === 'me' ? 'Du: ' : '') + m.text;
}

export default function Messages() {
  const { state, user, readAll, toast } = useStore();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<(typeof TABS)[number]>('Alla');
  const threads = state.threads.filter((t) => !state.blocked[t.with] && (tab === 'Alla' || (tab === 'Köpare' ? t.role === 'buyer' : t.role === 'seller')));

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: C.bg }}>
      <TopBar
        center={<Logo />}
        right={<IconBtn label="Markera alla som lästa" onPress={() => { readAll(); toast('Allt markerat som läst'); }}><Icon name="dots" /></IconBtn>}
      />
      <View style={styles.seg}>
        {TABS.map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={[styles.segBtn, tab === t && styles.segOn]} accessibilityState={{ selected: tab === t }}>
            <Text style={{ fontSize: 15.5, color: tab === t ? '#fff' : C.ink }}>{t}</Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={threads}
        keyExtractor={(t) => t.id}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: C.muted, padding: 40 }}>Inga konversationer</Text>}
        renderItem={({ item: t }) => (
          <Pressable style={styles.thread} onPress={() => router.push(`/chat/${t.id}`)}>
            <View>
              <Avatar handle={t.with} size={50} />
              {user(t.with).online ? <View style={styles.online} /> : null}
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.name}>{user(t.with).name}</Text>
              <Text numberOfLines={1} style={[styles.last, t.unread && { color: C.ink, fontWeight: '500' }]}>{lastLine(t)}</Text>
            </View>
            <View style={{ alignSelf: 'flex-start', alignItems: 'flex-end', gap: 10, paddingTop: 4 }}>
              <Text style={{ color: C.muted, fontSize: 13 }}>{t.time}</Text>
              {t.unread ? <View style={styles.dot} /> : null}
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  seg: { flexDirection: 'row', gap: 10, paddingHorizontal: 18, paddingBottom: 10 },
  segBtn: { flex: 1, borderWidth: 1, borderColor: C.border, borderRadius: 999, paddingVertical: 10, alignItems: 'center', backgroundColor: '#fff' },
  segOn: { backgroundColor: C.ink, borderColor: C.ink },
  thread: { flexDirection: 'row', gap: 14, alignItems: 'center', paddingVertical: 12, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: C.line },
  name: { fontWeight: '600', fontSize: 16.5, color: C.ink, marginBottom: 3 },
  last: { color: C.muted, fontSize: 15 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.accent },
  online: { position: 'absolute', right: 1, bottom: 1, width: 12, height: 12, borderRadius: 6, backgroundColor: C.online, borderWidth: 2, borderColor: C.bg },
});
