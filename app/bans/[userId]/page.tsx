import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Ban,
  CalendarDays,
  Clock3,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { syncExpiredBans } from "@/lib/expired-bans";
import RobloxAvatar from "@/components/roblox-avatar";

type PageProps = {
  params: Promise<{
    userId: string;
  }>;
};

export default async function PublicBanPage({
  params,
}: PageProps) {
  const { userId } = await params;

  await syncExpiredBans();

  const ban = await prisma.ban.findFirst({
    where: {
      robloxUserId: userId,
      active: true,
    },
    orderBy: {
      issuedAt: "desc",
    },
  });

  if (!ban) {
    notFound();
  }

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#f8f9fb]">
      {/* Header */}
      <section className="border-b border-black/[0.06] bg-white">
        <div className="mx-auto max-w-[1000px] px-6 py-8 lg:px-10">
          <Link
            href="/bans"
            className="inline-flex items-center gap-2 text-xs font-medium text-[#858991] transition hover:text-[#111318]"
          >
            <ArrowLeft size={14} />
            Back to ban database
          </Link>
        </div>
      </section>

      {/* Player header */}
      <section className="border-b border-black/[0.06] bg-white">
        <div className="mx-auto max-w-[1000px] px-6 pb-10 lg:px-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <RobloxAvatar
                userId={ban.robloxUserId}
                size={88}
                className="rounded-2xl"
              />

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-[-0.04em] text-[#111318] sm:text-3xl">
                    {ban.displayName || ban.username}
                  </h1>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-semibold text-red-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    Active
                  </span>
                </div>

                <p className="mt-1.5 text-sm text-[#858991]">
                  @{ban.username}
                </p>

                <p className="mt-2 font-mono text-[11px] text-[#a0a3a9]">
                  Roblox ID: {ban.robloxUserId}
                </p>
              </div>
            </div>

            <a
              href={`https://www.roblox.com/users/${ban.robloxUserId}/profile`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 w-fit items-center gap-2 rounded-lg border border-black/[0.08] px-3.5 text-xs font-semibold text-[#555a63] transition hover:bg-[#f7f7f8] hover:text-[#111318]"
            >
              Roblox Profile
              <ArrowUpRight size={13} />
            </a>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-[1000px] px-6 py-8 lg:px-10 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Main */}
          <div className="space-y-6">
            <Card
              icon={<Ban size={17} />}
              title="Ban details"
              description="Public information about this moderation action."
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <Info
                  label="Reason"
                  value={ban.reason}
                />

                <Info
                  label="Duration"
                  value={ban.duration}
                />

                <Info
                  label="Issued"
                  value={formatDateTime(ban.issuedAt)}
                />

                <Info
                  label="Expires"
                  value={
                    ban.expiresAt
                      ? formatDateTime(ban.expiresAt)
                      : "Never"
                  }
                />
              </div>
            </Card>

            <Card
              icon={<FileText size={17} />}
              title="Case"
              description="Reference information for this moderation record."
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <Info
                  label="Case ID"
                  value={ban.caseId}
                />

                <Info
                  label="Status"
                  value="Active"
                />
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-black/[0.07] bg-white p-5">
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-[#f3f4f5] text-[#686d75]">
                <ShieldCheck size={17} />
              </div>

              <h2 className="text-sm font-semibold text-[#111318]">
                Ban status
              </h2>

              <p className="mt-1 text-xs leading-5 text-[#858991]">
                This player currently has an active moderation
                restriction applied to their UKRP account.
              </p>

              {ban.expiresAt && (
                <div className="mt-5 flex items-center gap-3 rounded-xl bg-[#fafafa] p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#858991]">
                    <Clock3 size={14} />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#a0a3a9]">
                      Expires
                    </p>

                    <p className="mt-0.5 text-xs font-medium text-[#555a63]">
                      {formatDateTime(ban.expiresAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-black/[0.07] bg-white p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f3f4f5] text-[#686d75]">
                  <CalendarDays size={16} />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-[#111318]">
                    Issued
                  </h2>

                  <p className="mt-1 text-xs text-[#858991]">
                    {formatDateTime(ban.issuedAt)}
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/appeals"
              className="group flex items-center justify-between rounded-2xl border border-black/[0.07] bg-white p-5 transition hover:border-black/[0.12] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
            >
              <div>
                <h2 className="text-sm font-semibold text-[#111318]">
                  Believe this ban is incorrect?
                </h2>

                <p className="mt-1 text-xs text-[#858991]">
                  Submit an appeal for the moderation team to review.
                </p>
              </div>

              <ArrowUpRight
                size={16}
                className="shrink-0 text-[#969aa1] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#111318]"
              />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Card({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white">
      <div className="flex items-start gap-3 border-b border-black/[0.06] px-6 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f3f4f5] text-[#686d75]">
          {icon}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-[#111318]">
            {title}
          </h2>

          <p className="mt-1 text-xs text-[#969aa1]">
            {description}
          </p>
        </div>
      </div>

      <div className="p-6">{children}</div>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#a0a3a9]">
        {label}
      </p>

      <p className="mt-1.5 break-words text-sm font-medium text-[#555a63]">
        {value}
      </p>
    </div>
  );
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