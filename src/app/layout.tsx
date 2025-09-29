import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
