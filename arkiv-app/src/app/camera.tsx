import { CameraView, useCameraPermissions, useMicrophonePermissions, type CameraType } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '../components/Icon';
import { Btn, IconBtn, goBack } from '../components/ui';
import { MAX_VIDEO_SECONDS, pickFromLibrary, prepare, type LocalMedia } from '../lib/media';
import { errorText, toast } from '../lib/toast';
import type { Tag } from '../lib/types';
import { C } from '../theme';

const TYPES: [Tag, string][] = [['Inlägg', 'Inlägg'], ['Sälj', 'Sälj plagg'], ['OOTD', 'OOTD'], ['Review', 'Review']];

export default function Camera() {
  const insets = useSafeAreaInsets();
  const [cam, requestCam] = useCameraPermissions();
  const [mic, requestMic] = useMicrophonePermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [mode, setMode] = useState<'picture' | 'video'>('picture');
  const [tag, setTag] = useState<Tag>('Inlägg');
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [busy, setBusy] = useState(false);
  const ref = useRef<CameraView>(null);

  useEffect(() => {
    if (!recording) { setSeconds(0); return; }
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  const goCompose = (media: LocalMedia[]) => {
    router.replace({ pathname: '/compose', params: { media: JSON.stringify(media), tag } });
  };

  const shutter = async () => {
    if (!ref.current || busy) return;
    if (mode === 'picture') {
      setBusy(true);
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        const pic = await ref.current.takePictureAsync({ quality: 0.9 });
        if (pic?.uri) goCompose([await prepare({ uri: pic.uri, type: 'image', width: pic.width, height: pic.height })]);
      } catch (e) { toast(errorText(e)); } finally { setBusy(false); }
      return;
    }
    if (recording) { ref.current.stopRecording(); return; }
    setRecording(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    try {
      const video = await ref.current.recordAsync({ maxDuration: MAX_VIDEO_SECONDS });
      setRecording(false);
      if (video?.uri) {
        setBusy(true);
        goCompose([await prepare({ uri: video.uri, type: 'video' })]);
      }
    } catch (e) {
      setRecording(false);
      toast(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  const switchMode = async (m: 'picture' | 'video') => {
    if (recording) return;
    if (m === 'video' && !mic?.granted) await requestMic();
    setMode(m);
  };

  const library = async () => {
    try {
      setBusy(true);
      const media = await pickFromLibrary();
      if (media.length) goCompose(media);
    } catch (e) { toast(errorText(e)); } finally { setBusy(false); }
  };

  const granted = cam?.granted;

  return (
    <View style={{ flex: 1, backgroundColor: C.black }}>
      <StatusBar style="light" />
      <View style={styles.view}>
        {granted ? (
          <CameraView ref={ref} style={StyleSheet.absoluteFill} facing={facing} mode={mode} mute={!mic?.granted} videoQuality="1080p" />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.ask]}>
            <Text style={styles.askTitle}>Fota och filma dina looks</Text>
            <Text style={styles.askText}>ARKIV behöver tillgång till kameran för att du ska kunna fota och filma plagg och outfits.</Text>
            {cam && !cam.canAskAgain ? (
              <Btn title="Öppna Inställningar" variant="ghost" onPress={() => Linking.openSettings()} />
            ) : (
              <Btn title="Tillåt kamera" variant="ghost" onPress={requestCam} />
            )}
            <Pressable onPress={library} style={{ marginTop: 14 }}><Text style={{ color: '#fff', fontSize: 15 }}>Välj från bibliotek istället</Text></Pressable>
          </View>
        )}
        <IconBtn label="Stäng" onPress={goBack} style={[styles.x, { top: insets.top + 8 }]}><Icon name="close" color="#fff" size={20} /></IconBtn>
        {granted && !recording ? (
          <Pressable accessibilityLabel="Vänd kamera" onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))} style={[styles.flip, { top: insets.top + 4 }]}>
            <Icon name="flip" color="#fff" size={20} />
          </Pressable>
        ) : null}
        {recording ? (
          <View style={[styles.timer, { top: insets.top + 12 }]}>
            <View style={styles.recDot} />
            <Text style={{ color: '#fff', fontWeight: '600' }}>0:{String(seconds).padStart(2, '0')} / 0:{MAX_VIDEO_SECONDS}</Text>
          </View>
        ) : null}
        {granted ? (
          <View style={styles.modes}>
            {(['picture', 'video'] as const).map((m) => (
              <Pressable key={m} onPress={() => switchMode(m)} hitSlop={6}>
                <Text style={[styles.modeText, mode === m && { color: '#fff' }]}>{m === 'picture' ? 'FOTO' : 'VIDEO'}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
      <View style={styles.shutterWrap}>
        <Pressable
          accessibilityLabel={mode === 'video' ? (recording ? 'Stoppa inspelning' : 'Börja filma') : 'Ta foto'}
          onPress={granted ? shutter : requestCam}
          style={({ pressed }) => [styles.shutter, pressed && { transform: [{ scale: 0.94 }] }]}
        >
          {busy ? <ActivityIndicator color={C.ink} /> : (
            <View style={[styles.inner, mode === 'video' && { backgroundColor: '#e5372b', borderColor: '#fff' }, recording && styles.innerRec]} />
          )}
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={styles.controls}>
        <Pressable accessibilityLabel="Välj från bibliotek" onPress={library} style={styles.roll}><Icon name="image" color="#fff" size={24} /></Pressable>
        {TYPES.map(([k, l]) => (
          <Pressable key={k} onPress={() => setTag(k)} style={[styles.type, tag === k && { backgroundColor: '#fff' }]}>
            <Text style={{ fontSize: 15.5, fontWeight: '600', color: tag === k ? C.ink : '#fff' }}>{l}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <Text style={[styles.hint, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        {mode === 'video' ? `Tryck för att filma · max ${MAX_VIDEO_SECONDS} sek` : 'Tryck för foto · välj flera från biblioteket'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  view: { flex: 1, borderBottomLeftRadius: 22, borderBottomRightRadius: 22, overflow: 'hidden', backgroundColor: '#1a1a1a' },
  ask: { alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  askTitle: { color: '#fff', fontSize: 22, fontWeight: '600', textAlign: 'center' },
  askText: { color: '#ddd', fontSize: 15, textAlign: 'center', lineHeight: 21, marginBottom: 8 },
  x: { position: 'absolute', left: 18, width: 36, height: 36 },
  flip: { position: 'absolute', right: 18, width: 46, height: 46, borderWidth: 1.5, borderColor: '#fff', borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  timer: { position: 'absolute', alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(0,0,0,.45)', borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 },
  recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#e5372b' },
  modes: { position: 'absolute', bottom: 60, alignSelf: 'center', flexDirection: 'row', gap: 22 },
  modeText: { color: 'rgba(255,255,255,.55)', fontWeight: '700', letterSpacing: 2, fontSize: 13 },
  shutterWrap: { height: 44, alignItems: 'center', zIndex: 2 },
  shutter: { marginTop: -44, width: 88, height: 88, borderRadius: 44, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  inner: { width: 76, height: 76, borderRadius: 38, borderWidth: 3, borderColor: C.ink, backgroundColor: '#fff' },
  innerRec: { width: 34, height: 34, borderRadius: 6, borderWidth: 0 },
  controls: { gap: 8, alignItems: 'center', paddingHorizontal: 18, paddingTop: 20 },
  roll: { width: 48, height: 48, borderWidth: 2, borderColor: '#fff', borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  type: { borderWidth: 1.5, borderColor: '#fff', borderRadius: 999, paddingVertical: 9, paddingHorizontal: 15 },
  hint: { textAlign: 'center', fontSize: 13, color: '#ddd', paddingTop: 20 },
});
