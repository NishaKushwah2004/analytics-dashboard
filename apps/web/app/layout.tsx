import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
import { Sidebar } from '@/components/sidebar';
import { ThemeProvider } from '@/components/theme-provider';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Flowbit AI Dashboard',
  description: 'Analytics Dashboard with AI-powered insights',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system">
          <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
            {/* Sidebar */}
            <div className="flex-shrink-0">
              <Sidebar />
            </div>
            
            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
              <div className="h-full">
                {children}
              </div>
            </main>
          </div>
          <Toaster position="top-right" />
          <Analytics />
        </ThemeProvider>
        
      </body>
    </html>
  );
}