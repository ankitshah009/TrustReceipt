import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fafafa",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://trust-receipt.vercel.app"),
  title: "Trust Receipt | The proof behind every AI decision",
  description:
    "Runtime trust for AI agent workflows. Verify identity, intent, and policy at every step — then export cryptographically signed receipts your team and auditors can validate independently.",
  openGraph: {
    title: "Trust Receipt | The proof behind every AI decision",
    description:
      "Signed, offline-verifiable receipts for agent workflows — with a parallel Observer Agent and human review built in.",
    url: "https://trust-receipt.vercel.app",
    siteName: "Trust Receipt",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trust Receipt",
    description:
      "The proof behind every AI decision — runtime trust and signed receipts for agent workflows.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased subpixel-antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden bg-white text-slate-900 antialiased [font-feature-settings:'rlig'_1,'calt'_1,'ss01'_1]">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
