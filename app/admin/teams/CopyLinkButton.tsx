"use client";

import { useState } from "react";

export default function CopyLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard may be unavailable; nothing useful to do beyond ignoring it
    }
  }

  return (
    <button className="btn btn-ghost" type="button" onClick={copy} style={{ minHeight: 32, padding: "8px 14px" }}>
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}
