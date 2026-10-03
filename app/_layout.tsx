import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRealtimeSync } from "@/hooks/useRealTimeSync";
import { useSession } from "@/hooks/useSession";
import { queryClient } from "@/lib/queryClient";
import { setupNotifications } from "@/lib/notifications";

setupNotifications();

function RealtimeBridge() {
  const { session } = useSession();
  useRealtimeSync(!!session);
  return null;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <RealtimeBridge />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="homepage" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="lab_assistant" />
        <Stack.Screen name="user" />
      </Stack>
    </QueryClientProvider>
  );
}
