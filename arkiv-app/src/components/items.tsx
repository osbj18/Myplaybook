import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import type { ScrollViewInstance, TextInputInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ME, type Item, type Sale } from '../data/seed';
import { kr, useStore } from '../store';
import { C, T } from '../theme';
import { Icon } from './Icon';
import { Avatar, Btn, Chip, IconBtn, Img, Sheet, useModeration } from './ui';

export const openItem = (it: Item) => router.push(it.kind === 'sale' ? `/listing/${it.id}` : `/post/${it.id}`);

export function FeedTile({ it, width }: { it: Item; width: number }) {
  return (
    <Pressable onPress={() => openItem(it)} style={[s.tile, { width, height: width * 1.25 }]} accessibilityLabel={it.kind === 'sale' ? it.title : it.caption}>
      <Img source={it.thumb ?? it.images[0]} style={StyleSheet.absoluteFill} />
      {it.kind === 'sale' ? <SaleBadge sold={it.sold} /> : null}
      <Text style={s.handle}>@{it.owner}</Text>
    </Pressable>
  );
}

export const SaleBadge = ({ sold, small }: { sold?: boolean; small?: boolean }) => (
  <View style={[s.badge, small && { top: 7, paddingVertical: 3, paddingHorizontal: 10 }]}>
    <Text style={{ fontSize: small ? 12.5 : 14, color: C.ink }}>{sold ? 'Såld' : 'Säljes'}</Text>
  </View>
);

/** Helskärmsbild med svepbara bilder, avsändare och räknare. */
export function Hero({ it, height }: { it: Item; height: number }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { state, toggleHeart, toast } = useStore();
  const moderate = useModeration();
  const [index, setIndex] = useState(0);
  const n = it.images.length;
  return (
    <View style={[s.hero, { height }]}>
      <FlatList
        data={it.images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(x, i) => x + i}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item: img }) => <Img source={img} style={{ width, height }} />}
      />
      <View style={[s.heroTop, { top: insets.top + 10 }]}>
        <Pressable style={s.author} onPress={() => router.push(`/user/${it.owner}`)}>
          <Avatar handle={it.owner} ring />
          <Text style={s.authorName}>@{it.owner}</Text>
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          {it.kind === 'sale' ? <View style={s.heroBadge}><Text style={{ fontSize: 15, color: C.ink }}>{it.sold ? 'Såld' : 'Säljes'}</Text></View> : null}
          {it.owner !== ME ? <IconBtn label="Fler val" onPress={() => moderate(it.owner)} style={s.round}><Icon name="dots" color="#fff" size={20} /></IconBtn> : null}
          <IconBtn label="Stäng" onPress={() => router.back()} style={s.round}><Icon name="close" color="#fff" size={18} /></IconBtn>
        </View>
      </View>
      <View style={s.count}><Text style={s.countText}>{index + 1}/{n}</Text></View>
      {n > 1 ? (
        <View style={s.dots}>{it.images.map((_, i) => <View key={i} style={[s.dot, i === index && s.dotOn]} />)}</View>
      ) : null}
      {it.kind === 'sale' && it.owner !== ME ? (
        <Pressable
          style={s.heartFab}
          accessibilityLabel="Spara"
          onPress={() => { toggleHeart(it.id); toast(state.hearted[it.id] ? 'Borttagen från favoriter' : 'Sparad i favoriter'); }}
        >
          <Icon name="heart" size={20} filled={!!state.hearted[it.id]} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function CommentsSheet({ id, visible, onClose }: { id: string; visible: boolean; onClose: () => void }) {
  const { state, user, addComment, toggleCommentLike } = useStore();
  const [text, setText] = useState('');
  const input = useRef<TextInputInstance>(null);
  const scroll = useRef<ScrollViewInstance>(null);
  const list = (state.comments[id] ?? []).filter((c) => !state.blocked[c.user]);
  const send = () => {
    const v = text.trim();
    if (!v) return;
    addComment(id, v);
    setText('');
    setTimeout(() => scroll.current?.scrollToEnd(), 50);
  };
  return (
    <Sheet visible={visible} onClose={onClose} title={`${list.length + 34} kommentarer`} height="72%">
      <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={{ padding: 18 }} keyboardShouldPersistTaps="handled">
        {list.map((c, i) => {
          const key = id + i;
          const on = !!state.likedComments[key];
          const u = user(c.user);
          return (
            <View key={key} style={[s.comment, c.reply && { marginLeft: 42 }]}>
              <Avatar handle={c.user} size={38} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.ink }}>
                  {c.user === 'ameliacmode' || c.user === ME ? c.user : u.name}
                  <Text style={{ color: C.muted, fontWeight: '400' }}> · {c.creator ? 'Skapare · ' : ''}{c.time}</Text>
                </Text>
                <Text style={[T.body, { marginTop: 3, marginBottom: 6 }]}>{c.text}</Text>
                <Pressable onPress={() => { setText(`@${u.name.split(' ')[0]} `); input.current?.focus(); }}><Text style={{ fontSize: 13.5, color: C.muted }}>Svara</Text></Pressable>
              </View>
              <Pressable onPress={() => toggleCommentLike(key)} style={{ alignItems: 'center', paddingTop: 4 }} accessibilityLabel="Gilla kommentar" hitSlop={8}>
                <Icon name="heart" size={15} color={on ? '#c0392b' : C.muted} filled={on} />
                <Text style={{ fontSize: 11, color: on ? '#c0392b' : C.muted }}>{c.likes + (on ? 1 : 0) || ''}</Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
      <View style={s.foot}>
        <TextInput ref={input} value={text} onChangeText={setText} onSubmitEditing={send} placeholder="Skriv en kommentar..." placeholderTextColor="#9d9a94" style={s.input} returnKeyType="send" />
        <Pressable style={s.sendRound} onPress={send} accessibilityLabel="Skicka"><Icon name="send" size={16} color="#fff" /></Pressable>
      </View>
    </Sheet>
  );
}

export function DetailsSheet({ it, visible, onClose, onBid }: { it: Sale; visible: boolean; onClose: () => void; onBid: () => void }) {
  const { state, user, openDm } = useStore();
  const more = state.items.filter((x): x is Sale => x.owner === it.owner && x.kind === 'sale' && x.id !== it.id && !x.sold).slice(0, 3);
  const fact = (label: string, value: string) => (
    <View style={s.fact}><Text style={{ color: C.muted, fontSize: 13, marginBottom: 3 }}>{label}</Text><Text style={{ fontSize: 15, color: C.ink }}>{value}</Text></View>
  );
  return (
    <Sheet visible={visible} onClose={onClose}>
      <ScrollView contentContainerStyle={{ padding: 18 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={s.h2}>{it.title}</Text><Text style={s.h2}>{kr(it.price)}</Text>
        </View>
        <Text style={[T.upper, { fontSize: 13 }]}>{it.brand}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 16 }}>
          <Chip label={`Storlek ${it.size}`} style={{ borderRadius: 6 }} />
          <Chip label={it.cond} style={{ borderRadius: 6 }} />
          <Chip label={`Frakt ${it.ship} kr`} style={{ borderRadius: 6 }} />
        </View>
        <Text style={[T.upper, { marginBottom: 4 }]}>Beskrivning</Text>
        <Text style={[T.body, { marginBottom: 16 }]}>{it.desc}</Text>
        <View style={s.facts}>
          {fact('Material', it.material)}{fact('Mått', it.measure)}{fact('Färg', it.color)}{fact('Upplagd', it.posted)}
        </View>
        {more.length ? (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={T.upper}>Mer från {user(it.owner).name}</Text>
              <Pressable onPress={() => { onClose(); router.push(`/user/${it.owner}`); }}><Text style={{ fontSize: 14, color: C.ink }}>Visa alla</Text></Pressable>
            </View>
            <View style={{ flexDirection: 'row', gap: 9 }}>
              {more.map((m) => (
                <Pressable key={m.id} style={{ flex: 1 }} onPress={() => { onClose(); router.push(`/listing/${m.id}`); }}>
                  <Img source={m.thumb ?? m.images[0]} style={{ width: '100%', aspectRatio: 1.5, borderRadius: 4, marginBottom: 6 }} />
                  <Text style={{ fontSize: 15, color: C.ink }}>{kr(m.price)}</Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>
      {it.owner !== ME ? (
        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 18, paddingTop: 8 }}>
          <Btn title="Meddelande" variant="ghost" style={{ flex: 1 }} onPress={() => { onClose(); router.push(`/chat/${openDm(it.owner, it.id)}`); }} />
          <Btn title={it.sold ? 'Såld' : 'Lägg bud'} style={{ flex: 1 }} disabled={it.sold} onPress={onBid} />
        </View>
      ) : null}
    </Sheet>
  );
}

type BidProps = { it: Sale; visible: boolean; onClose: () => void; onSend: (amount: number) => void; title?: string; cta?: string; initial?: number };
export function BidSheet({ it, visible, onClose, onSend, title = 'Lägg bud', cta = 'Skicka bud', initial }: BidProps) {
  const suggestions = [0.8, 0.9, 1].map((f) => Math.round((it.price * f) / 10) * 10);
  const [amount, setAmount] = useState(String(initial ?? suggestions[1]));
  useEffect(() => { if (visible) setAmount(String(initial ?? suggestions[1])); }, [visible]);
  const v = parseInt(amount.replace(/\D/g, ''), 10) || 0;
  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      <View style={{ padding: 18, alignItems: 'center' }}>
        <Text style={T.small}>{it.title} · {it.brand} · utropspris {kr(it.price)}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginVertical: 10 }}>
          <TextInput value={amount} onChangeText={setAmount} keyboardType="number-pad" style={s.bidInput} accessibilityLabel="Belopp" selectTextOnFocus />
          <Text style={{ fontSize: 28, fontWeight: '600', color: C.ink }}>kr</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 18 }}>
          {suggestions.map((q) => (
            <Pressable key={q} onPress={() => setAmount(String(q))} style={[s.quick, v === q && { borderColor: C.ink }]}>
              <Text style={{ fontSize: 15, color: C.ink }}>{kr(q)}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={[T.small, { textAlign: 'center', marginBottom: 16 }]}>Köparskydd ingår. Du betalar först när säljaren accepterat.</Text>
        <Btn title={cta} style={{ alignSelf: 'stretch', paddingVertical: 16 }} disabled={!v} onPress={() => { onClose(); onSend(v); }} />
      </View>
    </Sheet>
  );
}

const s = StyleSheet.create({
  tile: { borderRadius: 6, overflow: 'hidden', backgroundColor: C.chip },
  badge: { position: 'absolute', top: 9, left: 7, backgroundColor: '#fff', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12 },
  handle: { position: 'absolute', left: 8, bottom: 7, color: '#fff', fontSize: 13.5, textShadowColor: 'rgba(0,0,0,.5)', textShadowRadius: 6 },
  hero: { backgroundColor: '#222', overflow: 'hidden', borderBottomLeftRadius: 14, borderBottomRightRadius: 14 },
  heroTop: { position: 'absolute', left: 16, right: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  author: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  authorName: { color: '#fff', fontWeight: '600', fontSize: 16, textShadowColor: 'rgba(0,0,0,.4)', textShadowRadius: 8 },
  heroBadge: { backgroundColor: '#fff', borderRadius: 999, paddingVertical: 7, paddingHorizontal: 16 },
  round: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,0,0,.3)' },
  count: { position: 'absolute', left: 14, bottom: 14, backgroundColor: 'rgba(40,40,40,.6)', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12 },
  countText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  dots: { position: 'absolute', bottom: 22, alignSelf: 'center', flexDirection: 'row', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,.55)' },
  dotOn: { width: 18, backgroundColor: '#fff' },
  heartFab: { position: 'absolute', right: 14, bottom: 14, width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  comment: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  foot: { flexDirection: 'row', gap: 10, alignItems: 'center', paddingHorizontal: 18, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.line },
  input: { flex: 1, backgroundColor: C.chip, borderRadius: 999, paddingVertical: 13, paddingHorizontal: 18, fontSize: 15.5, color: C.ink },
  sendRound: { width: 46, height: 46, borderRadius: 23, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' },
  h2: { fontSize: 21, fontWeight: '600', color: C.ink, marginBottom: 2 },
  facts: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginBottom: 22 },
  fact: { width: '48.5%', backgroundColor: '#fff', borderWidth: 1, borderColor: C.line, borderRadius: 7, paddingVertical: 10, paddingHorizontal: 12 },
  bidInput: { width: 190, height: 60, fontSize: 46, fontWeight: '600', textAlign: 'right', color: C.ink, padding: 0 },
  quick: { backgroundColor: C.chip, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 13, borderWidth: 1, borderColor: 'transparent' },
});
