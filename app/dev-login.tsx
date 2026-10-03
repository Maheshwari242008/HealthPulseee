import { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { signIn } from '@/services/authService';

// TEMPORARY: delete this file once the real login (app/(auth)/login.tsx) is merged.
export default function DevLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  async function onSignIn() {
    setMsg('Signing in...');
    try {
      await signIn(email.trim(), password);
      router.replace('/(admin)' as Href);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Sign in failed');
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 12 }}>
      <Text>Dev login (temporary)</Text>
      <TextInput
        placeholder="email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 10 }}
      />
      <TextInput
        placeholder="password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, padding: 10 }}
      />
      <Button title="Sign in" onPress={onSignIn} />
      <Text>{msg}</Text>
    </View>
  );
}
