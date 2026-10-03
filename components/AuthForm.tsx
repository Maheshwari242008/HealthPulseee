import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Field } from '@/components/ui';
import { theme } from '@/constants/theme';
import { getMyRoles, signIn, signOut, signUp } from '@/services/authService';
import type { UserRole } from '@/types/user';

interface Props {
  mode: 'login' | 'signup';
  title: string;
  subtitle?: string;
  /** If set, login only succeeds for accounts that hold this role. */
  requiredRole?: UserRole;
  /** Where the "other mode" link goes. Omit to hide it. */
  switchHref?: string;
  switchLabel?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthForm({ mode, title, subtitle, requiredRole, switchHref, switchLabel }: Props) {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setInfo(null);
    const e = email.trim().toLowerCase();
    if (!EMAIL_RE.test(e)) return setError('Enter a valid email address.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (mode === 'signup' && fullName.trim().length < 2) return setError('Enter your name.');

    setBusy(true);
    try {
      if (mode === 'signup') {
        const res = await signUp(e, password, fullName.trim());
        if (res.session) {
          router.replace('/');
        } else {
          setInfo('Account created. Check your email to confirm, then log in.');
        }
      } else {
        const res = await signIn(e, password);
        if (requiredRole) {
          const roles = await getMyRoles(res.user.id);
          if (!roles.some((r) => r.role === requiredRole)) {
            await signOut();
            throw new Error(
              requiredRole === 'lab'
                ? 'This account is not a lab account. Ask an administrator to link it to your lab.'
                : 'This account is not an administrator account.'
            );
          }
        }
        router.replace('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.brand}>HealthPulse</Text>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

          <View style={styles.form}>
            {mode === 'signup' ? (
              <Field label="Full name" value={fullName} onChangeText={setFullName} autoCapitalize="words" />
            ) : null}
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
            />
            <Field
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              textContentType={mode === 'signup' ? 'newPassword' : 'password'}
              onSubmitEditing={submit}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {info ? <Text style={styles.info}>{info}</Text> : null}
            <Button label={mode === 'signup' ? 'Create account' : 'Log in'} onPress={submit} loading={busy} />
          </View>

          {switchHref ? (
            <Pressable onPress={() => router.replace(switchHref as never)} hitSlop={10}>
              <Text style={styles.switch}>{switchLabel}</Text>
            </Pressable>
          ) : null}
          <Pressable onPress={() => router.replace('/user/landing')} hitSlop={10}>
            <Text style={styles.back}>Back to start</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 24, gap: 12, flexGrow: 1, justifyContent: 'center' },
  brand: { fontSize: 14, fontWeight: '700', letterSpacing: 1.2, color: theme.colors.muted, textTransform: 'uppercase' },
  title: { fontFamily: theme.fonts.heading, fontSize: 34, fontWeight: '800', color: theme.colors.primary },
  subtitle: { fontSize: 16, lineHeight: 23, color: theme.colors.muted },
  form: { gap: 14, marginTop: 14 },
  error: { fontSize: 14, color: theme.colors.danger },
  info: { fontSize: 14, color: theme.colors.mintText },
  switch: { textAlign: 'center', fontSize: 15, fontWeight: '600', color: theme.colors.primary, marginTop: 10 },
  back: { textAlign: 'center', fontSize: 14, color: theme.colors.muted, marginTop: 6 },
});
