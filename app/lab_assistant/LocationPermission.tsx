import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { Button, Card, Page } from "@/components/ui";
import { CONFIG } from "@/constants/config";
import { theme } from "@/constants/theme";
import { useHomeArea } from "@/hooks/useHomeArea";
import { areaTitle } from "@/lib/format";

/** Asks for location once and sets the nearest grid cell as the home area. */
export default function LocationPermissionScreen() {
  const router = useRouter();
  const { area, areas, setArea } = useHomeArea();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const useMyLocation = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== "granted") {
        setMessage("Location permission was denied. You can still choose your area manually from your profile.");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      let best: (typeof areas)[number] | null = null;
      let bestD = Infinity;
      for (const a of areas) {
        const d = (a.cell_lat - pos.coords.latitude) ** 2 + (a.cell_lon - pos.coords.longitude) ** 2;
        if (d < bestD) {
          best = a;
          bestD = d;
        }
      }
      // Further than ~3 cells from the grid = outside the covered region
      if (!best || bestD > (CONFIG.CELL_STEP * 3) ** 2) {
        setMessage("You appear to be outside the area HealthPulse currently covers. Choose an area manually instead.");
        return;
      }
      setArea(best.id);
      setMessage(`Home area set to ${areaTitle(best)}.`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not get your location.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page title="Use your location" back>
      <Card>
        <Text style={styles.text}>
          HealthPulse uses your location once to pick the nearest 1 km area. Your exact position is never stored or shared.
        </Text>
        <Text style={styles.current}>Current area: {area ? areaTitle(area) : "Not set"}</Text>
      </Card>
      {message ? <Text style={styles.text}>{message}</Text> : null}
      <Button label="Use my location" onPress={useMyLocation} loading={busy} />
      <Button label="Done" variant="outline" onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))} />
    </Page>
  );
}

const styles = StyleSheet.create({
  text: { fontSize: 15, lineHeight: 22, color: theme.colors.text },
  current: { fontSize: 15, fontWeight: "600", color: theme.colors.primary },
});
