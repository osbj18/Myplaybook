import { Image, type ImageStyle } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ActionSheetIOS, Alert, Animated, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, View,
  type StyleProp, type TextStyle, type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ASSETS } from '../data/assets';
import { ME } from '../data/seed';
import { resolveLocal } from '../photos';
import { useStore } from '../store';
import { C, T } from '../theme';
import { Icon } from './Icon';

export const src = (s?: string | null) => {
  if (!s) return undefined;
  if (s.startsWith('a:')) return ASSETS[s.slice(2)];
  if (s.startsWith('f:')) return { uri: resolveLocal(s.slice(2)) };
  return { uri: s };
};

export function Img({ source, style, blur }: { source?: string | null; style?: StyleProp<ImageStyle>; blur?: number }) {
  return <Image source={src(source)} style={style} contentFit="cover" transition={150} blurRadius={blur} />;
}

export function Avatar({ handle, size = 34, ring = false }: { handle: string; size?: number; ring?: boolean }) {
  const { user } = useStore();
  const u = user(handle);
  const st = { width: size, height: size, borderRadius: size / 2, borderWidth: ring ? 2 : 0, borderColor: 'rgba(255,255,255,.9)' };
  if (u.avatar) return <Img source={u.avatar} style={st} />;
  return (
    <View style={[st, { backgroundColor: '#d9d4cc', alignItems: 'center', justifyContent: 'center' }]}>
      <Text style={{ color: '#6b665f', fontSize: size * 0.3, fontWeight: '600' }}>{u.initials ?? handle.slice(0, 2).toUpperCase()}</Text>
    </View>
  );
}

type BtnProps = { title: string; onPress?: () => void; variant?: 'dark' | 'ghost'; style?: StyleProp<ViewStyle>; textStyle?: StyleProp<TextStyle>; disabled?: boolean; small?: boolean };
export function Btn({ title, onPress, variant = 'dark', style, textStyle, disabled, small }: BtnProps) {
  const dark = variant === 'dark';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        { backgroundColor: dark ? C.ink : C.white, borderRadius: 8, paddingVertical: small ? 10 : 14, paddingHorizontal: small ? 15 : 18, alignItems: 'center', justifyContent: 'center', borderWidth: dark ? 0 : 1, borderColor: C.line },
        (pressed || disabled) && { opacity: disabled ? 0.35 : 0.8 },
        style,
      ]}
    >
      <Text style={[{ color: dark ? C.white : C.ink, fontSize: small ? 14.5 : 16, fontWeight: '600' }, textStyle]}>{title}</Text>
    </Pressable>
  );
}

export function Pill({ label, on, onPress, style }: { label: string; on?: boolean; onPress?: () => void; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable onPress={onPress} style={[s.pill, on && s.pillOn, style]} accessibilityState={{ selected: on }}>
      <Text style={[s.pillText, on && { color: C.white }]}>{label}</Text>
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
export const BackBtn = ({ color = C.ink }: { color?: string }) => (
  <IconBtn label="Tillbaka" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}><Icon name="back" color={color} /></IconBtn>
);

/** Bottenark som glider upp, med scrim bakom. */
export function Sheet({ visible, onClose, children, title, height }: { visible: boolean; onClose: () => void; children: ReactNode; title?: string; height?: number | `${number}%` }) {
  const insets = useSafeAreaInsets();
  const y = useRef(new Animated.Value(600)).current;
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

/** Kort meddelande längst ner på skärmen. */
export function Toast() {
  const { toastMsg } = useStore();
  const insets = useSafeAreaInsets();
  const op = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!toastMsg) return;
    op.setValue(0);
    Animated.sequence([
      Animated.timing(op, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.delay(1700),
      Animated.timing(op, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [toastMsg]);
  if (!toastMsg) return null;
  return (
    <Animated.View pointerEvents="none" style={[s.toast, { bottom: insets.bottom + 96, opacity: op, transform: [{ translateY: op.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }]}>
      <Text style={{ color: C.white, fontSize: 14.5 }}>{toastMsg.text}</Text>
    </Animated.View>
  );
}

/** Rapportera/blockera – krävs av App Store för appar med användarinnehåll. */
export function useModeration() {
  const { block, toast, user } = useStore();
  return (handle: string, what: 'inlägg' | 'profil' = 'inlägg') => {
    if (handle === ME) return;
    const name = user(handle).name;
    const report = () => Alert.alert('Rapportera', `Varför vill du rapportera detta ${what}?`, [
      { text: 'Olämpligt innehåll', onPress: () => toast('Tack, vi granskar inom 24 timmar') },
      { text: 'Bedrägeri eller förfalskning', onPress: () => toast('Tack, vi granskar inom 24 timmar') },
      { text: 'Avbryt', style: 'cancel' },
    ]);
    const doBlock = () => Alert.alert(`Blockera ${name}?`, 'Du ser inte längre deras inlägg, plagg eller meddelanden.', [
      { text: 'Avbryt', style: 'cancel' },
      { text: 'Blockera', style: 'destructive', onPress: () => { block(handle); toast(`${name} är blockerad`); if (router.canGoBack()) router.back(); } },
    ]);
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Rapportera', `Blockera ${name}`, 'Avbryt'], destructiveButtonIndex: [0, 1], cancelButtonIndex: 2 },
        (i) => { if (i === 0) report(); if (i === 1) doBlock(); },
      );
    } else {
      Alert.alert(name, undefined, [{ text: 'Rapportera', onPress: report }, { text: 'Blockera', style: 'destructive', onPress: doBlock }, { text: 'Avbryt', style: 'cancel' }]);
    }
  };
}

const s = StyleSheet.create({
  pill: { borderWidth: 1, borderColor: C.border, backgroundColor: C.white, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14, alignItems: 'center' },
  pillOn: { backgroundColor: C.ink, borderColor: C.ink },
  pillText: { fontSize: 14.5, color: C.ink },
  chip: { backgroundColor: C.chip, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 13, alignSelf: 'flex-start' },
  topbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 6, paddingBottom: 14 },
  sheet: { backgroundColor: C.bg, borderTopLeftRadius: 18, borderTopRightRadius: 18, overflow: 'hidden' },
  grabber: { width: 38, height: 4, borderRadius: 2, backgroundColor: '#d6d3cd', alignSelf: 'center', marginTop: 9 },
  sheetHead: { textAlign: 'center', fontWeight: '600', fontSize: 17, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.line, color: C.ink },
  toast: { position: 'absolute', alignSelf: 'center', backgroundColor: C.ink, paddingVertical: 11, paddingHorizontal: 18, borderRadius: 999 },
});
