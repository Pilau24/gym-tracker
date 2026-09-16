import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  ThemeProvider,
  type Theme,
  type ThemeMode,
} from "@/components/theme-provider";
import { cookies } from "next/headers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Passkey Auth Template",
  description: "A reusable passwordless authentication starter.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const savedTheme = (await cookies()).get("theme")?.value;
  const savedMode = (await cookies()).get("theme-mode")?.value;
  const initialMode: ThemeMode =
    savedMode === "light" || savedMode === "dark" || savedMode === "auto"
      ? savedMode
      : "dark";
  const initialTheme: Theme = savedTheme === "light" ? "light" : "dark";

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
        initialTheme === "dark" && "dark",
      )}
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(() => {
  const cachedMode = sessionStorage.getItem("theme-mode") ||
    localStorage.getItem("theme-mode") ||
    document.cookie.match(/(?:^|; )theme-mode=(dark|light|auto)/)?.[1];
  const mode = cachedMode === "dark" || cachedMode === "light" || cachedMode === "auto"
    ? cachedMode
    : "auto";
  const theme = mode === "dark" ||
    (mode === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ? "dark"
    : "light";
  sessionStorage.setItem("theme-mode", mode);
  localStorage.setItem("theme-mode", mode);
  sessionStorage.setItem("theme", theme);
  localStorage.setItem("theme", theme);
  document.documentElement.dataset.theme = mode;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
})();`}
        </Script>
      </head>
      <body className="flex min-h-full flex-col">
        <ThemeProvider initialMode={initialMode} initialTheme={initialTheme}>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
