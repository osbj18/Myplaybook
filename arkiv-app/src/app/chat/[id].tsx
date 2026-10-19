import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { ScrollViewInstance, TextInputInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '../../components/Icon';
import { BidSheet } from '../../components/items';
import { Avatar, BackBtn, Btn, IconBtn, Img, Sheet, useModeration } from '../../components/ui';
import type { Message, Sale } from '../../data/seed';
import { kr, useStore } from '../../store';
import { C } from '../../theme';

export default function Chat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = useStore();
  const { state, user, item, markRead, sendMessage, acceptOffer, answerBid, placeBid, toast } = store;
  const insets = useSafeAreaInsets();
  const moderate = useModeration();
  const scroll = useRef<ScrollViewInstance>(null);
  const [text, setText] = useState('');
  const [answering, setAnswering] = useState<Message | null>(null);
  const [bidMode, setBidMode] = useState<'counter' | 'bid' | null>(null);
  const [counterFor, setCounterFor] = useState<Message | null>(null);
  const t = state.threads.find((x) => x.id === id);

  useEffect(() => { if (t?.unread) markRead(t.id); }, [t?.unread, t?.messages.length]);
  if (!t) return <Redirect href="/messages" />;

  const u = user(t.with);
  const it = item(t.item) as Sale | undefined;

  const send = () => {
    const v = text.trim();
    if (!v) return;
    sendMessage(t.id, v);
    setText('');
  };

  const offerAction = (m: Message) => {
    const o = m.offer!;
    if (o.state === 'open' && m.from === 'them') return <Btn small title="Svara" onPress={() => setAnswering(m)} />;
    if (o.state === 'agreed') return <Btn small title="Acceptera" onPress={() => { acceptOffer(t.id, m.id); toast('Affären är klar'); }} />;
    const label = { open: 'Väntar…', accepted: 'Accepterat ✓', declined: 'Avböjt', answered: 'Besvarat', agreed: '' }[o.state];
    return <Text style={styles.state}>{label}</Text>;
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top }}>
      <View style={styles.head}>
        <BackBtn />
        <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }} onPress={() => router.push(`/user/${t.with}`)}>
          <Avatar handle={t.with} size={44} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.name} numberOfLines={1}>{u.name}</Text>
            <Text style={{ color: C.muted, fontSize: 14 }}>{u.online ? 'Aktiv nu' : 'Aktiv idag'}</Text>
          </View>
        </Pressable>
        {it ? (
          <Pressable style={styles.item} onPress={() => router.push(`/listing/${it.id}`)}>
            <Img source={it.thumb ?? it.images[0]} style={{ width: 42, height: 42, borderRadius: 4 }} />
            <View style={{ maxWidth: 110 }}>
              <Text style={{ fontSize: 12, color: C.ink }} numberOfLines={1}>{it.title} från {it.brand}</Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: C.ink }}>{kr(it.price)}</Text>
            </View>
          </Pressable>
        ) : (
          <IconBtn label="Fler val" onPress={() => moderate(t.with, 'profil')}><Icon name="dots" /></IconBtn>
        )}
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView ref={scroll} contentContainerStyle={{ padding: 16, paddingTop: 22 }} onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })} keyboardDismissMode="interactive">
          {t.messages.map((m) => m.system ? (
            <View key={m.id} style={styles.system}><Text style={{ fontSize: 13, color: C.soft }}>{m.system}</Text></View>
          ) : (
            <View key={m.id} style={[styles.msg, m.from === 'me' ? { alignSelf: 'flex-end', alignItems: 'flex-end' } : { alignSelf: 'flex-start' }]}>
              {m.offer ? (
                <View style={[styles.bubble, styles.offer]}>
                  <View>
                    <Text style={{ fontSize: 13, color: C.ink }}>{m.offer.kind}</Text>
                    <Text style={{ fontSize: 22, fontWeight: '700', color: C.ink }}>{kr(m.offer.amount)}</Text>
                  </View>
                  {offerAction(m)}
                </View>
              ) : (
                <View style={styles.bubble}><Text style={{ fontSize: 15, lineHeight: 21, color: C.ink }}>{m.text}</Text></View>
              )}
              <Text style={styles.time}>{m.time}</Text>
            </View>
          ))}
          {t.typing ? <Text style={{ color: C.muted, fontSize: 13 }}>skriver…</Text> : null}
        </ScrollView>
        <View style={[styles.foot, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <Pressable
            style={styles.plus}
            accessibilityLabel={it && t.role === 'seller' && !it.sold ? 'Lägg bud' : 'Fler val'}
            onPress={() => (it && t.role === 'seller' && !it.sold ? setBidMode('bid') : moderate(t.with, 'profil'))}
          >
            <Text style={{ fontSize: 18, lineHeight: 20, color: C.ink }}>+</Text>
          </Pressable>
          <TextInput value={text} onChangeText={setText} onSubmitEditing={send} placeholder="Skriv ett meddelande..." placeholderTextColor="#9d9a94" style={styles.input} returnKeyType="send" />
          <IconBtn label="Skicka" onPress={send}><Icon name="send" size={20} /></IconBtn>
        </View>
      </KeyboardAvoidingView>

      <Sheet visible={!!answering} onClose={() => setAnswering(null)} title={answering ? `Bud på ${kr(answering.offer!.amount)}` : ''}>
        {answering && it ? (
          <View style={{ padding: 18, gap: 10 }}>
            <Text style={{ textAlign: 'center', color: C.muted, fontSize: 14, marginBottom: 8 }}>{u.name} vill köpa {it.title} ({kr(it.price)})</Text>
            <Btn title={`Acceptera ${kr(answering.offer!.amount)}`} onPress={() => { answerBid(t.id, answering.id, 'accept'); setAnswering(null); toast('Bud accepterat'); }} />
            <Btn title="Ge motbud" variant="ghost" onPress={() => { const m = answering; setAnswering(null); setTimeout(() => { setCounterFor(m); setBidMode('counter'); }, 350); }} />
            <Btn title="Avböj" variant="ghost" onPress={() => { answerBid(t.id, answering.id, 'decline'); setAnswering(null); }} />
          </View>
        ) : null}
      </Sheet>

      {it ? (
        <BidSheet
          it={it}
          visible={!!bidMode}
          title={bidMode === 'counter' ? 'Ge motbud' : 'Lägg bud'}
          cta={bidMode === 'counter' ? 'Skicka motbud' : 'Skicka bud'}
          initial={bidMode === 'counter' && counterFor ? Math.round((counterFor.offer!.amount + it.price) / 20) * 10 : undefined}
          onClose={() => { setBidMode(null); setCounterFor(null); }}
          onSend={(v) => {
            if (bidMode === 'counter' && counterFor) answerBid(t.id, counterFor.id, { counter: v });
            else placeBid(it, v);
          }}
        />
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
  offer: { flexDirection: 'row', alignItems: 'center', gap: 26 },
  state: { fontSize: 13, fontWeight: '600', color: C.soft },
  time: { fontSize: 12, color: C.muted, marginTop: 5 },
  system: { alignSelf: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: C.line, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 14, marginBottom: 18 },
  foot: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.line },
  plus: { width: 30, height: 30, borderRadius: 15, borderWidth: 1.6, borderColor: C.ink, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, backgroundColor: C.chip, borderRadius: 999, paddingVertical: 12, paddingHorizontal: 18, fontSize: 15.5, color: C.ink },
});
