import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { RoleGuard } from "@/components/RoleGuard";
import { theme } from "@/constants/theme";

const hidden = { href: null } as const;

export default function AdminLayout() {
  return (
    <RoleGuard allow={["administrator"]}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.tabInactive,
          tabBarActiveBackgroundColor: theme.colors.mint,
          tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
          tabBarItemStyle: { borderRadius: theme.radius.tab, marginHorizontal: 4, marginVertical: 6 },
          tabBarStyle: { backgroundColor: theme.colors.background, borderTopColor: "transparent", height: 72 },
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{ title: "Overview", tabBarIcon: ({ color, size }) => <Ionicons name="pulse-outline" size={size} color={color} /> }}
        />
        <Tabs.Screen
          name="map"
          options={{ title: "Map", tabBarIcon: ({ color, size }) => <Ionicons name="map-outline" size={size} color={color} /> }}
        />
        <Tabs.Screen
          name="alerts"
          options={{ title: "Alerts", tabBarIcon: ({ color, size }) => <Ionicons name="notifications-outline" size={size} color={color} /> }}
        />
        <Tabs.Screen
          name="actions"
          options={{ title: "New alert", tabBarIcon: ({ color, size }) => <Ionicons name="megaphone-outline" size={size} color={color} /> }}
        />
        <Tabs.Screen
          name="more"
          options={{ title: "More", tabBarIcon: ({ color, size }) => <Ionicons name="menu-outline" size={size} color={color} /> }}
        />
        <Tabs.Screen name="administration" options={hidden} />
        <Tabs.Screen name="lab-authority" options={hidden} />
        <Tabs.Screen name="suggested-actions" options={hidden} />
        <Tabs.Screen name="ward/[id]" options={hidden} />
      </Tabs>
    </RoleGuard>
  );
}
