import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "AI Interview Coach | Practice Interviews with AI",
  description: "Master your interview skills with our AI-powered interview simulator. Get instant feedback and improve your chances of landing your dream job.",
  keywords: "AI interview, interview practice, job interview, interview simulator, career development",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans min-h-screen bg-slate-900 text-white antialiased [text-rendering:optimizeLegibility]`}>
        <div className="relative min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
