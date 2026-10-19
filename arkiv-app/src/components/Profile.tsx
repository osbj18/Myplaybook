import { router, useIsFocused } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, Pressable, RefreshControl, ScrollView, Share, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { openThread, timeAgo, useFollowCounts, useMyFollows, useProfile, useReviews, useToggleFollow, useUserItems } from '../lib/api';
import { useAuth } from '../lib/auth';
import { errorText, toast } from '../lib/toast';
import { C } from '../theme';
import { Icon } from './Icon';
import { ItemTile } from './items';
import { Avatar, BackBtn, Empty, IconBtn, Loading, useModeration } from './ui';

const mono = { fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'ui-monospace, Menlo, monospace' }), letterSpacing: 2.6, color: C.muted } as const;

export function ProfileView({ id, showBack }: { id: string; showBack?: boolean }) {
  const { userId } = useAuth();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const focused = useIsFocused();
  const moderate = useModeration();
  const profile = useProfile(id);
  const items = useUserItems(id);
  const reviews = useReviews(id);
  const counts = useFollowCounts(id);
  const follows = useMyFollows();
  const toggleFollow = useToggleFollow();
  const [tab, setTab] = useState<'Profil' | 'Omdömen'>('Profil');
  const [filter, setFilter] = useState<'Alla' | 'Säljes' | 'Inlägg'>('Alla');
  const [busy, setBusy] = useState(false);

  const isMe = id === userId;
  const p = profile.data;
  const all = items.data ?? [];
  const forSale = all.filter((x) => x.kind === 'sale' && !x.sold);
  const shown = all.filter((x) => filter === 'Alla' || (filter === 'Säljes' ? x.kind === 'sale' : x.kind === 'post'));
  const following = !!follows.data?.has(id);
  const cell = (width - 36 - 8) / 3;
  const revs = reviews.data ?? [];
  const avg = revs.length ? revs.reduce((a, r) => a + r.stars, 0) / revs.length : 0;
  const dist = useMemo(() => [5, 4, 3, 2, 1].map((n) => [n, revs.filter((r) => r.stars === n).length] as const), [revs]);

  if (profile.isLoading) return <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top }}><Loading /></View>;
  if (!p) return <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top }}><BackBtn /><Empty title="Profilen finns inte" /></View>;

  const refresh = () => { profile.refetch(); items.refetch(); reviews.refetch(); counts.refetch(); };

  const header = (
    <View style={styles.headRow}>
      {showBack ? <BackBtn /> : <View style={{ width: 32 }} />}
      <View style={styles.seg}>
        {(['Profil', 'Omdömen'] as const).map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={[styles.segBtn, tab === t && styles.segOn]}>
            <Text style={[styles.segText, tab === t && { color: C.ink }]}>{t === 'Omdömen' ? `Omdömen · ${revs.length}` : t}</Text>
          </Pressable>
        ))}
      </View>
      {isMe ? (
        <IconBtn label="Inställningar" onPress={() => router.push('/settings')}><Icon name="dots" /></IconBtn>
      ) : (
        <IconBtn label="Fler val" onPress={() => moderate({ user: p })}><Icon name="dots" /></IconBtn>
      )}
    </View>
  );

  const scrollProps = {
    style: { flex: 1, backgroundColor: C.bg },
    contentContainerStyle: { paddingTop: insets.top, paddingBottom: 24 },
    refreshControl: <RefreshControl refreshing={items.isRefetching} onRefresh={refresh} />,
  };

  if (tab === 'Omdömen') {
    return (
      <ScrollView {...scrollProps}>
        {header}
        {revs.length ? (
          <View style={styles.rating}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 50, fontWeight: '700', color: C.ink, letterSpacing: -1 }}>{avg.toFixed(1).replace('.', ',')}</Text>
              <Text style={styles.stars}>{'★'.repeat(Math.round(avg))}{'☆'.repeat(5 - Math.round(avg))}</Text>
              <Text style={{ color: C.muted, fontSize: 13 }}>{revs.length} omdömen</Text>
            </View>
            <View style={{ flex: 1, gap: 6 }}>
              {dist.map(([st, n]) => (
                <View key={st} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.barLabel}>{st}</Text>
                  <View style={styles.bar}><View style={[styles.barFill, { width: `${n ? Math.max(2, (n / revs.length) * 100) : 0}%` }]} /></View>
                  <Text style={[styles.barLabel, { width: 26, textAlign: 'right' }]}>{n}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <Empty title="Inga omdömen än" text="Omdömen lämnas av köpare efter en avslutad affär." />
        )}
        {revs.map((r) => (
          <View key={r.id} style={styles.review}>
            <Pressable style={{ flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 10 }} onPress={() => r.reviewer && router.push(`/user/${r.reviewer.id}`)}>
              <Avatar profile={r.reviewer} size={40} />
              <View>
                <Text style={{ fontSize: 15.5, fontWeight: '600', color: C.ink }}>{r.reviewer?.name ?? 'Raderat konto'}</Text>
                <Text><Text style={styles.stars}>{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</Text><Text style={{ color: C.muted, fontSize: 13 }}> · {timeAgo(r.created_at)}</Text></Text>
              </View>
            </Pressable>
            {r.body ? <Text style={{ fontSize: 15, lineHeight: 21, color: '#333' }}>{r.body}</Text> : null}
          </View>
        ))}
      </ScrollView>
    );
  }

  const message = async () => {
    if (isMe) { router.navigate('/messages'); return; }
    setBusy(true);
    try { router.push(`/chat/${await openThread(userId!, id)}`); } catch (e) { toast(errorText(e)); } finally { setBusy(false); }
  };

  return (
    <ScrollView {...scrollProps}>
      {header}
      <View style={{ flexDirection: 'row', gap: 18, paddingHorizontal: 18 }}>
        <Avatar profile={p} size={96} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 19, fontWeight: '700', color: C.ink }}>{p.name}</Text>
          <Text style={{ fontSize: 14, color: C.muted, marginTop: 1 }}>@{p.handle}</Text>
          {p.city ? <Text style={[mono, { fontSize: 10.5, marginTop: 4 }]}>GARDEROB · {p.city.toUpperCase()}</Text> : null}
          {p.bio ? <Text style={{ fontSize: 15, lineHeight: 21, color: C.ink, marginTop: 8 }}>{p.bio}</Text> : null}
        </View>
      </View>
      <View style={styles.stats}>
        {([[all.filter((x) => x.kind === 'post').length, 'INLÄGG'], [forSale.length, 'TILL SALU'], [counts.data?.followers ?? 0, 'FÖLJARE']] as const).map(([n, l]) => (
          <View key={l} style={{ alignItems: 'center', flex: 1 }}><Text style={styles.statNum}>{n}</Text><Text style={[mono, { fontSize: 9.5 }]}>{l}</Text></View>
        ))}
      </View>
      <View style={styles.actions}>
        {isMe ? (
          <Pressable style={[styles.action, styles.primary]} onPress={() => router.push('/settings')}><Text style={[styles.actionText, { color: '#fff' }]}>Redigera profil</Text></Pressable>
        ) : (
          <Pressable style={[styles.action, !following && styles.primary]} onPress={() => { toggleFollow.mutate({ id, on: !following }); toast(following ? `Du slutade följa ${p.name}` : `Du följer ${p.name}`); }}>
            <Text style={[styles.actionText, !following && { color: '#fff' }]}>{following ? 'Följer' : 'Följ'}</Text>
          </Pressable>
        )}
        <Pressable style={[styles.action, busy && { opacity: 0.5 }]} onPress={message} disabled={busy}>
          <Text style={styles.actionText}>{isMe ? 'Meddelanden' : 'Meddelande'}</Text>
        </Pressable>
        <Pressable style={styles.shareBtn} accessibilityLabel="Dela profil" onPress={() => Share.share({ message: `Kolla in @${p.handle} på ARKIV` }).catch(() => {})}>
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
      {items.isLoading ? <Loading /> : null}
      <View style={styles.grid}>
        {shown.map((x) => <ItemTile key={x.id} it={x} width={cell} height={cell * 1.25} active={focused} showHandle={false} smallBadge />)}
      </View>
      {!items.isLoading && !shown.length ? (
        <Empty
          title={isMe ? 'Lägg upp ditt första inlägg' : 'Inget här än'}
          text={isMe ? 'Dela en outfit eller sälj ett plagg ur din garderob.' : undefined}
          action={isMe ? <Pressable style={[styles.pf, styles.pfOn]} onPress={() => router.push('/camera')}><Text style={{ color: '#fff', fontSize: 15 }}>Skapa</Text></Pressable> : undefined}
        />
      ) : null}
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
