import type { Metadata } from 'next';
import { MenuLayout } from './MenuLayout';
import { unauthenticated_currentSoldier } from './actions';
import './globals.css';
import { AntDesignRegistry } from './registry';

export const metadata: Metadata = {
  title: '9ood M&d',
  description: 'The 9ood! M&d',
  authors: { name: '제작: 본부중대장' },
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
