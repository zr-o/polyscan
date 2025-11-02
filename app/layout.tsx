import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'PolyFinance',
  description: 'PolyFinance Next.js app',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
