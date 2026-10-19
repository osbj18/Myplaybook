import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, Share, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ME, REVIEWS } from '../data/seed';
import { useStore } from '../store';
import { C } from '../theme';
import { Icon } from './Icon';
import { openItem, SaleBadge } from './items';
import { Avatar, BackBtn, IconBtn, Img, useModeration } from './ui';

const mono = { fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'ui-monospace, Menlo, monospace' }), letterSpacing: 2.6, color: C.muted } as const;

export function ProfileView({ handle, showBack }: { handle: string; showBack?: boolean }) {
  const { state, user, toggleFollow, openDm, toast } = useStore();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const moderate = useModeration();
  const [tab, setTab] = useState<'Profil' | 'Omdömen'>('Profil');
  const [filter, setFilter] = useState<'Alla' | 'Säljes' | 'Inlägg'>('Alla');
  const u = user(handle);
  const own = state.items.filter((x) => x.owner === handle);
  const forSale = own.filter((x) => x.kind === 'sale' && !x.sold);
  const shown = own.filter((x) => filter === 'Alla' || (filter === 'Säljes' ? x.kind === 'sale' : x.kind === 'post'));
  const cell = (width - 36 - 8) / 3;
  const isMe = handle === ME;
  const following = !!state.following[handle];

  const header = (
    <View style={styles.headRow}>
      {showBack ? <BackBtn /> : <View style={{ width: 32 }} />}
      <View style={styles.seg}>
        {(['Profil', 'Omdömen'] as const).map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={[styles.segBtn, tab === t && styles.segOn]}>
            <Text style={[styles.segText, tab === t && { color: C.ink }]}>{t === 'Omdömen' ? 'Omdömen · 128' : t}</Text>
          </Pressable>
        ))}
      </View>
      {isMe ? (
        <IconBtn label="Inställningar" onPress={() => router.push('/settings')}><Icon name="dots" /></IconBtn>
      ) : (
        <IconBtn label="Fler val" onPress={() => moderate(handle, 'profil')}><Icon name="dots" /></IconBtn>
      )}
    </View>
  );

  if (tab === 'Omdömen') {
    const dist: [number, number][] = [[5, 120], [4, 6], [3, 1], [2, 1], [1, 0]];
    return (
      <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 24 }}>
        {header}
        <View style={styles.rating}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 50, fontWeight: '700', color: C.ink, letterSpacing: -1 }}>4,9</Text>
            <Text style={styles.stars}>★★★★★</Text>
            <Text style={{ color: C.muted, fontSize: 13 }}>128 omdömen</Text>
          </View>
          <View style={{ flex: 1, gap: 6 }}>
            {dist.map(([st, n]) => (
              <View key={st} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.barLabel}>{st}</Text>
                <View style={styles.bar}><View style={[styles.barFill, { width: `${n ? Math.max(2, (n / 128) * 100) : 0}%` }]} /></View>
                <Text style={[styles.barLabel, { width: 26, textAlign: 'right' }]}>{n}</Text>
              </View>
            ))}
          </View>
        </View>
        {REVIEWS.map((r) => (
          <View key={r.user} style={styles.review}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 10 }}>
              <Avatar handle={r.user} size={40} />
              <View>
                <Text style={{ fontSize: 15.5, fontWeight: '600', color: C.ink }}>{user(r.user).name}</Text>
                <Text><Text style={styles.stars}>{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</Text><Text style={{ color: C.muted, fontSize: 13 }}> · {r.when}</Text></Text>
              </View>
            </View>
            <Text style={{ fontSize: 15, lineHeight: 21, color: '#333' }}>{r.text}</Text>
          </View>
        ))}
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 24 }}>
      {header}
      <View style={{ flexDirection: 'row', gap: 18, paddingHorizontal: 18 }}>
        <Avatar handle={handle} size={96} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
            <Text style={{ fontSize: 19, fontWeight: '700', color: C.ink }}>{u.name}</Text>
            <Icon name="check" size={18} color={C.accent} />
          </View>
          <Text style={[mono, { fontSize: 10.5, marginTop: 4 }]}>GARDEROB · STOCKHOLM</Text>
          <Text style={{ fontSize: 15, lineHeight: 21, color: C.ink, marginTop: 8 }}>{u.bio || 'Delar looks och säljer det jag inte längre bär.'}</Text>
        </View>
      </View>
      <View style={styles.stats}>
        <View style={{ alignItems: 'center', flex: 1 }}><Text style={styles.statNum}>{own.filter((x) => x.kind === 'post').length + 20}</Text><Text style={[mono, { fontSize: 9.5 }]}>INLÄGG</Text></View>
        <View style={{ alignItems: 'center', flex: 1 }}><Text style={styles.statNum}>{forSale.length}</Text><Text style={[mono, { fontSize: 9.5 }]}>PLAGG TILL SALU</Text></View>
      </View>
      <View style={styles.actions}>
        {isMe ? (
          <Pressable style={[styles.action, styles.primary]} onPress={() => router.push('/settings')}><Text style={[styles.actionText, { color: '#fff' }]}>Redigera profil</Text></Pressable>
        ) : (
          <Pressable style={[styles.action, !following && styles.primary]} onPress={() => { toggleFollow(handle); toast(following ? `Du slutade följa ${u.name}` : `Du följer ${u.name}`); }}>
            <Text style={[styles.actionText, !following && { color: '#fff' }]}>{following ? 'Följer' : 'Följ'}</Text>
          </Pressable>
        )}
        <Pressable style={styles.action} onPress={() => (isMe ? router.navigate('/messages') : router.push(`/chat/${openDm(handle)}`))}>
          <Text style={styles.actionText}>Meddelande</Text>
        </Pressable>
        <Pressable style={styles.shareBtn} accessibilityLabel="Dela profil" onPress={() => Share.share({ message: `Kolla in @${handle} på ARKIV` }).catch(() => {})}>
          <Icon name="arrow" size={15} />
        </Pressable>
      </View>
      <View style={{ flexDirection: 'row', gap: 7, paddingHorizontal: 18, paddingBottom: 15 }}>
        {([['Alla', 'Alla'], ['Säljes', `Säljes · ${forSale.length}`], ['Inlägg', 'Inlägg']] as const).map(([k, l]) => (
          <Pressable key={k} onPress={() => setFilter(k)} style={[styles.pf, filter === k && styles.pfOn]}>
            <Text style={{ fontSize: 14.5, color: filter === k ? '#fff' : C.ink }}>{l}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.grid}>
        {shown.map((x) => (
          <Pressable key={x.id} onPress={() => openItem(x)} style={{ width: cell, height: cell * 1.04, borderRadius: 2, overflow: 'hidden', backgroundColor: C.chip }}>
            <Img source={x.thumb ?? x.images[0]} style={StyleSheet.absoluteFill} />
            {x.kind === 'sale' ? <SaleBadge small sold={x.sold} /> : null}
          </Pressable>
        ))}
        {!shown.length ? <Text style={{ color: C.muted, textAlign: 'center', width: '100%', paddingVertical: 40 }}>Inget här än.</Text> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingTop: 6, paddingBottom: 18 },
  seg: { flex: 1, flexDirection: 'row', backgroundColor: C.chip, borderRadius: 9, padding: 3 },
  segBtn: { flex: 1, paddingVertical: 10, borderRadius: 7, alignItems: 'center' },
  segOn: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  segText: { fontSize: 15.5, fontWeight: '600', color: C.muted },
  stats: { flexDirection: 'row', marginVertical: 18 },
  statNum: { fontSize: 18, fontWeight: '600', color: C.ink },
  actions: { flexDirection: 'row', gap: 10, paddingHorizontal: 18, paddingBottom: 16 },
  action: { flex: 1, flexBasis: 0, height: 50, borderRadius: 8, borderWidth: 1, borderColor: C.border, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  shareBtn: { width: 53, height: 50, borderRadius: 8, borderWidth: 1, borderColor: C.border, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: C.ink, borderColor: C.ink },
  actionText: { fontSize: 16.5, fontWeight: '600', color: C.ink },
  pf: { borderWidth: 1, borderColor: C.border, backgroundColor: '#fff', borderRadius: 999, paddingVertical: 7, paddingHorizontal: 14 },
  pfOn: { backgroundColor: C.ink, borderColor: C.ink },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, paddingHorizontal: 18 },
  rating: { flexDirection: 'row', gap: 22, alignItems: 'center', paddingHorizontal: 18, paddingBottom: 22 },
  stars: { color: C.star, fontSize: 14, letterSpacing: 1 },
  barLabel: { fontSize: 11.5, color: C.muted, width: 12 },
  bar: { flex: 1, height: 5, borderRadius: 3, backgroundColor: C.chip, overflow: 'hidden' },
  barFill: { height: 5, borderRadius: 3, backgroundColor: C.ink },
  review: { marginHorizontal: 18, marginBottom: 18, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: C.line },
});
