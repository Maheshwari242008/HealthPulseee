// app/user/landing.tsx
//
// NOTE: no ZIP was attached to this conversation, so routes are taken from the
// architecture document (not verified against the project):
//   Log in      -> /(auth)/login        (app/(auth)/login.tsx)
//   Get Started -> /user/role-selection (app/user/role-selection.tsx)
// If your project's file names differ, change only the two constants below.

import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, type Href } from "expo-router";

const LOGIN_ROUTE = "/(auth)/login" as Href;
const ROLE_SELECTION_ROUTE = "/user/role-selection" as Href;

const COLORS = {
  teal: "#0F5960",
  ocean: "#176B87",
  sage: "#8FBFA3",
  mint: "#DCEFE5",
  ivory: "#F7F4EA",
  amber: "#E8B84A",
  coral: "#D9655D",
  ink: "#16343A",
  muted: "#5C7479",
  line: "#D5E3DE",
};

const STEPS = [
  { n: "01", title: "Labs share aggregated counts" },
  { n: "02", title: "Privacy protection" },
  { n: "03", title: "Risk analysis" },
  { n: "04", title: "Community awareness" },
];

// Small satellites around the central "area" circle.
// angle in degrees (0 = right, 90 = down), distance as a fraction of half the visual size.
const SIGNALS = [
  { angle: -62, dist: 0.8, size: 18, color: COLORS.teal },
  { angle: 12, dist: 0.88, size: 22, color: COLORS.amber },
  { angle: 118, dist: 0.76, size: 16, color: COLORS.sage },
  { angle: 205, dist: 0.84, size: 14, color: COLORS.coral },
];

function HealthSignalVisual({ size }: { size: number }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const haloScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.14] });
  const haloOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.2] });

  const half = size / 2;
  const core = size * 0.3;
  const ring = size * 0.5;
  const halo = size * 0.66;

  return (
    <View
      style={[styles.visual, { width: size, height: size }]}
      accessible
      accessibilityLabel="Illustration of health activity being monitored across nearby areas"
    >
      {/* Connecting lines */}
      {SIGNALS.map((s, i) => {
        const rad = (s.angle * Math.PI) / 180;
        const d = s.dist * half;
        const start = core / 2;
        const len = d - start;
        const mx = half + Math.cos(rad) * (start + len / 2);
        const my = half + Math.sin(rad) * (start + len / 2);
        return (
          <View
            key={`l${i}`}
            style={[
              styles.line,
              {
                width: len,
                left: mx - len / 2,
                top: my - 0.5,
                transform: [{ rotate: `${s.angle}deg` }],
              },
            ]}
          />
        );
      })}

      {/* Pulsing halo */}
      <Animated.View
        style={[
          styles.circle,
          {
            width: halo,
            height: halo,
            borderRadius: halo / 2,
            left: half - halo / 2,
            top: half - halo / 2,
            backgroundColor: COLORS.mint,
            opacity: haloOpacity,
            transform: [{ scale: haloScale }],
          },
        ]}
      />
      {/* Ring */}
      <View
        style={[
          styles.circle,
          {
            width: ring,
            height: ring,
            borderRadius: ring / 2,
            left: half - ring / 2,
            top: half - ring / 2,
            backgroundColor: "#EAF5EF",
            borderWidth: 1,
            borderColor: COLORS.sage,
          },
        ]}
      />
      {/* Core (the user's area) */}
      <View
        style={[
          styles.circle,
          {
            width: core,
            height: core,
            borderRadius: core / 2,
            left: half - core / 2,
            top: half - core / 2,
            backgroundColor: COLORS.teal,
          },
        ]}
      >
        <View style={styles.coreDot} />
      </View>

      {/* Nearby signals */}
      {SIGNALS.map((s, i) => {
        const rad = (s.angle * Math.PI) / 180;
        const d = s.dist * half;
        return (
          <View
            key={`s${i}`}
            style={[
              styles.circle,
              {
                width: s.size,
                height: s.size,
                borderRadius: s.size / 2,
                left: half + Math.cos(rad) * d - s.size / 2,
                top: half + Math.sin(rad) * d - s.size / 2,
                backgroundColor: s.color,
                borderWidth: 3,
                borderColor: COLORS.ivory,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

export default function LandingScreen() {
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [howY, setHowY] = useState(0);

  const visualSize = Math.min(Math.max(width - 96, 200), 280);

  const goLogin = () => router.push(LOGIN_ROUTE);
  const goGetStarted = () => router.push(ROLE_SELECTION_ROUTE);
  const scrollToHow = () => scrollRef.current?.scrollTo({ y: Math.max(howY - 16, 0), animated: true });
  const onHowLayout = (e: LayoutChangeEvent) => setHowY(e.nativeEvent.layout.y);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.ivory} />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* 1. Header */}
        <View style={styles.header}>
          <View style={styles.brand}>
            <View style={styles.brandMark}>
              <View style={styles.crossV} />
              <View style={styles.crossH} />
            </View>
            <Text style={styles.brandText}>HealthWatch</Text>
          </View>

          <Pressable
            onPress={goLogin}
            accessibilityRole="button"
            accessibilityLabel="Log in"
            hitSlop={8}
            style={({ pressed }) => [styles.loginBtn, pressed && styles.loginBtnPressed]}
          >
            <Text style={styles.loginText}>Log in</Text>
          </Pressable>
        </View>

        {/* 2. Hero */}
        <View style={styles.hero}>
          <Text style={styles.title} accessibilityRole="header">
            Know what's happening around you.
          </Text>
          <Text style={styles.subtitle}>
            Stay informed about local disease activity and receive early alerts when risk changes.
          </Text>
        </View>

        {/* 3. Visual */}
        <View style={styles.visualWrap}>
          <HealthSignalVisual size={visualSize} />
        </View>

        {/* 4. Actions */}
        <View style={styles.actions}>
          <Pressable
            onPress={goGetStarted}
            accessibilityRole="button"
            accessibilityLabel="Get started"
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryBtnPressed]}
          >
            <Text style={styles.primaryText}>Get Started</Text>
          </Pressable>

          <Pressable
            onPress={scrollToHow}
            accessibilityRole="button"
            accessibilityLabel="How it works"
            hitSlop={8}
            style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.secondaryText}>How it works</Text>
          </Pressable>
        </View>

        {/* How it works */}
        <View style={styles.how} onLayout={onHowLayout}>
          <Text style={styles.sectionLabel}>HOW IT WORKS</Text>
          {STEPS.map((s, i) => (
            <View key={s.n} style={[styles.stepRow, i === STEPS.length - 1 && { borderBottomWidth: 0 }]}>
              <Text style={styles.stepNum}>{s.n}</Text>
              <Text style={styles.stepTitle}>{s.title}</Text>
            </View>
          ))}
        </View>

        {/* Privacy */}
        <View style={styles.privacy}>
          <View style={styles.privacyDot} />
          <Text style={styles.privacyText}>
            Community-level insights. No patient names, phone numbers, addresses, or personal medical
            information.
          </Text>
        </View>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          HealthWatch provides community awareness information and is not a medical diagnosis or
          emergency service.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.ivory },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 28 },

  // Header
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brand: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandMark: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: COLORS.teal,
    alignItems: "center",
    justifyContent: "center",
  },
  crossV: { position: "absolute", width: 4, height: 16, borderRadius: 2, backgroundColor: COLORS.mint },
  crossH: { position: "absolute", width: 16, height: 4, borderRadius: 2, backgroundColor: COLORS.mint },
  brandText: { fontSize: 20, fontWeight: "700", color: COLORS.teal, letterSpacing: 0.2 },
  loginBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: COLORS.teal,
    backgroundColor: "transparent",
  },
  loginBtnPressed: { backgroundColor: COLORS.mint },
  loginText: { color: COLORS.teal, fontSize: 14, fontWeight: "700" },

  // Hero
  hero: { marginTop: 36 },
  title: { fontSize: 34, lineHeight: 40, fontWeight: "800", color: COLORS.teal, letterSpacing: -0.5 },
  subtitle: { marginTop: 14, fontSize: 16, lineHeight: 24, color: COLORS.muted, maxWidth: 440 },

  // Visual
  visualWrap: { alignItems: "center", marginTop: 28, marginBottom: 8 },
  visual: { position: "relative" },
  circle: { position: "absolute", alignItems: "center", justifyContent: "center" },
  coreDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.mint },
  line: { position: "absolute", height: 1, backgroundColor: COLORS.line },

  // Actions
  actions: { marginTop: 24, alignItems: "center" },
  primaryBtn: {
    width: "100%",
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: COLORS.teal,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.teal,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  primaryBtnPressed: { backgroundColor: COLORS.ocean, transform: [{ scale: 0.985 }] },
  primaryText: { color: "#FFFFFF", fontSize: 17, fontWeight: "700" },
  secondaryBtn: { marginTop: 14, paddingVertical: 8, paddingHorizontal: 12 },
  secondaryText: { color: COLORS.ocean, fontSize: 15, fontWeight: "600" },

  // How it works
  how: {
    marginTop: 36,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 6,
  },
  sectionLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 1.2, color: COLORS.muted, marginBottom: 6 },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  stepNum: { width: 38, fontSize: 15, fontWeight: "700", color: COLORS.sage },
  stepTitle: { flex: 1, fontSize: 15, fontWeight: "600", color: COLORS.ink },

  // Privacy + disclaimer
  privacy: {
    marginTop: 22,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: COLORS.mint,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  privacyDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.teal, marginTop: 6 },
  privacyText: { flex: 1, fontSize: 13, lineHeight: 19, color: COLORS.teal },
  disclaimer: { marginTop: 18, fontSize: 11.5, lineHeight: 17, color: COLORS.muted, textAlign: "center" },
});