import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
export const metadata: Metadata = {
  title: "Crelligent Admin | Diagnostic Engine",
  description: "Systems diagnostic and business architecture assessment platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Outfit:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-sans text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-black">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
