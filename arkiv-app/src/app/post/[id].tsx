import { Redirect, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '../../components/Icon';
import { CommentsSheet, Hero } from '../../components/items';
import { Chip } from '../../components/ui';
import { useStore } from '../../store';
import { C, T } from '../../theme';

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace('.', ',').replace(',0', '')}K` : String(n));

export default function PostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, item, toggleLike, toggleSave, toast } = useStore();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [comments, setComments] = useState(false);
  const it = item(id);
  if (!it || it.kind !== 'post') return <Redirect href="/" />;
  const liked = !!state.liked[it.id];
  const saved = !!state.saved[it.id];
  const nComments = (state.comments[it.id]?.length ?? 0) + 34;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView bounces={false} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        <Hero it={it} height={Math.round(height * 0.74)} />
        <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
          <View style={styles.row}>
            <Chip label="Inlägg" />
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <Pressable style={styles.action} onPress={() => toggleLike(it.id)} accessibilityLabel="Gilla">
                <Icon name="heart" filled={liked} color={liked ? '#c0392b' : C.ink} />
                <Text style={styles.actionText}>{fmt(it.likes + (liked ? 1 : 0))}</Text>
              </Pressable>
              <Pressable style={styles.action} onPress={() => { toggleSave(it.id); toast(saved ? 'Borttaget från sparade' : 'Sparat i din samling'); }} accessibilityLabel="Spara">
                <Icon name="bookmark" filled={saved} />
                <Text style={styles.actionText}>{fmt(it.saves + (saved ? 1 : 0))}</Text>
              </Pressable>
            </View>
          </View>
          <Text style={[T.body, { fontSize: 15.5, marginBottom: 6 }]}>{it.caption}</Text>
          <View style={styles.row}>
            <Pressable onPress={() => setComments(true)} hitSlop={6}><Text style={T.small}>Visa alla {nComments} kommentarer</Text></Pressable>
            <Text style={T.small}>{it.time}</Text>
          </View>
        </View>
      </ScrollView>
      <CommentsSheet id={it.id} visible={comments} onClose={() => setComments(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  actionText: { fontWeight: '600', fontSize: 15, color: C.ink },
});
