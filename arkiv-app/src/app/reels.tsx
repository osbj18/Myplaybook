import { useEvent } from 'expo';
import { router, useIsFocused, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '../components/Icon';
import { CommentsSheet } from '../components/items';
import { getReelQueue } from '../components/Mosaic';
import { Avatar, IconBtn, Img, goBack, useModeration } from '../components/ui';
import { countOf, kr, useItem, useMyFollows, useMyLikes, useMySaves, useToggleFollow, useToggleLike, useToggleSave } from '../lib/api';
import { useAuth } from '../lib/auth';
import { publicUrl } from '../lib/supabase';
import { toast } from '../lib/toast';
import type { Item } from '../lib/types';

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace('.', ',').replace(',0', '')}K` : String(n));

function Reel({ it, active, height, onComments }: { it: Item; active: boolean; height: number; onComments: () => void }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();
  const likes = useMyLikes();
  const saves = useMySaves();
  const follows = useMyFollows();
  const toggleLike = useToggleLike();
  const toggleSave = useToggleSave();
  const toggleFollow = useToggleFollow();
  const moderate = useModeration();
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const media = it.media[0];

  const player = useVideoPlayer(publicUrl(media.path) ?? null, (p) => { p.loop = true; });
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  useEffect(() => {
    if (active && !paused) player.play();
    else player.pause();
  }, [active, paused, player]);
  useEffect(() => { if (!active) { setPaused(false); player.currentTime = 0; } }, [active, player]);
  useEffect(() => { player.muted = muted; }, [muted, player]);

  const liked = !!likes.data?.has(it.id);
  const likedAtStart = useRef<boolean | null>(null);
  if (likedAtStart.current === null && likes.data) likedAtStart.current = liked;
  const saved = !!saves.data?.has(it.id);
  const following = !!follows.data?.has(it.owner_id);
  const own = it.owner_id === userId;

  return (
    <View style={{ width, height, backgroundColor: '#000' }}>
      {media.poster ? <Img path={media.poster} style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]} /> : null}
      <View style={[StyleSheet.absoluteFill, { opacity: isPlaying || paused ? 1 : 0 }]} pointerEvents="none">
        <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} allowsPictureInPicture={false} />
      </View>
      <Pressable style={StyleSheet.absoluteFill} onPress={() => setPaused((p) => !p)} onLongPress={() => setMuted((m) => !m)} accessibilityLabel={paused ? 'Spela' : 'Pausa'} />
      {paused ? <View style={styles.center} pointerEvents="none"><View style={styles.bigPlay}><Icon name="play" size={34} color="#fff" /></View></View> : null}
      {[300, 200, 110].map((h) => <View key={h} style={[styles.shade, { height: h }]} pointerEvents="none" />)}

      <View style={[styles.side, { bottom: insets.bottom + 30 }]}>
        <Pressable style={styles.sideBtn} onPress={() => toggleLike.mutate({ id: it.id, on: !liked })} accessibilityLabel={liked ? 'Sluta gilla' : 'Gilla'}>
          <Icon name="heart" size={30} color={liked ? '#ff3b4f' : '#fff'} filled={liked} />
          <Text style={styles.sideText}>{fmt(countOf(it.likes) + (liked ? 1 : 0) - (likedAtStart.current ? 1 : 0))}</Text>
        </Pressable>
        <Pressable style={styles.sideBtn} onPress={onComments} accessibilityLabel="Kommentarer">
          <Icon name="chat" size={28} color="#fff" />
          <Text style={styles.sideText}>{fmt(countOf(it.comments))}</Text>
        </Pressable>
        <Pressable style={styles.sideBtn} onPress={() => { toggleSave.mutate({ id: it.id, on: !saved }); toast(saved ? 'Borttaget från sparade' : 'Sparat'); }} accessibilityLabel="Spara">
          <Icon name="bookmark" size={28} color="#fff" filled={saved} />
        </Pressable>
        <Pressable style={styles.sideBtn} onPress={() => setMuted((m) => !m)} accessibilityLabel={muted ? 'Slå på ljud' : 'Stäng av ljud'}>
          <Icon name={muted ? 'soundOff' : 'soundOn'} size={26} color="#fff" />
        </Pressable>
        {it.owner ? (
          <Pressable style={styles.sideBtn} onPress={() => moderate({ user: it.owner!, itemId: it.id })} accessibilityLabel="Fler val">
            <Icon name="dots" size={26} color="#fff" />
          </Pressable>
        ) : null}
      </View>

      <View style={[styles.info, { bottom: insets.bottom + 24 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 }} onPress={() => router.push(`/user/${it.owner_id}`)}>
            <Avatar profile={it.owner} size={34} ring />
            <Text style={styles.handle} numberOfLines={1}>{it.owner?.handle}</Text>
          </Pressable>
          {!own && !following ? (
            <Pressable style={styles.follow} onPress={() => { toggleFollow.mutate({ id: it.owner_id, on: true }); toast(`Du följer ${it.owner?.name ?? ''}`); }}>
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>Följ</Text>
            </Pressable>
          ) : null}
        </View>
        {it.caption ? <Text style={styles.caption} numberOfLines={3}>{it.caption}</Text> : null}
        {it.kind === 'sale' ? (
          <Pressable style={styles.sale} onPress={() => router.push(`/item/${it.id}`)}>
            <Text style={{ fontWeight: '700', fontSize: 14, color: '#111' }}>{it.sold ? 'Såld' : `${it.title} · ${kr(it.price ?? 0)}`}</Text>
            {!it.sold ? <Text style={{ fontSize: 14, color: '#111' }}>Lägg bud ›</Text> : null}
          </Pressable>
        ) : (
          <Pressable onPress={() => router.push(`/item/${it.id}`)} hitSlop={6}><Text style={styles.more}>Visa inlägget ›</Text></Pressable>
        )}
      </View>
    </View>
  );
}

export default function Reels() {
  const { start } = useLocalSearchParams<{ start: string }>();
  const win = useWindowDimensions();
  const [height, setHeight] = useState(win.height);
  const insets = useSafeAreaInsets();
  const focused = useIsFocused();
  const fallback = useItem(start);
  const queue = useMemo(() => {
    const q = getReelQueue();
    if (q.length) {
      const i = Math.max(0, q.findIndex((x) => x.id === start));
      return [...q.slice(i), ...q.slice(0, i)];
    }
    return fallback.data ? [fallback.data] : [];
  }, [start, fallback.data]);
  const [index, setIndex] = useState(0);
  const [comments, setComments] = useState<Item | null>(null);
  const onViewable = useRef(({ viewableItems }: { viewableItems: { index?: number | null }[] }) => {
    const first = viewableItems[0]?.index;
    if (first != null) setIndex(first);
  }).current;

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }} onLayout={(e) => setHeight(e.nativeEvent.layout.height)}>
      <StatusBar style="light" />
      <FlatList
        key={height}
        data={queue}
        keyExtractor={(x) => x.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        decelerationRate="fast"
        getItemLayout={(_, i) => ({ length: height, offset: height * i, index: i })}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={{ itemVisiblePercentThreshold: 70 }}
        windowSize={3}
        renderItem={({ item, index: i }) => <Reel it={item} active={focused && i === index && !comments} height={height} onComments={() => setComments(item)} />}
      />
      <View style={[styles.top, { top: insets.top + 6 }]}>
        <IconBtn label="Tillbaka" onPress={goBack}><Icon name="back" color="#fff" size={26} /></IconBtn>
        <Text style={styles.title}>Videor</Text>
        <View style={{ width: 32 }} />
      </View>
      {comments ? <CommentsSheet item={comments} visible={!!comments} onClose={() => setComments(null)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  top: { position: 'absolute', left: 12, right: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: '#fff', fontSize: 18, fontWeight: '700', textShadowColor: 'rgba(0,0,0,.4)', textShadowRadius: 6 },
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  bigPlay: { width: 76, height: 76, borderRadius: 38, backgroundColor: 'rgba(0,0,0,.35)', alignItems: 'center', justifyContent: 'center', paddingLeft: 5 },
  shade: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,.11)' },
  side: { position: 'absolute', right: 10, alignItems: 'center', gap: 22 },
  sideBtn: { alignItems: 'center', gap: 4 },
  sideText: { color: '#fff', fontSize: 13, fontWeight: '600', textShadowColor: 'rgba(0,0,0,.5)', textShadowRadius: 4 },
  info: { position: 'absolute', left: 14, right: 72, gap: 10 },
  handle: { color: '#fff', fontWeight: '700', fontSize: 15, textShadowColor: 'rgba(0,0,0,.5)', textShadowRadius: 4, flexShrink: 1 },
  follow: { borderWidth: 1, borderColor: 'rgba(255,255,255,.8)', borderRadius: 8, paddingVertical: 5, paddingHorizontal: 12 },
  caption: { color: '#fff', fontSize: 14.5, lineHeight: 20, textShadowColor: 'rgba(0,0,0,.5)', textShadowRadius: 4 },
  sale: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,.94)', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 },
  more: { color: '#fff', fontWeight: '600', fontSize: 14, textShadowColor: 'rgba(0,0,0,.5)', textShadowRadius: 4 },
});
