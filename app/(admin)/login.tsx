import React, { useMemo, useState } from 'react';
import {
  FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View, useColorScheme,
} from 'react-native';

type Role = 'city' | 'state';
type Status = { text: string; kind?: 'err' | 'ok' };

const LOCATIONS: Record<Role, string[]> = {
  city: ['Solapur City', 'Pune City', 'Mumbai City', 'Nagpur City', 'Nashik City', 'Aurangabad City'],
  state: ['Maharashtra', 'Karnataka', 'Gujarat', 'Telangana', 'Madhya Pradesh', 'Tamil Nadu'],
};

const light = {
  bg: '#fffdf6', card: '#ffffff', ink: '#1b2b2a', muted: '#6a7b80', teal: '#0b676b',
  track: '#edf3f1', line: '#d6e0dc', err: '#b3261e', ok: '#1f7a4d', onTeal: '#fffdf6',
};
const dark = {
  bg: '#101e1e', card: '#172a2a', ink: '#eef3ec', muted: '#98acab', teal: '#56b7b8',
  track: '#1b3030', line: '#2c4747', err: '#ff8a80', ok: '#7bd8a4', onTeal: '#101e1e',
};

export default function AdminLoginScreen({ onSignedIn }: { onSignedIn?: (scope: string) => void }) {
  const C = useColorScheme() === 'dark' ? dark : light;
  const s = useMemo(() => makeStyles(C), [C]);

  const [signup, setSignup] = useState(false);
  const [role, setRole] = useState<Role>('city');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [location, setLocation] = useState(LOCATIONS.city[0]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [status, setStatus] = useState<Status>({ text: '' });

  const chooseRole = (r: Role) => {
    setRole(r);
    setLocation(LOCATIONS[r][0]);
    setStatus({ text: '' });
  };

  const toggleSignup = () => {
    setSignup(!signup);
    setPassword('');
    setConfirm('');
    setStatus({ text: '' });
  };

  const submit = () => {
    const scope = `${role === 'city' ? 'City' : 'State'} Administrator, ${location}`;
    if (signup && !name.trim()) return setStatus({ text: 'Enter your full name.', kind: 'err' });
    if (!email.trim() || !password)
      return setStatus({ text: 'Enter your government email / ID and password.', kind: 'err' });
    if (signup && password.length < 6)
      return setStatus({ text: 'Use a password with at least 6 characters.', kind: 'err' });
    if (signup && password !== confirm)
      return setStatus({ text: "Passwords don't match.", kind: 'err' });

    // TODO: call your auth backend here (e.g. Supabase signInWithPassword / signUp).
    setStatus({ text: signup ? `Account created for ${scope}.` : `Signed in as ${scope}.`, kind: 'ok' });
    onSignedIn?.(scope);
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
        <Text style={s.h1}>{signup ? 'Create administrator account' : 'Administrator sign in'}</Text>
        <Text style={s.sub}>Access depends on your government administrative scope.</Text>

        <View style={s.tabs}>
          {(['city', 'state'] as Role[]).map((r) => (
            <Pressable key={r} onPress={() => chooseRole(r)} accessibilityRole="button"
              accessibilityState={{ selected: role === r }}
              style={[s.tab, role === r && s.tabOn]}>
              <Text style={[s.tabTxt, role === r && s.tabTxtOn]}>
                {r === 'city' ? 'City Administrator' : 'State Administrator'}
              </Text>
            </Pressable>
          ))}
        </View>

        {signup && (
          <View style={s.field}>
            <Text style={s.label}>Full name</Text>
            <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Your full name"
              placeholderTextColor={C.muted} autoComplete="name" textContentType="name" />
          </View>
        )}

        <View style={s.field}>
          <Text style={s.label}>Government email / ID</Text>
          <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="admin@health.gov.in"
            placeholderTextColor={C.muted} autoCapitalize="none" autoCorrect={false}
            keyboardType="email-address" autoComplete="username" textContentType="username" />
        </View>

        <View style={s.field}>
          <Text style={s.label}>Password</Text>
          <TextInput style={s.input} value={password} onChangeText={setPassword} placeholder="Enter password"
            placeholderTextColor={C.muted} secureTextEntry
            autoComplete={signup ? 'new-password' : 'password'}
            textContentType={signup ? 'newPassword' : 'password'} />
        </View>

        {signup && (
          <View style={s.field}>
            <Text style={s.label}>Confirm password</Text>
            <TextInput style={s.input} value={confirm} onChangeText={setConfirm}
              placeholder="Re-enter password" placeholderTextColor={C.muted} secureTextEntry
              autoComplete="new-password" textContentType="newPassword" />
          </View>
        )}

        <View style={s.field}>
          <Text style={s.label}>Administrative location</Text>
          <Pressable style={[s.input, s.select]} onPress={() => setPickerOpen(true)}
            accessibilityRole="button" accessibilityLabel={`Administrative location, ${location}`}>
            <Text style={s.selectTxt}>{location}</Text>
            <Text style={s.chevron}>⌄</Text>
          </Pressable>
        </View>

        {!signup && (
          <Pressable style={s.forgot} hitSlop={8}
            onPress={() => setStatus({ text: "Prototype: password reset isn't connected." })}>
            <Text style={s.link}>Forgot password?</Text>
          </Pressable>
        )}

        <Text style={[s.status, status.kind === 'err' && { color: C.err }, status.kind === 'ok' && { color: C.ok }]}
          accessibilityLiveRegion="polite">{status.text}</Text>

        <Pressable style={s.primary} onPress={submit}>
          <Text style={s.primaryTxt}>{signup ? 'Create account →' : 'Sign in to dashboard →'}</Text>
        </Pressable>

        <View style={s.divider}>
          <View style={s.rule} /><Text style={s.dividerTxt}>or</Text><View style={s.rule} />
        </View>

        <Pressable style={s.ghost}
          onPress={() => setStatus({ text: "Prototype: Google sign in isn't connected." })}>
          <Text style={s.gLogo}>G</Text>
          <Text style={s.ghostTxt}>Continue with Google</Text>
        </Pressable>

        <View style={s.switchRow}>
          <Text style={s.muted}>{signup ? 'Already registered?' : 'New administrator?'}</Text>
          <Pressable onPress={toggleSignup} hitSlop={8}>
            <Text style={s.switchLink}>{signup ? 'Sign in' : 'Create new account'}</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <Pressable style={s.backdrop} onPress={() => setPickerOpen(false)}>
          <View style={s.sheet}>
            <FlatList
              data={LOCATIONS[role]}
              keyExtractor={(i) => i}
              renderItem={({ item }) => (
                <Pressable style={s.option} onPress={() => { setLocation(item); setPickerOpen(false); }}>
                <Text style={[s.optionTxt, item === location && { color: C.teal, fontWeight: '700' }]}>
                    {item}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (C: typeof light) =>
  StyleSheet.create({
    flex: { flex: 1, backgroundColor: C.bg },
    wrap: { padding: 24, paddingTop: 64, paddingBottom: 48, width: '100%', maxWidth: 520, alignSelf: 'center' },
    h1: { fontSize: 30, fontWeight: '700', lineHeight: 38, color: C.teal, marginBottom: 8 },
    sub: { fontSize: 18, lineHeight: 25, color: C.muted, marginBottom: 20 },
    tabs: { flexDirection: 'row', gap: 4, padding: 5, backgroundColor: C.track, borderRadius: 16, marginBottom: 24 },
    tab: { flex: 1, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    tabOn: { backgroundColor: C.card, elevation: 1, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } },
    tabTxt: { fontWeight: '600', fontSize: 17, color: C.ink },
    tabTxtOn: { fontWeight: '700', color: C.teal },
    field: { marginBottom: 20 },
    label: { fontSize: 15, color: C.muted, marginBottom: 8 },
    input: {
      height: 60, borderRadius: 16, borderWidth: 1, borderColor: C.line, backgroundColor: C.card,
      paddingHorizontal: 20, fontSize: 18, color: C.ink,
    },
    select: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    selectTxt: { fontSize: 18, color: C.ink },
    chevron: { fontSize: 22, color: C.muted, marginTop: -8 },
    forgot: { alignSelf: 'flex-end', marginTop: -8, marginBottom: 10 },
    link: { fontWeight: '600', fontSize: 16, color: C.teal },
    status: { fontSize: 15, color: C.muted, minHeight: 22, marginBottom: 14 },
    primary: { height: 60, borderRadius: 16, backgroundColor: C.teal, alignItems: 'center', justifyContent: 'center' },
    primaryTxt: { fontWeight: '600', fontSize: 18, color: C.onTeal },
    divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 18 },
    rule: { flex: 1, height: 1, backgroundColor: C.line },
    dividerTxt: { fontSize: 15, color: C.muted },
    ghost: {
      height: 60, borderRadius: 16, borderWidth: 1, borderColor: C.teal, flexDirection: 'row',
      alignItems: 'center', justifyContent: 'center', gap: 10,
    },
    gLogo: { fontWeight: '700', fontSize: 20, color: '#4285F4' },
    ghostTxt: { fontWeight: '600', fontSize: 18, color: C.teal },
    switchRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 26 },
    muted: { fontSize: 16, color: C.muted },
    switchLink: { fontWeight: '700', fontSize: 16, color: C.teal },
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 28 },
    sheet: { backgroundColor: C.card, borderRadius: 18, maxHeight: 360, paddingVertical: 6, width: '100%', maxWidth: 420, alignSelf: 'center' },
    option: { paddingVertical: 16, paddingHorizontal: 22 },
    optionTxt: { fontSize: 18, color: C.ink },
  });