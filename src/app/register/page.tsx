import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { AuthCard } from "@/components/ui/auth-card";
import { authOptions, isAuthenticatedSession } from "@/lib/auth";

async function RegisterGate() {
  await connection();
  const session = await getServerSession(authOptions);
  if (isAuthenticatedSession(session)) {
    redirect("/");
  }

  return <AuthCard mode="register" />;
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterGate />
    </Suspense>
  );
}
