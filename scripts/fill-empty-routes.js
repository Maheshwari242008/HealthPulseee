const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "app");

const pascal = (s) =>
  s
    .replace(/[\[\]()]/g, "")
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join("");

const layoutStub = (name) => `import { Stack } from "expo-router";

export default function ${name}() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
`;

const screenStub = (name, route) => `import { StyleSheet, Text, View } from "react-native";

export default function ${name}() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>${route}</Text>
      <Text>Coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  title: { fontSize: 18, fontWeight: "600" },
});
`;

function fill(file) {
  const base = path.basename(file, ".tsx");
  const parent = path.basename(path.dirname(file));
  const rel = path.relative(ROOT, file).replace(/\\/g, "/").replace(/\.tsx$/, "");

  const isLayout = base === "_layout";
  const stem = isLayout || base === "index" ? parent : base;
  const name = (pascal(stem) || "Route") + (isLayout ? "Layout" : "Screen");

  fs.writeFileSync(file, isLayout ? layoutStub(name) : screenStub(name, rel));
  console.log("filled:", rel);
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (p.endsWith(".tsx") && fs.statSync(p).size === 0) fill(p);
  }
}

walk(ROOT);