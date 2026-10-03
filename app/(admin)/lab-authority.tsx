import { useState } from "react";
import { Alert, StyleSheet, Switch, Text } from "react-native";
import { ErrorView, LoadingView } from "@/components/StateViews";
import { Button, Card, Field, Group, ListRow, Page, SectionTitle } from "@/components/ui";
import { theme } from "@/constants/theme";
import { useCreateLab, useLabs, useSetLabApproval } from "@/hooks/useAdmin";

/** Approve / suspend laboratories. Lab staff accounts are linked in SQL (see database/admin_and_tests.sql). */
export default function LabAuthorityScreen() {
  const q = useLabs();
  const setApproval = useSetLabApproval();
  const createLab = useCreateLab();
  const [name, setName] = useState("");

  if (q.isLoading) return <LoadingView />;
  if (q.error) return <ErrorView message={q.error instanceof Error ? q.error.message : undefined} onRetry={q.refetch} />;

  const fail = (e: unknown) => Alert.alert("Could not update", e instanceof Error ? e.message : "Try again.");

  return (
    <Page title="Lab authority" subtitle="Only approved labs can submit reports." back refreshing={q.isRefetching} onRefresh={() => q.refetch()}>
      <Group>
        {(q.data ?? []).map((l) => (
          <ListRow
            key={l.id}
            icon="flask-outline"
            label={l.name}
            value={l.approved ? "Approved" : "Suspended"}
            right={<Switch value={l.approved} onValueChange={(v) => setApproval.mutate({ labId: l.id, approved: v }, { onError: fail })} trackColor={{ true: theme.colors.primary, false: theme.colors.border }} />}
          />
        ))}
      </Group>
      {(q.data ?? []).length === 0 ? <Text style={styles.muted}>No labs yet.</Text> : null}
      <Card>
        <SectionTitle>Add a lab</SectionTitle>
        <Field label="Lab name" value={name} onChangeText={setName} placeholder="City Path Lab" />
        <Button
          label="Create and approve"
          loading={createLab.isPending}
          disabled={name.trim().length < 3}
          onPress={() => createLab.mutate(name, { onSuccess: () => setName(""), onError: fail })}
        />
        <Text style={styles.muted}>
          To link a person to a lab, they sign up in the app, then run section A of database/admin_and_tests.sql.
        </Text>
      </Card>
    </Page>
  );
}

const styles = StyleSheet.create({ muted: { fontSize: 13, lineHeight: 19, color: theme.colors.muted } });
