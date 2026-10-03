import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import type { ComponentProps, ReactNode } from "react";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AreaPickerModal } from "@/components/AreaPickerModel";
import { MockBanner } from "@/components/StateViews";
import { CONFIG } from "@/constants/config";
import { DISCLAIMER } from "@/constants/diseases";
import { theme } from "@/constants/theme";
import { useHomeArea } from "@/hooks/useHomeArea";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useSession } from "@/hooks/useSession";
import { areaTitle } from "@/lib/format";
import { signOut } from "@/services/authService";

type IconName = ComponentProps<typeof Ionicons>["name"];

function Row({
  icon,
  label,
  value,
  onPress,
  right,
}: {
  icon: IconName;
  label: string;
  value?: string;
  onPress?: () => void;
  right?: ReactNode;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress} disabled={!onPress}>
      <Ionicons name={icon} size={22} color={theme.colors.primary} />
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {value ? (
          <Text style={styles.rowValue} numberOfLines={1}>
            {value}
          </Text>
        ) : null}
      </View>
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={theme.colors.muted} /> : null)}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session } = useSession();
  const profileQuery = useProfile();
  const updateProfile = useUpdateProfile();
  const { area, areas, setArea } = useHomeArea();
  const [pickerOpen, setPickerOpen] = useState(false);

  const profile = profileQuery.data;
  const name = profile?.full_name?.trim() || "Your profile";
  const email = session?.user.email ?? (CONFIG.USE_MOCK ? "demo@healthpulse.app" : "Not signed in");
  const initials =
    (profile?.full_name ?? session?.user.email ?? "?")
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0].toUpperCase())
      .join("") || "?";

  const confirmSignOut = () => {
    Alert.alert("Sign out", "Do you want to sign out of HealthPulse?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
          } catch {
            // already signed out; continue
          }
          queryClient.clear();
          router.replace("/");
        },
      },
    ]);
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        {CONFIG.USE_MOCK ? <MockBanner /> : null}

        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.email} numberOfLines={1}>
              {email}
            </Text>
          </View>
        </View>

        <View style={styles.group}>
          <Row
            icon="location-outline"
            label="Home area"
            value={area ? areaTitle(area) : "Not set"}
            onPress={() => setPickerOpen(true)}
          />
          <Row
            icon="notifications-outline"
            label="Alert notifications"
            right={
              <Switch
                value={profile?.notification_enabled ?? true}
                onValueChange={(enabled) => updateProfile.mutate({ notification_enabled: enabled })}
                trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
              />
            }
          />
        </View>

        <View style={styles.group}>
          <Row icon="person-outline" label="Edit profile" onPress={() => router.push("/user/edit-profile")} />
          <Row
            icon="options-outline"
            label="Notification settings"
            onPress={() => router.push("/user/notification-settings")}
          />
          <Row icon="settings-outline" label="App settings" onPress={() => router.push("/user/app-settings")} />
          <Row icon="leaf-outline" label="Prevention tips" onPress={() => router.push("/user/prevention-tips")} />
        </View>

        <Pressable style={styles.signOut} onPress={confirmSignOut}>
          <Ionicons name="log-out-outline" size={20} color={theme.colors.danger} />
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>

        <Text style={styles.disclaimer}>{DISCLAIMER}</Text>
      </ScrollView>

      <AreaPickerModal
        visible={pickerOpen}
        areas={areas}
        selectedId={area?.id ?? null}
        onSelect={setArea}
        onClose={() => setPickerOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  header: { flexDirection: "row", alignItems: "center", gap: 16, paddingVertical: 8 },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontFamily: theme.fonts.heading, fontSize: 26, fontWeight: "700", color: theme.colors.primaryText },
  name: { fontFamily: theme.fonts.heading, fontSize: 26, fontWeight: "800", color: theme.colors.primary },
  email: { fontSize: 14, color: theme.colors.muted, marginTop: 2 },
  group: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  rowLabel: { fontSize: 16, color: theme.colors.text, fontWeight: "500" },
  rowValue: { fontSize: 13, color: theme.colors.muted, marginTop: 2 },
  signOut: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: theme.radius.small,
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  signOutText: { fontSize: 16, fontWeight: "700", color: theme.colors.danger },
  disclaimer: { fontSize: 12, lineHeight: 18, color: theme.colors.muted, textAlign: "center" },
});
