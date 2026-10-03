import { StyleSheet, Text, View } from "react-native";

export default function PreventionTipsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>lab_assistant/PreventionTips</Text>
      <Text>Coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  title: { fontSize: 18, fontWeight: "600" },
});
