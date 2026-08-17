import type { Metadata } from "next";
import DiagnosticApp from "./DiagnosticApp";

export const metadata: Metadata = {
  title: "IIO Diagnostic & Framework Explorer",
  description: "Run the Layer 0 diagnostic and explore all five layers of the IIO framework in depth.",
};

export default function DiagnosticPage() {
  return <DiagnosticApp />;
}
