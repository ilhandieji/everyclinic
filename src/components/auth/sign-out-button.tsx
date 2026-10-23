"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      className="bg-destructive text-white shadow-md shadow-destructive/30 hover:bg-destructive/90"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      <LogOut aria-hidden />
      خروج
    </Button>
  );
}
