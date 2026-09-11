import Link from "next/link";
import { ArrowLeft, ShieldX } from "lucide-react";

export default function AccessDeniedPage() {
  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[#f8f9fb] px-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
          <ShieldX size={21} />
        </div>

        <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#969aa1]">
          Staff Portal
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#111318]">
          Access denied
        </h1>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#777b83]">
          Your account does not have the required UKRP staff permissions to
          access this area.
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg border border-black/[0.08] bg-white px-4 text-xs font-semibold text-[#555a63] transition hover:bg-[#f7f7f8]"
        >
          <ArrowLeft size={14} />
          Return home
        </Link>
      </div>
    </main>
  );
}