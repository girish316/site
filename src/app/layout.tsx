import type { Metadata } from "next";
import { Syne, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "sonner";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Girish M — Software Engineer · Robotics · AI", template: "%s | Girish M" },
  description: "I build systems that move, think, react, and occasionally break in spectacular ways. CS & AI @ University of Toronto.",
  keywords: ["software engineer", "robotics", "AI", "machine learning", "ROS2", "Next.js", "Toronto"],
  authors: [{ name: "Girish M" }],
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: "https://girishm.dev",
    siteName: "Girish M",
    title: "Girish M — Software Engineer · Robotics · AI",
    description: "I build systems that move, think, react, and occasionally break in spectacular ways.",
  },
  // twitter: { card: "summary_large_image", creator: "@alexchen_dev" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <body className="bg-surface-50 text-slate-900 antialiased selection:bg-brand-200 selection:text-brand-900">
        <AuthProvider>
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </AuthProvider>
      </body>
    </html>
  );
}
