import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { getMyRoles, signIn, signOut } from '@/services/authService';

const CITY = 'Solapur City, Maharashtra';
const TEAL = '#155B5B';
const CREAM = '#F7F4E8';
const MINT = '#DDF1E7';

function readableError(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  const normalized = message.toLowerCase();

  if (normalized.includes('invalid login credentials')) {
    return 'The email address or password is incorrect.';
  }
  if (normalized.includes('email not confirmed')) {
    return 'Please confirm your email address before signing in.';
  }
  if (normalized.includes('network') || normalized.includes('fetch')) {
    return 'We could not reach the secure sign-in service. Check your connection and try again.';
  }
  return message || 'We could not sign you in. Please try again.';
}

export default function Index() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [cityMenuOpen, setCityMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function onLogin() {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError('Enter your government email address and password to continue.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    let signedIn = false;

    try {
      const { user } = await signIn(trimmedEmail, password);
      signedIn = true;

      if (!user) {
        throw new Error('Your sign-in session could not be established. Please try again.');
      }

      const roles = await getMyRoles(user.id);
      const isAdministrator = roles.some((role) => role.role === 'administrator');

      if (!isAdministrator) {
        await signOut();
        signedIn = false;
        setError('This account does not have City Administrator access. Please contact your system administrator.');
        return;
      }

      router.replace('/(admin)' as Href);
    } catch (loginError) {
      if (signedIn) {
        try {
          await signOut();
        } catch {
          // Preserve the original login or authorization error for the user.
        }
      }
      setError(readableError(loginError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={CREAM} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.branding}>
              <View style={styles.seal}>
                <Ionicons name="shield-checkmark" size={35} color={TEAL} />
              </View>
              <Text style={styles.governmentLabel}>GOVERNMENT HEALTH ADMINISTRATION</Text>
              <Text style={styles.title}>HealthPulse</Text>
              <Text style={styles.subtitle}>Disease Surveillance &amp; Response System</Text>
            </View>

            <View style={styles.formSection}>
              <View style={styles.accountHeader}>
                <View style={styles.accountIcon}>
                  <Ionicons name="business-outline" size={19} color={TEAL} />
                </View>
                <View>
                  <Text style={styles.accountTitle}>City Administrator</Text>
                  <Text style={styles.accountDescription}>Secure access for authorized officials</Text>
                </View>
              </View>

              <Text style={styles.label}>Administrative location</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Select administrative location"
                onPress={() => setCityMenuOpen(true)}
                style={({ pressed }) => [styles.input, styles.selectInput, pressed && styles.pressed]}
              >
                <View style={styles.selectTextWrap}>
                  <Ionicons name="location-outline" size={18} color={TEAL} />
                  <Text numberOfLines={1} style={styles.selectText}>{CITY}</Text>
                </View>
                <Ionicons name="chevron-down" size={18} color="#53716F" />
              </Pressable>

              <Text style={styles.label}>Government email</Text>
              <View style={styles.input}>
                <Ionicons name="mail-outline" size={18} color="#53716F" />
                <TextInput
                  accessibilityLabel="Government email"
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  placeholder="name@city.gov.in"
                  placeholderTextColor="#78908E"
                  style={styles.textInput}
                  value={email}
                />
              </View>

              <Text style={styles.label}>Password</Text>
              <View style={styles.input}>
                <Ionicons name="lock-closed-outline" size={18} color="#53716F" />
                <TextInput
                  accessibilityLabel="Password"
                  autoComplete="current-password"
                  onChangeText={setPassword}
                  onSubmitEditing={onLogin}
                  placeholder="Enter your password"
                  placeholderTextColor="#78908E"
                  secureTextEntry={!showPassword}
                  style={styles.textInput}
                  value={password}
                />
                <Pressable
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  accessibilityRole="button"
                  hitSlop={10}
                  onPress={() => setShowPassword((visible) => !visible)}
                >
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#53716F" />
                </Pressable>
              </View>

              {error ? (
                <View accessibilityRole="alert" style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={18} color="#A63D36" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: isSubmitting }}
                disabled={isSubmitting}
                onPress={onLogin}
                style={({ pressed }) => [
                  styles.loginButton,
                  (pressed || isSubmitting) && styles.loginButtonPressed,
                ]}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>Login</Text>
                    <Ionicons name="arrow-forward" size={19} color="#FFFFFF" />
                  </>
                )}
              </Pressable>
            </View>

            <Text style={styles.securityNote}>
              Protected government system. Authorized access only.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        animationType="fade"
        onRequestClose={() => setCityMenuOpen(false)}
        transparent
        visible={cityMenuOpen}
      >
        <Pressable onPress={() => setCityMenuOpen(false)} style={styles.modalBackdrop}>
          <Pressable style={styles.locationSheet}>
            <Text style={styles.locationSheetTitle}>Administrative location</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setCityMenuOpen(false)}
              style={styles.locationOption}
            >
              <View style={styles.locationOptionText}>
                <Ionicons name="location" size={18} color={TEAL} />
                <Text style={styles.locationOptionLabel}>{CITY}</Text>
              </View>
              <Ionicons name="checkmark" size={20} color={TEAL} />
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: CREAM },
  keyboardAvoidingView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: { flexGrow: 1, width: '100%', maxWidth: 540, alignSelf: 'center', paddingHorizontal: 24, paddingVertical: 34 },
  branding: { alignItems: 'center', marginBottom: 34 },
  seal: { alignItems: 'center', backgroundColor: MINT, borderColor: '#B8DCCE', borderRadius: 34, borderWidth: 1, height: 68, justifyContent: 'center', marginBottom: 14, width: 68 },
  governmentLabel: { color: '#53716F', fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textAlign: 'center' },
  title: { color: TEAL, fontSize: 36, fontWeight: '800', marginTop: 7 },
  subtitle: { color: '#355B59', fontSize: 14, marginTop: 3, textAlign: 'center' },
  formSection: { backgroundColor: '#FFFEF8', borderColor: '#DDE7D6', borderRadius: 18, borderWidth: 1, padding: 20, shadowColor: '#315B54', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 18, elevation: 2 },
  accountHeader: { alignItems: 'center', flexDirection: 'row', gap: 11, marginBottom: 25 },
  accountIcon: { alignItems: 'center', backgroundColor: MINT, borderRadius: 18, height: 36, justifyContent: 'center', width: 36 },
  accountTitle: { color: '#173E3C', fontSize: 16, fontWeight: '700' },
  accountDescription: { color: '#66807D', fontSize: 12, marginTop: 2 },
  label: { color: '#294B49', fontSize: 13, fontWeight: '700', marginBottom: 8, marginTop: 17 },
  input: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#C8D8D1', borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: 10, minHeight: 52, paddingHorizontal: 14 },
  selectInput: { justifyContent: 'space-between' },
  selectTextWrap: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 10 },
  selectText: { color: '#244B48', flex: 1, fontSize: 14 },
  textInput: { color: '#1C3D3B', flex: 1, fontSize: 15, minWidth: 0, paddingVertical: 13 },
  pressed: { backgroundColor: '#F5FAF6' },
  errorBox: { alignItems: 'flex-start', backgroundColor: '#FCEAE7', borderColor: '#F1C6BF', borderRadius: 10, borderWidth: 1, flexDirection: 'row', gap: 8, marginTop: 18, padding: 11 },
  errorText: { color: '#81332D', flex: 1, fontSize: 13, lineHeight: 18 },
  loginButton: { alignItems: 'center', backgroundColor: TEAL, borderRadius: 12, flexDirection: 'row', gap: 9, height: 52, justifyContent: 'center', marginTop: 24 },
  loginButtonPressed: { backgroundColor: '#104A4A', opacity: 0.9 },
  loginButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  securityNote: { color: '#68817E', fontSize: 12, lineHeight: 18, marginTop: 22, paddingHorizontal: 16, textAlign: 'center' },
  modalBackdrop: { alignItems: 'center', backgroundColor: 'rgba(19, 55, 53, 0.35)', flex: 1, justifyContent: 'flex-end', padding: 18 },
  locationSheet: { backgroundColor: '#FFFEF8', borderRadius: 16, maxWidth: 540, padding: 20, width: '100%' },
  locationSheetTitle: { color: '#173E3C', fontSize: 16, fontWeight: '700', marginBottom: 15 },
  locationOption: { alignItems: 'center', backgroundColor: MINT, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', minHeight: 52, paddingHorizontal: 14 },
  locationOptionText: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  locationOptionLabel: { color: '#244B48', fontSize: 14, fontWeight: '600' },
});
