import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { Button, Group, ListRow, Page } from "@/components/ui";
import { useSession } from "@/hooks/useSession";
import { signOut } from "@/services/authService";

export default function AdminMoreScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const { session } = useSession();

  return (
    <Page title="More" subtitle={session?.user.email}>
      <Group>
        <ListRow icon="bulb-outline" label="Suggested actions" onPress={() => router.push("/suggested-actions")} />
        <ListRow icon="document-text-outline" label="Lab reports" onPress={() => router.push("/administration")} />
        <ListRow icon="flask-outline" label="Lab authority" onPress={() => router.push("/lab-authority")} />
        <ListRow icon="eye-outline" label="Preview the public app" onPress={() => router.push("/user/home")} />
      </Group>
      <Button
        label="Sign out"
        variant="danger"
        onPress={() =>
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
          ])
        }
      />
    </Page>
  );
}
