import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackBtn, Btn, Img, TopBar } from '../components/ui';
import { ME } from '../data/seed';
import { useStore, type Draft } from '../store';
import { C, T } from '../theme';

const TYPES: [Draft['type'], string][] = [['Inlägg', 'Inlägg'], ['Sälj', 'Sälj plagg'], ['OOTD', 'OOTD'], ['Review', 'Review']];
const TITLES: Record<Draft['type'], string> = { Inlägg: 'Nytt inlägg', Sälj: 'Säljes', OOTD: 'Dagens outfit', Review: 'Review' };
const SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const CONDS = ['Ny med lapp', 'Mycket gott', 'Gott', 'Använt'];
const SHIPPING = ['PostNord · 59 kr', 'Instabox · 49 kr', 'DHL · 79 kr', 'Endast upphämtning'];

export default function Compose() {
  const params = useLocalSearchParams<{ images?: string; type?: Draft['type'] }>();
  const { publish, toast } = useStore();
  const insets = useSafeAreaInsets();
  const [d, setD] = useState<Draft>(() => ({
    type: params.type ?? 'Inlägg',
    images: params.images ? JSON.parse(params.images) : [],
    caption: '', price: 0, brand: '', size: 'M', cond: 'Mycket gott', ship: SHIPPING[0], tagged: false, pickup: false,
  }));
  const set = (patch: Partial<Draft>) => setD((x) => ({ ...x, ...patch }));
  const sale = d.type === 'Sälj';
  const ok = d.images.length > 0 && (!sale || (d.price > 0 && d.brand.trim().length > 0));

  const submit = () => {
    if (!ok) { toast(sale ? 'Fyll i pris och märke' : 'Lägg till en bild'); return; }
    publish(d);
    router.dismissAll();
    router.navigate('/profile');
    toast(sale ? 'Ute till salu!' : 'Inlägget är delat');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TopBar
        left={<BackBtn />}
        center={<Text style={T.title}>{TITLES[d.type]}</Text>}
        right={<Pressable onPress={submit} hitSlop={8}><Text style={[styles.share, !ok && { opacity: 0.35 }]}>Dela</Text></Pressable>}
      />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <View style={styles.compose}>
          <ScrollView horizontal style={{ flexGrow: 0, maxWidth: 140 }} contentContainerStyle={{ gap: 6 }} showsHorizontalScrollIndicator={false}>
            {d.images.map((img) => <Img key={img} source={img} style={{ width: 82, height: 102, borderRadius: 3 }} />)}
          </ScrollView>
          <TextInput value={d.caption} onChangeText={(caption) => set({ caption })} placeholder="Skriv en bildtext..." placeholderTextColor="#9d9a94" multiline style={styles.caption} maxLength={500} />
        </View>
        <View style={{ paddingHorizontal: 18 }}>
          <View style={styles.formH}>
            <Text style={T.label}>TYP AV INLÄGG</Text>
            <Text style={{ color: C.muted, fontSize: 14 }}>Visas under {sale ? 'Säljes' : 'Inlägg'}</Text>
          </View>
          <View style={styles.typeseg}>
            {TYPES.map(([k, l]) => (
              <Pressable key={k} style={[styles.typeBtn, d.type === k && styles.typeOn]} onPress={() => set({ type: k })}>
                <Text style={[styles.typeText, d.type === k && { color: C.ink }]} numberOfLines={1}>{l}</Text>
              </Pressable>
            ))}
          </View>
          {sale ? (
            <>
              <Text style={[T.label, { marginBottom: 12 }]}>OM PLAGGET</Text>
              <View style={{ flexDirection: 'row', gap: 9, marginBottom: 16 }}>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Pris</Text>
                  <TextInput value={d.price ? String(d.price) : ''} onChangeText={(v) => set({ price: parseInt(v.replace(/\D/g, ''), 10) || 0 })} keyboardType="number-pad" placeholder="0 kr" placeholderTextColor="#9d9a94" style={styles.fieldInput} />
                </View>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Märke</Text>
                  <TextInput value={d.brand} onChangeText={(brand) => set({ brand })} placeholder="t.ex. Arket" placeholderTextColor="#9d9a94" style={styles.fieldInput} autoCapitalize="words" />
                </View>
              </View>
              <Text style={styles.optLabel}>Storlek</Text>
              <View style={styles.opts}>
                {SIZES.map((v) => <Opt key={v} label={v} on={d.size === v} onPress={() => set({ size: v })} />)}
              </View>
              <Text style={styles.optLabel}>Skick</Text>
              <View style={styles.opts}>
                {CONDS.map((v) => <Opt key={v} label={v} on={d.cond === v} onPress={() => set({ cond: v })} />)}
              </View>
              <Pressable style={[styles.navrow, styles.boxed]} onPress={() => set({ ship: SHIPPING[(SHIPPING.indexOf(d.ship) + 1) % SHIPPING.length] })}>
                <Text style={{ fontSize: 16, color: C.ink }}>Frakt</Text>
                <Text style={{ fontSize: 15.5, color: C.muted }}>{d.ship} ›</Text>
              </Pressable>
            </>
          ) : null}
          <Pressable style={styles.navrow} onPress={() => set({ tagged: !d.tagged })}>
            <Text style={styles.navText}>Tagga i en look</Text>
            <Text style={{ fontSize: 15.5, color: d.tagged ? C.accent : C.muted }}>{d.tagged ? 'Taggad ✓' : '›'}</Text>
          </Pressable>
          <Pressable style={styles.navrow} onPress={() => set({ pickup: !d.pickup })}>
            <Text style={styles.navText}>Upphämtning i Stockholm</Text>
            <Text style={{ fontSize: 15.5, color: d.pickup ? C.accent : C.muted }}>{d.pickup ? 'Ja ✓' : '›'}</Text>
          </Pressable>
          <Btn title={sale ? 'Lägg ut till salu' : 'Dela inlägg'} onPress={submit} disabled={!ok} style={{ marginTop: 26, paddingVertical: 16 }} textStyle={{ fontSize: 17 }} />
          <Text style={{ color: C.muted, fontSize: 12.5, textAlign: 'center', marginTop: 12 }}>Publiceras som @{ME}</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Opt({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.opt, on && styles.optOn]} accessibilityState={{ selected: on }}>
      <Text style={{ fontSize: 14, color: on ? '#fff' : C.ink }} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  share: { color: C.accent, fontWeight: '600', fontSize: 17 },
  compose: { flexDirection: 'row', gap: 14, paddingHorizontal: 18, paddingBottom: 18, borderBottomWidth: 1.5, borderBottomColor: C.line, marginBottom: 22 },
  caption: { flex: 1, fontSize: 15.5, minHeight: 102, textAlignVertical: 'top', color: C.ink, paddingTop: 0 },
  formH: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 },
  typeseg: { flexDirection: 'row', backgroundColor: C.chip, borderRadius: 9, padding: 3, marginBottom: 26 },
  typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 7, alignItems: 'center' },
  typeOn: { backgroundColor: '#fff' },
  typeText: { fontSize: 15, fontWeight: '600', color: C.muted },
  field: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: C.line, borderRadius: 7, paddingVertical: 9, paddingHorizontal: 13 },
  fieldLabel: { color: C.muted, fontSize: 13 },
  fieldInput: { fontSize: 17, fontWeight: '600', color: C.ink, paddingTop: 2, paddingBottom: 0 },
  optLabel: { color: C.muted, fontSize: 14, marginBottom: 8 },
  opts: { flexDirection: 'row', gap: 6, marginBottom: 16 },
  opt: { flexGrow: 1, borderWidth: 1, borderColor: C.border, backgroundColor: '#fff', borderRadius: 999, paddingVertical: 9, paddingHorizontal: 9, alignItems: 'center' },
  optOn: { backgroundColor: C.ink, borderColor: C.ink },
  navrow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: C.line },
  boxed: { backgroundColor: '#fff', borderWidth: 1, borderColor: C.line, borderRadius: 7, paddingHorizontal: 13, paddingVertical: 13, marginBottom: 16 },
  navText: { fontSize: 17, color: C.ink },
});
