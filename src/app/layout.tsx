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
  title: "Call Times - Professional Call Sheets",
  description: "Create and send professional call sheets for your film and video productions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${baskerville.variable}`}>
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
