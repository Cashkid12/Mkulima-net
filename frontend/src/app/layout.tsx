import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import localFont from 'next/font/local';
import './globals.css';
import { ClerkAuthProvider } from '@/contexts/ClerkAuthContext';

const geistSans = localFont({
  src: './fonts/GeistVF.woff2',
  variable: '--font-geist-sans',
  weight: '100 900',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff2',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'MkulimaNet - Agricultural Network',
  description: 'Connecting farmers, buyers, and agricultural experts',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        variables: {
          colorPrimary: '#2E7D32',
          colorBackground: '#FFFFFF',
          colorInputBackground: '#F5F7FA',
          colorInputText: '#222222',
        },
        elements: {
          formButtonPrimary: 'bg-green-800 hover:bg-green-900 text-white font-semibold py-3 rounded-full',
          socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50',
          footerActionLink: 'text-green-800 hover:text-green-900',
        }
      }}
    >
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <ClerkAuthProvider>
            {children}
          </ClerkAuthProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}