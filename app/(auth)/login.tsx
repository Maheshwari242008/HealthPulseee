import { useLocalSearchParams } from "expo-router";
import { AuthForm } from "@/components/AuthForm";

export default function LoginScreen() {
  const { role } = useLocalSearchParams<{ role?: string }>();
  const admin = role === "administrator";

  return (
    <AuthForm
      mode="login"
      title={admin ? "Health authority login" : "Welcome back"}
      subtitle={admin ? "Administrator accounts only." : "Log in to see disease activity near you."}
      requiredRole={admin ? "administrator" : undefined}
      switchHref={admin ? undefined : "/signup"}
      switchLabel="New here? Create an account"
    />
  );
}
