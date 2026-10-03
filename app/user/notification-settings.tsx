import { useState } from "react";
import { Alert, StyleSheet, Switch, Text } from "react-native";
import { Card, Group, ListRow, Page } from "@/components/ui";
import { CONFIG } from "@/constants/config";
import { theme } from "@/constants/theme";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { registerForPushToken } from "@/lib/notifications";

export default function NotificationSettingsScreen() {
  const profileQuery = useProfile();
  const update = useUpdateProfile();
  const [busy, setBusy] = useState(false);
  const enabled = profileQuery.data?.notification_enabled ?? true;
  const hasToken = !!profileQuery.data?.push_token;

  const toggle = async (value: boolean) => {
    if (!value) {
      update.mutate({ notification_enabled: false });
      return;
    }
    setBusy(true);
    try {
      if (CONFIG.USE_MOCK) {
        update.mutate({ notification_enabled: true });
        return;
      }
      const token = await registerForPushToken();
      if (!token) {
        Alert.alert(
        "Notifications unavailable",
        "Push notifications need a development build (not Expo Go) on a real device, with notifications allowed in phone settings."
      );
        return;
      }
      update.mutate({ notification_enabled: true, push_token: token });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page title="Notification settings" back>
      <Group>
        <ListRow
          icon="notifications-outline"
          label="Alert notifications"
          value={enabled ? (hasToken ? "On for this device" : "On — tap to register this device") : "Off"}
          right={
            <Switch
              value={enabled}
              disabled={busy}
              onValueChange={toggle}
              trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
            />
          }
        />
        {enabled && !hasToken && !CONFIG.USE_MOCK ? (
          <ListRow icon="phone-portrait-outline" label="Register this device" onPress={() => toggle(true)} />
        ) : null}
      </Group>
      <Card>
        <Text style={styles.text}>
          You are notified when disease activity rises to Moderate or High in your home area or a neighbouring area.
          Alerts are indicators, not a diagnosis.
        </Text>
      </Card>
    </Page>
  );
}

const styles = StyleSheet.create({ text: { fontSize: 14, lineHeight: 21, color: theme.colors.muted } });
