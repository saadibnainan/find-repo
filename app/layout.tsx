import type { Metadata, Viewport } from "next";
import { Archivo_Black, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "FIND-REPO // GitHub Repository Explorer",
  description:
    "Dark-brutalist GitHub repository explorer. Type a username, get their profile and public repos, and inspect any repo's file tree.",
  appleWebApp: {
    title: "Find-Repo",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body className="bg-void text-bone font-mono antialiased">
        {children}
      </body>
    </html>
  );
}
