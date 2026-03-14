import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

const siteUrl = "https://nextjs-dashboard-lyart-zeta-20.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0369a1",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Smart City Intelligence — นครสวรรค์",
    template: "%s | Smart City นครสวรรค์",
  },
  description: "ระบบสารสนเทศเมืองอัจฉริยะ นครสวรรค์ — ระบบสนับสนุนข้อมูลเชิงสถิติสำหรับผู้บริหาร เทศบาลนครนครสวรรค์ วิเคราะห์โครงการ งบประมาณ และยุทธศาสตร์ Smart City",
  keywords: ["นครสวรรค์", "Smart City", "เทศบาลนครนครสวรรค์", "ระบบสารสนเทศ", "งบประมาณ", "Smart Governance", "Smart Living", "Smart Economy", "Smart People"],
  authors: [{ name: "กองยุทธศาสตร์และงบประมาณ เทศบาลนครนครสวรรค์" }],
  creator: "เทศบาลนครนครสวรรค์",
  publisher: "เทศบาลนครนครสวรรค์",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: siteUrl,
    siteName: "Smart City Intelligence นครสวรรค์",
    title: "Smart City Intelligence — เทศบาลนครนครสวรรค์",
    description: "ระบบสนับสนุนข้อมูลเชิงสถิติสำหรับผู้บริหาร — วิเคราะห์โครงการและงบประมาณ Smart City",
    images: [{ url: "/media/info.webp", width: 1200, height: 630, alt: "Smart City Intelligence นครสวรรค์" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart City Intelligence — นครสวรรค์",
    description: "ระบบสนับสนุนข้อมูลเชิงสถิติสำหรับผู้บริหาร เทศบาลนครนครสวรรค์",
    images: ["/media/info.webp"],
  },
  icons: {
    icon: [
      { url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏙️</text></svg>", type: "image/svg+xml" },
    ],
    apple: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏙️</text></svg>",
  },
  alternates: { canonical: siteUrl },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <a href="#main-content" className="skipLink">ข้ามไปเนื้อหาหลัก</a>
        {children}
      </body>
    </html>
  );
}
