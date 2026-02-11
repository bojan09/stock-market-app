import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
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
  // Replace with your actual production URL
  metadataBase: new URL("https://signalist.com"),
  title: {
    default: "Signalist | Real-Time Stock Intelligence & Market News",
    template: "%s | Signalist",
  },
  description:
    "Track real-time stock prices, get personalized AI-driven alerts, and explore detailed company insights with institutional-grade market data.",
  keywords: [
    "stock market tracking",
    "real-time stock alerts",
    "market sentiment analysis",
    "financial news",
    "AI stock insights",
  ],
  authors: [{ name: "Signalist Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://stock-market-signalist.vercel.app/",
    siteName: "Signalist",
    images: [
      {
        url: "/og-image.png", // Ensure you have an OG image in your public folder
        width: 1200,
        height: 630,
        alt: "Signalist Market Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Signalist | Real-Time Stock Intelligence",
    description:
      "Track real-time stock prices and get personalized AI market alerts.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster
          position="bottom-right"
          richColors
          theme="dark"
          toastOptions={{
            style: {
              background: "#121212",
              border: "1px solid #333",
            },
          }}
        />
      </body>
    </html>
  );
}
