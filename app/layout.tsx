import type { Metadata } from "next";
import "./globals.css";
import "./newspaper.css";
import "./welcome.css";

export const metadata: Metadata = {
  title: "CompSci Guide — Your computer science workspace",
  description: "Your computer science workspace. Track applications, build projects, practice coding, and plan your courses.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/compsci-guide.svg",
    shortcut: "/compsci-guide.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="newspaper">
      <body className="antialiased">{children}</body>
    </html>
  );
}
