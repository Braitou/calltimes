import type { Metadata } from "next";
import { Inter, Libre_Baskerville } from 'next/font/google';
import "./globals.css";
import { Toaster } from '@/components/ui/sonner';
import { ContactsProvider } from '@/contexts/contacts-context';
import { DepartmentsProvider } from '@/contexts/departments-context';

// Configure Inter (sans-serif moderne)
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

// Configure Libre Baskerville (serif élégant)
const baskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-baskerville',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: "Call Times - Your New Best Friend as a Producer",
    template: "%s | Call Times"
  },
  description: "Call Times is a global production assistant app that helps you manage your shooting faster and smoother. Create call sheets, manage contacts, and collaborate with your team.",
  keywords: ["call sheet", "production management", "film production", "video production", "crew management", "call times", "production assistant", "shooting schedule"],
  authors: [{ name: "Call Times" }],
  creator: "Call Times",
  publisher: "Call Times",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://calltimes.app",
    title: "Call Times - Your New Best Friend as a Producer",
    description: "Call Times is a global production assistant app that helps you manage your shooting faster and smoother.",
    siteName: "Call Times",
  },
  twitter: {
    card: "summary_large_image",
    title: "Call Times - Your New Best Friend as a Producer",
    description: "Call Times is a global production assistant app that helps you manage your shooting faster and smoother.",
    creator: "@calltimes",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${baskerville.variable}`}>
      <body className={`${inter.className} antialiased`}>
        <DepartmentsProvider>
          <ContactsProvider>
            {children}
            <Toaster />
          </ContactsProvider>
        </DepartmentsProvider>
      </body>
    </html>
  );
}
