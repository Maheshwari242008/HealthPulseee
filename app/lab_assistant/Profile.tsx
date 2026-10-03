import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { AreaPickerModal } from "@/components/AreaPickerModel";
import { Button, Group, ListRow, Page } from "@/components/ui";
import { CONFIG } from "@/constants/config";
import { useHomeArea } from "@/hooks/useHomeArea";
import { useProfile } from "@/hooks/useProfile";
import { useSession } from "@/hooks/useSession";
import { areaTitle } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import { getMyLabId } from "@/services/reportsService";
import { signOut } from "@/services/authService";

export default function LabProfileScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const { session } = useSession();
  const profile = useProfile().data;
  const { area, areas, setArea } = useHomeArea();
  const [pickerOpen, setPickerOpen] = useState(false);

  const labQuery = useQuery({
    queryKey: ["lab", "mine"],
    queryFn: async () => {
      if (CONFIG.USE_MOCK) return { name: "Demo Lab" };
      const id = await getMyLabId();
      if (!id) return null;
      const { data, error } = await supabase.from("labs").select("name, approved").eq("id", id).single();
      if (error) throw error;
      return data as { name: string; approved: boolean };
    },
  });

  const confirmSignOut = () =>
    Alert.alert("Sign out", "Do you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
          } catch {}
          qc.clear();
          router.replace("/");
        },
      },
    ]);

  return (
    <Page title={profile?.full_name?.trim() || "Lab profile"} subtitle={session?.user.email}>
      <Group>
        <ListRow icon="flask-outline" label="Laboratory" value={labQuery.data?.name ?? (labQuery.isLoading ? "Loading…" : "Not linked to an approved lab")} />
        <ListRow icon="location-outline" label="Home area" value={area ? areaTitle(area) : "Not set"} onPress={() => setPickerOpen(true)} />
        <ListRow icon="navigate-outline" label="Use my location" onPress={() => router.push("/lab_assistant/LocationPermission")} />
        <ListRow icon="leaf-outline" label="Prevention tips" onPress={() => router.push("/lab_assistant/PreventionTips")} />
        <ListRow icon="person-outline" label="Edit profile" onPress={() => router.push("/user/edit-profile")} />
      </Group>
      <Button label="Sign out" variant="danger" onPress={confirmSignOut} />
      <AreaPickerModal visible={pickerOpen} areas={areas} selectedId={area?.id ?? null} onSelect={setArea} onClose={() => setPickerOpen(false)} />
    </Page>
  );
}
