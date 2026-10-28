"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      type="button"
      variant="destructive"
      className="h-11 w-full"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      <LogOut aria-hidden />
      خروج
    </Button>
  );
}
