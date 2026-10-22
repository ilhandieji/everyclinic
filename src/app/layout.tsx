import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import "@radix-ui/themes/styles.css";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { StyledComponentsRegistry } from "@/components/providers/styled-components-registry";
import { AppThemeProvider } from "@/components/providers/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "فروشگاه",
  description: "فروشگاه آنلاین",
};

const themeInitScript = `(function(){try{var m=document.cookie.match(/(?:^|; )theme=([^;]*)/);var t=m?decodeURIComponent(m[1]):"dark";if(t==="light"){document.documentElement.classList.remove("dark");}else{document.documentElement.classList.add("dark");}}catch(e){document.documentElement.classList.add("dark");}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fa-IR"
      dir="rtl"
      className={cn(
        "h-full dark",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
      )}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <StyledComponentsRegistry>
          <AuthSessionProvider>
            <AppThemeProvider>
              <SiteNavbar />
              <main className="flex min-h-0 flex-1 flex-col">{children}</main>
            </AppThemeProvider>
          </AuthSessionProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
