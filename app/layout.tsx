import type { Metadata } from "next";
import "./globals.css";
import "./newspaper.css";

export const metadata: Metadata = {
  title: "Fieldnotes — The CS Student Workspace",
  description: "Your computer science workspace. Track applications, build projects, practice coding, and plan your courses.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
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
