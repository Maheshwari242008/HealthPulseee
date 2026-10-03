import { AuthForm } from "@/components/AuthForm";

export default function SignupScreen() {
  return (
    <AuthForm
      mode="signup"
      title="Create your account"
      subtitle="Free for everyone. We never collect patient data."
      switchHref="/login"
      switchLabel="Already have an account? Log in"
    />
  );
}
