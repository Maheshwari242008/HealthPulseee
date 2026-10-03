import { Stack } from "expo-router";

export default function LabAssistantLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="Home" />
      <Stack.Screen name="Alerts" />
      <Stack.Screen name="AlertDetail" />
      <Stack.Screen name="LocationPermission" />
      <Stack.Screen name="PreventionTips" />
      <Stack.Screen name="Profile" />
      <Stack.Screen name="RiskMap" />
      <Stack.Screen name="login" />
    </Stack>
  );
}