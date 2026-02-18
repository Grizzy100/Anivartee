// app/layout.tsx
import "./globals.css";
import { Bebas_Neue, Oxanium, Orbitron } from "next/font/google";
import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { ThemeProvider } from "next-themes";

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
});

const oxanium = Oxanium({
  subsets: ["latin"],
  variable: "--font-oxanium",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

export const metadata: Metadata = {
  title: "Anivartee",
  description: "Infinite canvas SaaS landing page",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${bebas.variable} ${oxanium.variable} ${orbitron.variable} antialiased min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
