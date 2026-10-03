import { Button, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';

export default function Administration() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, padding: 16, paddingTop: 48, gap: 12 }}>
      <Text style={{ fontWeight: 'bold' }}>Administration</Text>
      <Text>Role: Administrator</Text>
      <Text>Data is aggregated and anonymized. No personal patient information is stored.</Text>
      <Button title="Add / manage lab authorities" onPress={() => router.push('/(admin)/lab-authority' as Href)} />
    </View>
  );
}
