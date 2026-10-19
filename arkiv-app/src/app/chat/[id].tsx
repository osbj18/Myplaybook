import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { ScrollViewInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '../../components/Icon';
import { BidSheet, ReviewSheet } from '../../components/items';
import { Avatar, BackBtn, Btn, Empty, IconBtn, Img, Loading, Sheet, useModeration } from '../../components/ui';
import { clock, kr, useChatActions, useMessages, useMyBlocks, useMyReview, useThreads } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { errorText, toast } from '../../lib/toast';
import type { Message } from '../../lib/types';
import { C } from '../../theme';

export default function Chat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userId } = useAuth();
  const insets = useSafeAreaInsets();
  const moderate = useModeration();
  const threads = useThreads();
  const messages = useMessages(id);
  const blocks = useMyBlocks();
  const myReview = useMyReview(id);
  const actions = useChatActions(id);
  const scroll = useRef<ScrollViewInstance>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [answering, setAnswering] = useState<Message | null>(null);
  const [bidMode, setBidMode] = useState<'counter' | 'bid' | null>(null);
  const [counterFor, setCounterFor] = useState<Message | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  const t = threads.data?.find((x) => x.id === id);
  const msgs = messages.data ?? [];

  useEffect(() => { if (userId && msgs.length) actions.markRead(userId); }, [msgs.length, userId]);

  if (threads.isLoading || messages.isLoading) return <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top }}><Loading /></View>;
  if (!t) return <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top }}><BackBtn /><Empty title="Konversationen finns inte" /></View>;

  const iAmBuyer = t.buyer_id === userId;
  const other = iAmBuyer ? t.seller : t.buyer;
  const it = t.item;
  const blocked = !!other && !!blocks.data?.has(other.id);
  const dealDone = msgs.some((m) => m.offer_state === 'accepted');
  const canReview = iAmBuyer && dealDone && !myReview.data && !myReview.isLoading;

  const send = async () => {
    const v = text.trim();
    if (!v || sending) return;
    setSending(true);
    try { await actions.send(v); setText(''); } catch (e) { toast(errorText(e)); } finally { setSending(false); }
  };

  const answer = async (m: Message, action: 'accept' | 'decline' | 'counter', amount?: number) => {
    try {
      await actions.answer(m.id, action, amount);
      if (action === 'accept') toast('Affären är klar!');
    } catch (e) { toast(errorText(e)); }
  };

  const offerAction = (m: Message) => {
    const mine = m.sender_id === userId;
    if (m.offer_state === 'open' && !mine) return <Btn small title="Svara" onPress={() => setAnswering(m)} />;
    const label = { open: 'Väntar…', accepted: 'Accepterat ✓', declined: 'Avböjt', countered: 'Motbud gavs' }[m.offer_state ?? 'open'];
    return <Text style={styles.state}>{label}</Text>;
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top }}>
      <View style={styles.head}>
        <BackBtn />
        <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }} onPress={() => other && router.push(`/user/${other.id}`)}>
          <Avatar profile={other} size={44} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.name} numberOfLines={1}>{other?.name ?? 'Raderat konto'}</Text>
            <Text style={{ color: C.muted, fontSize: 14 }} numberOfLines={1}>{other ? `@${other.handle}` : ''}</Text>
          </View>
        </Pressable>
        {it ? (
          <Pressable style={styles.item} onPress={() => router.push(`/item/${it.id}`)}>
            <Img path={it.media[0]?.poster ?? it.media[0]?.path} style={{ width: 42, height: 42, borderRadius: 4 }} />
            <View style={{ maxWidth: 100 }}>
              <Text style={{ fontSize: 12, color: C.ink }} numberOfLines={1}>{it.title}</Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: C.ink }}>{it.sold ? 'Såld' : kr(it.price ?? 0)}</Text>
            </View>
          </Pressable>
        ) : null}
        {other ? <IconBtn label="Fler val" onPress={() => moderate({ user: other })}><Icon name="dots" /></IconBtn> : null}
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView ref={scroll} contentContainerStyle={{ padding: 16, paddingTop: 22, flexGrow: 1 }} onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: false })} keyboardDismissMode="interactive">
          {!msgs.length ? (
            <Text style={{ color: C.muted, textAlign: 'center', marginTop: 30 }}>{it ? `Fråga om ${it.title} eller lägg ett bud.` : 'Säg hej!'}</Text>
          ) : null}
          {msgs.map((m) => m.system ? (
            <View key={m.id} style={styles.system}><Text style={{ fontSize: 13, color: C.soft }}>{m.body}</Text></View>
          ) : (
            <View key={m.id} style={[styles.msg, m.sender_id === userId ? { alignSelf: 'flex-end', alignItems: 'flex-end' } : { alignSelf: 'flex-start' }]}>
              {m.offer_kind ? (
                <View style={[styles.bubble, styles.offer]}>
                  <View>
                    <Text style={{ fontSize: 13, color: C.ink }}>{m.offer_kind}</Text>
                    <Text style={{ fontSize: 22, fontWeight: '700', color: C.ink }}>{kr(m.offer_amount ?? 0)}</Text>
                  </View>
                  {offerAction(m)}
                </View>
              ) : (
                <View style={[styles.bubble, m.sender_id === userId && styles.mine]}>
                  <Text style={{ fontSize: 15, lineHeight: 21, color: C.ink }}>{m.body}</Text>
                </View>
              )}
              <Text style={styles.time}>{clock(m.created_at)}</Text>
            </View>
          ))}
          {dealDone ? (
            <Text style={{ color: C.soft, fontSize: 13, textAlign: 'center', marginBottom: 14, lineHeight: 19 }}>
              Gör upp betalning och leverans här i chatten, t.ex. Swish vid upphämtning.
            </Text>
          ) : null}
          {canReview ? <Btn title={`Lämna omdöme om ${other?.name ?? 'säljaren'}`} variant="ghost" onPress={() => setReviewOpen(true)} style={{ alignSelf: 'center' }} small /> : null}
        </ScrollView>
        {blocked ? (
          <View style={[styles.foot, { paddingBottom: Math.max(insets.bottom, 12) }]}><Text style={{ color: C.muted, flex: 1, textAlign: 'center' }}>Du har blockerat {other?.name}.</Text></View>
        ) : (
          <View style={[styles.foot, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            {it && iAmBuyer && !it.sold ? (
              <Pressable style={styles.plus} accessibilityLabel="Lägg bud" onPress={() => setBidMode('bid')}>
                <Text style={{ fontSize: 18, lineHeight: 20, color: C.ink }}>+</Text>
              </Pressable>
            ) : null}
            <TextInput value={text} onChangeText={setText} onSubmitEditing={send} placeholder="Skriv ett meddelande..." placeholderTextColor="#9d9a94" style={styles.input} returnKeyType="send" maxLength={2000} />
            <IconBtn label="Skicka" onPress={send}><Icon name="send" size={20} color={sending ? C.muted : C.ink} /></IconBtn>
          </View>
        )}
      </KeyboardAvoidingView>

      <Sheet visible={!!answering} onClose={() => setAnswering(null)} title={answering ? `${answering.offer_kind} på ${kr(answering.offer_amount ?? 0)}` : ''}>
        {answering && it ? (
          <View style={{ padding: 18, gap: 10 }}>
            <Text style={{ textAlign: 'center', color: C.muted, fontSize: 14, marginBottom: 8 }}>{it.title} · utropspris {kr(it.price ?? 0)}</Text>
            <Btn title={`Acceptera ${kr(answering.offer_amount ?? 0)}`} onPress={() => { const m = answering; setAnswering(null); answer(m, 'accept'); }} />
            <Btn title="Ge motbud" variant="ghost" onPress={() => { const m = answering; setAnswering(null); setTimeout(() => { setCounterFor(m); setBidMode('counter'); }, 350); }} />
            <Btn title="Avböj" variant="ghost" onPress={() => { const m = answering; setAnswering(null); answer(m, 'decline'); }} />
          </View>
        ) : null}
      </Sheet>

      {it ? (
        <BidSheet
          price={it.price ?? 0}
          label={`${it.title} · ${it.brand}`}
          visible={!!bidMode}
          title={bidMode === 'counter' ? 'Ge motbud' : 'Lägg bud'}
          cta={bidMode === 'counter' ? 'Skicka motbud' : 'Skicka bud'}
          initial={bidMode === 'counter' && counterFor ? Math.round(((counterFor.offer_amount ?? 0) + (it.price ?? 0)) / 20) * 10 : undefined}
          onClose={() => { setBidMode(null); setCounterFor(null); }}
          onSend={async (v) => {
            if (bidMode === 'counter' && counterFor) await actions.answer(counterFor.id, 'counter', v);
            else await actions.offer(v);
          }}
        />
      ) : null}
      {t.seller ? (
        <ReviewSheet visible={reviewOpen} onClose={() => setReviewOpen(false)} sellerName={t.seller.name} onSend={(stars, body) => actions.review(t.seller_id, stars, body)} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingTop: 4, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.line },
  name: { fontSize: 17, fontWeight: '600', color: C.ink },
  item: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  msg: { maxWidth: '78%', marginBottom: 18 },
  bubble: { backgroundColor: C.chip, borderRadius: 10, paddingVertical: 11, paddingHorizontal: 14 },
  mine: { backgroundColor: '#e3e0d9' },
  offer: { flexDirection: 'row', alignItems: 'center', gap: 26 },
  state: { fontSize: 13, fontWeight: '600', color: C.soft },
  time: { fontSize: 12, color: C.muted, marginTop: 5 },
  system: { alignSelf: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: C.line, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 14, marginBottom: 18 },
  foot: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.line },
  plus: { width: 30, height: 30, borderRadius: 15, borderWidth: 1.6, borderColor: C.ink, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, backgroundColor: C.chip, borderRadius: 999, paddingVertical: 12, paddingHorizontal: 18, fontSize: 15.5, color: C.ink },
});
