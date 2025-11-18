import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'IPiece - IP 공모 플랫폼',
  description: 'IP 투자 및 공모 플랫폼',
  generator: 'v0.app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <>{children}</>;
}
