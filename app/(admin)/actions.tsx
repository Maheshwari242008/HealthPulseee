import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text } from "react-native";
import { AreaPickerModal } from "@/components/AreaPickerModel";
import { LoadingView } from "@/components/StateViews";
import { Button, Card, Chip, Field, Group, ListRow, Page, SectionTitle } from "@/components/ui";
// import { Card, Group, ListRow, Page, SectionTitle, Stat } from "@/components/ui";
import { CONFIG } from "@/constants/config";
import { theme } from "@/constants/theme";
import { useCreateAlert } from "@/hooks/useAdmin";
import { useAreas } from "@/hooks/useArea";
import { useDiseases } from "@/hooks/useDiseases";
import { areaTitle, capitalize } from "@/lib/format";
import type { AlertSeverity } from "@/types/alert";

/** Manually publish an alert. Accepts prefill params from Suggested actions. */
export default function CreateAlertScreen() {
  const router = useRouter();
  const p = useLocalSearchParams<{ areaId?: string; disease?: string; severity?: string }>();
  const areas = useAreas();
  const diseases = useDiseases();
  const create = useCreateAlert();

  const [areaId, setAreaId] = useState<number | null>(p.areaId ? Number(p.areaId) : null);
  const [diseaseName, setDiseaseName] = useState<string | null>(p.disease ?? null);
  const [severity, setSeverity] = useState<AlertSeverity>((p.severity as AlertSeverity) ?? "MODERATE");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [days, setDays] = useState("7");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  if (areas.isLoading || diseases.isLoading) return <LoadingView />;

  const area = areas.data?.find((a) => a.id === areaId);
  const disease = diseases.data?.find((d) => d.name === diseaseName);

  const submit = () => {
    setFeedback(null);
    if (CONFIG.USE_MOCK) return setFeedback({ ok: false, text: "Sample-data mode: alerts are not saved." });
    if (!area || !disease) return setFeedback({ ok: false, text: "Choose an area and a disease." });
    if (title.trim().length < 4) return setFeedback({ ok: false, text: "Add a short title." });
    if (message.trim().length < 10) return setFeedback({ ok: false, text: "Add a message for the public (at least 10 characters)." });
    const d = Math.min(30, Math.max(1, Number(days) || 7));
    create.mutate(
      { area_id: area.id, disease_id: disease.id, severity, title, message, expires_in_days: d },
      {
        onSuccess: () => {
          setFeedback({ ok: true, text: "Alert published." });
          setTitle("");
          setMessage("");
          router.replace("/alerts");
        },
        onError: (e) => setFeedback({ ok: false, text: e instanceof Error ? e.message : "Could not publish." }),
      }
    );
  };

  return (
    <Page title="Publish an alert" subtitle="Shown to residents of the area and its neighbours.">
      <Card>
        <SectionTitle>Disease</SectionTitle>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {(diseases.data ?? []).map((d) => (
            <Chip key={d.id} label={capitalize(d.name)} active={d.name === diseaseName} onPress={() => setDiseaseName(d.name)} />
          ))}
        </ScrollView>
        <SectionTitle>Area</SectionTitle>
        <Group>
          <ListRow icon="location-outline" label={area ? areaTitle(area) : "Choose area"} onPress={() => setPickerOpen(true)} />
        </Group>
        <SectionTitle>Severity</SectionTitle>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {(["LOW", "MODERATE", "HIGH"] as AlertSeverity[]).map((s) => (
            <Chip key={s} label={capitalize(s.toLowerCase())} active={s === severity} onPress={() => setSeverity(s)} />
          ))}
        </ScrollView>
        <Field label="Title" value={title} onChangeText={setTitle} placeholder="Dengue risk is HIGH" />
        <Field label="Message" value={message} onChangeText={setMessage} multiline numberOfLines={4} style={{ minHeight: 100, textAlignVertical: "top" }} placeholder="What residents should know and do" />
        <Field label="Show for (days, 1–30)" value={days} onChangeText={(t) => setDays(t.replace(/[^0-9]/g, ""))} keyboardType="number-pad" />
        {feedback ? <Text style={{ color: feedback.ok ? theme.colors.mintText : theme.colors.danger }}>{feedback.text}</Text> : null}
        <Button label="Publish alert" onPress={submit} loading={create.isPending} />
      </Card>
      <AreaPickerModal visible={pickerOpen} areas={areas.data ?? []} selectedId={areaId} onSelect={setAreaId} onClose={() => setPickerOpen(false)} />
    </Page>
  );
}
