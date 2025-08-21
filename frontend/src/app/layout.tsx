import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodeHive",
  description: "This is a description for CodeHive",
};

export default function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
