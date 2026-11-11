import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PrepTrack — Personal Examination Preparation Workspace",
  description:
    "Single-owner personal workspace for competitive examination preparation, hierarchical syllabus tracking, MCQ question banks, and authentic CBT mock tests.",
  icons: {
    icon: "/icon",
    apple: "/icon",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var storedTheme = localStorage.getItem('preptrack-theme') || 'system';
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var isDark = storedTheme === 'dark' || (storedTheme === 'system' && prefersDark);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-text-primary antialiased font-sans transition-colors duration-150">
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <ThemeProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
