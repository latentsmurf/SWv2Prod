import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeCustomizationProvider } from "@/contexts/ThemeCustomizationContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SceneWeaver | AI-Powered Film Production Studio",
  description: "Transform your screenplay into stunning visuals with AI. SceneWeaver is the complete production studio for filmmakers, from script to screen.",
  keywords: ["film production", "AI video", "screenplay", "storyboard", "filmmaking", "video generation"],
  authors: [{ name: "SceneWeaver" }],
  openGraph: {
    title: "SceneWeaver | AI-Powered Film Production Studio",
    description: "Transform your screenplay into stunning visuals with AI.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeCustomizationProvider>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </ThemeCustomizationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
