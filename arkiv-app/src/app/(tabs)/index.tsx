import { router, useIsFocused } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '../../components/Icon';
import { MediaView } from '../../components/MediaView';
import { buildBlocks, MosaicBlock, type Block } from '../../components/Mosaic';
import { Avatar, Btn, Empty, IconBtn, Loading, Logo, TopBar } from '../../components/ui';
import { useFavorites, useFeed, useMyBlocks } from '../../lib/api';
import { C, T } from '../../theme';

export default function Home() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const focused = useIsFocused();
  const feed = useFeed();
  const favorites = useFavorites();
  const blocks = useMyBlocks();
  const [visible, setVisible] = useState<Set<string>>(new Set());

  const items = useMemo(() => (feed.data?.items ?? []).filter((x) => !blocks.data?.has(x.owner_id)), [feed.data, blocks.data]);
  const favs = (favorites.data ?? []).filter((f) => !blocks.data?.has(f.profile.id));

  // Spela bara videor i block som syns på skärmen.
  const onViewable = useRef(({ viewableItems }: { viewableItems: { item?: unknown }[] }) => {
    setVisible(new Set(viewableItems.map((v) => (v.item as Block).key)));
  }).current;

  const blocksList = useMemo(() => buildBlocks(items), [items]);

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
        data={blocksList}
        keyExtractor={(b) => b.key}
        ListHeaderComponent={header}
        ListEmptyComponent={feed.isLoading ? <Loading /> : (
          <Empty
            title="Här är det tomt än"
            text="Bli först med att dela en look eller lägga ut ett plagg till salu."
            action={<Btn title="Lägg ut något" onPress={() => router.push('/camera')} />}
          />
        )}
        renderItem={({ item: b }) => <MosaicBlock block={b} width={width} visible={focused && visible.has(b.key)} all={items} />}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={{ itemVisiblePercentThreshold: 40 }}
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
});
