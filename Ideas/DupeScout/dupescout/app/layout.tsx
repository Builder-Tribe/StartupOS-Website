import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Inter({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = JetBrains_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "DupeScout", template: "%s | DupeScout" },
  description: "Shop the Look. Not the Markup. AI visual search that finds what you want at the right price.",
  keywords: ["dupe", "visual search", "shopping", "fashion", "India", "Gen Z"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://dupescout.in",
    siteName: "DupeScout",
    title: "DupeScout — Shop the Look. Not the Markup.",
    description: "Upload a photo. Find it cheaper. Powered by AI.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/favicon.ico", apple: "/apple-icon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#10b981",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-white">
        {children}
      </body>
    </html>
  );
}
