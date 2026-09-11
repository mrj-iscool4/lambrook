import { redirect } from "next/navigation";
import { getStaffAuth } from "@/lib/auth";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Ban,
  CheckCircle2,
  Clock3,
  FileText,
  Gavel,
  Search,
  Shield,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { syncExpiredBans } from "@/lib/expired-bans";

export default async function StaffDashboard() {
  const staff = await getStaffAuth();

  if (!staff.authenticated) {
    redirect("/sign-in");
  }

  if (!staff.authorized) {
    redirect("/staff/access-denied");
  }

  await syncExpiredBans();

  const [
    totalBans,
    activeBans,
    inactiveBans,
    pendingAppeals,
    recentBans,
  ] = await Promise.all([
    prisma.ban.count(),

    prisma.ban.count({
      where: {
        active: true,
      },
    }),

    prisma.ban.count({
      where: {
        active: false,
      },
    }),

    prisma.appeal.count({
      where: {
        status: "Pending",
      },
    }),

    prisma.ban.findMany({
      orderBy: {
        issuedAt: "desc",
      },
      take: 6,
    }),
  ]);

  const robloxConfigured = Boolean(
    process.env.ROBLOX_OPEN_CLOUD_API_KEY
  );

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-black/[0.06] bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(0,0,0,0.035),transparent_32%)]" />

        <div className="relative mx-auto max-w-[1400px] px-6 py-10 lg:px-10 lg:py-14">
          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-black/[0.07] bg-[#fafafa] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#777b83]">
                <Shield size={13} />
                Staff Portal
              </div>

              <h1 className="text-4xl font-semibold tracking-[-0.055em] text-[#111318] sm:text-5xl">
                Dashboard
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-[#777b83]">
                Manage moderation, appeals and community records
                from one place.
              </p>
            </div>

            <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>

              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                System operational
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="mx-auto max-w-[1400px] px-6 pt-7 lg:px-10 lg:pt-9">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Gavel size={17} />}
            label="Total bans"
            value={totalBans}
            description="All moderation records"
          />

          <StatCard
            icon={<Ban size={17} />}
            label="Active bans"
            value={activeBans}
            description="Currently enforced"
            accent="red"
          />

          <StatCard
            icon={<Clock3 size={17} />}
            label="Inactive bans"
            value={inactiveBans}
            description="Expired or revoked"
          />

          <StatCard
            icon={<FileText size={17} />}
            label="Pending appeals"
            value={pendingAppeals}
            description="Awaiting review"
            accent={pendingAppeals > 0 ? "amber" : undefined}
          />
        </div>
      </section>

      {/* Main content */}
      <section className="mx-auto grid max-w-[1400px] gap-5 px-6 py-7 lg:grid-cols-[1.55fr_1fr] lg:px-10 lg:py-8">
        {/* Recent moderation */}
        <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f5f6] text-[#555a63]">
                <Activity size={17} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-[#111318]">
                  Recent moderation
                </h2>

                <p className="mt-1 text-xs text-[#969aa1]">
                  Latest cases added to the database.
                </p>
              </div>
            </div>

            <Link
              href="/staff/bans"
              className="group flex items-center gap-1.5 text-[11px] font-semibold text-[#777b83] transition hover:text-[#111318]"
            >
              View all
              <ArrowRight
                size={13}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          {recentBans.length === 0 ? (
            <EmptyState
              icon={<Ban size={19} />}
              title="No moderation activity"
              description="Once a ban is issued, the latest cases will appear here."
            />
          ) : (
            <div className="divide-y divide-black/[0.055]">
              {recentBans.map((ban) => (
                <Link
                  key={ban.id}
                  href={`/staff/bans/${ban.id}`}
                  className="group flex items-center gap-4 px-6 py-4 transition hover:bg-[#fafafa]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <Ban size={15} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-xs font-semibold text-[#111318]">
                        {ban.displayName || ban.username}
                      </p>

                      <span
                        className={`hidden shrink-0 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.08em] sm:inline-flex ${
                          ban.active
                            ? "bg-red-50 text-red-600"
                            : "bg-[#f2f3f4] text-[#777b83]"
                        }`}
                      >
                        {ban.active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <p className="mt-1 truncate text-[10px] text-[#969aa1]">
                      {ban.reason}
                    </p>
                  </div>

                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="font-mono text-[9px] font-medium text-[#777b83]">
                      {ban.caseId}
                    </p>

                    <p className="mt-1 text-[9px] text-[#a0a3a9]">
                      {formatRelativeDate(ban.issuedAt)}
                    </p>
                  </div>

                  <ArrowRight
                    size={13}
                    className="shrink-0 text-[#c5c7ca] transition group-hover:translate-x-0.5 group-hover:text-[#555a63]"
                  />
                </Link>
              ))}
            </div>
          )}

          {recentBans.length > 0 && (
            <div className="border-t border-black/[0.06] bg-[#fcfcfc] px-6 py-3">
              <Link
                href="/staff/bans"
                className="flex items-center justify-between text-[10px] font-semibold text-[#777b83] transition hover:text-[#111318]"
              >
                <span>Manage all moderation records</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Quick actions */}
          <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="border-b border-black/[0.06] px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-[#111318]">
                    Quick actions
                  </h2>

                  <p className="mt-1 text-xs text-[#969aa1]">
                    Common staff actions.
                  </p>
                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f5f5f6]">
                  <ArrowRight size={14} className="text-[#777b83]" />
                </div>
              </div>
            </div>

            <div className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-1">
              <QuickAction
                href="/staff/bans/new"
                icon={<Ban size={16} />}
                title="Issue a ban"
                description="Create a new moderation record"
              />

              <QuickAction
                href="/staff/players"
                icon={<Users size={16} />}
                title="Players"
                description="Search player moderation history"
              />

              <QuickAction
                href="/staff/appeals"
                icon={<FileText size={16} />}
                title="Review appeals"
                description={`${pendingAppeals} pending ${
                  pendingAppeals === 1 ? "appeal" : "appeals"
                }`}
              />

              <QuickAction
                href="/staff/rules"
                icon={<FileText size={16} />}
                title="Rules management"
                description="Edit and publish community rules"
              />

              <QuickAction
                href="/staff/bans"
                icon={<Gavel size={16} />}
                title="Manage bans"
                description="View existing moderation records"
              />

              <QuickAction
                href="/staff/audit"
                icon={<Activity size={16} />}
                title="Audit log"
                description="Review staff activity"
              />
            </div>
          </div>

          {/* System */}
          <div className="rounded-2xl border border-black/[0.07] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f5f6] text-[#555a63]">
                <Shield size={17} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-[#111318]">
                  System status
                </h2>

                <p className="mt-1 text-xs text-[#969aa1]">
                  UKRP moderation infrastructure
                </p>
              </div>
            </div>

            <div className="mt-5 divide-y divide-black/[0.055]">
              <SystemRow
                label="Database"
                value="Connected"
                positive
              />

              <SystemRow
                label="Authentication"
                value="Clerk"
                positive
              />

              <SystemRow
                label="Moderation"
                value="Operational"
                positive
              />

              <SystemRow
                label="Roblox integration"
                value={
                  robloxConfigured
                    ? "Configured"
                    : "Not configured"
                }
                positive={robloxConfigured}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  description,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  description: string;
  accent?: "red" | "amber";
}) {
  const iconClass =
    accent === "red"
      ? "bg-red-50 text-red-600"
      : accent === "amber"
        ? "bg-amber-50 text-amber-600"
        : "bg-[#f5f5f6] text-[#686d75]";

  return (
    <div className="group rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition duration-200 hover:-translate-y-[1px] hover:border-black/[0.1] hover:shadow-[0_8px_25px_rgba(0,0,0,0.035)]">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

        <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[#b0b3b8]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Live
        </span>
      </div>

      <p className="mt-6 text-3xl font-semibold tracking-[-0.055em] text-[#111318]">
        {value.toLocaleString("en-GB")}
      </p>

      <p className="mt-1 text-xs font-semibold text-[#555a63]">
        {label}
      </p>

      <p className="mt-1 text-[10px] text-[#a0a3a9]">
        {description}
      </p>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-transparent p-3 transition hover:border-black/[0.06] hover:bg-[#fafafa]"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-black/[0.07] bg-white text-[#686d75] transition group-hover:border-black/[0.11] group-hover:text-[#111318]">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-[#111318]">
          {title}
        </p>

        <p className="mt-0.5 truncate text-[10px] text-[#969aa1]">
          {description}
        </p>
      </div>

      <ArrowRight
        size={13}
        className="shrink-0 text-[#c0c2c6] transition group-hover:translate-x-0.5 group-hover:text-[#555a63]"
      />
    </Link>
  );
}

function SystemRow({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-[11px] text-[#858991]">
        {label}
      </span>

      <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#686d75]">
        {positive ? (
          <CheckCircle2 size={12} className="text-emerald-500" />
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        )}

        {value}
      </span>
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
    <div className="flex min-h-[320px] items-center justify-center px-6">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5f5f6] text-[#969aa1]">
          {icon}
        </div>

        <h3 className="mt-4 text-sm font-semibold text-[#111318]">
          {title}
        </h3>

        <p className="mt-2 max-w-xs text-xs leading-5 text-[#969aa1]">
          {description}
        </p>
      </div>
    </div>
  );
}

function formatRelativeDate(date: Date) {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);

  if (days < 7) return `${days}d ago`;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}