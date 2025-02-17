import type React from 'react';
import './globals.css';
import { Inter } from 'next/font/google';
import { Navbar } from '../components/Navbar';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Xhosa Hip Hop Videos',
  description:
    'Watch the latest and greatest Xhosa hip hop music videos. Discover new artists and enjoy your favorite tracks.',
  manifest: '/manifest.json',
  themeColor: '#000000',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
    { rel: 'apple-touch-icon', sizes: '180x180', url: '/apple-touch-icon.png' },
  ],
  openGraph: {
    type: 'website',
    url: 'https://xhap.co.za',
    title: 'Xhosa Hip Hop Videos',
    description: 'Watch the latest and greatest Xhosa hip hop music videos.',
    images: [{ url: '/og-image.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Xhosa Hip Hop Videos',
    description: 'Watch the latest and greatest Xhosa hip hop music videos.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={`${inter.className} bg-black text-white min-h-screen`}>
        <Script
          id='facebook-jssdk'
          strategy='afterInteractive'
          dangerouslySetInnerHTML={{
            __html: `
              window.fbAsyncInit = function() {
                FB.init({
                  appId: '${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID}',
                  xfbml: true,
                  version: 'v12.0'
                });
              };
            `,
          }}
        />
        <Script
          strategy='afterInteractive'
          src='https://connect.facebook.net/en_US/sdk.js'
        />
        <Navbar />
        <main className='mt-16'>{children}</main>
        <Analytics />
      </body>
    </html>
  );
}

import './globals.css';
