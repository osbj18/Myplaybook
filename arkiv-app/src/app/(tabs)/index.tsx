import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '../../components/Icon';
import { FeedTile } from '../../components/items';
import { Avatar, IconBtn, Img, Logo, TopBar } from '../../components/ui';
import { FAVORITES, type Item } from '../../data/seed';
import { useStore } from '../../store';
import { C, T } from '../../theme';

function Story({ index, onClose }: { index: number | null; onClose: () => void }) {
  const { markStory } = useStore();
  const [i, setI] = useState(index);
  const p = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  useEffect(() => setI(index), [index]);
  useEffect(() => {
    if (i === null) return;
    markStory(FAVORITES[i].user);
    p.setValue(0);
    const a = Animated.timing(p, { toValue: 1, duration: 4000, useNativeDriver: false });
    a.start(({ finished }) => { if (finished) next(); });
    return () => a.stop();
  }, [i]);
  const next = () => setI((cur) => { if (cur === null || cur + 1 >= FAVORITES.length) { onClose(); return null; } return cur + 1; });
  if (i === null) return null;
  const f = FAVORITES[i];
  return (
    <Modal visible animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={{ flex: 1, backgroundColor: '#000' }} onPress={next}>
        <Img source={f.story} style={StyleSheet.absoluteFill} />
        <View style={[styles.progress, { top: insets.top + 8 }]}>
          <Animated.View style={{ height: 3, backgroundColor: '#fff', width: p.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />
        </View>
        <Pressable style={[styles.storyWho, { top: insets.top + 22 }]} onPress={() => { onClose(); router.push(`/user/${f.user}`); }}>
          <Avatar handle={f.user} size={30} ring />
          <Text style={styles.storyName}>{f.user}</Text>
        </Pressable>
        <IconBtn label="Stäng" onPress={onClose} style={{ position: 'absolute', right: 14, top: insets.top + 20 }}><Icon name="close" color="#fff" size={20} /></IconBtn>
      </Pressable>
    </Modal>
  );
}

export default function Home() {
  const { state, item } = useStore();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [story, setStory] = useState<number | null>(null);
  const tileW = (width - 36 - 7) / 2;
  const feed = state.feed.map(item).filter((x): x is Item => !!x && !state.blocked[x.owner]);

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: C.bg }}>
      <TopBar
        left={<Pressable style={styles.post} onPress={() => router.push('/camera')}><Text style={{ fontSize: 15, color: C.ink }}>Lägg ut</Text></Pressable>}
        center={<Logo />}
        right={<IconBtn label="Meddelanden" onPress={() => router.navigate('/messages')}><Icon name="chat" /></IconBtn>}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 18 }} showsVerticalScrollIndicator={false}>
        <Text style={[T.label, { marginHorizontal: 18, marginTop: 6, marginBottom: 14 }]}>FAVORITER</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 18, gap: 9 }}>
          {FAVORITES.filter((f) => !state.blocked[f.user]).map((f) => (
            <Pressable key={f.user} style={{ width: 82 }} onPress={() => setStory(FAVORITES.indexOf(f))} accessibilityLabel={`Story från ${f.user}`}>
              <Img source={f.img} style={[styles.fav, state.seenStories[f.user] && { opacity: 0.6 }]} />
              <Text numberOfLines={1} style={styles.favName}>{f.user}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <View style={styles.rowBetween}>
          <Text style={T.label}>FÖLJER</Text>
          <Pressable onPress={() => router.navigate('/explore')} hitSlop={8}><Text style={styles.seeAll}>SE ALLA ›</Text></Pressable>
        </View>
        <View style={styles.grid}>
          {feed.map((it) => <FeedTile key={it.id} it={it} width={tileW} />)}
        </View>
      </ScrollView>
      <Story index={story} onClose={() => setStory(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  post: { backgroundColor: C.chip, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 16 },
  fav: { width: 82, height: 137, borderRadius: 6, marginBottom: 7 },
  favName: { fontSize: 12, color: '#333', textAlign: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 18, marginTop: 26, marginBottom: 14 },
  seeAll: { color: C.accent, fontSize: 13, fontWeight: '600', letterSpacing: 1.8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, paddingHorizontal: 18 },
  progress: { position: 'absolute', left: 14, right: 14, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,.35)', overflow: 'hidden' },
  storyWho: { position: 'absolute', left: 16, flexDirection: 'row', alignItems: 'center', gap: 9 },
  storyName: { color: '#fff', fontWeight: '600', fontSize: 15, textShadowColor: 'rgba(0,0,0,.5)', textShadowRadius: 6 },
});
