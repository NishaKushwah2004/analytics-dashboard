import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientWrapper } from "./client-wrapper";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
export const runtime = "nodejs"; // disables edge prerendering (required with styled-jsx errors)


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Flowbit AI Dashboard",
  description: "Analytics Dashboard with AI-powered insights",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
