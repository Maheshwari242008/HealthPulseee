import { Alert } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { signOut } from '@/services/authService';
import MoreView from '@/components/admin/MoreView';

export default function More() {
  const router = useRouter();

  async function onLogout() {
    try {
      await signOut();
      router.replace('/' as Href);
    } catch (e) {
      Alert.alert('Logout failed', e instanceof Error ? e.message : 'Logout failed');
    }
  }

  return (
    <MoreView
      onAdministration={() => router.push('/(admin)/administration' as Href)}
      onLogout={onLogout}
    />
  );
}