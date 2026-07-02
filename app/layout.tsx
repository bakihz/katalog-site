import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.laleedt.com.tr"),
  title: "Lale EDT Gıda A.Ş. | Çok Yakında",
  description:
    "Yeni web sitemiz hazırlanıyor. İletişim bilgilerimize bu sayfadan ulaşabilirsiniz.",
  applicationName: "Lale EDT Gıda",
  openGraph: {
    title: "Lale EDT Gıda A.Ş.",
    description:
      "Yeni web sitemiz hazırlanıyor. İletişim bilgilerimize bu sayfadan ulaşabilirsiniz.",
    url: "https://www.laleedt.com.tr/gecici",
    siteName: "Lale EDT Gıda",
    images: [
      {
        url: "/logo.svg",
        width: 720,
        height: 720,
        alt: "Lale EDT Gıda logosu",
      },
    ],
    locale: "tr_TR",
    type: "website",
  },
  icons: {
    icon: [
      {
        url: "/logo.svg",
        type: "image/svg+xml",
        sizes: "any",
      },
    ],
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
