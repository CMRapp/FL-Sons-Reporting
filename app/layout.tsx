import type { Metadata } from "next";
import { Inter, Jost } from "next/font/google";
import "./globals.css";
import 'tailwindcss/tailwind.css';
import Footer from "./components/Footer";
import TopBar from "./components/TopBar";

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

export const metadata: Metadata = {
  title: "Detachment of Florida Reporting Portal",
  description: "Submit reports for Sons of the American Legion Detachment of Florida",
  icons: {
    icon: '/fl-sons-150.png',
    shortcut: '/fl-sons-150.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
