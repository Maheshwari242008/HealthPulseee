import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { EmptyView, ErrorView, LoadingView } from "@/components/StateViews";
import { Card, Page, SectionTitle } from "@/components/ui";
import { DISCLAIMER, getDiseaseMeta } from "@/constants/diseases";
import { theme } from "@/constants/theme";
import { useDiseases } from "@/hooks/useDiseases";
import { capitalize, toLines } from "@/lib/format";

export default function DiseaseInfoScreen() {
  const { name } = useLocalSearchParams<{ name?: string }>();
  const { data, isLoading, error, refetch } = useDiseases();

  if (isLoading) return <LoadingView />;
  if (error) return <ErrorView message={error instanceof Error ? error.message : undefined} onRetry={refetch} />;

  const disease = data?.find((d) => d.name === name);
  if (!disease) return <EmptyView title="Disease not found" text="Go back and choose a disease from the home screen." />;

  const meta = getDiseaseMeta(disease.name);
  return (
    <Page title={`${meta?.emoji ?? ""} ${capitalize(disease.name)}`.trim()} back>
      {disease.symptoms ? (
        <Card>
          <SectionTitle>Symptoms</SectionTitle>
          <Text style={styles.body}>{disease.symptoms}</Text>
        </Card>
      ) : null}
      <Card>
        <SectionTitle>How to protect yourself</SectionTitle>
        {toLines(disease.precautions).map((p) => (
          <View key={p} style={styles.row}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.body}>{p}</Text>
          </View>
        ))}
      </Card>
      {disease.when_to_seek_care ? (
        <Card>
          <SectionTitle>When to see a doctor</SectionTitle>
          <Text style={styles.body}>{disease.when_to_seek_care}</Text>
        </Card>
      ) : null}
      <Text style={styles.disclaimer}>{DISCLAIMER}</Text>
    </Page>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  bullet: { fontSize: 15, lineHeight: 22, color: theme.colors.primary },
  body: { flex: 1, fontSize: 15, lineHeight: 22, color: theme.colors.text },
  disclaimer: { fontSize: 12, lineHeight: 18, color: theme.colors.muted, textAlign: "center" },
});
