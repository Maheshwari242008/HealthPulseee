// app/user/landing.tsx
import React from "react";
import { Pressable, StatusBar, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, type Href } from "expo-router";

const LOGIN_ROUTE = "/homepage/Options" as Href;

const C = {
  bg: "#FAF7F1",
  teal: "#0E5A60",
  leafDark: "#0F5F68",
  leafLight: "#5FB07E",
  tagline: "#5E7280",
};

function Logo({ size }: { size: number }) {
  const k = size / 192; // reference logo box is ~192 x 190
  return (
    <View style={{ width: 192 * k, height: 190 * k }}>
      {/* left, darker leaf */}
      <View
        style={{
          position: "absolute",
          left: 0,
          top: 80 * k,
          width: 82 * k,
          height: 108 * k,
          backgroundColor: C.leafDark,
          borderTopLeftRadius: 6 * k,
          borderBottomRightRadius: 6 * k,
          borderTopRightRadius: 90 * k,
          borderBottomLeftRadius: 90 * k,
          transform: [{ rotate: "-4deg" }],
        }}
      />
      {/* right, lighter leaf */}
      <View
        style={{
          position: "absolute",
          left: 80 * k,
          top: 0,
          width: 112 * k,
          height: 188 * k,
          backgroundColor: C.leafLight,
          borderTopRightRadius: 6 * k,
          borderBottomLeftRadius: 6 * k,
          borderTopLeftRadius: 120 * k,
          borderBottomRightRadius: 120 * k,
          transform: [{ rotate: "10deg" }],
        }}
      />
      {/* white medical cross */}
      <View style={{ position: "absolute", left: 113 * k, top: 66 * k, width: 52 * k, height: 52 * k }}>
        <View
          style={{
            position: "absolute",
            left: 18 * k,
            top: 0,
            width: 16 * k,
            height: 52 * k,
            borderRadius: 4 * k,
            backgroundColor: "#FFFFFF",
          }}
        />
        <View
          style={{
            position: "absolute",
            left: 0,
            top: 18 * k,
            width: 52 * k,
            height: 16 * k,
            borderRadius: 4 * k,
            backgroundColor: "#FFFFFF",
          }}
        />
      </View>
    </View>
  );
}

export default function LandingScreen() {
  const { width: W, height: H } = useWindowDimensions();
  const logoSize = Math.min(W * 0.3, 140);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* top-right Log in */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.push(LOGIN_ROUTE)}
          accessibilityRole="button"
          accessibilityLabel="Log in"
          hitSlop={8}
          style={({ pressed }) => [styles.loginBtn, pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.loginText}>Log in</Text>
        </Pressable>
      </View>

      {/* centered brand group */}
      <View style={[styles.center, { paddingBottom: H * 0.1 }]}>
        <Logo size={logoSize} />
        <Text style={[styles.name, { fontSize: W * 0.1, marginTop: W * 0.045 }]}>HealthWatch</Text>
        <Text
          style={[
            styles.tagline,
            { fontSize: W * 0.046, lineHeight: W * 0.046 * 1.55, marginTop: W * 0.035 },
          ]}
        >
          {"Healthier Communities\nSafer Tomorrows"}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  loginBtn: {
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.teal,
    backgroundColor: "transparent",
  },
  loginText: { color: C.teal, fontSize: 14, fontWeight: "600" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  name: { color: C.teal, fontWeight: "700", letterSpacing: -0.5, textAlign: "center" },
  tagline: { color: C.tagline, textAlign: "center", fontWeight: "500" },
});