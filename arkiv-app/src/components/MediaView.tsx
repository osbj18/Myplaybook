import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { publicUrl } from '../lib/supabase';
import type { Media } from '../lib/types';
import { Icon } from './Icon';
import { Img } from './ui';

/**
 * Visar en bild eller en video. Videor spelas automatiskt, ljudlöst och i loop
 * när `active` är sant – så att man direkt ser att det är en video i flödet.
 */
export function MediaView({ media, style, active = true, soundToggle = false }: { media: Media; style?: StyleProp<ViewStyle>; active?: boolean; soundToggle?: boolean }) {
  if (media.type !== 'video') return <Img path={media.path} style={[StyleSheet.absoluteFill, style as object]} />;
  return <AutoVideo media={media} style={style} active={active} soundToggle={soundToggle} />;
}

function AutoVideo({ media, style, active, soundToggle }: { media: Media; style?: StyleProp<ViewStyle>; active: boolean; soundToggle: boolean }) {
  const [muted, setMuted] = useState(true);
  const player = useVideoPlayer(publicUrl(media.path) ?? null, (p) => {
    p.loop = true;
    p.muted = true;
  });
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  useEffect(() => {
    if (active) player.play();
    else player.pause();
  }, [active, player]);

  useEffect(() => { player.muted = muted; }, [muted, player]);

  return (
    <View style={[StyleSheet.absoluteFill, style]}>
      {media.poster ? <Img path={media.poster} style={StyleSheet.absoluteFill} /> : <View style={[StyleSheet.absoluteFill, { backgroundColor: '#1a1a1a' }]} />}
      <VideoView
        player={player}
        style={[StyleSheet.absoluteFill, { opacity: isPlaying ? 1 : 0 }]}
        contentFit="cover"
        nativeControls={false}
        allowsPictureInPicture={false}
        pointerEvents="none"
      />
      {soundToggle ? (
        <Pressable onPress={() => setMuted((m) => !m)} style={styles.sound} accessibilityLabel={muted ? 'Slå på ljud' : 'Stäng av ljud'} hitSlop={8}>
          <Icon name={muted ? 'soundOff' : 'soundOn'} size={18} color="#fff" />
        </Pressable>
      ) : null}
    </View>
  );
}

/** Liten markering i hörnet på rutor som innehåller video. */
export function VideoBadge() {
  return (
    <View style={styles.badge} pointerEvents="none">
      <Icon name="play" size={12} color="#fff" />
    </View>
  );
}

const styles = StyleSheet.create({
  sound: { position: 'absolute', right: 14, bottom: 70, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,.45)', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 9, right: 9, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(0,0,0,.45)', alignItems: 'center', justifyContent: 'center', paddingLeft: 2 },
});
