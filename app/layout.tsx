import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trust Receipt | The proof behind every AI decision",
  description:
    "Enterprise runtime trust for AI agents. Verify identity, intent, and policy at every step — then export cryptographically signed receipts your team and auditors can validate independently.",
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
      <body className="min-h-full flex flex-col bg-white text-slate-900 antialiased [font-feature-settings:'rlig'_1,'calt'_1,'ss01'_1]">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
