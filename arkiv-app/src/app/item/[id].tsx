import { useQueryClient } from '@tanstack/react-query';
import { router, useIsFocused, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '../../components/Icon';
import { BidSheet, CommentsSheet, DetailsSheet } from '../../components/items';
import { MediaView } from '../../components/MediaView';
import { Avatar, BackBtn, Btn, Chip, Empty, IconBtn, Loading, goBack, useModeration } from '../../components/ui';
import { countOf, kr, openThread, timeAgo, useDeleteItem, useItem, useMyLikes, useMySaves, useThreads, useToggleLike, useToggleSave } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { errorText, toast } from '../../lib/toast';
import type { Item } from '../../lib/types';
import { C, T } from '../../theme';

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace('.', ',').replace(',0', '')}K` : String(n));

function Hero({ it, height }: { it: Item; height: number }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const focused = useIsFocused();
  const { userId } = useAuth();
  const moderate = useModeration();
  const del = useDeleteItem();
  const qc = useQueryClient();
  const [index, setIndex] = useState(0);
  const n = it.media.length;
  const own = it.owner_id === userId;

  const menu = () => moderate({ user: it.owner!, itemId: it.id }, own ? [
    ...(it.kind === 'sale' ? [{ label: it.sold ? 'Markera som till salu' : 'Markera som såld', onPress: async () => {
      const { error } = await supabase.from('items').update({ sold: !it.sold }).eq('id', it.id);
      if (error) toast(errorText(error)); else { toast(it.sold ? 'Till salu igen' : 'Markerad som såld'); qc.invalidateQueries({ queryKey: ['item', it.id] }); qc.invalidateQueries({ queryKey: ['userItems'] }); }
    } }] : []),
    { label: 'Ta bort', destructive: true, onPress: () => Alert.alert('Ta bort?', 'Det går inte att ångra.', [
      { text: 'Avbryt', style: 'cancel' },
      { text: 'Ta bort', style: 'destructive', onPress: () => del.mutate(it, { onSuccess: () => { toast('Borttaget'); goBack(); }, onError: (e) => toast(errorText(e)) }) },
    ]) },
  ] : undefined);

  return (
    <View style={[styles.hero, { height }]}>
      <FlatList
        data={it.media}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(m) => m.path}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item: m, index: i }) => (
          <View style={{ width, height }}>
            <MediaView media={m} active={focused && i === index} soundToggle />
          </View>
        )}
      />
      <View style={[styles.heroTop, { top: insets.top + 10 }]}>
        <Pressable style={styles.author} onPress={() => router.push(`/user/${it.owner_id}`)}>
          <Avatar profile={it.owner} ring />
          <Text style={styles.authorName} numberOfLines={1}>@{it.owner?.handle}</Text>
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          {it.kind === 'sale' ? <View style={styles.heroBadge}><Text style={{ fontSize: 15, color: C.ink }}>{it.sold ? 'Såld' : 'Säljes'}</Text></View> : null}
          <IconBtn label="Fler val" onPress={menu} style={styles.round}><Icon name="dots" color="#fff" size={20} /></IconBtn>
          <IconBtn label="Stäng" onPress={goBack} style={styles.round}><Icon name="close" color="#fff" size={18} /></IconBtn>
        </View>
      </View>
      {n > 1 ? (
        <>
          <View style={styles.count}><Text style={styles.countText}>{index + 1}/{n}</Text></View>
          <View style={styles.dots}>{it.media.map((m, i) => <View key={m.path} style={[styles.dot, i === index && styles.dotOn]} />)}</View>
        </>
      ) : null}
    </View>
  );
}

export default function ItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userId } = useAuth();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const q = useItem(id);
  const likes = useMyLikes();
  const saves = useMySaves();
  const toggleLike = useToggleLike();
  const toggleSave = useToggleSave();
  const threads = useThreads();
  const [comments, setComments] = useState(false);
  const [details, setDetails] = useState(false);
  const [bid, setBid] = useState(false);
  const [busy, setBusy] = useState(false);

  if (q.isLoading) return <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top }}><Loading /></View>;
  const it = q.data;
  if (!it) return <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top }}><BackBtn /><Empty title="Inlägget finns inte längre" /></View>;

  const own = it.owner_id === userId;
  const liked = !!likes.data?.has(it.id);
  const saved = !!saves.data?.has(it.id);
  const likeCount = countOf(it.likes);
  const commentCount = countOf(it.comments);

  const message = async () => {
    setBusy(true);
    try { setDetails(false); router.push(`/chat/${await openThread(userId!, it.owner_id, it.kind === 'sale' ? it : undefined)}`); }
    catch (e) { toast(errorText(e)); } finally { setBusy(false); }
  };
  const openBid = () => { if (details) { setDetails(false); setTimeout(() => setBid(true), 350); } else setBid(true); };
  const ownBids = () => {
    const t = (threads.data ?? []).filter((x) => x.item_id === it.id);
    if (!t.length) toast('Inga bud eller frågor än');
    else if (t.length === 1) router.push(`/chat/${t[0].id}`);
    else router.navigate('/messages');
  };

  const actions = (
    <View style={{ flexDirection: 'row', gap: 16 }}>
      <Pressable style={styles.action} onPress={() => toggleLike.mutate({ id: it.id, on: !liked })} accessibilityLabel={liked ? 'Sluta gilla' : 'Gilla'}>
        <Icon name="heart" filled={liked} color={liked ? '#c0392b' : C.ink} />
        <Text style={styles.actionText}>{fmt(likeCount)}</Text>
      </Pressable>
      <Pressable style={styles.action} onPress={() => setComments(true)} accessibilityLabel="Kommentarer">
        <Icon name="chat" />
        <Text style={styles.actionText}>{fmt(commentCount)}</Text>
      </Pressable>
      <Pressable style={styles.action} onPress={() => { toggleSave.mutate({ id: it.id, on: !saved }); toast(saved ? 'Borttaget från sparade' : 'Sparat'); }} accessibilityLabel={saved ? 'Ta bort från sparade' : 'Spara'}>
        <Icon name="bookmark" filled={saved} />
      </Pressable>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView bounces={false} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        <Hero it={it} height={Math.round(height * (it.kind === 'sale' ? 0.72 : 0.7))} />
        {it.kind === 'sale' ? (
          <View style={{ paddingHorizontal: 18, paddingTop: 18 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 21, fontWeight: '600', color: C.ink, marginBottom: 4 }} numberOfLines={2}>{it.title}  {kr(it.price ?? 0)}</Text>
                <Pressable onPress={() => setDetails(true)} hitSlop={6}>
                  <Text style={T.small}>{[it.brand, it.size && `Storlek ${it.size}`, 'Detaljer ›'].filter(Boolean).join(' · ')}</Text>
                </Pressable>
              </View>
              {own ? <Btn title="Se bud" onPress={ownBids} /> : <Btn title={it.sold ? 'Såld' : 'Lägg bud'} disabled={it.sold} onPress={openBid} />}
            </View>
            <View style={{ marginTop: 16 }}>{actions}</View>
            {it.caption ? <Text style={[T.body, { marginTop: 12 }]}>{it.caption}</Text> : null}
            {!own ? <Btn title="Skicka meddelande" variant="ghost" onPress={message} loading={busy} style={{ marginTop: 16 }} /> : null}
          </View>
        ) : (
          <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
            <View style={styles.row}>
              <Chip label={it.tag} />
              {actions}
            </View>
            {it.caption ? <Text style={[T.body, { fontSize: 15.5, marginBottom: 6 }]}>{it.caption}</Text> : null}
            <View style={styles.row}>
              <Pressable onPress={() => setComments(true)} hitSlop={6}><Text style={T.small}>{commentCount ? `Visa alla ${commentCount} kommentarer` : 'Skriv en kommentar'}</Text></Pressable>
              <Text style={T.small}>{timeAgo(it.created_at)}</Text>
            </View>
          </View>
        )}
      </ScrollView>
      <CommentsSheet item={it} visible={comments} onClose={() => setComments(false)} />
      {it.kind === 'sale' ? (
        <>
          <DetailsSheet it={it} visible={details} onClose={() => setDetails(false)} onBid={openBid} onMessage={message} />
          <BidSheet
            price={it.price ?? 0}
            label={`${it.title} · ${it.brand}`}
            visible={bid}
            onClose={() => setBid(false)}
            onSend={async (amount) => {
              const threadId = await openThread(userId!, it.owner_id, it);
              const { error } = await supabase.rpc('make_offer', { p_thread: threadId, p_amount: amount });
              if (error) throw error;
              toast('Bud skickat');
              router.push(`/chat/${threadId}`);
            }}
          />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: '#222', overflow: 'hidden', borderBottomLeftRadius: 14, borderBottomRightRadius: 14 },
  heroTop: { position: 'absolute', left: 16, right: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  author: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
  authorName: { color: '#fff', fontWeight: '600', fontSize: 16, textShadowColor: 'rgba(0,0,0,.4)', textShadowRadius: 8, flexShrink: 1 },
  heroBadge: { backgroundColor: '#fff', borderRadius: 999, paddingVertical: 7, paddingHorizontal: 16 },
  round: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,0,0,.3)' },
  count: { position: 'absolute', left: 14, bottom: 14, backgroundColor: 'rgba(40,40,40,.6)', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12 },
  countText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  dots: { position: 'absolute', bottom: 22, alignSelf: 'center', flexDirection: 'row', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,.55)' },
  dotOn: { width: 18, backgroundColor: '#fff' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  actionText: { fontWeight: '600', fontSize: 15, color: C.ink },
});
