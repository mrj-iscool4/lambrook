"use client";

import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f8f9fb] text-[#111318]">
        <main className="flex min-h-screen items-center justify-center px-6">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#777b83] shadow-sm ring-1 ring-black/[0.06]">
              <AlertTriangle size={22} />
            </div>

            <h1 className="mt-6 text-2xl font-semibold tracking-[-0.04em]">
              Something went wrong
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#858991]">
              An unexpected error occurred. Try again or return to the UKRP homepage.
            </p>

            <div className="mt-6 flex justify-center gap-2">
              <button
                onClick={reset}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#111318] px-4 text-xs font-semibold text-white transition hover:bg-[#25272d]"
              >
                <RefreshCw size={13} />
                Try again
              </button>

              <a
                href="/"
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-black/[0.08] bg-white px-4 text-xs font-semibold text-[#555a63] transition hover:bg-[#f7f7f8]"
              >
                <Home size={13} />
                Home
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
