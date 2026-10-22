"use client";

import { SessionProvider, signOut, useSession } from "next-auth/react";
import { useEffect, type ReactNode } from "react";

function InvalidSessionGuard({ children }: { children: ReactNode }) {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.error === "InvalidSession") {
      void signOut({ redirect: false });
    }
  }, [session?.error]);

  return children;
}

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <InvalidSessionGuard>{children}</InvalidSessionGuard>
    </SessionProvider>
  );
}
