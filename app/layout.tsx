import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IIO: Systems Design for Human-AI Work",
  description:
    "A diagnostic framework built on systems dynamics and industrial-organizational psychology for how companies integrate AI into work.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
