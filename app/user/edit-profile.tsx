import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text } from "react-native";
import { AreaPickerModal } from "@/components/AreaPickerModel";
import { LoadingView } from "@/components/StateViews";
import { Button, Field, ListRow, Group, Page } from "@/components/ui";
import { theme } from "@/constants/theme";
import { useHomeArea } from "@/hooks/useHomeArea";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { areaTitle } from "@/lib/format";

export default function EditProfileScreen() {
  const router = useRouter();
  const profileQuery = useProfile();
  const update = useUpdateProfile();
  const { area, areas, setArea } = useHomeArea();
  const [name, setName] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profileQuery.data?.full_name != null) setName(profileQuery.data.full_name);
  }, [profileQuery.data?.full_name]);

  if (profileQuery.isLoading) return <LoadingView />;

  const save = () => {
    setError(null);
    if (name.trim().length < 2) return setError("Enter your name.");
    update.mutate(
      { full_name: name.trim() },
      { onSuccess: () => router.back(), onError: (e) => setError(e instanceof Error ? e.message : "Could not save.") }
    );
  };

  return (
    <Page title="Edit profile" back>
      <Field label="Full name" value={name} onChangeText={setName} autoCapitalize="words" />
      <Group>
        <ListRow icon="location-outline" label="Home area" value={area ? areaTitle(area) : "Not set"} onPress={() => setPickerOpen(true)} />
      </Group>
      {error ? <Text style={{ color: theme.colors.danger }}>{error}</Text> : null}
      <Button label="Save" onPress={save} loading={update.isPending} />
      <AreaPickerModal
        visible={pickerOpen}
        areas={areas}
        selectedId={area?.id ?? null}
        onSelect={setArea}
        onClose={() => setPickerOpen(false)}
      />
    </Page>
  );
}
