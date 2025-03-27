import type { Metadata } from "next";
import "./globals.css";
import Footer from "./components/Footer";
import TopBar from "./components/TopBar";

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
    <html lang="en">
      <head>
        <link rel="icon" href="/fl-sons-150.png" />
        <link rel="shortcut icon" href="/fl-sons-150.png" />
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <TopBar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
