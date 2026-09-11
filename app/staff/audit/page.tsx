import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  Search,
  Shield,
} from "lucide-react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStaffAuth } from "@/lib/auth";

type SearchParams = Promise<{
  q?: string;
  action?: string;
}>;

export default async function StaffAuditPage({
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
  const action = params.action?.trim() || "All";

  const where = {
    ...(action !== "All" ? { action } : {}),
    ...(query
      ? {
          OR: [
            {
              actorId: {
                contains: query,
                mode: "insensitive" as const,
              },
            },
            {
              action: {
                contains: query,
                mode: "insensitive" as const,
              },
            },
            {
              targetType: {
                contains: query,
                mode: "insensitive" as const,
              },
            },
            {
              targetId: {
                contains: query,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  };

  const [logs, actionRows, totalLogs] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    }),

    prisma.auditLog.findMany({
      distinct: ["action"],
      orderBy: {
        createdAt: "desc",
      },
      select: {
        action: true,
      },
    }),

    prisma.auditLog.count(),
  ]);

  const actions = actionRows.map((item) => item.action);

  return (
    <main className="min-h-screen bg-[#f8f9fb]">
      {/* Header */}
      <section className="border-b border-black/[0.06] bg-white">
        <div className="mx-auto max-w-[1200px] px-6 py-8 lg:px-10">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#969aa1]">
                <Activity size={13} />
                Moderation
              </div>

              <h1 className="text-3xl font-semibold tracking-[-0.05em] text-[#111318]">
                Audit Logs
              </h1>

              <p className="mt-2 text-sm text-[#777b83]">
                Review staff actions and moderation activity.
              </p>
            </div>

            <Link
              href="/staff"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-black/[0.08] px-3.5 text-xs font-semibold text-[#555a63] transition hover:bg-[#f7f7f8] hover:text-[#111318]"
            >
              Staff Dashboard
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-[1200px] px-6 py-8 lg:px-10 lg:py-10">
        {/* Summary */}
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          <SummaryCard
            icon={<Activity size={16} />}
            label="Total events"
            value={totalLogs}
          />

          <SummaryCard
            icon={<Shield size={16} />}
            label="Actions tracked"
            value={actions.length}
          />
        </div>

        {/* Filters */}
        <form
          method="GET"
          className="mb-4 rounded-2xl border border-black/[0.07] bg-white p-4"
        >
          <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#969aa1]"
              />

              <input
                name="q"
                defaultValue={query}
                placeholder="Search staff ID, action, target type or target ID..."
                className="h-11 w-full rounded-xl border border-black/[0.08] bg-white pl-10 pr-4 text-sm text-[#111318] outline-none transition placeholder:text-[#a0a3a9] focus:border-black/[0.18]"
              />
            </div>

            <select
              name="action"
              defaultValue={action}
              className="h-11 rounded-xl border border-black/[0.08] bg-white px-4 text-sm text-[#555a63] outline-none transition focus:border-black/[0.18]"
            >
              <option value="All">All actions</option>

              {actions.map((item) => (
                <option key={item} value={item}>
                  {formatAction(item)}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-[10px] text-[#a0a3a9]">
              Showing {logs.length} event{logs.length === 1 ? "" : "s"}
            </p>

            <button
              type="submit"
              className="inline-flex h-8 items-center gap-2 rounded-lg bg-[#111318] px-3 text-[11px] font-semibold text-white transition hover:bg-[#25272d]"
            >
              <Search size={12} />
              Search
            </button>
          </div>
        </form>

        {/* Logs */}
        {logs.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-black/[0.07] bg-white text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#f3f4f5] text-[#969aa1]">
              <Activity size={20} />
            </div>

            <h2 className="text-sm font-semibold text-[#111318]">
              No audit logs found
            </h2>

            <p className="mt-2 max-w-sm text-xs leading-5 text-[#858991]">
              No moderation activity matches your current search
              or filter.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white">
            <div className="hidden grid-cols-[1.2fr_1.2fr_1fr_1fr_auto] gap-4 border-b border-black/[0.06] bg-[#fafafa] px-5 py-3 text-[9px] font-bold uppercase tracking-[0.1em] text-[#a0a3a9] md:grid">
              <span>Action</span>
              <span>Staff member</span>
              <span>Target</span>
              <span>Date</span>
              <span />
            </div>

            <div className="divide-y divide-black/[0.05]">
              {logs.map((log) => (
                <AuditRow key={log.id} log={log} />
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Components                                                                 */
/* -------------------------------------------------------------------------- */

function AuditRow({
  log,
}: {
  log: {
    id: string;
    actorId: string;
    action: string;
    targetType: string;
    targetId: string | null;
    metadata: string | null;
    createdAt: Date;
  };
}) {
  return (
    <div className="group px-5 py-4 transition hover:bg-[#fafafa]">
      <div className="grid gap-4 md:grid-cols-[1.2fr_1.2fr_1fr_1fr_auto] md:items-center">
        {/* Action */}
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f3f4f5] text-[#686d75]">
              <Activity size={14} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-[#111318]">
                {formatAction(log.action)}
              </p>

              <p className="mt-0.5 text-[9px] uppercase tracking-[0.08em] text-[#a0a3a9]">
                {log.action}
              </p>
            </div>
          </div>
        </div>

        {/* Actor */}
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#a0a3a9] md:hidden">
            Staff member
          </p>

          <p className="mt-1 break-all text-xs text-[#555a63] md:mt-0">
            {log.actorId}
          </p>
        </div>

        {/* Target */}
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#a0a3a9] md:hidden">
            Target
          </p>

          <p className="mt-1 text-xs font-medium text-[#555a63] md:mt-0">
            {formatTarget(log.targetType)}
          </p>

          {log.targetId && (
            <p className="mt-0.5 break-all text-[10px] text-[#a0a3a9]">
              {log.targetId}
            </p>
          )}
        </div>

        {/* Date */}
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#a0a3a9] md:hidden">
            Date
          </p>

          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-[#858991] md:mt-0">
            <CalendarDays size={12} />
            {formatDateTime(log.createdAt)}
          </div>
        </div>

        {/* Metadata */}
        <div className="md:text-right">
          {log.metadata ? (
            <span
              title={log.metadata}
              className="inline-flex max-w-[140px] truncate rounded-lg bg-[#f3f4f5] px-2 py-1 text-[9px] font-medium text-[#858991]"
            >
              Metadata
            </span>
          ) : (
            <span className="text-[10px] text-[#c0c2c6]">
              —
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-black/[0.07] bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#a0a3a9]">
          {label}
        </p>

        <div className="text-[#969aa1]">{icon}</div>
      </div>

      <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#111318]">
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatAction(action: string) {
  return action
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatTarget(target: string) {
  return target
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}