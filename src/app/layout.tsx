import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from '@/components/ui/sonner';
import { ContactsProvider } from '@/contexts/contacts-context';
import { DepartmentsProvider } from '@/contexts/departments-context';

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
    <html lang="fr">
      <body className="antialiased">
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
