import { AuthForm } from "@/features/auth/auth-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-10">
      <AuthForm mode="login" />
    </main>
  );
}
