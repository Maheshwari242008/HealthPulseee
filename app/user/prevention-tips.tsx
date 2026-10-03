import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ErrorView, LoadingView } from "@/components/StateViews";
import { Card, Page, SectionTitle } from "@/components/ui";
import { DISCLAIMER, getDiseaseMeta } from "@/constants/diseases";
import { theme } from "@/constants/theme";
import { useDiseases } from "@/hooks/useDiseases";
import { capitalize, toLines } from "@/lib/format";

const GENERAL = [
  "Wash hands with soap before eating and after using the toilet",
  "Drink boiled, filtered or bottled water",
  "Do not let water collect around your home — empty coolers, pots and tyres weekly",
  "Use mosquito nets and repellent, especially at dawn and dusk",
  "See a doctor early if fever lasts more than 2 days",
];

export default function PreventionTipsScreen() {
  const { data, isLoading, error, refetch } = useDiseases();
  const [open, setOpen] = useState<string | null>(null);

  if (isLoading) return <LoadingView />;
  if (error) return <ErrorView message={error instanceof Error ? error.message : undefined} onRetry={refetch} />;

  return (
    <Page title="Prevention tips" back>
      <Card>
        <SectionTitle>Everyday precautions</SectionTitle>
        {GENERAL.map((t) => (
          <View key={t} style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.body}>{t}</Text>
          </View>
        ))}
      </Card>

      {(data ?? []).map((d) => {
        const isOpen = open === d.name;
        const steps = toLines(d.precautions);
        return (
          <Pressable key={d.id} onPress={() => setOpen(isOpen ? null : d.name)}>
            <Card>
              <View style={styles.head}>
                <Text style={styles.name}>
                  {getDiseaseMeta(d.name)?.emoji ?? "•"} {capitalize(d.name)}
                </Text>
                <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={18} color={theme.colors.primary} />
              </View>
              {isOpen ? (
                <View style={{ gap: 6 }}>
                  {steps.map((s) => (
                    <View key={s} style={styles.bulletRow}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.body}>{s}</Text>
                    </View>
                  ))}
                  {d.when_to_seek_care ? <Text style={styles.care}>{d.when_to_seek_care}</Text> : null}
                </View>
              ) : null}
            </Card>
          </Pressable>
        );
      })}
      <Text style={styles.disclaimer}>{DISCLAIMER}</Text>
    </Page>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  name: { fontFamily: theme.fonts.heading, fontSize: 20, fontWeight: "700", color: theme.colors.primary },
  bulletRow: { flexDirection: "row", gap: 8 },
  bullet: { fontSize: 15, lineHeight: 22, color: theme.colors.primary },
  body: { flex: 1, fontSize: 15, lineHeight: 22, color: theme.colors.text },
  care: { fontSize: 14, lineHeight: 20, color: theme.colors.danger, marginTop: 6 },
  disclaimer: { fontSize: 12, lineHeight: 18, color: theme.colors.muted, textAlign: "center" },
});
