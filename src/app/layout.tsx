import type { Metadata } from 'next';
import { MenuLayout } from './MenuLayout';
import { unauthenticated_currentSoldier } from './actions';
import './globals.css';
import { AntDesignRegistry } from './registry';

export const metadata: Metadata = {
  title: '병영생활 관리',
  description: '제9탄약창 병영생활 관리',
  authors: { name: '9ammu dev team' },
};

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1.0,
    userScalable: 'no',
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await unauthenticated_currentSoldier();
  return (
    <html lang='ko'>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        <AntDesignRegistry>
          <MenuLayout data={data}>{children}</MenuLayout>
        </AntDesignRegistry>
      </body>
    </html>
  );
}
