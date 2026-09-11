import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Ban,
  CalendarDays,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { syncExpiredBans } from "@/lib/expired-bans";
import RobloxAvatar from "@/components/roblox-avatar";

export const metadata: Metadata = {
  title: "Ban Database",
  description: "Search active UKRP moderation records and case information.",
};

type SearchParams = Promise<{
  q?: string;
}>;

export default async function BansPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  await syncExpiredBans();
  const query = params.q?.trim() || "";

  const bans = await prisma.ban.findMany({
    where: {
      active: true,
      ...(query
        ? {
            OR: [
              {
                username: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                displayName: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                robloxUserId: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                caseId: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    },
    orderBy: {
      issuedAt: "desc",
    },
  });

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#f7f8fa]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-black/[0.06] bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(0,0,0,0.035),transparent_32%)]" />

        <div className="relative mx-auto max-w-[1200px] px-6 py-14 lg:px-10 lg:py-20">
          <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/[0.07] bg-[#fafafa] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#777b83]">
                <ShieldCheck size={13} />
                Public moderation records
              </div>

              <h1 className="text-4xl font-semibold tracking-[-0.055em] text-[#111318] sm:text-5xl lg:text-[52px] lg:leading-[1.05]">
                Ban Database
              </h1>

              <p className="mt-5 max-w-xl text-[14px] leading-7 text-[#777b83]">
                Search active moderation records across the UKRP community.
                View case information, ban reasons and expiry dates.
              </p>
            </div>

            <div className="hidden shrink-0 lg:block">
              <div className="flex items-center gap-3 rounded-2xl border border-black/[0.07] bg-[#fafafa] px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                  <Ban size={17} className="text-[#555a63]" />
                </div>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#a0a3a9]">
                    Active records
                  </p>
                  <p className="mt-0.5 text-lg font-semibold tracking-[-0.03em] text-[#111318]">
                    {bans.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Database */}
      <section className="mx-auto max-w-[1200px] px-6 py-8 lg:px-10 lg:py-12">
        {/* Search panel */}
        <div className="mb-8 rounded-2xl border border-black/[0.07] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.025)] sm:p-5">
          <form method="GET">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#969aa1]"
                />

                <input
                  name="q"
                  defaultValue={query}
                  placeholder="Search username, Roblox ID or case ID..."
                  className="h-12 w-full rounded-xl border border-black/[0.07] bg-[#fafafa] pl-11 pr-4 text-sm text-[#111318] outline-none transition placeholder:text-[#a0a3a9] hover:border-black/[0.11] focus:border-black/[0.2] focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#111318] px-6 text-xs font-semibold text-white transition hover:bg-[#25282d] active:scale-[0.99]"
              >
                <Search size={14} />
                Search
              </button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1">
            <p className="text-[11px] text-[#969aa1]">
              Search by username, display name, Roblox ID or case ID.
            </p>

            {query && (
              <Link
                href="/bans"
                className="text-[11px] font-semibold text-[#555a63] transition hover:text-[#111318]"
              >
                Clear search
              </Link>
            )}
          </div>
        </div>

        {/* Results header */}
        <div className="mb-4 flex items-end justify-between px-1">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#a0a3a9]">
              Database
            </p>

            <h2 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-[#111318]">
              {query ? "Search results" : "Active bans"}
            </h2>
          </div>

          <p className="text-xs text-[#858991]">
            {bans.length} {bans.length === 1 ? "record" : "records"}
          </p>
        </div>

        {/* Results */}
        {bans.length === 0 ? (
          <div className="flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-black/[0.07] bg-white px-6 text-center shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-black/[0.07] bg-[#fafafa]">
              {query ? (
                <Search size={21} className="text-[#969aa1]" />
              ) : (
                <Ban size={21} className="text-[#969aa1]" />
              )}
            </div>

            <h2 className="text-sm font-semibold text-[#111318]">
              {query ? "No matching records" : "No active bans"}
            </h2>

            <p className="mt-2 max-w-sm text-xs leading-5 text-[#858991]">
              {query
                ? "We couldn't find an active ban matching your search. Try a different username, Roblox ID or case ID."
                : "There are currently no active moderation records in the database."}
            </p>

            {query && (
              <Link
                href="/bans"
                className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg border border-black/[0.08] bg-white px-4 text-xs font-semibold text-[#555a63] transition hover:border-black/[0.14] hover:text-[#111318]"
              >
                Clear search
                <ArrowRight size={13} />
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {bans.map((ban) => (
              <PublicBanCard key={ban.id} ban={ban} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function PublicBanCard({
  ban,
}: {
  ban: {
    id: string;
    robloxUserId: string;
    username: string;
    displayName: string | null;
    reason: string;
    duration: string;
    issuedAt: Date;
    expiresAt: Date | null;
    caseId: string;
    active: boolean;
  };
}) {
  return (
    <Link
      href={`/bans/${ban.robloxUserId}`}
      className="group block overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition duration-200 hover:-translate-y-[1px] hover:border-black/[0.11] hover:shadow-[0_10px_35px_rgba(0,0,0,0.055)]"
    >
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          {/* Player */}
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="relative shrink-0">
              <RobloxAvatar
                userId={ban.robloxUserId}
                size={60}
                className="rounded-2xl"
              />

              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-red-500">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-[15px] font-semibold tracking-[-0.025em] text-[#111318]">
                  {ban.displayName || ban.username}
                </h3>

                <span className="rounded-full bg-red-50 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-red-600">
                  Active
                </span>
              </div>

              <p className="mt-1 text-xs text-[#858991]">
                @{ban.username}
              </p>

              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[#a0a3a9]">
                <UserRound size={11} />
                {ban.robloxUserId}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-5 border-t border-black/[0.06] pt-5 sm:grid-cols-4 lg:min-w-[570px] lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
            <Detail
              label="Reason"
              value={ban.reason}
            />

            <Detail
              label="Duration"
              value={ban.duration}
            />

            <Detail
              label="Case"
              value={ban.caseId}
              mono
            />

            <Detail
              label="Expires"
              value={
                ban.expiresAt
                  ? formatDate(ban.expiresAt)
                  : "Never"
              }
              icon={<CalendarDays size={11} />}
            />
          </div>

          {/* Arrow */}
          <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/[0.07] text-[#969aa1] transition-all group-hover:border-black/[0.13] group-hover:bg-[#fafafa] group-hover:text-[#111318] lg:flex">
            <ArrowRight
              size={15}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </div>
        </div>
      </div>

      {/* Bottom metadata */}
      <div className="flex items-center justify-between border-t border-black/[0.05] bg-[#fcfcfc] px-5 py-3 sm:px-6">
        <p className="text-[10px] text-[#a0a3a9]">
          Issued {formatDate(ban.issuedAt)}
        </p>

        <p className="text-[10px] font-medium text-[#969aa1] transition-colors group-hover:text-[#555a63]">
          View case
          <span className="ml-1">→</span>
        </p>
      </div>
    </Link>
  );
}

function Detail({
  label,
  value,
  mono = false,
  icon,
}: {
  label: string;
  value: string;
  mono?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#a0a3a9]">
        {icon}
        {label}
      </p>

      <p
        className={`mt-1 truncate text-xs font-medium text-[#555a63] ${
          mono ? "font-mono text-[10px]" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}