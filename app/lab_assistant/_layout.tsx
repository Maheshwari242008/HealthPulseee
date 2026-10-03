import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { RoleGuard } from "@/components/RoleGuard";
import { theme } from "@/constants/theme";

const hidden = { href: null, tabBarStyle: { display: "none" as const } };

export default function LabAssistantLayout() {
  return (
    <RoleGuard allow={["lab"]} publicRoutes={["login"]}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.tabInactive,
          tabBarActiveBackgroundColor: theme.colors.mint,
          tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
          tabBarItemStyle: { borderRadius: theme.radius.tab, marginHorizontal: 6, marginVertical: 6 },
          tabBarStyle: { backgroundColor: theme.colors.background, borderTopColor: "transparent", height: 72 },
        }}
      >
        <Tabs.Screen
          name="Home"
          options={{ title: "Report", tabBarIcon: ({ color, size }) => <Ionicons name="flask-outline" size={size} color={color} /> }}
        />
        <Tabs.Screen
          name="RiskMap"
          options={{ title: "Map", tabBarIcon: ({ color, size }) => <Ionicons name="map-outline" size={size} color={color} /> }}
        />
        <Tabs.Screen
          name="Alerts"
          options={{ title: "Alerts", tabBarIcon: ({ color, size }) => <Ionicons name="notifications-outline" size={size} color={color} /> }}
        />
        <Tabs.Screen
          name="Profile"
          options={{ title: "Profile", tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }}
        />
        <Tabs.Screen name="index" options={hidden} />
        <Tabs.Screen name="login" options={hidden} />
        <Tabs.Screen name="AlertDetail" options={{ href: null }} />
        <Tabs.Screen name="LocationPermission" options={{ href: null }} />
        <Tabs.Screen name="PreventionTips" options={{ href: null }} />
      </Tabs>
    </RoleGuard>
  );
}
