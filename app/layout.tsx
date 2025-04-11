import type { Metadata } from "next";
import "./globals.css";
import 'tailwindcss/tailwind.css';
import ClientLayout from "./components/ClientLayout";

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
  return <ClientLayout>{children}</ClientLayout>;
}
