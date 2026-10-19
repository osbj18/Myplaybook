import { router, useIsFocused } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '../../components/Icon';
import { ItemTile } from '../../components/items';
import { MediaView } from '../../components/MediaView';
import { Avatar, Btn, Empty, IconBtn, Loading, Logo, TopBar } from '../../components/ui';
import { useFavorites, useFeed, useMyBlocks } from '../../lib/api';
import type { Item } from '../../lib/types';
import { C, T } from '../../theme';

export default function Home() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const focused = useIsFocused();
  const feed = useFeed();
  const favorites = useFavorites();
  const blocks = useMyBlocks();
  const [visible, setVisible] = useState<Set<string>>(new Set());
  const tileW = (width - 36 - 7) / 2;

  const items = (feed.data?.items ?? []).filter((x) => !blocks.data?.has(x.owner_id));
  const favs = (favorites.data ?? []).filter((f) => !blocks.data?.has(f.profile.id));

  // Spela bara videor som syns på skärmen.
  const onViewable = useRef(({ viewableItems }: { viewableItems: { item?: unknown }[] }) => {
    const ids = new Set<string>();
    viewableItems.forEach((v) => (v.item as Item[] | undefined)?.forEach((it) => ids.add(it.id)));
    setVisible(ids);
  }).current;

  const rows: Item[][] = [];
  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));

  const refresh = useCallback(() => { feed.refetch(); favorites.refetch(); }, [feed, favorites]);

  const header = (
    <View>
      {favs.length ? (
        <>
          <Text style={[T.label, { marginHorizontal: 18, marginTop: 6, marginBottom: 14 }]}>FAVORITER</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 18, gap: 9 }}>
            {favs.map(({ profile, cover }) => (
              <Pressable key={profile.id} style={{ width: 82 }} onPress={() => router.push(`/user/${profile.id}`)} accessibilityLabel={profile.name}>
                <View style={styles.fav}>
                  {cover ? <MediaView media={cover} active={focused} /> : <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}><Avatar profile={profile} size={48} /></View>}
                </View>
                <Text numberOfLines={1} style={styles.favName}>{profile.handle}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </>
      ) : null}
      <View style={styles.rowBetween}>
        <Text style={T.label}>{feed.data?.following ? 'FÖLJER' : 'SENASTE PÅ ARKIV'}</Text>
        <Pressable onPress={() => router.navigate('/explore')} hitSlop={8}><Text style={styles.seeAll}>SE ALLA ›</Text></Pressable>
      </View>
      {!feed.data?.following && items.length ? (
        <Text style={[T.small, { marginHorizontal: 18, marginTop: -6, marginBottom: 14 }]}>Följ personer du gillar så hamnar deras looks här.</Text>
      ) : null}
    </View>
  );

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: C.bg }}>
      <TopBar
        left={<Pressable style={styles.post} onPress={() => router.push('/camera')}><Text style={{ fontSize: 15, color: C.ink }}>Lägg ut</Text></Pressable>}
        center={<Logo />}
        right={<IconBtn label="Meddelanden" onPress={() => router.navigate('/messages')}><Icon name="chat" /></IconBtn>}
      />
      <FlatList
        data={rows}
        keyExtractor={(r) => r.map((x) => x.id).join('-')}
        ListHeaderComponent={header}
        ListEmptyComponent={feed.isLoading ? <Loading /> : (
          <Empty
            title="Här är det tomt än"
            text="Bli först med att dela en look eller lägga ut ett plagg till salu."
            action={<Btn title="Lägg ut något" onPress={() => router.push('/camera')} />}
          />
        )}
        renderItem={({ item: row }) => (
          <View style={styles.row}>
            {row.map((it) => <ItemTile key={it.id} it={it} width={tileW} height={tileW * 1.25} active={focused && visible.has(it.id)} />)}
          </View>
        )}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={{ itemVisiblePercentThreshold: 55 }}
        refreshControl={<RefreshControl refreshing={feed.isRefetching} onRefresh={refresh} />}
        contentContainerStyle={{ paddingBottom: 18 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  post: { backgroundColor: C.chip, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 16 },
  fav: { width: 82, height: 137, borderRadius: 6, marginBottom: 7, overflow: 'hidden', backgroundColor: C.chip },
  favName: { fontSize: 12, color: '#333', textAlign: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 18, marginTop: 22, marginBottom: 14 },
  seeAll: { color: C.accent, fontSize: 13, fontWeight: '600', letterSpacing: 1.8 },
  row: { flexDirection: 'row', gap: 7, paddingHorizontal: 18, marginBottom: 7 },
});
