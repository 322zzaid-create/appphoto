import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/providers";
import { PwaRegister } from "@/components/pwa/pwa-register";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "apex - Discover Amazing Wallpapers",
    template: "%s | apex",
  },
  description:
    "Discover and download high-quality wallpapers for all your devices. Premium dark glassmorphism design with thousands of curated wallpapers.",
  keywords: [
    "wallpapers",
    "hd wallpapers",
    "phone wallpapers",
    "desktop wallpapers",
    "4k wallpapers",
    "live wallpapers",
  ],
  authors: [{ name: "apex" }],
  creator: "apex",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://wallpaperhub.app",
    siteName: "apex",
    title: "apex - Discover Amazing Wallpapers",
    description:
      "Discover and download high-quality wallpapers for all your devices.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "apex - Discover Amazing Wallpapers",
    description:
      "Discover and download high-quality wallpapers for all your devices.",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="min-h-screen bg-[#0a0a0f] text-white antialiased">
        <Providers>
          {children}
          <PwaRegister />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "transparent",
                boxShadow: "none",
                padding: 0,
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
