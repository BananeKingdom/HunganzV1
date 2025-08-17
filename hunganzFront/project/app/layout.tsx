import './globals.css';
import type { Metadata } from 'next';
import { WalletProvider } from '@/contexts/WalletContext';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Hunganz - Gaming NFT Ecosystem',
  description: 'Evolve your Hunga Apes, earn Banane tokens, and explore the Flow blockchain gaming universe',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: 'Orbitron, sans-serif' }}>
        <WalletProvider>
          {children}
          <Toaster position="top-right" />
        </WalletProvider>
      </body>
    </html>
  );
}
