import type { Metadata } from "next";
import "./globals.css";
import "./newspaper.css";
import "./welcome.css";
import "./dark-mode.css";

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
    <html lang="en" className="newspaper" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{__html:`try{var t=localStorage.getItem("compsciguide:theme");document.documentElement.classList.toggle("dark",t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches)}catch{document.documentElement.classList.toggle("dark",matchMedia("(prefers-color-scheme: dark)").matches)}`}}/></head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
