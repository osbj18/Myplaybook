import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BidSheet, DetailsSheet, Hero } from '../../components/items';
import { Btn } from '../../components/ui';
import { ME } from '../../data/seed';
import { kr, useStore } from '../../store';
import { C, T } from '../../theme';

export default function ListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, item, placeBid, toast, deleteItem } = useStore();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [details, setDetails] = useState(false);
  const [bid, setBid] = useState(false);
  const it = item(id);
  if (!it || it.kind !== 'sale') return <Redirect href="/" />;
  const own = it.owner === ME;

  const onPrimary = () => {
    if (own) {
      const t = state.threads.find((x) => x.item === it.id);
      if (t) router.push(`/chat/${t.id}`);
      else toast('Inga bud ännu');
      return;
    }
    if (details) { setDetails(false); setTimeout(() => setBid(true), 350); }
    else setBid(true);
  };

  const remove = () => Alert.alert('Ta bort annonsen?', undefined, [
    { text: 'Avbryt', style: 'cancel' },
    { text: 'Ta bort', style: 'destructive', onPress: () => { router.back(); deleteItem(it.id); toast('Annonsen är borttagen'); } },
  ]);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView bounces={false} contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}>
        <Hero it={it} height={Math.round(height * 0.78)} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingTop: 20 }}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={{ fontSize: 21, fontWeight: '600', color: C.ink, marginBottom: 4 }} numberOfLines={1}>
              {it.title}  {kr(it.price)}
            </Text>
            <Pressable onPress={() => setDetails(true)} hitSlop={6}>
              <Text style={T.small}>{it.brand} · Storlek {it.size} · Detaljer ›</Text>
            </Pressable>
          </View>
          <Btn title={own ? 'Se bud' : it.sold ? 'Såld' : 'Lägg bud'} disabled={!own && it.sold} onPress={onPrimary} />
        </View>
        {own ? (
          <Pressable onPress={remove} style={{ paddingHorizontal: 18, paddingTop: 18 }}><Text style={{ color: '#b3261e', fontSize: 15 }}>Ta bort annons</Text></Pressable>
        ) : null}
      </ScrollView>
      <DetailsSheet it={it} visible={details} onClose={() => setDetails(false)} onBid={onPrimary} />
      <BidSheet
        it={it}
        visible={bid}
        onClose={() => setBid(false)}
        onSend={(amount) => {
          const threadId = placeBid(it, amount);
          toast('Bud skickat');
          router.push(`/chat/${threadId}`);
        }}
      />
    </View>
  );
}
