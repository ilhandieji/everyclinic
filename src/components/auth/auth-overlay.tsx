"use client";

import { createContext, Suspense, useContext, useState, type ReactNode } from "react";
import { Dialog } from "radix-ui";
import { Button } from "@/components/ui/button";
import { AuthCard, type AuthCardMode } from "@/components/ui/auth-card";

type AuthOverlayValue = {
  openAuth: (mode: AuthCardMode) => void;
};

const AuthOverlayContext = createContext<AuthOverlayValue | null>(null);

export function useAuthOverlay() {
  const value = useContext(AuthOverlayContext);
  if (!value) {
    throw new Error("Auth overlay is missing.");
  }
  return value;
}

export function AuthOverlayProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AuthCardMode | null>(null);

  return (
    <AuthOverlayContext.Provider value={{ openAuth: setMode }}>
      {children}
      <Dialog.Root open={mode !== null} onOpenChange={(open) => !open && setMode(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/45" />
          <Dialog.Content
            className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-transparent p-4 shadow-none outline-none sm:items-center"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setMode(null);
              }
            }}
         >
            <div className="flex w-full max-w-sm flex-col gap-2">
            <Dialog.Close asChild>
              <Button type="button" variant="outline" className="self-start">
                بستن
              </Button>
            </Dialog.Close>
            <Dialog.Title className="sr-only">
              {mode === "register" ? "ثبت‌نام" : "ورود"}
            </Dialog.Title>
            {mode ? (
              <Suspense fallback={<p className="text-sm text-muted-foreground">در حال بارگذاری…</p>}>
                <AuthCard
                  key={mode}
                  mode={mode}
                  onModeChange={setMode}
                  onSuccess={() => setMode(null)}
                />
              </Suspense>
            ) : null}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </AuthOverlayContext.Provider>
  );
}
