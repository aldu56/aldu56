import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { Toaster } from "sonner";
import { CartProvider } from "@/components/site/cart-context";
import "./globals.css";

const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500", "600"], style: ["normal", "italic"], variable: "--font-cormorant" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "ÉLORIA SKIN • HAIR — Your beauty, understood.", template: "%s · ÉLORIA" },
  description: "ÉLORIA Smart Mirror and Smart Comb: intelligent skin and scalp analysis with personalized care rituals.",
  openGraph: { title: "ÉLORIA SKIN • HAIR", description: "Your beauty, understood.", type: "website" },
};

export const viewport: Viewport = { themeColor: "#FAF6F1" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="min-h-screen">
        <CartProvider>{children}</CartProvider>
        <Toaster position="top-center" toastOptions={{ style: { background: "#FAF6F1", color: "#49352B", border: "1px solid #D8C1AE", fontFamily: "var(--font-inter)" } }} />
      </body>
    </html>
  );
}
