import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "SkillBridge | Intelligent Skill-Development & Mentorship Platform",
  description:
    "Connect with verified technical mentors, track milestone-based skill growth, and receive explainable mentor recommendations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground flex flex-col selection:bg-emerald-500 selection:text-slate-950">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-emerald-500/10 py-8 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-400">SkillBridge</span>
                <span>— Intelligent Skill-Development Platform</span>
              </div>
              <p>© {new Date().getFullYear()} SkillBridge Inc. All rights reserved.</p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
