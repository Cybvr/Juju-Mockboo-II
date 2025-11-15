import './globals.css';
import type { Metadata } from 'next';
import { DM_Sans, Space_Grotesk } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

// Load DM Sans font with the desired subsets
const dmSans = DM_Sans({ subsets: ['latin'] });

// Load Space Grotesk font for headlines
const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk'
});

export const metadata: Metadata = {
  title: 'Juju - Workspace Suite',
  description: 'What would you like to create today?',
  keywords: 'mockup generator, AI mockups, design tool, templates, creative',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Juju',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Juju',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body className={`${spaceGrotesk.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <div className="relative min-h-screen">
            {/* Dot Grid Background */}
            <div
              className="fixed inset-0 opacity-20 pointer-events-none z-0"
              style={{
                backgroundImage: `radial-gradient(circle, #9ca3af 1px, transparent 1px)`,
                backgroundSize: '20px 20px'
              }}
            />
            <div className="relative z-10">
              {children}
            </div>
          </div>
          <Toaster />
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}