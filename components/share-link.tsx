"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";

export function ShareLink({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const path = `/u/${slug}`;
  const url =
    typeof window !== "undefined" ? `${window.location.origin}${path}` : path;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked — fall through silently
    }
  }

  return (
    <div className="flex items-center gap-2 mt-3">
      <code className="flex-1 truncate field tabular text-[12px] py-2">
        {url}
      </code>
      <button
        type="button"
        onClick={copy}
        className="btn-soft inline-flex items-center gap-1.5"
        aria-label="Copy public link"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? "Copied" : "Copy"}
      </button>
      <a
        href={path}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-soft inline-flex items-center gap-1.5"
      >
        <ExternalLink size={14} /> Open
      </a>
    </div>
  );
}
