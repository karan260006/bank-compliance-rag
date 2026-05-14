import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RBI Compliance RAG Assistant",
  description: "AI-powered verification for Indian banking guidelines",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
