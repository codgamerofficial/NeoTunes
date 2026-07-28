import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import QueryProvider from "@/providers/QueryProvider";
import YouTubePlayer from "@/components/player/YouTubePlayer";
import AppLayout from "@/components/navigation/AppLayout";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const viewport: Viewport = {
  themeColor: "#090909",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "NeoTunes - Music Streaming Platform",
  description: "A premium desktop music streaming platform combining Spotify, Apple Music, and TIDAL playback.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NeoTunes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#121212] text-white`}>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <AppLayout>
              {children}
            </AppLayout>
            <YouTubePlayer />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
