import { Redirect } from "expo-router";
import { LoadingView } from "@/components/StateViews";
import { CONFIG } from "@/constants/config";
import { useRole } from "@/hooks/useRole";

/** Entry gate: signed out -> landing, otherwise route by role. */
export default function Index() {
  const { session, role, loading } = useRole();

  if (CONFIG.USE_MOCK) return <Redirect href="/user/home" />;
  if (loading) return <LoadingView />;
  if (!session) return <Redirect href="/user/landing" />;
  if (role === "administrator") return <Redirect href="/dashboard" />;
  if (role === "lab") return <Redirect href="/lab_assistant/Home" />;
  return <Redirect href="/user/home" />;
}
