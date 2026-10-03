import { useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "@/constants/theme";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.replace("/"), 1600);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <View style={styles.screen}>
      <View style={styles.pulse} />
      <Text style={styles.name}>HealthPulse</Text>
      <Text style={styles.tag}>Know what's spreading near you</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: theme.colors.primary },
  pulse: { width: 84, height: 84, borderRadius: 42, backgroundColor: theme.colors.mint, opacity: 0.9, marginBottom: 14 },
  name: { fontFamily: theme.fonts.heading, fontSize: 38, fontWeight: "800", color: theme.colors.primaryText },
  tag: { fontSize: 16, color: theme.colors.mint },
});
