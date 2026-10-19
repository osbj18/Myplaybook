import { Image, type ImageStyle } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ActionSheetIOS, ActivityIndicator, Alert, Animated, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, View,
  type StyleProp, type TextStyle, type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { report, useToggleBlock } from '../lib/api';
import { useAuth } from '../lib/auth';
import { publicUrl } from '../lib/supabase';
import { errorText, toast, useToastMessage } from '../lib/toast';
import type { Profile } from '../lib/types';
import { C, T } from '../theme';
import { Icon } from './Icon';

/** Bild från lagringen (path) eller en lokal/fjärr-URI. */
export function Img({ path, uri, style, blur }: { path?: string | null; uri?: string | null; style?: StyleProp<ImageStyle>; blur?: number }) {
  const src = uri ?? publicUrl(path);
  return <Image source={src ? { uri: src } : undefined} style={[{ backgroundColor: C.chip }, style]} contentFit="cover" transition={150} blurRadius={blur} recyclingKey={src} />;
}

export function Avatar({ profile, size = 34, ring = false }: { profile?: Profile | null; size?: number; ring?: boolean }) {
  const st = { width: size, height: size, borderRadius: size / 2, borderWidth: ring ? 2 : 0, borderColor: 'rgba(255,255,255,.9)' };
  if (profile?.avatar_path) return <Img path={profile.avatar_path} style={st} />;
  const initials = (profile?.name ?? profile?.handle ?? '?').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <View style={[st, { backgroundColor: '#d9d4cc', alignItems: 'center', justifyContent: 'center' }]}>
      <Text style={{ color: '#6b665f', fontSize: size * 0.32, fontWeight: '600' }}>{initials}</Text>
    </View>
  );
}

type BtnProps = { title: string; onPress?: () => void; variant?: 'dark' | 'ghost'; style?: StyleProp<ViewStyle>; textStyle?: StyleProp<TextStyle>; disabled?: boolean; small?: boolean; loading?: boolean };
export function Btn({ title, onPress, variant = 'dark', style, textStyle, disabled, small, loading }: BtnProps) {
  const dark = variant === 'dark';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      style={({ pressed }) => [
        { backgroundColor: dark ? C.ink : C.white, borderRadius: 8, paddingVertical: small ? 10 : 14, paddingHorizontal: small ? 15 : 18, alignItems: 'center', justifyContent: 'center', borderWidth: dark ? 0 : 1, borderColor: C.line },
        (pressed || disabled) && { opacity: disabled ? 0.35 : 0.8 },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={dark ? '#fff' : C.ink} /> : <Text style={[{ color: dark ? C.white : C.ink, fontSize: small ? 14.5 : 16, fontWeight: '600' }, textStyle]}>{title}</Text>}
    </Pressable>
  );
}

export function Chip({ label, style }: { label: string; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.chip, style]}><Text style={{ fontSize: 14, color: C.ink }}>{label}</Text></View>;
}

export function IconBtn({ onPress, children, label, style }: { onPress?: () => void; children: ReactNode; label: string; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable onPress={onPress} accessibilityLabel={label} accessibilityRole="button" hitSlop={8} style={[{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }, style]}>
      {children}
    </Pressable>
  );
}

export function TopBar({ left, center, right }: { left?: ReactNode; center?: ReactNode; right?: ReactNode }) {
  return (
    <View style={s.topbar}>
      <View style={{ flex: 1, alignItems: 'flex-start' }}>{left}</View>
      <View>{center}</View>
      <View style={{ flex: 1, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}

export const Logo = () => <Text style={[T.logo, { paddingLeft: 8 }]}>ARKIV</Text>;
export const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));
export const BackBtn = ({ color = C.ink }: { color?: string }) => (
  <IconBtn label="Tillbaka" onPress={goBack}><Icon name="back" color={color} /></IconBtn>
);

export function Loading({ dark }: { dark?: boolean }) {
  return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}><ActivityIndicator color={dark ? '#fff' : C.ink} /></View>;
}

export function Empty({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 48, paddingHorizontal: 28, gap: 8 }}>
      <Text style={{ fontSize: 17, fontWeight: '600', color: C.ink, textAlign: 'center' }}>{title}</Text>
      {text ? <Text style={{ fontSize: 15, color: C.muted, textAlign: 'center', lineHeight: 21 }}>{text}</Text> : null}
      {action ? <View style={{ marginTop: 10 }}>{action}</View> : null}
    </View>
  );
}

/** Bottenark som glider upp, med scrim bakom. */
export function Sheet({ visible, onClose, children, title, height }: { visible: boolean; onClose: () => void; children: ReactNode; title?: string; height?: number | `${number}%` }) {
  const insets = useSafeAreaInsets();
  const y = useRef(new Animated.Value(700)).current;
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.spring(y, { toValue: 0, useNativeDriver: true, bounciness: 0, speed: 16 }).start();
    } else if (mounted) {
      Animated.timing(y, { toValue: 700, duration: 220, useNativeDriver: true }).start(() => setMounted(false));
    }
  }, [visible]);

  return (
    <Modal transparent visible={mounted} animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,.18)' }]} onPress={onClose} accessibilityLabel="Stäng" />
        <Animated.View style={[s.sheet, { paddingBottom: Math.max(insets.bottom, 12), transform: [{ translateY: y }] }, height ? { height } : { maxHeight: '88%' }]}>
          <View style={s.grabber} />
          {title ? <Text style={s.sheetHead}>{title}</Text> : null}
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function Toast() {
  const msg = useToastMessage();
  const insets = useSafeAreaInsets();
  const op = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!msg) return;
    op.setValue(0);
    Animated.sequence([
      Animated.timing(op, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(op, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [msg]);
  if (!msg) return null;
  return (
    <Animated.View pointerEvents="none" style={[s.toast, { bottom: insets.bottom + 96, opacity: op, transform: [{ translateY: op.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }]}>
      <Text style={{ color: C.white, fontSize: 14.5, textAlign: 'center' }}>{msg.text}</Text>
    </Animated.View>
  );
}

/** Rapportera/blockera – krävs av App Store för appar med användarinnehåll. */
export function useModeration() {
  const { userId } = useAuth();
  const block = useToggleBlock();
  return (target: { user: Profile; itemId?: string; commentId?: string }, extra?: { label: string; destructive?: boolean; onPress: () => void }[]) => {
    const own = target.user.id === userId;
    const what = target.commentId ? 'kommentaren' : target.itemId ? 'inlägget' : 'profilen';
    const send = (reason: string) => report(reason, { user_id: target.user.id, item_id: target.itemId, comment_id: target.commentId })
      .then(() => toast('Tack! Vi granskar anmälan inom 24 timmar.'))
      .catch((e) => toast(errorText(e)));
    const doReport = () => Alert.alert(`Rapportera ${what}`, 'Vad är problemet?', [
      { text: 'Olämpligt eller stötande', onPress: () => send('Olämpligt eller stötande') },
      { text: 'Bedrägeri eller förfalskning', onPress: () => send('Bedrägeri eller förfalskning') },
      { text: 'Spam', onPress: () => send('Spam') },
      { text: 'Avbryt', style: 'cancel' },
    ]);
    const doBlock = () => Alert.alert(`Blockera ${target.user.name}?`, 'Ni kan inte längre se varandras inlägg eller skicka meddelanden.', [
      { text: 'Avbryt', style: 'cancel' },
      { text: 'Blockera', style: 'destructive', onPress: () => { block.mutate({ id: target.user.id, on: true }); toast(`${target.user.name} är blockerad`); goBack(); } },
    ]);
    const options = [...(extra ?? []), ...(own ? [] : [{ label: 'Rapportera', destructive: true, onPress: doReport }, { label: `Blockera ${target.user.name}`, destructive: true, onPress: doBlock }])];
    if (!options.length) return;
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: [...options.map((o) => o.label), 'Avbryt'], destructiveButtonIndex: options.map((o, i) => (o.destructive ? i : -1)).filter((i) => i >= 0), cancelButtonIndex: options.length },
        (i) => options[i]?.onPress(),
      );
    } else {
      Alert.alert('Välj', undefined, [...options.map((o) => ({ text: o.label, style: o.destructive ? ('destructive' as const) : undefined, onPress: o.onPress })), { text: 'Avbryt', style: 'cancel' as const }]);
    }
  };
}

const s = StyleSheet.create({
  chip: { backgroundColor: C.chip, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 13, alignSelf: 'flex-start' },
  topbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 6, paddingBottom: 14 },
  sheet: { backgroundColor: C.bg, borderTopLeftRadius: 18, borderTopRightRadius: 18, overflow: 'hidden' },
  grabber: { width: 38, height: 4, borderRadius: 2, backgroundColor: '#d6d3cd', alignSelf: 'center', marginTop: 9 },
  sheetHead: { textAlign: 'center', fontWeight: '600', fontSize: 17, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.line, color: C.ink },
  toast: { position: 'absolute', alignSelf: 'center', maxWidth: '86%', backgroundColor: C.ink, paddingVertical: 11, paddingHorizontal: 18, borderRadius: 999 },
});
