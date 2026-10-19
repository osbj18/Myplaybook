import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { ScrollViewInstance, TextInputInstance } from 'react-native';

import { kr, timeAgo, useAddComment, useComments, useDeleteComment, useMyBlocks } from '../lib/api';
import { useAuth } from '../lib/auth';
import { errorText, toast } from '../lib/toast';
import type { Item } from '../lib/types';
import { C, T } from '../theme';
import { Icon } from './Icon';
import { MediaView, VideoBadge } from './MediaView';
import { Avatar, Btn, Chip, Loading, Sheet, useModeration } from './ui';

export const openItem = (it: Item) => router.push(`/item/${it.id}`);

/** Ruta i flöden och rutnät. Videor spelas upp ljudlöst när rutan syns. */
export function ItemTile({ it, width, height, active, showHandle = true, smallBadge }: { it: Item; width: number; height: number; active: boolean; showHandle?: boolean; smallBadge?: boolean }) {
  const first = it.media[0];
  return (
    <Pressable onPress={() => openItem(it)} style={[s.tile, { width, height }]} accessibilityLabel={it.kind === 'sale' ? it.title ?? 'Plagg' : it.caption || 'Inlägg'}>
      {first ? <MediaView media={first} active={active} /> : null}
      {it.kind === 'sale' ? <SaleBadge sold={it.sold} small={smallBadge} /> : null}
      {first?.type === 'video' ? <VideoBadge /> : null}
      {showHandle && it.owner ? <Text style={s.handle} numberOfLines={1}>@{it.owner.handle}</Text> : null}
    </Pressable>
  );
}

export const SaleBadge = ({ sold, small }: { sold?: boolean; small?: boolean }) => (
  <View style={[s.badge, small && { top: 7, paddingVertical: 3, paddingHorizontal: 10 }]}>
    <Text style={{ fontSize: small ? 12.5 : 14, color: C.ink }}>{sold ? 'Såld' : 'Säljes'}</Text>
  </View>
);

export function CommentsSheet({ item, visible, onClose }: { item: Item; visible: boolean; onClose: () => void }) {
  const { userId } = useAuth();
  const comments = useComments(item.id, visible);
  const blocks = useMyBlocks();
  const add = useAddComment(item.id);
  const del = useDeleteComment(item.id);
  const moderate = useModeration();
  const [text, setText] = useState('');
  const input = useRef<TextInputInstance>(null);
  const scroll = useRef<ScrollViewInstance>(null);
  const list = (comments.data ?? []).filter((c) => !blocks.data?.has(c.user_id));

  const send = () => {
    const v = text.trim();
    if (!v) return;
    add.mutate(v, {
      onSuccess: () => { setText(''); setTimeout(() => scroll.current?.scrollToEnd(), 200); },
      onError: (e) => toast(errorText(e)),
    });
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={`${list.length} ${list.length === 1 ? 'kommentar' : 'kommentarer'}`} height="72%">
      <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={{ padding: 18 }} keyboardShouldPersistTaps="handled">
        {comments.isLoading ? <Loading /> : null}
        {!comments.isLoading && !list.length ? <Text style={{ color: C.muted, textAlign: 'center', paddingVertical: 30 }}>Bli först att kommentera.</Text> : null}
        {list.map((c) => (
          <Pressable
            key={c.id}
            style={s.comment}
            onLongPress={() => c.user && moderate(
              { user: c.user, commentId: c.id },
              c.user_id === userId || item.owner_id === userId ? [{ label: 'Ta bort kommentar', destructive: true, onPress: () => del.mutate(c.id) }] : undefined,
            )}
          >
            <Avatar profile={c.user} size={38} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.ink }}>
                {c.user?.handle ?? 'okänd'}
                <Text style={{ color: C.muted, fontWeight: '400' }}> · {c.user_id === item.owner_id ? 'Skapare · ' : ''}{timeAgo(c.created_at)}</Text>
              </Text>
              <Text style={[T.body, { marginTop: 3, marginBottom: 6 }]}>{c.body}</Text>
              <Pressable onPress={() => { setText(`@${c.user?.handle ?? ''} `); input.current?.focus(); }} hitSlop={6}>
                <Text style={{ fontSize: 13.5, color: C.muted }}>Svara</Text>
              </Pressable>
            </View>
          </Pressable>
        ))}
      </ScrollView>
      <View style={s.foot}>
        <TextInput ref={input} value={text} onChangeText={setText} onSubmitEditing={send} placeholder="Skriv en kommentar..." placeholderTextColor="#9d9a94" style={s.input} returnKeyType="send" maxLength={500} />
        <Pressable style={[s.sendRound, add.isPending && { opacity: 0.5 }]} onPress={send} disabled={add.isPending} accessibilityLabel="Skicka"><Icon name="send" size={16} color="#fff" /></Pressable>
      </View>
    </Sheet>
  );
}

export function DetailsSheet({ it, visible, onClose, onBid, onMessage }: { it: Item; visible: boolean; onClose: () => void; onBid: () => void; onMessage: () => void }) {
  const { userId } = useAuth();
  const own = it.owner_id === userId;
  return (
    <Sheet visible={visible} onClose={onClose}>
      <ScrollView contentContainerStyle={{ padding: 18 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
          <Text style={[s.h2, { flex: 1 }]}>{it.title}</Text><Text style={s.h2}>{kr(it.price ?? 0)}</Text>
        </View>
        <Text style={[T.upper, { fontSize: 13 }]}>{it.brand}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 16 }}>
          {it.size ? <Chip label={`Storlek ${it.size}`} style={{ borderRadius: 6 }} /> : null}
          {it.condition ? <Chip label={it.condition} style={{ borderRadius: 6 }} /> : null}
          {it.shipping ? <Chip label={it.shipping} style={{ borderRadius: 6 }} /> : null}
          {it.pickup ? <Chip label="Kan hämtas" style={{ borderRadius: 6 }} /> : null}
        </View>
        {it.caption ? (
          <>
            <Text style={[T.upper, { marginBottom: 4 }]}>Beskrivning</Text>
            <Text style={[T.body, { marginBottom: 16 }]}>{it.caption}</Text>
          </>
        ) : null}
        <Text style={[T.small, { marginBottom: 6 }]}>Upplagd {timeAgo(it.created_at)} av @{it.owner?.handle}</Text>
        <Text style={[T.small, { lineHeight: 19 }]}>Betalning och frakt gör ni upp direkt med varandra, t.ex. via Swish. Möts gärna upp eller använd spårbar frakt.</Text>
      </ScrollView>
      {!own ? (
        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 18, paddingTop: 8 }}>
          <Btn title="Meddelande" variant="ghost" style={{ flex: 1 }} onPress={onMessage} />
          <Btn title={it.sold ? 'Såld' : 'Lägg bud'} style={{ flex: 1 }} disabled={it.sold} onPress={onBid} />
        </View>
      ) : null}
    </Sheet>
  );
}

type BidProps = { price: number; label: string; visible: boolean; onClose: () => void; onSend: (amount: number) => Promise<void>; title?: string; cta?: string; initial?: number };
export function BidSheet({ price, label, visible, onClose, onSend, title = 'Lägg bud', cta = 'Skicka bud', initial }: BidProps) {
  const suggestions = [0.8, 0.9, 1].map((f) => Math.round((price * f) / 10) * 10);
  const [amount, setAmount] = useState(String(initial ?? suggestions[1]));
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (visible) setAmount(String(initial ?? suggestions[1])); }, [visible]);
  const v = parseInt(amount.replace(/\D/g, ''), 10) || 0;
  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      <View style={{ padding: 18, alignItems: 'center' }}>
        <Text style={T.small}>{label} · utropspris {kr(price)}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginVertical: 10 }}>
          <TextInput value={amount} onChangeText={setAmount} keyboardType="number-pad" style={s.bidInput} accessibilityLabel="Belopp" selectTextOnFocus maxLength={7} />
          <Text style={{ fontSize: 28, fontWeight: '600', color: C.ink }}>kr</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 18 }}>
          {suggestions.map((q) => (
            <Pressable key={q} onPress={() => setAmount(String(q))} style={[s.quick, v === q && { borderColor: C.ink }]}>
              <Text style={{ fontSize: 15, color: C.ink }}>{kr(q)}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={[T.small, { textAlign: 'center', marginBottom: 16 }]}>Budet är bindande om det accepteras. Betalning görs direkt mellan er.</Text>
        <Btn
          title={cta}
          loading={busy}
          style={{ alignSelf: 'stretch', paddingVertical: 16 }}
          disabled={!v}
          onPress={async () => {
            setBusy(true);
            try { await onSend(v); onClose(); } catch (e) { toast(errorText(e)); } finally { setBusy(false); }
          }}
        />
      </View>
    </Sheet>
  );
}

export function ReviewSheet({ visible, onClose, onSend, sellerName }: { visible: boolean; onClose: () => void; onSend: (stars: number, body: string) => Promise<void>; sellerName: string }) {
  const [stars, setStars] = useState(5);
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <Sheet visible={visible} onClose={onClose} title={`Omdöme om ${sellerName}`}>
      <View style={{ padding: 18, gap: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable key={n} onPress={() => setStars(n)} hitSlop={6} accessibilityLabel={`${n} stjärnor`}>
              <Text style={{ fontSize: 34, color: n <= stars ? C.star : '#d6d3cd' }}>★</Text>
            </Pressable>
          ))}
        </View>
        <TextInput value={body} onChangeText={setBody} placeholder="Hur gick affären?" placeholderTextColor="#9d9a94" multiline maxLength={500} style={[s.input, { borderRadius: 10, minHeight: 90, textAlignVertical: 'top' }]} />
        <Btn title="Skicka omdöme" loading={busy} onPress={async () => {
          setBusy(true);
          try { await onSend(stars, body.trim()); onClose(); toast('Tack för ditt omdöme!'); } catch (e) { toast(errorText(e)); } finally { setBusy(false); }
        }} />
      </View>
    </Sheet>
  );
}

const s = StyleSheet.create({
  tile: { borderRadius: 6, overflow: 'hidden', backgroundColor: C.chip },
  badge: { position: 'absolute', top: 9, left: 7, backgroundColor: '#fff', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12 },
  handle: { position: 'absolute', left: 8, right: 8, bottom: 7, color: '#fff', fontSize: 13.5, textShadowColor: 'rgba(0,0,0,.5)', textShadowRadius: 6 },
  comment: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  foot: { flexDirection: 'row', gap: 10, alignItems: 'center', paddingHorizontal: 18, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.line },
  input: { flex: 1, backgroundColor: C.chip, borderRadius: 999, paddingVertical: 13, paddingHorizontal: 18, fontSize: 15.5, color: C.ink },
  sendRound: { width: 46, height: 46, borderRadius: 23, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' },
  h2: { fontSize: 21, fontWeight: '600', color: C.ink, marginBottom: 2 },
  bidInput: { width: 190, height: 60, fontSize: 46, fontWeight: '600', textAlign: 'right', color: C.ink, padding: 0 },
  quick: { backgroundColor: C.chip, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 13, borderWidth: 1, borderColor: 'transparent' },
});
