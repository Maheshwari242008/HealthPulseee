import { useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import { Alert, StyleSheet, Text } from "react-native";
import { Card, Group, ListRow, Page } from "@/components/ui";
import { CONFIG } from "@/constants/config";
import { DISCLAIMER } from "@/constants/diseases";
import { theme } from "@/constants/theme";

export default function AppSettingsScreen() {
  const queryClient = useQueryClient();

  return (
    <Page title="App settings" back>
      <Group>
        <ListRow
          icon="refresh-outline"
          label="Refresh data"
          value="Clear cached data and reload"
          onPress={() => {
            queryClient.invalidateQueries();
            Alert.alert("Refreshing", "Latest data is being loaded.");
          }}
        />
        <ListRow icon="information-circle-outline" label="Version" value={Constants.expoConfig?.version ?? "1.0.0"} />
        <ListRow icon="server-outline" label="Data source" value={CONFIG.USE_MOCK ? "Sample data (demo mode)" : "Live database"} />
      </Group>
      <Card>
        <Text style={styles.title}>Your privacy</Text>
        <Text style={styles.text}>
          HealthPulse only shows aggregated case counts per ~1 km area. No patient names or records are stored, and
          areas with fewer than {CONFIG.PRIVACY_MIN_CASES} recent cases are hidden.
        </Text>
      </Card>
      <Text style={styles.disclaimer}>{DISCLAIMER}</Text>
    </Page>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: theme.fonts.heading, fontSize: 18, fontWeight: "700", color: theme.colors.primary },
  text: { fontSize: 14, lineHeight: 21, color: theme.colors.muted },
  disclaimer: { fontSize: 12, lineHeight: 18, color: theme.colors.muted, textAlign: "center" },
});
