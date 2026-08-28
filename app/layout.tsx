import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Backstop: AI-Verification Load Tracking for Zendesk",
  description:
    "Backstop is a Zendesk app that tracks AI-verification and oversight load by group, the hidden work of checking AI-generated replies, before it burns out a team.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
