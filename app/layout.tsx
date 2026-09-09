import type { Metadata } from 'next';
import './globals.css';
import { SensingProvider } from '@/lib/providers/DataProvider';
import { ThemeProvider } from '@/lib/providers/ThemeProvider';
import { AppNavbar } from '@/components/layout/AppNavbar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { GlobalSafetyAlert } from '@/components/layout/GlobalSafetyAlert';

export const metadata: Metadata = {
  title: 'WiSense | Contactless RF Spatial Intelligence',
  description: 'Wi-Fi CSI • Edge AI contactless indoor spatial intelligence, activity awareness, and safety monitoring.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[var(--ws-background)] text-[var(--ws-text)] antialiased flex flex-col selection:bg-brand-lime/30">
        <ThemeProvider>
          <SensingProvider>
            <GlobalSafetyAlert />
            <AppNavbar />
            <div className="flex-1 flex overflow-hidden">
              <AppSidebar />
              <main className="flex-1 overflow-y-auto bg-[var(--ws-background)] ws-grid-pattern">
                {children}
              </main>
            </div>
          </SensingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
