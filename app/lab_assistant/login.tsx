import { AuthForm } from "@/components/AuthForm";

export default function LabLoginScreen() {
  return (
    <AuthForm
      mode="login"
      title="Lab login"
      subtitle="For approved laboratory staff. Your administrator links your account to your lab."
      requiredRole="lab"
    />
  );
}
