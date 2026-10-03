import { StyleSheet, Text, View } from "react-native";

export default function AreaDetailsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>user/area-details</Text>
      <Text>Coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  title: { fontSize: 18, fontWeight: "600" },
});
