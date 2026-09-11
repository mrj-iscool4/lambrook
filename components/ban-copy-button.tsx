"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export default function BanCopyButton({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      // Clipboard access can be unavailable in some browsers.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={`Copy ${value}`}
      className="group/copy inline-flex max-w-full items-center gap-1.5 text-left"
    >
      <span className="truncate text-[11px] font-medium text-[#858991] transition-colors group-hover/copy:text-[#111318]">
        {label}
      </span>

      {copied ? (
        <Check
          size={12}
          className="shrink-0 text-emerald-600"
        />
      ) : (
        <Copy
          size={11}
          className="shrink-0 text-[#b0b2b6] opacity-0 transition-opacity group-hover/copy:opacity-100"
        />
      )}
    </button>
  );
}