import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import "@radix-ui/themes/styles.css";
import { Suspense } from "react";
import { AuthOverlayProvider } from "@/components/auth/auth-overlay";
import { SiteHeader } from "@/components/layout/site-header";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { StyledComponentsRegistry } from "@/components/providers/styled-components-registry";
import { AppThemeProvider } from "@/components/providers/theme-provider";

export const metadata: Metadata = {
  title: " ",
  description: "",
};

const themeInitScript = `(function(){try{var m=document.cookie.match(/(?:^|; )theme=([^;]*)/);var t=m?decodeURIComponent(m[1]):"dark";if(t==="light"){document.documentElement.classList.remove("dark");}else{document.documentElement.classList.add("dark");}}catch(e){document.documentElement.classList.add("dark");}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fa-IR"
      dir="rtl"
      className={cn("h-full dark antialiased font-sans")}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <StyledComponentsRegistry>
          <AuthSessionProvider>
            <AppThemeProvider>
              <AuthOverlayProvider>
                <Suspense
                  fallback={
                    <header className="h-12 border-b border-border bg-background" />
                  }
                >
                  <SiteHeader />
                </Suspense>
                <main className="flex min-h-0 flex-1 flex-col">{children}</main>
              </AuthOverlayProvider>
            </AppThemeProvider>
          </AuthSessionProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
