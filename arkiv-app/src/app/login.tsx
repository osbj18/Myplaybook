import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Btn } from '../components/ui';
import { useAuth } from '../lib/auth';
import { errorText } from '../lib/toast';
import { C, T } from '../theme';

export default function Login() {
  const { sendCode, verifyCode, signInWithPassword } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [password, setPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const submitEmail = async () => {
    setBusy(true); setError('');
    try { await sendCode(email); setStep('code'); } catch (e) { setError(errorText(e)); } finally { setBusy(false); }
  };
  const submitPassword = async () => {
    setBusy(true); setError('');
    try { await signInWithPassword(email, password); } catch { setError('Fel e-post eller lösenord.'); } finally { setBusy(false); }
  };
  const submitCode = async () => {
    setBusy(true); setError('');
    try { await verifyCode(email, code); } catch { setError('Fel kod eller så har den gått ut. Försök igen.'); } finally { setBusy(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.wrap, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 20 }]}>
        <Text style={[T.logo, { fontSize: 26, letterSpacing: 11, textAlign: 'center' }]}>ARKIV</Text>
        <Text style={styles.tagline}>Följ stilen. Köp looken.</Text>

        <View style={{ flex: 1, justifyContent: 'center' }}>
          {step === 'email' ? (
            <>
              <Text style={styles.h}>Logga in eller skapa konto</Text>
              <Text style={styles.p}>Vi skickar en engångskod till din e-post. Inget lösenord behövs.</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="din@epost.se"
                placeholderTextColor="#9d9a94"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                autoCorrect={false}
                style={styles.input}
                onSubmitEditing={() => validEmail && accepted && submitEmail()}
              />
              <Pressable style={styles.terms} onPress={() => setAccepted((a) => !a)} accessibilityRole="checkbox" accessibilityState={{ checked: accepted }}>
                <View style={[styles.box, accepted && styles.boxOn]}>{accepted ? <Text style={{ color: '#fff', fontSize: 13 }}>✓</Text> : null}</View>
                <Text style={{ flex: 1, fontSize: 14, color: C.soft, lineHeight: 20 }}>
                  Jag godkänner{' '}
                  <Text style={{ color: C.ink, textDecorationLine: 'underline' }} onPress={() => router.push('/terms')}>användarvillkoren</Text>
                  . Stötande innehåll och bedrägerier tolereras inte.
                </Text>
              </Pressable>
              <Btn title="Skicka kod" onPress={submitEmail} disabled={!validEmail || !accepted} loading={busy} style={{ paddingVertical: 16 }} />
              <Pressable onPress={() => { setStep('password'); setError(''); }} style={{ alignSelf: 'center', marginTop: 18 }}>
                <Text style={{ color: C.muted, fontSize: 14 }}>Logga in med lösenord</Text>
              </Pressable>
            </>
          ) : step === 'password' ? (
            <>
              <Text style={styles.h}>Logga in med lösenord</Text>
              <Text style={styles.p}>För konton som har fått ett lösenord, t.ex. testkonton.</Text>
              <TextInput value={email} onChangeText={setEmail} placeholder="din@epost.se" placeholderTextColor="#9d9a94" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} style={styles.input} />
              <TextInput value={password} onChangeText={setPassword} placeholder="Lösenord" placeholderTextColor="#9d9a94" secureTextEntry style={styles.input} onSubmitEditing={submitPassword} />
              <Btn title="Logga in" onPress={submitPassword} disabled={!validEmail || !password} loading={busy} style={{ paddingVertical: 16 }} />
              <Pressable onPress={() => { setStep('email'); setError(''); }} style={{ alignSelf: 'center', marginTop: 18 }}>
                <Text style={{ color: C.muted, fontSize: 15 }}>Logga in med kod istället</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.h}>Ange koden</Text>
              <Text style={styles.p}>Vi har skickat en kod till {email.trim()}. Kolla även skräpposten.</Text>
              <TextInput
                value={code}
                onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 10))}
                placeholder="123456"
                placeholderTextColor="#c2bfb8"
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                style={[styles.input, { fontSize: 28, letterSpacing: 8, textAlign: 'center' }]}
                autoFocus
                onSubmitEditing={() => code.length >= 6 && submitCode()}
              />
              <Btn title="Logga in" onPress={submitCode} disabled={code.length < 6} loading={busy} style={{ paddingVertical: 16 }} />
              <Pressable onPress={() => { setStep('email'); setCode(''); setError(''); }} style={{ alignSelf: 'center', marginTop: 18 }}>
                <Text style={{ color: C.muted, fontSize: 15 }}>Byt e-post eller skicka ny kod</Text>
              </Pressable>
            </>
          )}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 24 },
  tagline: { textAlign: 'center', color: C.muted, fontSize: 15, marginTop: 10, fontStyle: 'italic' },
  h: { fontSize: 24, fontWeight: '700', color: C.ink, marginBottom: 8 },
  p: { fontSize: 15, color: C.soft, lineHeight: 21, marginBottom: 20 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: C.line, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 15, fontSize: 17, color: C.ink, marginBottom: 14 },
  terms: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: 18 },
  box: { width: 22, height: 22, borderRadius: 5, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center', marginTop: 1, backgroundColor: '#fff' },
  boxOn: { backgroundColor: C.ink, borderColor: C.ink },
  error: { color: '#b3261e', fontSize: 14, marginTop: 14, textAlign: 'center' },
});
