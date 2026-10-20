import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { kr } from '../lib/api';
import type { Item } from '../lib/types';
import { Icon } from './Icon';
import { MediaView } from './MediaView';

/**
 * Rutnät i stil med Instagram Utforska: tre kolumner kant till kant, där
 * videor blir höga rutor (två rader) som spelas automatiskt utan ljud.
 */

export const GAP = 2;
export type Block =
  | { key: string; kind: 'mosaic'; tall: Item; small: Item[]; tallLeft: boolean }
  | { key: string; kind: 'row'; items: Item[] };

const isVideo = (it: Item) => it.media[0]?.type === 'video';

/** Delar upp inläggen i block: en hög ruta + fyra små, omväxlande vänster/höger. */
export function buildBlocks(items: Item[]): Block[] {
  const pool = [...items];
  const out: Block[] = [];
  let tallLeft = false;
  while (pool.length >= 5) {
    const window = pool.slice(0, 7);
    const vi = window.findIndex(isVideo);
    if (vi === -1) {
      // Inga videor i närheten: en vanlig rad med tre.
      const row = pool.splice(0, 3);
      out.push({ key: row.map((x) => x.id).join('-'), kind: 'row', items: row });
      continue;
    }
    const [tall] = pool.splice(vi, 1);
    const small = pool.splice(0, 4);
    out.push({ key: `${tall.id}-${small.map((x) => x.id).join('-')}`, kind: 'mosaic', tall, small, tallLeft });
    tallLeft = !tallLeft;
  }
  for (let i = 0; i < pool.length; i += 3) {
    const row = pool.slice(i, i + 3);
    out.push({ key: row.map((x) => x.id).join('-'), kind: 'row', items: row });
  }
  return out;
}

export const blockItems = (b: Block) => (b.kind === 'mosaic' ? [b.tall, ...b.small] : b.items);

/** Öppnar en video i helskärm (Reels-läge), med resten av videorna i listan efter. */
let reelQueue: Item[] = [];
export const getReelQueue = () => reelQueue;
export function openTile(it: Item, all: Item[]) {
  if (isVideo(it)) {
    reelQueue = all.filter(isVideo);
    router.push({ pathname: '/reels', params: { start: it.id } });
  } else {
    router.push(`/item/${it.id}`);
  }
}

function Tile({ it, w, h, active, all }: { it: Item; w: number; h: number; active: boolean; all: Item[] }) {
  const first = it.media[0];
  const video = first?.type === 'video';
  return (
    <Pressable onPress={() => openTile(it, all)} style={{ width: w, height: h, backgroundColor: '#e6e3dd', overflow: 'hidden' }} accessibilityLabel={it.kind === 'sale' ? it.title ?? 'Plagg' : it.caption || (video ? 'Video' : 'Inlägg')}>
      {first ? <MediaView media={first} active={active} /> : null}
      {video ? <View style={styles.corner} pointerEvents="none"><Icon name="play" size={14} color="#fff" /></View> : null}
      {!video && it.media.length > 1 ? <View style={styles.corner} pointerEvents="none"><View style={styles.stack} /></View> : null}
      {it.kind === 'sale' ? (
        <View style={styles.price} pointerEvents="none">
          <Text style={styles.priceText}>{it.sold ? 'Såld' : kr(it.price ?? 0)}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function MosaicBlock({ block, width, visible, all }: { block: Block; width: number; visible: boolean; all: Item[] }) {
  const w = (width - GAP * 2) / 3;
  if (block.kind === 'row') {
    return (
      <View style={{ flexDirection: 'row', gap: GAP, marginBottom: GAP }}>
        {block.items.map((it) => <Tile key={it.id} it={it} w={w} h={w * 1.25} active={visible} all={all} />)}
      </View>
    );
  }
  const tall = <Tile it={block.tall} w={w} h={w * 2.5 + GAP} active={visible} all={all} />;
  const grid = (
    <View style={{ width: w * 2 + GAP, flexDirection: 'row', flexWrap: 'wrap', gap: GAP }}>
      {block.small.map((it) => <Tile key={it.id} it={it} w={w} h={w * 1.25} active={visible} all={all} />)}
    </View>
  );
  return (
    <View style={{ flexDirection: 'row', gap: GAP, marginBottom: GAP }}>
      {block.tallLeft ? tall : grid}
      {block.tallLeft ? grid : tall}
    </View>
  );
}

const styles = StyleSheet.create({
  corner: { position: 'absolute', top: 8, right: 8, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 3, shadowOffset: { width: 0, height: 0 } },
  stack: { width: 13, height: 13, borderRadius: 2, borderWidth: 2, borderColor: '#fff' },
  price: { position: 'absolute', left: 6, bottom: 6, backgroundColor: 'rgba(255,255,255,.92)', borderRadius: 999, paddingVertical: 3, paddingHorizontal: 9 },
  priceText: { fontSize: 12, fontWeight: '600', color: '#111' },
});
