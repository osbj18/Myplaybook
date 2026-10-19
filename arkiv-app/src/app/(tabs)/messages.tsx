import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, Empty, Img, Loading, Logo, TopBar } from '../../components/ui';
import { clock, useMyBlocks, useThreads } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { C } from '../../theme';

const TABS = ['Alla', 'Köpare', 'Säljare'] as const;

export default function Messages() {
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();
  const threads = useThreads();
  const blocks = useMyBlocks();
  const [tab, setTab] = useState<(typeof TABS)[number]>('Alla');

  // "Köpare" = trådar där någon vill köpa av mig, "Säljare" = där jag köper av någon.
  const list = (threads.data ?? []).filter((t) => {
    const other = t.buyer_id === userId ? t.seller_id : t.buyer_id;
    if (blocks.data?.has(other)) return false;
    if (tab === 'Köpare') return t.seller_id === userId && !!t.item_id;
    if (tab === 'Säljare') return t.buyer_id === userId && !!t.item_id;
    return true;
  });

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: C.bg }}>
      <TopBar center={<Logo />} />
      <View style={styles.seg}>
        {TABS.map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={[styles.segBtn, tab === t && styles.segOn]} accessibilityState={{ selected: tab === t }}>
            <Text style={{ fontSize: 15.5, color: tab === t ? '#fff' : C.ink }}>{t}</Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={list}
        keyExtractor={(t) => t.id}
        refreshControl={<RefreshControl refreshing={threads.isRefetching} onRefresh={() => { threads.refetch(); }} />}
        ListEmptyComponent={threads.isLoading ? <Loading /> : <Empty title="Inga meddelanden än" text="Lägg ett bud på ett plagg eller skriv till någon från deras profil." />}
        renderItem={({ item: t }) => {
          const other = t.buyer_id === userId ? t.seller : t.buyer;
          const preview = t.last_message ? (t.last_sender_id === userId ? `Du: ${t.last_message}` : t.last_message) : 'Ny konversation';
          return (
            <Pressable style={styles.thread} onPress={() => router.push(`/chat/${t.id}`)}>
              <Avatar profile={other} size={50} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.name} numberOfLines={1}>{other?.name ?? 'Raderat konto'}</Text>
                <Text numberOfLines={1} style={[styles.last, t.unread && { color: C.ink, fontWeight: '500' }]}>{preview}</Text>
              </View>
              {t.item?.media?.[0] ? <Img path={t.item.media[0].poster ?? t.item.media[0].path} style={{ width: 38, height: 38, borderRadius: 4 }} /> : null}
              <View style={{ alignSelf: 'flex-start', alignItems: 'flex-end', gap: 10, paddingTop: 4 }}>
                <Text style={{ color: C.muted, fontSize: 13 }}>{clock(t.updated_at)}</Text>
                {t.unread ? <View style={styles.dot} /> : null}
              </View>
            </Pressable>
          );
        }}
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
});
