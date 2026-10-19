import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '../../components/Icon';
import { IconBtn, Img, Logo, TopBar } from '../../components/ui';
import { ME, type Sale } from '../../data/seed';
import { kr, useStore } from '../../store';
import { C } from '../../theme';

const FILTERS = ['Märke', 'Storlek', 'Skick', 'Färg', 'Pris'] as const;
type Filter = (typeof FILTERS)[number];
const HINT: Record<Filter, string> = { Märke: 'A–Ö', Storlek: 'M', Skick: 'mycket gott+', Färg: 'neutrala', Pris: 'lägst först' };

export default function Explore() {
  const { state, toggleHeart, toast } = useStore();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter | null>(null);
  const colW = (width - 36 - 13) / 2;

  const list = useMemo(() => {
    let l = state.items.filter((x): x is Sale => x.kind === 'sale' && x.owner !== ME && !x.sold && !state.blocked[x.owner]);
    const query = q.trim().toLowerCase();
    if (query) l = l.filter((x) => [x.brand, x.title, x.owner, x.color].join(' ').toLowerCase().includes(query));
    else l = [...l.filter((x) => x.explore), ...l.filter((x) => !x.explore)];
    if (filter === 'Pris') l = [...l].sort((a, b) => a.price - b.price);
    if (filter === 'Skick') l = l.filter((x) => /Ny|Mycket/.test(x.cond));
    if (filter === 'Storlek') l = l.filter((x) => ['M', 'One size'].includes(x.size));
    if (filter === 'Märke') l = [...l].sort((a, b) => a.brand.localeCompare(b.brand, 'sv'));
    if (filter === 'Färg') l = l.filter((x) => /Svart|Grå|Beige|Sand|Natur/.test(x.color));
    return l;
  }, [state.items, state.blocked, q, filter]);

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: C.bg }}>
      <TopBar
        left={<IconBtn label="Hem" onPress={() => router.navigate('/')}><Icon name="back" /></IconBtn>}
        center={<Logo />}
        right={<IconBtn label="Notiser" onPress={() => toast('Inga nya notiser')}><Icon name="bell" /></IconBtn>}
      />
      <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 24 }}>
        <Text style={styles.title}>Upptäck</Text>
        <View style={styles.search}>
          <Icon name="search" size={14} color="#777" />
          <TextInput value={q} onChangeText={setQ} placeholder="Sök märke, plagg eller medlem" placeholderTextColor="#8f8c86" style={styles.searchInput} returnKeyType="search" clearButtonMode="while-editing" autoCorrect={false} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -18, marginBottom: 22 }} contentContainerStyle={{ paddingHorizontal: 18, gap: 7 }}>
          {FILTERS.map((f) => {
            const on = filter === f;
            return (
              <Pressable key={f} onPress={() => setFilter(on ? null : f)} style={[styles.filter, on && styles.filterOn]}>
                <Text style={{ fontSize: 14.5, color: on ? '#fff' : C.ink }}>{f}{on ? ` · ${HINT[f]}` : ''}</Text>
                <Icon name="chev" size={9} color={on ? '#fff' : C.ink} />
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={styles.hRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
            <Text style={styles.h3} numberOfLines={1}>{q.trim() ? `Resultat för ”${q.trim()}”` : 'För dig'}</Text>
            {q.trim() ? null : <Icon name="check" size={18} color={C.accent} />}
          </View>
        </View>
        <View style={styles.grid}>
          {list.map((x) => (
            <View key={x.id} style={{ width: colW }}>
              <Pressable onPress={() => router.push(`/listing/${x.id}`)}>
                <Img source={x.thumb ?? x.images[0]} style={{ width: colW, height: colW * 1.07, borderRadius: 4, marginBottom: 10, backgroundColor: C.chip }} />
                <Text style={styles.brand}>{x.brand}</Text>
                <Text style={styles.name}>{x.title}</Text>
                <Text style={styles.name}>{kr(x.price)}</Text>
              </Pressable>
              <Pressable
                style={styles.heart}
                accessibilityLabel="Spara"
                onPress={() => { toggleHeart(x.id); toast(state.hearted[x.id] ? 'Borttagen från favoriter' : 'Sparad i favoriter'); }}
              >
                <Icon name="heart" size={17} filled={!!state.hearted[x.id]} />
              </Pressable>
            </View>
          ))}
          {!list.length ? <Text style={styles.empty}>Inga plagg matchar din sökning.</Text> : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 30, fontWeight: '700', color: C.ink, marginTop: 4, marginBottom: 14 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.chip, borderRadius: 8, paddingHorizontal: 16, height: 48, marginBottom: 14 },
  searchInput: { flex: 1, fontSize: 16.5, color: C.ink },
  filter: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: C.border, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#fff' },
  filterOn: { backgroundColor: C.ink, borderColor: C.ink },
  hRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  h3: { fontSize: 19, fontWeight: '700', color: C.ink },
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 13, rowGap: 20 },
  brand: { fontSize: 13, letterSpacing: 1, color: C.muted, textTransform: 'uppercase' },
  name: { fontSize: 15.5, color: C.ink, marginTop: 2 },
  heart: { position: 'absolute', top: 7, right: 7, width: 39, height: 39, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  empty: { color: C.muted, textAlign: 'center', paddingVertical: 40, width: '100%' },
});
