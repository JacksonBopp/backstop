import type { Metadata } from "next";
import DiagnosticApp from "./DiagnosticApp";

export const metadata: Metadata = {
  title: "AI-Adoption Diagnostic & Framework Explorer",
  description: "Run the Layer 0 diagnostic and explore all five layers of the original AI-adoption framework in depth.",
};

export default function DiagnosticPage() {
  return <DiagnosticApp />;
}
