import { router, useIsFocused } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '../../components/Icon';
import { openItem } from '../../components/items';
import { MediaView, VideoBadge } from '../../components/MediaView';
import { buildBlocks, MosaicBlock, type Block } from '../../components/Mosaic';
import { Avatar, Empty, IconBtn, Loading, Logo, TopBar } from '../../components/ui';
import { kr, useDiscover, useExplore, useMyBlocks, useMySaves, useToggleSave, type ExploreFilter } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { toast } from '../../lib/toast';
import { C } from '../../theme';

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const CONDS = ['Ny med lapp', 'Mycket gott skick', 'Gott skick', 'Använt'];

export default function Explore() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const focused = useIsFocused();
  const { userId } = useAuth();
  const [input, setInput] = useState('');
  const [f, setF] = useState<ExploreFilter>({ q: '', sort: 'new' });
  const [open, setOpen] = useState<'size' | 'cond' | null>(null);
  const res = useExplore(f);
  const saves = useMySaves();
  const toggleSave = useToggleSave();
  const blocks = useMyBlocks();
  const colW = (width - 36 - 13) / 2;

  // Vänta lite med sökningen medan man skriver.
  useEffect(() => {
    const t = setTimeout(() => setF((x) => ({ ...x, q: input })), 300);
    return () => clearTimeout(t);
  }, [input]);

  const items = (res.data?.items ?? []).filter((x) => !blocks.data?.has(x.owner_id) && x.owner_id !== userId);
  const people = (res.data?.people ?? []).filter((p) => !blocks.data?.has(p.id) && p.id !== userId);

  // Utan sökning visas ett rutnät som Instagram Utforska, med videor som höga rutor.
  const browsing = !f.q.trim() && !f.size && !f.condition && f.sort !== 'price' && !input.trim();
  const discover = useDiscover();
  const discoverItems = useMemo(() => (discover.data ?? []).filter((x) => !blocks.data?.has(x.owner_id) && x.owner_id !== userId), [discover.data, blocks.data, userId]);
  const mosaic = useMemo(() => buildBlocks(discoverItems), [discoverItems]);
  const [visible, setVisible] = useState<Set<string>>(new Set());
  const onViewable = useRef(({ viewableItems }: { viewableItems: { item?: unknown }[] }) => {
    setVisible(new Set(viewableItems.map((v) => (v.item as Block).key)));
  }).current;

  const pill = (label: string, on: boolean, onPress: () => void) => (
    <Pressable key={label} onPress={onPress} style={[styles.filter, on && styles.filterOn]}>
      <Text style={{ fontSize: 14.5, color: on ? '#fff' : C.ink }}>{label}</Text>
      <Icon name="chev" size={9} color={on ? '#fff' : C.ink} />
    </Pressable>
  );

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: C.bg }}>
      <TopBar
        left={<IconBtn label="Hem" onPress={() => router.navigate('/')}><Icon name="back" /></IconBtn>}
        center={<Logo />}
        right={<IconBtn label="Meddelanden" onPress={() => router.navigate('/messages')}><Icon name="bell" /></IconBtn>}
      />
      <FlatList
        data={browsing ? mosaic : []}
        keyExtractor={(b) => b.key}
        renderItem={({ item: b }) => <MosaicBlock block={b} width={width} visible={focused && visible.has(b.key)} all={discoverItems} />}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={{ itemVisiblePercentThreshold: 40 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={res.isRefetching || discover.isRefetching} onRefresh={() => { res.refetch(); discover.refetch(); }} />}
        ListEmptyComponent={browsing && discover.isLoading ? <Loading /> : browsing ? <Empty title="Inget att utforska än" text="Lägg upp en look eller en video så syns den här." /> : undefined}
        ListHeaderComponent={<View style={{ paddingHorizontal: 18 }}>
        <Text style={styles.title}>Upptäck</Text>
        <View style={styles.search}>
          <Icon name="search" size={14} color="#777" />
          <TextInput value={input} onChangeText={setInput} placeholder="Sök märke, plagg eller medlem" placeholderTextColor="#8f8c86" style={styles.searchInput} returnKeyType="search" clearButtonMode="while-editing" autoCorrect={false} autoCapitalize="none" />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -18, marginBottom: open ? 10 : browsing ? 14 : 22 }} contentContainerStyle={{ paddingHorizontal: 18, gap: 7 }}>
          {pill(f.size ? `Storlek ${f.size}` : 'Storlek', !!f.size, () => setOpen(open === 'size' ? null : 'size'))}
          {pill(f.condition ?? 'Skick', !!f.condition, () => setOpen(open === 'cond' ? null : 'cond'))}
          {pill(f.sort === 'price' ? 'Pris: lägst först' : 'Pris', f.sort === 'price', () => setF((x) => ({ ...x, sort: x.sort === 'price' ? 'new' : 'price' })))}
        </ScrollView>
        {open ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 20 }}>
            {(open === 'size' ? SIZES : CONDS).map((v) => {
              const key = open === 'size' ? 'size' : 'condition';
              const on = f[key] === v;
              return (
                <Pressable key={v} onPress={() => { setF((x) => ({ ...x, [key]: on ? undefined : v })); setOpen(null); }} style={[styles.opt, on && styles.filterOn]}>
                  <Text style={{ fontSize: 14, color: on ? '#fff' : C.ink }}>{v}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {browsing ? null : (<>
        {people.length ? (
          <View style={{ marginBottom: 22 }}>
            <Text style={[styles.h3, { marginBottom: 10 }]}>Medlemmar</Text>
            {people.map((p) => (
              <Pressable key={p.id} style={styles.person} onPress={() => router.push(`/user/${p.id}`)}>
                <Avatar profile={p} size={40} />
                <View><Text style={{ fontSize: 15.5, fontWeight: '600', color: C.ink }}>{p.name}</Text><Text style={{ color: C.muted }}>@{p.handle}</Text></View>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Text style={styles.h3} numberOfLines={1}>{f.q.trim() ? `Resultat för ”${f.q.trim()}”` : 'Till salu nu'}</Text>
          {f.q.trim() ? null : <Icon name="check" size={18} color={C.accent} />}
        </View>
        {res.isLoading ? <Loading /> : null}
        <View style={styles.grid}>
          {items.map((x) => {
            const saved = !!saves.data?.has(x.id);
            return (
              <View key={x.id} style={{ width: colW }}>
                <Pressable onPress={() => openItem(x)}>
                  <View style={{ width: colW, height: colW * 1.07, borderRadius: 4, overflow: 'hidden', marginBottom: 10, backgroundColor: C.chip }}>
                    {x.media[0] ? <MediaView media={x.media[0]} active={focused} /> : null}
                    {x.media[0]?.type === 'video' ? <VideoBadge /> : null}
                  </View>
                  <Text style={styles.brand} numberOfLines={1}>{x.brand}</Text>
                  <Text style={styles.name} numberOfLines={1}>{x.title}</Text>
                  <Text style={styles.name}>{kr(x.price ?? 0)}</Text>
                </Pressable>
                <Pressable style={styles.heart} accessibilityLabel={saved ? 'Ta bort från sparade' : 'Spara'} onPress={() => { toggleSave.mutate({ id: x.id, on: !saved }); toast(saved ? 'Borttagen från sparade' : 'Sparad'); }}>
                  <Icon name="heart" size={17} filled={saved} />
                </Pressable>
              </View>
            );
          })}
        </View>
        {!res.isLoading && !items.length ? <Empty title={f.q || f.size || f.condition ? 'Inga plagg matchar' : 'Inga plagg till salu än'} text={f.q || f.size || f.condition ? 'Prova en annan sökning eller ta bort filter.' : 'Lägg ut något ur din garderob så syns det här.'} /> : null}
        </>)}
        </View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 30, fontWeight: '700', color: C.ink, marginTop: 4, marginBottom: 14 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.chip, borderRadius: 8, paddingHorizontal: 16, height: 48, marginBottom: 14 },
  searchInput: { flex: 1, fontSize: 16.5, color: C.ink },
  filter: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: C.border, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#fff' },
  filterOn: { backgroundColor: C.ink, borderColor: C.ink },
  opt: { borderWidth: 1, borderColor: C.border, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 12, backgroundColor: '#fff' },
  h3: { fontSize: 19, fontWeight: '700', color: C.ink },
  person: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 13, rowGap: 20 },
  brand: { fontSize: 13, letterSpacing: 1, color: C.muted, textTransform: 'uppercase' },
  name: { fontSize: 15.5, color: C.ink, marginTop: 2 },
  heart: { position: 'absolute', top: 7, right: 7, width: 39, height: 39, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
});
