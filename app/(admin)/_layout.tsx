import { Stack } from "expo-router";

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="administration" />
      <Stack.Screen name="alerts" />
      <Stack.Screen name="lab-authority" />
      <Stack.Screen name="map" />
      <Stack.Screen name="actions" />
      <Stack.Screen name="suggested-actions" />
      <Stack.Screen name="more" />
      <Stack.Screen name="ward" />
    </Stack>
  );
}