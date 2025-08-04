import type { Metadata } from "next";
import { Inter, PT_Mono } from "next/font/google";
import "./globals.css";
import AuthSessionProvider from "@/providers/SessionProvider";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/providers/MyThemeProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const ptMono = PT_Mono({
  variable: "--font-pt-mono",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Envoy - Secure Environment Variable Management",
  description: "Envoy is a secure platform for managing and synchronizing your environment variables across multiple workspaces. Simplify your development workflow with Envoy.",
  icons: {
    icon: [
      { url: '/assets/envoy-logo.svg' },
      { url: '/assets/envoy-logo.svg', type: 'image/svg' },
    ],
    apple: [
      { url: '/assets/envoy-logo.svg' },
    ],
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
      suppressHydrationWarning
      className={`${inter.variable} ${ptMono.variable}`}
    >
      <body className="antialiased" >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <AuthSessionProvider>
            <Toaster position="bottom-right" />
            {children}
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}