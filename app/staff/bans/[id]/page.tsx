
import Link from "next/link";
import BanActions from "@/components/ban-actions";
import RobloxAvatar from "@/components/roblox-avatar";
import {
  ArrowLeft,
  Ban,
  CalendarDays,
  ExternalLink,
  FileText,
  Shield,
  User,
} from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function StaffBanPage({ params }: PageProps) {
  const { id } = await params;

  const ban = await prisma.ban.findUnique({
    where: {
      id,
    },
  });

  if (!ban) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f8f9fb]">
      {/* Header */}
      <section className="border-b border-black/[0.06] bg-white">
        <div className="mx-auto max-w-[1100px] px-6 py-8 lg:px-10">
          <Link
            href="/staff/bans"
            className="mb-6 inline-flex items-center gap-2 text-xs font-medium text-[#858991] transition hover:text-[#111318]"
          >
            <ArrowLeft size={14} />
            Back to ban database
          </Link>

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#969aa1]">
                <Shield size={13} />
                Moderation Record
              </div>

              <h1 className="text-3xl font-semibold tracking-[-0.05em] text-[#111318]">
                {ban.displayName || ban.username}
              </h1>

              <p className="mt-2 text-sm text-[#777b83]">
                Case {ban.caseId}
              </p>
            </div>

            <span
              className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                ban.active
                  ? "bg-red-50 text-red-600"
                  : "bg-[#f3f4f5] text-[#777b83]"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  ban.active ? "bg-red-500" : "bg-[#a0a3a9]"
                }`}
              />

              {ban.active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-[1100px] px-6 py-8 lg:px-10 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Main record */}
          <div className="space-y-6">
            {/* Player */}
            {/* Player */}
<Card
  icon={<User size={17} />}
  title="Player information"
  description="Roblox account associated with this moderation record."
>
  <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
    {/* Roblox avatar */}
    <RobloxAvatar
      userId={ban.robloxUserId}
      size={96}
      className="rounded-2xl"
    />

    {/* Player identity */}
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#111318]">
          {ban.displayName || ban.username}
        </h2>

        {ban.displayName &&
          ban.displayName !== ban.username && (
            <span className="text-sm text-[#969aa1]">
              @{ban.username}
            </span>
          )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-xs text-[#858991]">
          Roblox User ID
        </span>

        <span className="font-mono text-xs font-medium text-[#555a63]">
          {ban.robloxUserId}
        </span>
      </div>

      <a
        href={`https://www.roblox.com/users/${ban.robloxUserId}/profile`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#555a63] transition hover:text-[#111318]"
      >
        View Roblox profile
        <ExternalLink size={12} />
      </a>
    </div>
  </div>
</Card>

            {/* Moderation */}
            <Card
              icon={<Ban size={17} />}
              title="Moderation details"
              description="Information about the action taken against this player."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Info label="Reason" value={ban.reason} />

                <Info label="Duration" value={ban.duration} />

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

            {/* Notes */}
            <Card
              icon={<FileText size={17} />}
              title="Case notes"
              description="Internal notes attached to this moderation record."
            >
              <div className="rounded-xl bg-[#fafafa] p-4">
                <p className="whitespace-pre-wrap text-sm leading-6 text-[#555a63]">
                  {ban.notes || "No notes were provided for this case."}
                </p>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Case information */}
            <Card
              icon={<Shield size={17} />}
              title="Case information"
              description="Record metadata."
            >
              <div className="space-y-4">
                <Info label="Case ID" value={ban.caseId} />

                <Info
                  label="Issued by"
                  value={ban.issuedBy}
                />

                <Info
                  label="Created"
                  value={formatDateTime(ban.createdAt)}
                />

                <Info
                  label="Last updated"
                  value={formatDateTime(ban.updatedAt)}
                />
              </div>
            </Card>

            {/* Actions */}
<div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white">
  <div className="border-b border-black/[0.06] px-5 py-4">
    <p className="text-sm font-semibold text-[#111318]">
      Actions
    </p>

    <p className="mt-1 text-xs text-[#969aa1]">
      Manage this moderation record.
    </p>
  </div>

  <div className="p-3">
    <BanActions
      ban={{
        id: ban.id,
        reason: ban.reason,
        duration: ban.duration,
        expiresAt: ban.expiresAt,
        notes: ban.notes,
        active: ban.active,
      }}
    />
  </div>
</div>

            {/* Created */}
            <div className="flex items-start gap-3 rounded-xl border border-black/[0.06] bg-white p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f3f4f5] text-[#858991]">
                <CalendarDays size={15} />
              </div>

              <div>
                <p className="text-xs font-semibold text-[#555a63]">
                  Record created
                </p>

                <p className="mt-1 text-[11px] text-[#969aa1]">
                  {formatDateTime(ban.createdAt)}
                </p>
              </div>
            </div>
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
