import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import QueryProvider from "@/providers/QueryProvider";
import AppLayout from "@/components/navigation/AppLayout";
import { GlobalErrorBoundary } from "@/components/common/GlobalErrorBoundary";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const viewport: Viewport = {
  themeColor: "#0A0D14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "NeoTunes - Premium Universal Music Streaming Platform",
  description: "Feel the Music. Live the Moment. The billion-dollar AI-native universal music search and streaming platform.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/app-icon.svg",
    shortcut: "/favicon.svg",
  },
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0A0D14] text-white`}>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <GlobalErrorBoundary>
              <AppLayout>
                {children}
              </AppLayout>
            </GlobalErrorBoundary>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
