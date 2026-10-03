import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

// Placeholder: ward detail is the next page to build.
export default function WardDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Ward detail for area {id} (coming next)</Text>
    </View>
  );
}
