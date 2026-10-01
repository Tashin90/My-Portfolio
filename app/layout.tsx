import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Md. Naimul Haque Tashin | CSE Student & Web Developer",
  description: "Portfolio of Md. Naimul Haque Tashin, a CSE student, web developer, and aspiring researcher building practical software through projects and continuous learning.",
  metadataBase: new URL("https://tashin90.github.io"),
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  openGraph: { title: "Md. Naimul Haque Tashin", description: "CSE student, web developer, and aspiring researcher building practical software.", type: "website", images: [{ url: "/images/profile.png", width: 800, height: 800, alt: "Md. Naimul Haque Tashin" }] },
  twitter: { card: "summary_large_image", title: "Md. Naimul Haque Tashin", description: "CSE student, web developer, and aspiring researcher.", images: ["/images/profile.png"] },
  appleWebApp: { capable: true, title: "Tashin Portfolio", statusBarStyle: "black-translucent" },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icons/icon-192.svg", type: "image/svg+xml", sizes: "192x192" }
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", type: "image/png", sizes: "180x180" }]
  }
};

export const viewport: Viewport = { themeColor: "#a78bfa" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
