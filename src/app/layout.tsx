import type { Metadata } from "next";
import { Geist, Geist_Mono, Bebas_Neue, Dancing_Script } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Toaster } from "@/components/ui/toaster";
import ConditionalNavFooter from "@/components/ConditionalNavFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bebasNeueCertificate = Bebas_Neue({
  variable: "--font-bebas-neue",
  weight: "400",
  subsets: ["latin"],
});

const dancingScriptCertificate = Dancing_Script({
  variable: "--font-dancing-script",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AIQ Learning",
  description: "A modern e-learning platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bebasNeueCertificate.variable} ${dancingScriptCertificate.variable} antialiased`}
      >
        <Providers>
          <ConditionalNavFooter>
            {children}
          </ConditionalNavFooter>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
