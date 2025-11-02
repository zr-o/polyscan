import './globals.css';
import Script from 'next/script';
import type { ReactNode } from 'react';
import ChatWidget from '../components/ChatWidget';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';

export const metadata = {
  title: 'PolyFinance',
  description: 'PolyFinance Next.js app',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <ChatWidget />
        <Script src="/scripts/ticker-search.js" strategy="afterInteractive" />
        <Script src="/scripts/interactions.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
