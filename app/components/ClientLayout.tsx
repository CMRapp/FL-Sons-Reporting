'use client';

import { Inter, Jost } from "next/font/google";
import Footer from "./Footer";
import TopBar from "./TopBar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  display: "swap",
});

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jost.variable}`}>
      <head>
        <link rel="icon" href="/fl-sons-150.png" />
        <link rel="shortcut icon" href="/fl-sons-150.png" />
      </head>
      <body className="font-jost antialiased min-h-screen flex flex-col">
        <TopBar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
} 