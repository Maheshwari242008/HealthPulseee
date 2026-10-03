import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { AreaPickerModal } from "@/components/AreaPickerModel";
import { RiskPill } from "@/components/RiskPill";
import { ErrorView, LoadingView, MockBanner } from "@/components/StateViews";
import { Button, Card, Chip, Field, ListRow, Group, Page, SectionTitle } from "@/components/ui";
import { CONFIG } from "@/constants/config";
import { DISCLAIMER } from "@/constants/diseases";
import { theme } from "@/constants/theme";
import { useAreas } from "@/hooks/useArea";
import { useAreaAlerts } from "@/hooks/useAreaAlerts";
import { useDiseases } from "@/hooks/useDiseases";
import { useHomeArea } from "@/hooks/useHomeArea";
import { daysAgoISO, isValidISODate, shortDate, todayISO } from "@/lib/date";
import { areaTitle, capitalize } from "@/lib/format";
import { queryKeys } from "@/lib/queryClient";
import type { LabReportWithNames } from "@/types/report";
import { getMyReports, submitReport, validateReport } from "@/services/reportsService";

export default function LabHomeScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const diseasesQuery = useDiseases();
  const areasQuery = useAreas();
  const { area: homeArea } = useHomeArea();
  const alertsQuery = useAreaAlerts(homeArea?.id ?? null);

  const [diseaseId, setDiseaseId] = useState<number | null>(null);
  const [areaId, setAreaId] = useState<number | null>(null);
  const [date, setDate] = useState(todayISO());
  const [count, setCount] = useState("1");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const reportsQuery = useQuery({
    queryKey: queryKeys.myReports,
    queryFn: () => (CONFIG.USE_MOCK ? Promise.resolve([] as LabReportWithNames[]) : getMyReports(15)),
  });

  const submit = useMutation({
    mutationFn: async () => {
      if (CONFIG.USE_MOCK) throw new Error("Sample-data mode: reports are not saved.");
      if (diseaseId == null) throw new Error("Choose a disease.");
      if (areaId == null) throw new Error("Choose an area.");
      if (!isValidISODate(date)) throw new Error("Date must look like 2026-10-03.");
      const report = { disease_id: diseaseId, area_id: areaId, report_date: date, case_count: Number(count) };
      const problem = validateReport(report);
      if (problem) throw new Error(problem);
      await submitReport(report);
    },
    onSuccess: () => {
      setMessage({ ok: true, text: "Report submitted. Risk levels are being updated." });
      setCount("1");
      qc.invalidateQueries({ queryKey: queryKeys.myReports });
      qc.invalidateQueries({ queryKey: ["cells"] });
      qc.invalidateQueries({ queryKey: ["alerts"] });
    },
    onError: (e) => setMessage({ ok: false, text: e instanceof Error ? e.message : "Could not submit." }),
  });

  if (diseasesQuery.isLoading || areasQuery.isLoading) return <LoadingView />;
  if (diseasesQuery.error || areasQuery.error) {
    return (
      <ErrorView
        message={(diseasesQuery.error ?? areasQuery.error) instanceof Error ? (diseasesQuery.error ?? areasQuery.error)!.message : undefined}
        onRetry={() => {
          diseasesQuery.refetch();
          areasQuery.refetch();
        }}
      />
    );
  }

  const selectedArea = areasQuery.data?.find((a) => a.id === areaId);
  const latestAlert = alertsQuery.data?.[0];
  const n = Number(count);

  return (
    <Page
      title="Submit lab report"
      subtitle="Aggregated counts only — never patient details."
      refreshing={reportsQuery.isRefetching}
      onRefresh={() => reportsQuery.refetch()}
    >
      {CONFIG.USE_MOCK ? <MockBanner /> : null}

      {latestAlert ? (
        <Card>
          <View style={styles.row}>
            <RiskPill level={latestAlert.severity} />
            <Text style={styles.link} onPress={() => router.push({ pathname: "/lab_assistant/AlertDetail", params: { alertId: String(latestAlert.alert_id) } })}>
              View alert
            </Text>
          </View>
          <Text style={styles.alertTitle}>{capitalize(latestAlert.title)}</Text>
        </Card>
      ) : null}

      <Card>
        <SectionTitle>Disease</SectionTitle>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {(diseasesQuery.data ?? []).map((d) => (
            <Chip key={d.id} label={capitalize(d.name)} active={d.id === diseaseId} onPress={() => setDiseaseId(d.id)} />
          ))}
        </ScrollView>

        <SectionTitle>Area (1 km square)</SectionTitle>
        <Group>
          <ListRow
            icon="location-outline"
            label={selectedArea ? areaTitle(selectedArea) : "Choose area"}
            onPress={() => setPickerOpen(true)}
          />
        </Group>

        <SectionTitle>Report date</SectionTitle>
        <View style={styles.chipsRow}>
          <Chip label="Today" active={date === todayISO()} onPress={() => setDate(todayISO())} />
          <Chip label="Yesterday" active={date === daysAgoISO(1)} onPress={() => setDate(daysAgoISO(1))} />
          <Chip label="2 days ago" active={date === daysAgoISO(2)} onPress={() => setDate(daysAgoISO(2))} />
        </View>
        <Field label="Or type a date (YYYY-MM-DD, last 30 days)" value={date} onChangeText={setDate} autoCapitalize="none" keyboardType="numbers-and-punctuation" />

        <Field
          label={`Confirmed cases (${CONFIG.MIN_CASE_COUNT}–${CONFIG.MAX_CASE_COUNT})`}
          value={count}
          onChangeText={(t) => setCount(t.replace(/[^0-9]/g, ""))}
          keyboardType="number-pad"
        />
        {message ? <Text style={{ color: message.ok ? theme.colors.mintText : theme.colors.danger }}>{message.text}</Text> : null}
        <Button label="Submit report" onPress={() => { setMessage(null); submit.mutate(); }} loading={submit.isPending} disabled={!n} />
      </Card>

      <SectionTitle>Recent submissions</SectionTitle>
      {reportsQuery.isLoading ? (
        <Text style={styles.muted}>Loading…</Text>
      ) : (reportsQuery.data ?? []).length === 0 ? (
        <Text style={styles.muted}>No reports yet.</Text>
      ) : (
        <Group>
          {(reportsQuery.data ?? []).map((r) => (
            <ListRow
              key={r.id}
              label={`${capitalize(r.diseases?.name ?? "Disease")} · ${r.case_count} case${r.case_count === 1 ? "" : "s"}`}
              value={`${r.areas ? `${Number(r.areas.cell_lat).toFixed(2)}, ${Number(r.areas.cell_lon).toFixed(2)}` : "Area"} · ${shortDate(r.report_date)}`}
            />
          ))}
        </Group>
      )}
      <Text style={styles.disclaimer}>{DISCLAIMER}</Text>

      <AreaPickerModal
        visible={pickerOpen}
        areas={areasQuery.data ?? []}
        selectedId={areaId}
        onSelect={setAreaId}
        onClose={() => setPickerOpen(false)}
      />
    </Page>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  link: { color: theme.colors.primary, fontWeight: "600" },
  alertTitle: { fontFamily: theme.fonts.heading, fontSize: 18, fontWeight: "700", color: theme.colors.primary },
  chipsRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  muted: { fontSize: 14, color: theme.colors.muted },
  disclaimer: { fontSize: 12, lineHeight: 18, color: theme.colors.muted, textAlign: "center" },
});
