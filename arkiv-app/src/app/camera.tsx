import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '../components/Icon';
import { Btn, IconBtn, Img } from '../components/ui';
import { persistImages } from '../photos';
import { C } from '../theme';

const MODES = ['Inlägg', 'Sälj plagg', 'OOTD', 'Review'] as const;
const typeOf = (m: (typeof MODES)[number]) => (m === 'Sälj plagg' ? 'Sälj' : m);

export default function Camera() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [mode, setMode] = useState<(typeof MODES)[number]>('Inlägg');
  const [busy, setBusy] = useState(false);
  const cam = useRef<CameraView>(null);

  const goCompose = async (uris: string[]) => {
    const saved = await persistImages(uris);
    router.replace({ pathname: '/compose', params: { images: JSON.stringify(saved), type: typeOf(mode) } });
  };

  const shoot = async () => {
    if (busy || !cam.current) return;
    setBusy(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      const pic = await cam.current.takePictureAsync({ quality: 0.85 });
      if (pic?.uri) await goCompose([pic.uri]);
    } finally {
      setBusy(false);
    }
  };

  const pick = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: 6, quality: 0.85, orderedSelection: true });
    if (!res.canceled && res.assets.length) await goCompose(res.assets.map((a) => a.uri));
  };

  const granted = permission?.granted;

  return (
    <View style={{ flex: 1, backgroundColor: C.black }}>
      <StatusBar style="light" />
      <View style={styles.view}>
        {granted ? (
          <CameraView ref={cam} style={StyleSheet.absoluteFill} facing={facing} />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.ask]}>
            <Img source="a:kamera" style={[StyleSheet.absoluteFill, { opacity: 0.35 }]} blur={6} />
            <Text style={styles.askTitle}>Fota dina looks</Text>
            <Text style={styles.askText}>ARKIV behöver tillgång till kameran för att du ska kunna fota plagg och outfits.</Text>
            {permission && !permission.canAskAgain ? (
              <Btn title="Öppna Inställningar" variant="ghost" onPress={() => Linking.openSettings()} />
            ) : (
              <Btn title="Tillåt kamera" variant="ghost" onPress={requestPermission} />
            )}
            <Pressable onPress={pick} style={{ marginTop: 14 }}><Text style={{ color: '#fff', fontSize: 15 }}>Välj från bilder istället</Text></Pressable>
          </View>
        )}
        <IconBtn label="Stäng" onPress={() => router.back()} style={[styles.x, { top: insets.top + 8 }]}><Icon name="close" color="#fff" size={20} /></IconBtn>
        {granted ? (
          <Pressable accessibilityLabel="Vänd kamera" onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))} style={[styles.flip, { top: insets.top + 4 }]}>
            <Icon name="flip" color="#fff" size={20} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.shutterWrap}>
        <Pressable accessibilityLabel="Ta foto" onPress={granted ? shoot : requestPermission} style={({ pressed }) => [styles.shutter, (pressed || busy) && { transform: [{ scale: 0.94 }] }]}>
          <View style={styles.shutterInner} />
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={styles.controls}>
        <Pressable accessibilityLabel="Kamerarulle" onPress={pick} style={styles.roll}><Icon name="image" color="#fff" size={24} /></Pressable>
        {MODES.map((m) => (
          <Pressable key={m} onPress={() => setMode(m)} style={[styles.mode, mode === m && { backgroundColor: '#fff' }]}>
            <Text style={{ fontSize: 15.5, fontWeight: '600', color: mode === m ? C.ink : '#fff' }}>{m}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <Text style={[styles.hint, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>Tryck för foto · välj flera från kamerarullen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  view: { flex: 1, borderBottomLeftRadius: 22, borderBottomRightRadius: 22, overflow: 'hidden', backgroundColor: '#1a1a1a' },
  ask: { alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  askTitle: { color: '#fff', fontSize: 22, fontWeight: '600' },
  askText: { color: '#ddd', fontSize: 15, textAlign: 'center', lineHeight: 21, marginBottom: 8 },
  x: { position: 'absolute', left: 18, width: 36, height: 36 },
  flip: { position: 'absolute', right: 18, width: 46, height: 46, borderWidth: 1.5, borderColor: '#fff', borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  shutterWrap: { height: 44, alignItems: 'center', zIndex: 2 },
  shutter: { marginTop: -44, width: 88, height: 88, borderRadius: 44, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 76, height: 76, borderRadius: 38, borderWidth: 3, borderColor: C.ink, backgroundColor: '#fff' },
  controls: { gap: 8, alignItems: 'center', paddingHorizontal: 18, paddingTop: 20 },
  roll: { width: 48, height: 48, borderWidth: 2, borderColor: '#fff', borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  mode: { borderWidth: 1.5, borderColor: '#fff', borderRadius: 999, paddingVertical: 9, paddingHorizontal: 15 },
  hint: { textAlign: 'center', fontSize: 13, color: '#ddd', paddingTop: 20 },
});
