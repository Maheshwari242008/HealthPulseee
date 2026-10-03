import { Stack } from "expo-router";
import { RoleGuard } from "@/components/RoleGuard";

export default function UserLayout() {
  return (
    <RoleGuard allow={["user", "lab", "administrator"]} publicRoutes={["landing", "role-selection", "sign-in"]}>
      <Stack screenOptions={{ headerShown: false }} />
    </RoleGuard>
  );
}
