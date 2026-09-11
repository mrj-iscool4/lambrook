import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { syncExpiredBans } from "@/lib/expired-bans";
import { getStaffAuth } from "@/lib/auth";
import RobloxAvatar from "@/components/roblox-avatar";
import { redirect } from "next/navigation";
import {
  Ban,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  ExternalLink,
  Filter,
  Search,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";
import BanCopyButton from "@/components/ban-copy-button";
import BanQuickRevoke from "@/components/ban-quick-revoke";

type SearchParams = Promise<{
  q?: string;
  status?: string;
  page?: string;
}>;

const PAGE_SIZE = 15;

export default async function StaffBansPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const staff = await getStaffAuth();

  if (!staff.authenticated) {
    redirect("/sign-in");
  }

  if (!staff.authorized) {
    redirect("/staff/access-denied");
  }

  const params = await searchParams;

  await syncExpiredBans();

  const query = params.q?.trim() || "";
  const status = params.status || "all";

  let page = Number.parseInt(params.page || "1", 10);

  if (!Number.isFinite(page) || page < 1) {
    page = 1;
  }

  const where: any = {};

  /*
   * Search
   */
  if (query) {
    where.OR = [
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
    ];
  }

  /*
   * Status filtering
   */
  if (status === "active") {
    where.active = true;
  }

  if (status === "revoked") {
    where.active = false;
  }

  if (status === "expired") {
    where.active = false;
    where.expiresAt = {
      not: null,
      lte: new Date(),
    };
  }

  const total = await prisma.ban.count({
    where,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (page > totalPages) {
    page = totalPages;
  }

  const bans = await prisma.ban.findMany({
    where,
    orderBy: {
      issuedAt: "desc",
    },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const activeCount = await prisma.ban.count({
    where: {
      active: true,
    },
  });

  const revokedCount = await prisma.ban.count({
    where: {
      active: false,
    },
  });

  const expiredCount = await prisma.ban.count({
    where: {
      active: false,
      expiresAt: {
        not: null,
        lte: new Date(),
      },
    },
  });

  function buildUrl(nextPage: number) {
    const search = new URLSearchParams();

    if (query) {
      search.set("q", query);
    }

    if (status !== "all") {
      search.set("status", status);
    }

    search.set("page", String(nextPage));

    return `/staff/bans?${search.toString()}`;
  }

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#f8f9fb]">
      <div className="mx-auto max-w-[1400px] px-6 py-8 lg:px-10 lg:py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[12px] font-medium text-[#969aa1]">
              <Link
                href="/staff"
                className="transition-colors hover:text-[#111318]"
              >
                Staff
              </Link>

              <span>/</span>

              <span className="text-[#111318]">Ban Database</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-black/[0.07] bg-white shadow-sm">
                <Ban size={19} strokeWidth={1.8} />
              </div>

              <div>
                <h1 className="text-[25px] font-semibold tracking-[-0.04em] text-[#111318]">
                  Ban Database
                </h1>

                <p className="mt-1 text-[13px] text-[#777b83]">
                  Search and manage player moderation records.
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/staff/bans/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#111318] px-4 text-[13px] font-semibold text-white transition hover:bg-[#24262b]"
          >
            <Ban size={15} />
            Issue Ban
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            icon={<ShieldCheck size={17} />}
            label="Active bans"
            value={activeCount}
          />

          <StatCard
            icon={<XCircle size={17} />}
            label="Revoked"
            value={revokedCount}
          />

          <StatCard
            icon={<Ban size={17} />}
            label="Expired"
            value={expiredCount}
          />
        </div>

        {/* Search / Filters */}
        <div className="mb-5 rounded-xl border border-black/[0.07] bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <form
            method="GET"
            className="flex flex-col gap-3 lg:flex-row"
          >
            <div className="relative flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#969aa1]"
              />

              <input
                name="q"
                defaultValue={query}
                placeholder="Search username, Roblox ID, display name or case ID..."
                className="h-10 w-full rounded-lg border border-black/[0.08] bg-[#fafafa] pl-10 pr-10 text-[13px] text-[#111318] outline-none transition placeholder:text-[#a1a4aa] focus:border-black/[0.18] focus:bg-white"
              />

              {query && (
                <Link
                  href={`/staff/bans?status=${status}`}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#969aa1] transition hover:text-[#111318]"
                  aria-label="Clear search"
                >
                  <XCircle size={15} />
                </Link>
              )}
            </div>

            <div className="relative">
              <Filter
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#969aa1]"
              />

              <select
                name="status"
                defaultValue={status}
                className="h-10 w-full min-w-[170px] appearance-none rounded-lg border border-black/[0.08] bg-[#fafafa] pl-9 pr-9 text-[13px] font-medium text-[#111318] outline-none transition focus:border-black/[0.18] focus:bg-white"
              >
                <option value="all">All records</option>
                <option value="active">Active bans</option>
                <option value="revoked">Revoked</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <button
              type="submit"
              className="h-10 rounded-lg border border-black/[0.08] bg-[#111318] px-5 text-[13px] font-semibold text-white transition hover:bg-[#24262b]"
            >
              Search
            </button>
          </form>
        </div>

        {/* Result information */}
        <div className="mb-3 flex items-center justify-between px-1">
          <p className="text-[12px] text-[#858991]">
            {total === 0
              ? "No records found"
              : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(
                  page * PAGE_SIZE,
                  total
                )} of ${total} record${total === 1 ? "" : "s"}`}
          </p>

          {(query || status !== "all") && (
            <Link
              href="/staff/bans"
              className="text-[12px] font-medium text-[#5f636b] transition hover:text-[#111318]"
            >
              Clear filters
            </Link>
          )}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-black/[0.07] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          {bans.length === 0 ? (
            <EmptyState
              filtered={Boolean(query || status !== "all")}
            />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-black/[0.06] bg-[#fafafa]">
                      <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#969aa1]">
                        Player
                      </th>

                      <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#969aa1]">
                        Case
                      </th>

                      <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#969aa1]">
                        Reason
                      </th>

                      <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#969aa1]">
                        Duration
                      </th>

                      <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#969aa1]">
                        Status
                      </th>

                      <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[#969aa1]">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-black/[0.05]">
                    {bans.map((ban) => (
                      <BanRow key={ban.id} ban={ban} />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-black/[0.06] lg:hidden">
                {bans.map((ban) => (
                  <MobileBanCard key={ban.id} ban={ban} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-5 flex items-center justify-between">
            <Link
              href={page > 1 ? buildUrl(page - 1) : "#"}
              aria-disabled={page <= 1}
              className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-[12px] font-medium transition ${
                page <= 1
                  ? "pointer-events-none border-black/[0.05] text-[#c0c2c6]"
                  : "border-black/[0.08] bg-white text-[#555960] hover:bg-[#fafafa] hover:text-[#111318]"
              }`}
            >
              <ChevronLeft size={14} />
              Previous
            </Link>

            <div className="text-[12px] text-[#858991]">
              Page{" "}
              <span className="font-semibold text-[#111318]">
                {page}
              </span>{" "}
              of {totalPages}
            </div>

            <Link
              href={page < totalPages ? buildUrl(page + 1) : "#"}
              aria-disabled={page >= totalPages}
              className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-[12px] font-medium transition ${
                page >= totalPages
                  ? "pointer-events-none border-black/[0.05] text-[#c0c2c6]"
                  : "border-black/[0.08] bg-white text-[#555960] hover:bg-[#fafafa] hover:text-[#111318]"
              }`}
            >
              Next
              <ChevronRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-black/[0.07] bg-white px-4 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/[0.06] bg-[#fafafa] text-[#555960]">
          {icon}
        </div>

        <span className="text-[12px] font-medium text-[#777b83]">
          {label}
        </span>
      </div>

      <span className="text-[20px] font-semibold tracking-[-0.04em] text-[#111318]">
        {value}
      </span>
    </div>
  );
}

function BanRow({
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
  const expired =
    !ban.active &&
    ban.expiresAt &&
    ban.expiresAt <= new Date();

  return (
    <tr className="group transition-colors hover:bg-[#fcfcfc]">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
 <RobloxAvatar
  userId={ban.robloxUserId}
  size={40}
/>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Link
                href={`/staff/bans/${ban.id}`}
                className="truncate text-[13px] font-semibold text-[#111318] hover:underline"
              >
                {ban.username}
              </Link>

              {ban.displayName &&
                ban.displayName !== ban.username && (
                  <span className="truncate text-[11px] text-[#969aa1]">
                    {ban.displayName}
                  </span>
                )}
            </div>

            <BanCopyButton value={ban.robloxUserId} label="ID" />
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <BanCopyButton value={ban.caseId} label={ban.caseId} />
      </td>

      <td className="max-w-[240px] px-5 py-4">
        <p
          className="truncate text-[12px] font-medium text-[#44474e]"
          title={ban.reason}
        >
          {ban.reason}
        </p>
      </td>

      <td className="px-5 py-4">
        <span className="text-[12px] text-[#666a72]">
          {ban.duration}
        </span>
      </td>

      <td className="px-5 py-4">
        <StatusBadge
          active={ban.active}
          expired={Boolean(expired)}
        />
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-2">
          {ban.active && (
            <BanQuickRevoke banId={ban.id} />
          )}

          <Link
            href={`/staff/bans/${ban.id}`}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-black/[0.08] px-2.5 text-[11px] font-semibold text-[#555960] opacity-0 transition group-hover:opacity-100 hover:bg-[#f7f7f8] hover:text-[#111318]"
          >
            Manage
            <ExternalLink size={12} />
          </Link>
        </div>
      </td>
    </tr>
  );
}

function MobileBanCard({
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
  const expired =
    !ban.active &&
    ban.expiresAt &&
    ban.expiresAt <= new Date();

  return (
    <div className="p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
<RobloxAvatar
  userId={ban.robloxUserId}
  size={44}
/>

          <div className="min-w-0">
            <Link
              href={`/staff/bans/${ban.id}`}
              className="block truncate text-[13px] font-semibold text-[#111318]"
            >
              {ban.username}
            </Link>

            {ban.displayName &&
              ban.displayName !== ban.username && (
                <p className="truncate text-[11px] text-[#969aa1]">
                  {ban.displayName}
                </p>
              )}
          </div>
        </div>

        <StatusBadge
          active={ban.active}
          expired={Boolean(expired)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <InfoItem label="Case">
          <BanCopyButton
            value={ban.caseId}
            label={ban.caseId}
          />
        </InfoItem>

        <InfoItem label="Roblox ID">
          <BanCopyButton
            value={ban.robloxUserId}
            label={ban.robloxUserId}
          />
        </InfoItem>

        <InfoItem label="Reason">
          <span className="block truncate text-[12px] text-[#555960]">
            {ban.reason}
          </span>
        </InfoItem>

        <InfoItem label="Duration">
          <span className="text-[12px] text-[#555960]">
            {ban.duration}
          </span>
        </InfoItem>
      </div>

      <div className="mt-4 flex gap-2">
        <Link
          href={`/staff/bans/${ban.id}`}
          className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-black/[0.08] text-[12px] font-semibold text-[#111318]"
        >
          Manage
          <ExternalLink size={13} />
        </Link>

        {ban.active && (
          <BanQuickRevoke banId={ban.id} />
        )}
      </div>
    </div>
  );
}

function InfoItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-black/[0.05] bg-[#fafafa] px-3 py-2.5">
      <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#a0a3a8]">
        {label}
      </p>

      {children}
    </div>
  );
}

function StatusBadge({
  active,
  expired,
}: {
  active: boolean;
  expired: boolean;
}) {
  if (active) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[10px] font-semibold text-red-700">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        Active
      </span>
    );
  }

  if (expired) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Expired
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-[#f7f7f8] px-2.5 py-1 text-[10px] font-semibold text-[#777b83]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#9b9ea4]" />
      Revoked
    </span>
  );
}

function EmptyState({
  filtered,
}: {
  filtered: boolean;
}) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-black/[0.07] bg-[#fafafa]">
        <Ban size={20} className="text-[#969aa1]" />
      </div>

      <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-[#111318]">
        {filtered ? "No matching bans" : "No bans recorded"}
      </h2>

      <p className="mt-1.5 max-w-sm text-[12px] leading-5 text-[#858991]">
        {filtered
          ? "Try changing your search or filters to find another moderation record."
          : "Once a player is banned, their moderation record will appear here."}
      </p>
    </div>
  );
}