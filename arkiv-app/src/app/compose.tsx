import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '../components/Icon';
import { VideoBadge } from '../components/MediaView';
import { BackBtn, Btn, Img, TopBar } from '../components/ui';
import { useCreateItem } from '../lib/api';
import { useMe } from '../lib/auth';
import { pickFromLibrary, uploadAll, type LocalMedia } from '../lib/media';
import { errorText, toast } from '../lib/toast';
import type { Tag } from '../lib/types';
import { C, T } from '../theme';

const TYPES: [Tag, string][] = [['Inlägg', 'Inlägg'], ['Sälj', 'Sälj plagg'], ['OOTD', 'OOTD'], ['Review', 'Review']];
const TITLES: Record<Tag, string> = { Inlägg: 'Nytt inlägg', Sälj: 'Säljes', OOTD: 'Dagens outfit', Review: 'Review' };
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'One size'];
const CONDS = ['Ny med lapp', 'Mycket gott skick', 'Gott skick', 'Använt'];
const SHIPPING = ['Frakt via PostNord', 'Frakt via Instabox', 'Frakt via DHL', 'Endast upphämtning'];

export default function Compose() {
  const params = useLocalSearchParams<{ media?: string; tag?: Tag }>();
  const { me, uid } = useMe();
  const insets = useSafeAreaInsets();
  const create = useCreateItem();
  const [media, setMedia] = useState<LocalMedia[]>(() => (params.media ? JSON.parse(params.media) : []));
  const [tag, setTag] = useState<Tag>(params.tag ?? 'Inlägg');
  const [caption, setCaption] = useState('');
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState(0);
  const [size, setSize] = useState('M');
  const [condition, setCondition] = useState('Mycket gott skick');
  const [shipping, setShipping] = useState(SHIPPING[0]);
  const [pickup, setPickup] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const sale = tag === 'Sälj';
  const ok = media.length > 0 && (!sale || (price > 0 && brand.trim().length > 0 && title.trim().length > 0));

  const addMore = async () => {
    try {
      const more = await pickFromLibrary();
      setMedia((m) => [...m, ...more].slice(0, 10));
    } catch (e) { toast(errorText(e)); }
  };

  const submit = async () => {
    if (!ok || progress) { if (!ok) toast(sale ? 'Fyll i titel, märke och pris' : 'Lägg till en bild eller video'); return; }
    try {
      setProgress(`Laddar upp 0/${media.length}…`);
      const uploaded = await uploadAll(uid, media, (d, n) => setProgress(`Laddar upp ${d}/${n}…`));
      setProgress('Publicerar…');
      await create.mutateAsync({
        kind: sale ? 'sale' : 'post',
        tag,
        caption: caption.trim(),
        media: uploaded,
        ...(sale ? { title: title.trim(), brand: brand.trim(), price, size, condition, shipping, pickup } : {}),
      });
      router.dismissAll();
      router.navigate('/profile');
      toast(sale ? 'Ute till salu!' : 'Inlägget är delat');
    } catch (e) {
      toast(errorText(e));
    } finally {
      setProgress(null);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TopBar
        left={<BackBtn />}
        center={<Text style={T.title}>{TITLES[tag]}</Text>}
        right={<Pressable onPress={submit} hitSlop={8} disabled={!!progress}><Text style={[styles.share, (!ok || progress) && { opacity: 0.35 }]}>Dela</Text></Pressable>}
      />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 18, marginBottom: 14 }}>
          {media.map((m, i) => (
            <View key={m.uri} style={{ width: 96, height: 120, borderRadius: 4, overflow: 'hidden' }}>
              <Img uri={m.type === 'video' ? m.poster ?? null : m.uri} style={{ width: 96, height: 120, backgroundColor: '#222' }} />
              {m.type === 'video' ? <VideoBadge /> : null}
              <Pressable onPress={() => setMedia((x) => x.filter((_, j) => j !== i))} style={styles.remove} accessibilityLabel="Ta bort">
                <Icon name="close" size={12} color="#fff" />
              </Pressable>
            </View>
          ))}
          {media.length < 10 ? (
            <Pressable onPress={addMore} style={styles.add} accessibilityLabel="Lägg till bild eller video">
              <Icon name="plus" size={26} color={C.muted} />
            </Pressable>
          ) : null}
        </ScrollView>
        <View style={styles.compose}>
          <TextInput value={caption} onChangeText={setCaption} placeholder={sale ? 'Beskriv plagget: skick, passform, mått…' : 'Skriv en bildtext...'} placeholderTextColor="#9d9a94" multiline style={styles.caption} maxLength={1000} />
        </View>
        <View style={{ paddingHorizontal: 18 }}>
          <View style={styles.formH}>
            <Text style={T.label}>TYP AV INLÄGG</Text>
            <Text style={{ color: C.muted, fontSize: 14 }}>Visas under {sale ? 'Säljes' : 'Inlägg'}</Text>
          </View>
          <View style={styles.typeseg}>
            {TYPES.map(([k, l]) => (
              <Pressable key={k} style={[styles.typeBtn, tag === k && styles.typeOn]} onPress={() => setTag(k)}>
                <Text style={[styles.typeText, tag === k && { color: C.ink }]} numberOfLines={1}>{l}</Text>
              </Pressable>
            ))}
          </View>
          {sale ? (
            <>
              <Text style={[T.label, { marginBottom: 12 }]}>OM PLAGGET</Text>
              <View style={[styles.field, { marginBottom: 9 }]}>
                <Text style={styles.fieldLabel}>Vad säljer du?</Text>
                <TextInput value={title} onChangeText={setTitle} placeholder="t.ex. Overshirt i ull" placeholderTextColor="#9d9a94" style={styles.fieldInput} maxLength={60} />
              </View>
              <View style={{ flexDirection: 'row', gap: 9, marginBottom: 16 }}>
                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>Pris (kr)</Text>
                  <TextInput value={price ? String(price) : ''} onChangeText={(v) => setPrice(parseInt(v.replace(/\D/g, ''), 10) || 0)} keyboardType="number-pad" placeholder="0" placeholderTextColor="#9d9a94" style={styles.fieldInput} maxLength={7} />
                </View>
                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>Märke</Text>
                  <TextInput value={brand} onChangeText={setBrand} placeholder="t.ex. Arket" placeholderTextColor="#9d9a94" style={styles.fieldInput} autoCapitalize="words" maxLength={40} />
                </View>
              </View>
              <Text style={styles.optLabel}>Storlek</Text>
              <View style={styles.opts}>{SIZES.map((v) => <Opt key={v} label={v} on={size === v} onPress={() => setSize(v)} />)}</View>
              <Text style={styles.optLabel}>Skick</Text>
              <View style={styles.opts}>{CONDS.map((v) => <Opt key={v} label={v} on={condition === v} onPress={() => setCondition(v)} />)}</View>
              <Pressable style={[styles.navrow, styles.boxed]} onPress={() => setShipping(SHIPPING[(SHIPPING.indexOf(shipping) + 1) % SHIPPING.length])}>
                <Text style={{ fontSize: 16, color: C.ink }}>Leverans</Text>
                <Text style={{ fontSize: 15.5, color: C.muted }}>{shipping} ›</Text>
              </Pressable>
              <Pressable style={styles.navrow} onPress={() => setPickup((p) => !p)}>
                <Text style={styles.navText}>Kan hämtas{me.city ? ` i ${me.city}` : ''}</Text>
                <Text style={{ fontSize: 15.5, color: pickup ? C.accent : C.muted }}>{pickup ? 'Ja ✓' : 'Nej'}</Text>
              </Pressable>
            </>
          ) : null}
          <Btn title={progress ?? (sale ? 'Lägg ut till salu' : 'Dela inlägg')} onPress={submit} disabled={!ok} loading={false} style={{ marginTop: 26, paddingVertical: 16, opacity: progress ? 0.6 : 1 }} textStyle={{ fontSize: 17 }} />
          <Text style={{ color: C.muted, fontSize: 12.5, textAlign: 'center', marginTop: 12 }}>Publiceras som @{me.handle}</Text>
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
  add: { width: 96, height: 120, borderRadius: 4, borderWidth: 1.5, borderStyle: 'dashed', borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  remove: { position: 'absolute', top: 6, left: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,.55)', alignItems: 'center', justifyContent: 'center' },
  compose: { paddingHorizontal: 18, paddingBottom: 14, borderBottomWidth: 1.5, borderBottomColor: C.line, marginBottom: 22 },
  caption: { fontSize: 15.5, minHeight: 70, textAlignVertical: 'top', color: C.ink, paddingTop: 0 },
  formH: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 },
  typeseg: { flexDirection: 'row', backgroundColor: C.chip, borderRadius: 9, padding: 3, marginBottom: 26 },
  typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 7, alignItems: 'center' },
  typeOn: { backgroundColor: '#fff' },
  typeText: { fontSize: 15, fontWeight: '600', color: C.muted },
  field: { backgroundColor: '#fff', borderWidth: 1, borderColor: C.line, borderRadius: 7, paddingVertical: 9, paddingHorizontal: 13 },
  fieldLabel: { color: C.muted, fontSize: 13 },
  fieldInput: { fontSize: 17, fontWeight: '600', color: C.ink, paddingTop: 2, paddingBottom: 0 },
  optLabel: { color: C.muted, fontSize: 14, marginBottom: 8 },
  opts: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  opt: { borderWidth: 1, borderColor: C.border, backgroundColor: '#fff', borderRadius: 999, paddingVertical: 9, paddingHorizontal: 12, alignItems: 'center' },
  optOn: { backgroundColor: C.ink, borderColor: C.ink },
  navrow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: C.line },
  boxed: { backgroundColor: '#fff', borderWidth: 1, borderColor: C.line, borderRadius: 7, paddingHorizontal: 13, paddingVertical: 13, marginBottom: 6 },
  navText: { fontSize: 17, color: C.ink },
});
