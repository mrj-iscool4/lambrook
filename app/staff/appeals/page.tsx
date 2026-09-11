import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  Search,
  Shield,
  ShieldQuestion,
  XCircle,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getStaffAuth } from "@/lib/auth";
import RobloxAvatar from "@/components/roblox-avatar";

type SearchParams = Promise<{
  q?: string;
  status?: string;
}>;

export default async function StaffAppealsPage({
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
  const query = params.q?.trim() || "";
  const requestedStatus = params.status || "Pending";

  const validStatuses = ["Pending", "Approved", "Denied", "All"];
  const status = validStatuses.includes(requestedStatus)
    ? requestedStatus
    : "Pending";

  const where = {
    ...(status !== "All" ? { status } : {}),
    ...(query
      ? {
          OR: [
            {
              username: {
                contains: query,
                mode: "insensitive" as const,
              },
            },
            {
              robloxUserId: {
                contains: query,
                mode: "insensitive" as const,
              },
            },
            {
              caseId: {
                contains: query,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  };

  const [
    pendingCount,
    approvedCount,
    deniedCount,
    totalCount,
    appeals,
  ] = await Promise.all([
    prisma.appeal.count({
      where: { status: "Pending" },
    }),

    prisma.appeal.count({
      where: { status: "Approved" },
    }),

    prisma.appeal.count({
      where: { status: "Denied" },
    }),

    prisma.appeal.count(),

    prisma.appeal.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
      select: {
        id: true,
        robloxUserId: true,
        username: true,
        caseId: true,
        email: true,
        reason: true,
        statement: true,
        status: true,
        reviewedBy: true,
        reviewedAt: true,
        response: true,
        createdAt: true,
      },
    }),
  ]);

  return (
    <main className="min-h-screen bg-[#f8f9fb]">
      {/* Header */}
      <section className="border-b border-black/[0.06] bg-white">
        <div className="mx-auto max-w-[1400px] px-6 py-8 lg:px-10">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#969aa1]">
                <Shield size={13} />
                Staff Portal
              </div>

              <h1 className="text-3xl font-semibold tracking-[-0.05em] text-[#111318]">
                Appeal Review
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[#777b83]">
                Review player appeals and manage decisions on moderation cases.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#f3f4f5] px-3.5 text-[11px] font-semibold text-[#555a63]">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    pendingCount > 0
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                />
                {pendingCount} pending
              </span>

              <Link
                href="/appeals"
                target="_blank"
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-black/[0.08] bg-white px-3.5 text-xs font-semibold text-[#555a63] transition hover:border-black/[0.14] hover:text-[#111318]"
              >
                Public appeals
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main */}
      <section className="mx-auto max-w-[1400px] px-6 py-8 lg:px-10 lg:py-10">
        {/* Statistics */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            href="/staff/appeals?status=Pending"
            label="Pending"
            value={pendingCount}
            description="Awaiting staff review"
            icon={<Clock3 size={17} />}
            highlight={pendingCount > 0}
          />

          <StatCard
            href="/staff/appeals?status=Approved"
            label="Approved"
            value={approvedCount}
            description="Appeals accepted"
            icon={<CheckCircle2 size={17} />}
          />

          <StatCard
            href="/staff/appeals?status=Denied"
            label="Denied"
            value={deniedCount}
            description="Appeals rejected"
            icon={<XCircle size={17} />}
          />

          <StatCard
            href="/staff/appeals?status=All"
            label="Total Appeals"
            value={totalCount}
            description="All submitted appeals"
            icon={<FileText size={17} />}
          />
        </div>

        {/* Search + filters */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-black/[0.07] bg-white">
          <div className="border-b border-black/[0.06] px-5 py-4">
            <div className="flex items-center gap-2">
              <Search size={15} className="text-[#686d75]" />

              <div>
                <h2 className="text-sm font-semibold text-[#111318]">
                  Find an appeal
                </h2>

                <p className="mt-1 text-xs text-[#969aa1]">
                  Search by username, Roblox ID or case ID.
                </p>
              </div>
            </div>
          </div>

          <form
            method="GET"
            className="flex flex-col gap-3 p-4 lg:flex-row"
          >
            <div className="relative flex-1">
              <Search
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a0a3a9]"
              />

              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search appeals..."
                className="h-11 w-full rounded-xl border border-black/[0.08] bg-[#fafafa] pl-10 pr-4 text-xs text-[#111318] outline-none transition placeholder:text-[#a0a3a9] focus:border-black/[0.18] focus:bg-white"
              />
            </div>

            <input type="hidden" name="status" value={status} />

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#111318] px-5 text-xs font-semibold text-white transition hover:bg-[#25272d]"
            >
              <Search size={14} />
              Search
            </button>

            {query && (
              <Link
                href={`/staff/appeals?status=${status}`}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-black/[0.08] px-5 text-xs font-semibold text-[#555a63] transition hover:bg-[#f7f7f8] hover:text-[#111318]"
              >
                Clear
              </Link>
            )}
          </form>

          <div className="flex flex-wrap gap-2 border-t border-black/[0.06] px-4 py-3">
            <FilterLink
              href={buildFilterUrl("Pending", query)}
              active={status === "Pending"}
            >
              Pending
              {pendingCount > 0 && (
                <span className="ml-1.5 text-[9px] opacity-60">
                  {pendingCount}
                </span>
              )}
            </FilterLink>

            <FilterLink
              href={buildFilterUrl("Approved", query)}
              active={status === "Approved"}
            >
              Approved
            </FilterLink>

            <FilterLink
              href={buildFilterUrl("Denied", query)}
              active={status === "Denied"}
            >
              Denied
            </FilterLink>

            <FilterLink
              href={buildFilterUrl("All", query)}
              active={status === "All"}
            >
              All appeals
            </FilterLink>
          </div>
        </div>

        {/* Results */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-black/[0.07] bg-white">
          <div className="flex flex-col justify-between gap-3 border-b border-black/[0.06] px-5 py-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <ShieldQuestion size={15} className="text-[#686d75]" />

                <h2 className="text-sm font-semibold text-[#111318]">
                  {status === "All" ? "All appeals" : `${status} appeals`}
                </h2>
              </div>

              <p className="mt-1 text-xs text-[#969aa1]">
                {appeals.length}{" "}
                {appeals.length === 1 ? "appeal" : "appeals"} found
                {query ? ` for "${query}"` : ""}.
              </p>
            </div>

            {status === "Pending" && pendingCount > 0 && (
              <div className="inline-flex w-fit items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-[10px] font-semibold text-amber-700">
                <AlertCircle size={13} />
                Action required
              </div>
            )}
          </div>

          {appeals.length === 0 ? (
            <EmptyState
              icon={<ShieldQuestion size={19} />}
              title={
                query
                  ? "No matching appeals"
                  : status === "Pending"
                    ? "No pending appeals"
                    : "No appeals found"
              }
              description={
                query
                  ? "Try a different username, Roblox ID or case ID."
                  : status === "Pending"
                    ? "There are currently no appeals waiting for review."
                    : "Appeals matching this filter will appear here."
              }
            />
          ) : (
            <div className="divide-y divide-black/[0.05]">
              {appeals.map((appeal) => (
                <AppealRow key={appeal.id} appeal={appeal} />
              ))}
            </div>
          )}
        </div>

        {/* Bottom information */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <InfoTile
            icon={<ShieldQuestion size={15} />}
            label="Review queue"
            value={`${pendingCount} pending`}
          />

          <InfoTile
            icon={<FileText size={15} />}
            label="Records"
            value={`${totalCount} total appeals`}
          />

          <InfoTile
            icon={<Shield size={15} />}
            label="Access"
            value={formatRole(staff.role)}
          />
        </div>
      </section>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Components                                                                 */
/* -------------------------------------------------------------------------- */

function StatCard({
  href,
  label,
  value,
  description,
  icon,
  highlight = false,
}: {
  href: string;
  label: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group rounded-2xl border bg-white p-5 transition duration-200 hover:-translate-y-[1px] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] ${
        highlight
          ? "border-amber-200 hover:border-amber-300"
          : "border-black/[0.07] hover:border-black/[0.12]"
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#a0a3a9]">
          {label}
        </p>

        <div
          className={`transition-colors ${
            highlight
              ? "text-amber-600"
              : "text-[#969aa1] group-hover:text-[#111318]"
          }`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#111318]">
        {value}
      </p>

      <p className="mt-1 text-[10px] text-[#969aa1]">
        {description}
      </p>
    </Link>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex h-8 items-center rounded-lg px-3 text-[10px] font-semibold transition ${
        active
          ? "bg-[#111318] text-white"
          : "bg-[#f4f5f6] text-[#686d75] hover:bg-[#eceef0] hover:text-[#111318]"
      }`}
    >
      {children}
    </Link>
  );
}

function AppealRow({
  appeal,
}: {
  appeal: {
    id: string;
    robloxUserId: string;
    username: string;
    caseId: string;
    email: string;
    reason: string;
    statement: string;
    status: string;
    reviewedBy: string | null;
    reviewedAt: Date | null;
    response: string | null;
    createdAt: Date;
  };
}) {
  return (
    <Link
      href={`/staff/appeals/${appeal.id}`}
      className="group flex flex-col gap-4 px-5 py-5 transition hover:bg-[#fafafa] sm:flex-row sm:items-center"
    >
      <RobloxAvatar
        userId={appeal.robloxUserId}
        size={46}
        className="rounded-xl"
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-xs font-semibold text-[#111318]">
            @{appeal.username}
          </p>

          <AppealStatus status={appeal.status} />

          <span className="rounded-full bg-[#f3f4f5] px-2 py-0.5 text-[9px] font-semibold text-[#858991]">
            {appeal.caseId}
          </span>
        </div>

        <p className="mt-2 line-clamp-1 text-[11px] leading-5 text-[#686d75]">
          {appeal.reason}
        </p>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#a0a3a9]">
          <span>Roblox ID {appeal.robloxUserId}</span>
          <span className="hidden sm:inline">·</span>
          <span>{formatDate(appeal.createdAt)}</span>

          {appeal.reviewedAt && (
            <>
              <span className="hidden sm:inline">·</span>
              <span>Reviewed {formatDate(appeal.reviewedAt)}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <div className="hidden text-right lg:block">
          <p className="text-[10px] font-medium text-[#555a63]">
            {appeal.statement.length > 55
              ? `${appeal.statement.slice(0, 55)}…`
              : appeal.statement}
          </p>

          <p className="mt-1 text-[9px] text-[#a0a3a9]">
            Player statement
          </p>
        </div>

        <ArrowRight
          size={14}
          className="shrink-0 text-[#b0b2b6] transition group-hover:translate-x-0.5 group-hover:text-[#111318]"
        />
      </div>
    </Link>
  );
}

function AppealStatus({ status }: { status: string }) {
  const config =
    status === "Pending"
      ? {
          className: "bg-amber-50 text-amber-700",
          icon: <Clock3 size={10} />,
        }
      : status === "Approved"
        ? {
            className: "bg-emerald-50 text-emerald-700",
            icon: <CheckCircle2 size={10} />,
          }
        : {
            className: "bg-red-50 text-red-700",
            icon: <XCircle size={10} />,
          };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] ${config.className}`}
    >
      {config.icon}
      {status}
    </span>
  );
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-black/[0.06] bg-white px-4 py-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f3f4f5] text-[#858991]">
        {icon}
      </div>

      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#a0a3a9]">
          {label}
        </p>

        <p className="mt-0.5 text-[11px] font-medium text-[#555a63]">
          {value}
        </p>
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#f3f4f5] text-[#969aa1]">
        {icon}
      </div>

      <p className="text-xs font-semibold text-[#111318]">
        {title}
      </p>

      <p className="mt-1 max-w-sm text-[10px] leading-5 text-[#969aa1]">
        {description}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function buildFilterUrl(status: string, query: string) {
  const params = new URLSearchParams();

  if (status) {
    params.set("status", status);
  }

  if (query) {
    params.set("q", query);
  }

  return `/staff/appeals?${params.toString()}`;
}

function formatRole(role: string | null) {
  switch (role) {
    case "org:management":
      return "Management";

    case "org:adminsitrator":
      return "Administrator";

    case "org:senior_moderator":
      return "Senior Moderator";

    case "org:moderator":
      return "Moderator";

    default:
      return "Staff";
  }
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}