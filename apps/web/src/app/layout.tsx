import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ClipStream AI — Klip kamu, dibayar otomatis",
  description:
    "Brand kunci budget di smart contract. AI mengecek klip kamu. Begitu views masuk, uangnya cair. Tanpa nunggu approval admin.",
  openGraph: {
    title: "ClipStream AI",
    description:
      "Platform klip video terverifikasi AI dengan pembayaran otomatis berbasis smart contract di BNB Chain.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClipStream AI",
    description: "Klip kamu, dibayar otomatis.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={inter.variable}>
      <head>
        <link
          rel="stylesheet"
          href="/css/amplemarket-staging.webflow.shared.6db28886d.min.css"
        />
        <link
          rel="stylesheet"
          href="/css/amplemarket-staging.webflow.6694f1b8a9955d9d2be998ad.40f1360e8.opt.min.css"
        />
        <link
          rel="stylesheet"
          href="/css/amplemarket-custom.css"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(regs) {
                  for (let r of regs) { r.unregister(); }
                });
                if ('caches' in window) {
                  caches.keys().then(function(names) {
                    for (let n of names) { caches.delete(n); }
                  });
                }
              }
            `,
          }}
        />
      </head>
      <body className="am-body min-h-screen flex flex-col bg-[#f6f5f3] text-[#111] antialiased">
        <div className="am-page-wrapper flex flex-col min-h-screen">
          <Providers>
            <Nav />
            <main className="am-main-page flex-1">{children}</main>
            <Footer />
          </Providers>
        </div>
      </body>
    </html>
  );
}

