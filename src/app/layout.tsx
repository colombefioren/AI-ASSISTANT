import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { brand } from "@/lib/brand";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: `${brand.fullName} | Practice interviews with AI`,
    template: `%s | ${brand.fullName}`,
  },
  description: brand.description,
  keywords: ["mock interview", "interview practice", "AI interviewer", "job interview", "career"],
  applicationName: brand.fullName,
};

export const viewport: Viewport = {
  themeColor: "#090e1c",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Opt into scroll reveals before first paint, unless motion is reduced. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if(!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("js-reveal")`,
          }}
        />
      </head>
      <body className="min-h-[100dvh] font-sans">{children}</body>
    </html>
  );
}
