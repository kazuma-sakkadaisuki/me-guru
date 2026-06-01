import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MEGURU — 農村の余りものプラットフォーム",
  description: "駒ヶ根の余りものを地域でつなぐプラットフォーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;600;700&family=Noto+Sans+JP:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(regs) {
              regs.forEach(function(reg) { reg.unregister(); });
            });
            caches.keys().then(function(names) {
              names.forEach(function(name) { caches.delete(name); });
            });
          }
        `}} />
        {children}
      </body>
    </html>
  );
}
