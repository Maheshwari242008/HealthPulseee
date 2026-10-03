// app/user/role-selection.tsx
import React from "react";
import { Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";

// Existing login routes (adjust here if your project uses different names)
const COMMUNITY_LOGIN = "/user/sign-in" as Href;
const LAB_LOGIN = "/lab_assistant/login" as Href;
const AUTHORITY_LOGIN = "/(auth)/login" as Href;

const C = {
  bg: "#F7F4EA",
  card: "#FFFDF8",
  border: "#E7E3D6",
  teal: "#0F5960",
  green: "#13705F",
  ink: "#16343A",
  muted: "#5C7479",
  mint: "#DCEFE5",
  sky: "#E6F2F6",
  sand: "#FBEBC8",
};

const SERIF = Platform.select({ ios: "Georgia", android: "serif", default: "serif" });

type Role = {
  key: string;
  title: string;
  description: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  tint: string;
  href: Href;
};

const ROLES: Role[] = [
  {
    key: "community",
    title: "Community User",
    description: "View local disease awareness alerts.",
    icon: "people-outline",
    tint: C.mint,
    href: COMMUNITY_LOGIN,
  },
  {
    key: "lab",
    title: "Lab Assistant",
    description: "Submit aggregated case information.",
    icon: "flask-outline",
    tint: C.sky,
    href: LAB_LOGIN,
  },
  {
    key: "authority",
    title: "Health Authority",
    description: "Monitor trends and affected areas.",
    icon: "shield-checkmark-outline",
    tint: C.sand,
    href: AUTHORITY_LOGIN,
  },
];

export default function RoleSelectionScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.brand}>
          <Ionicons name="leaf-outline" size={28} color={C.green} />
          <Text style={styles.brandText}>HealthWatch</Text>
        </View>

        <Text style={styles.heading} accessibilityRole="header">
          Choose your role
        </Text>

        <View style={styles.list}>
          {ROLES.map((r) => (
            <Pressable
              key={r.key}
              onPress={() => router.push(r.href)}
              accessibilityRole="button"
              accessibilityLabel={`${r.title}. ${r.description}`}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            >
              <View style={[styles.iconTile, { backgroundColor: r.tint }]}>
                <Ionicons name={r.icon} size={28} color={C.teal} />
              </View>
              <View style={styles.textCol}>
                <Text style={styles.title}>{r.title}</Text>
                <Text style={styles.desc}>{r.description}</Text>
              </View>
              <Ionicons name="arrow-forward" size={22} color={C.ink} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 36, paddingBottom: 32 },

  brand: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  brandText: { fontFamily: SERIF, fontSize: 30, fontWeight: "700", color: C.green },

  heading: {
    fontFamily: SERIF,
    fontSize: 28,
    fontWeight: "700",
    color: C.green,
    textAlign: "center",
    marginTop: 30,
  },

  list: { marginTop: 32, gap: 16 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 16,
    shadowColor: "#0F5960",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardPressed: { transform: [{ scale: 0.985 }], backgroundColor: "#F8F5EC" },

  iconTile: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  textCol: { flex: 1 },
  title: { fontSize: 20, fontWeight: "700", color: C.ink, letterSpacing: 0.2 },
  desc: { marginTop: 4, fontSize: 16, lineHeight: 23, color: C.muted },
});