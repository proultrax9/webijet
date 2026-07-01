import { redirect } from "next/navigation";
import { AuthForm } from "@/components/store/AuthForm";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-10">
      <AuthForm mode="login" />
    </div>
  );
}
