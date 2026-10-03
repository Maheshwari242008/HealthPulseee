import { useState } from 'react';
import { Button, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { signOut } from '@/services/authService';

export default function More() {
  const router = useRouter();
  const [msg, setMsg] = useState('');

  async function onLogout() {
    try {
      await signOut();
      router.replace('/' as Href);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Logout failed');
    }
  }

  return (
    <View style={{ flex: 1, padding: 16, paddingTop: 48, gap: 12 }}>
      <Text style={{ fontWeight: 'bold' }}>More</Text>
      <Button title="Administration" onPress={() => router.push('/(admin)/administration' as Href)} />
      <Button title="Logout" onPress={onLogout} />
      {msg ? <Text>{msg}</Text> : null}
    </View>
  );
}
