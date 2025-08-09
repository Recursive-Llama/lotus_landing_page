import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lotus — private, open-source AI that remembers",
  description:
    "Lotus is a private, open-source AI that remembers. It learns with you, grows with you, and keeps your data yours.",
  metadataBase: new URL("https://lotusprotocol.xyz"),
  openGraph: {
    title: "Lotus — private, open-source AI that remembers",
    description:
      "Lotus is a private, open-source AI that remembers. It learns with you, grows with you, and keeps your data yours.",
    images: [
      {
        url: "/social-card.png",
        width: 1200,
        height: 630,
        alt: "Lotus",
      },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
  themeColor: "#0a0b10",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
