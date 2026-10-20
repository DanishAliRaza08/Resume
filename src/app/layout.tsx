import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Benchsale Dan", template: "%s · Benchsale Dan" },
  description: "Benchsale Dan — resume builder, JD tailoring and Dice Apply. Developed by Danish Ali Raza.",
  applicationName: "Benchsale Dan",
  authors: [{ name: "Danish Ali Raza" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
