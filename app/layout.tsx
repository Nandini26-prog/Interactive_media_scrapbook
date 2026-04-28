import type { Metadata } from "next";
import { Bungee, Caveat, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/theme/theme-provider";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

const bungee = Bungee({
  variable: "--font-bungee",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Prestige Farewell",
  description: "A maximalist digital scrapbook.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${caveat.variable} ${bungee.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" data-theme="nostalgia">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
