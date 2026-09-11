import Link from "next/link";
import { ArrowLeft, Search, ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[#f8f9fb] px-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#777b83] shadow-sm ring-1 ring-black/[0.06]">
          <ShieldAlert size={22} />
        </div>

        <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.15em] text-[#a0a3a9]">
          404
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#111318]">
          Page not found
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#858991]">
          The page you're looking for doesn't exist or is no
          longer available.
        </p>

        <div className="mt-6 flex justify-center gap-2">
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#111318] px-4 text-xs font-semibold text-white transition hover:bg-[#25272d]"
          >
            <ArrowLeft size={13} />
            Return home
          </Link>

          <Link
            href="/bans"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-black/[0.08] bg-white px-4 text-xs font-semibold text-[#555a63] transition hover:bg-[#f7f7f8]"
          >
            <Search size={13} />
            Ban database
          </Link>
        </div>
      </div>
    </main>
  );
}