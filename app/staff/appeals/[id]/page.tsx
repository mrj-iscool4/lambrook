import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  Ban,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  ShieldQuestion,
  User,
  XCircle,
} from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStaffAuth } from "@/lib/auth";
import AppealActions from "@/components/appeal-actions";
import RobloxAvatar from "@/components/roblox-avatar";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function StaffAppealPage({
  params,
}: PageProps) {
  const staff = await getStaffAuth();

  if (!staff.authenticated) {
    redirect("/sign-in");
  }

  if (!staff.authorized) {
    redirect("/staff/access-denied");
  }

  const { id } = await params;

  const appeal = await prisma.appeal.findUnique({
    where: { id },
  });

  if (!appeal) {
    notFound();
  }

  const ban = await prisma.ban.findFirst({
    where: {
      caseId: appeal.caseId,
    },
  });

  return (
    <main className="min-h-screen bg-[#f8f9fb]">
      <section className="border-b border-black/[0.06] bg-white">
        <div className="mx-auto max-w-[1100px] px-6 py-8 lg:px-10">
          <Link
            href="/staff/appeals"
            className="mb-6 inline-flex items-center gap-2 text-xs font-medium text-[#858991] transition hover:text-[#111318]"
          >
            <ArrowLeft size={14} />
            Back to appeals
          </Link>

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#969aa1]">
                <ShieldQuestion size={13} />
                Appeal review
              </div>

              <h1 className="text-3xl font-semibold tracking-[-0.05em] text-[#111318]">
                Appeal
              </h1>

              <p className="mt-2 font-mono text-xs text-[#777b83]">
                {appeal.id}
              </p>
            </div>

            <StatusBadge status={appeal.status} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-6 py-8 lg:px-10 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6">
            {/* Player */}
            <Card
              icon={<User size={17} />}
              title="Player"
              description="Player information associated with this appeal."
            >
              <div className="flex items-center gap-4">
                <RobloxAvatar
                  userId={appeal.robloxUserId}
                  size={64}
                  className="rounded-xl"
                />

                <div>
                  <p className="text-base font-semibold text-[#111318]">
                    @{appeal.username}
                  </p>

                  <p className="mt-1 font-mono text-[11px] text-[#858991]">
                    {appeal.robloxUserId}
                  </p>

                  <a
                    href={`https://www.roblox.com/users/${appeal.robloxUserId}/profile`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-[#777b83] hover:text-[#111318]"
                  >
                    Roblox Profile
                    <ArrowUpRight size={11} />
                  </a>
                </div>
              </div>
            </Card>

            {/* Appeal */}
            <Card
              icon={<FileText size={17} />}
              title="Appeal statement"
              description="The information submitted by the player."
            >
              <div className="space-y-5">
                <Info
                  label="Reason"
                  value={appeal.reason}
                />

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#a0a3a9]">
                    Statement
                  </p>

                  <div className="mt-2 rounded-xl bg-[#fafafa] p-4">
                    <p className="whitespace-pre-wrap text-sm leading-7 text-[#555a63]">
                      {appeal.statement}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Response */}
            {appeal.response && (
              <Card
                icon={<CheckCircle2 size={17} />}
                title="Staff response"
                description="Response recorded against this appeal."
              >
                <p className="whitespace-pre-wrap text-sm leading-6 text-[#555a63]">
                  {appeal.response}
                </p>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {/* Case */}
            <Card
              icon={<Ban size={17} />}
              title="Moderation record"
              description="The ban associated with this appeal."
            >
              {ban ? (
                <div className="space-y-4">
                  <Info
                    label="Case ID"
                    value={ban.caseId}
                  />

                  <Info
                    label="Reason"
                    value={ban.reason}
                  />

                  <Info
                    label="Duration"
                    value={ban.duration}
                  />

                  <Info
                    label="Status"
                    value={ban.active ? "Active" : "Inactive"}
                  />

                  <Link
                    href={`/staff/bans/${ban.id}`}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#555a63] transition hover:text-[#111318]"
                  >
                    View moderation record
                    <ArrowUpRight size={13} />
                  </Link>
                </div>
              ) : (
                <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4">
                  <AlertCircle
                    size={16}
                    className="mt-0.5 shrink-0 text-amber-600"
                  />

                  <p className="text-xs leading-5 text-amber-700">
                    The original moderation record could not be
                    found.
                  </p>
                </div>
              )}
            </Card>

            {/* Contact */}
            <Card
              icon={<User size={17} />}
              title="Contact"
              description="Contact information provided by the player."
            >
              <Info
                label="Email"
                value={appeal.email}
              />
            </Card>

            {/* Metadata */}
            <Card
              icon={<CalendarDays size={17} />}
              title="Metadata"
              description="Appeal submission information."
            >
              <div className="space-y-4">
                <Info
                  label="Submitted"
                  value={formatDateTime(appeal.createdAt)}
                />

                <Info
                  label="Last updated"
                  value={formatDateTime(appeal.updatedAt)}
                />

                {appeal.reviewedBy && (
                  <Info
                    label="Reviewed by"
                    value={appeal.reviewedBy}
                  />
                )}

                {appeal.reviewedAt && (
                  <Info
                    label="Reviewed at"
                    value={formatDateTime(appeal.reviewedAt)}
                  />
                )}
              </div>
            </Card>

            {/* Actions */}
            {appeal.status === "Pending" && (
              <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white">
                <div className="border-b border-black/[0.06] px-5 py-4">
                  <p className="text-sm font-semibold text-[#111318]">
                    Review appeal
                  </p>

                  <p className="mt-1 text-xs text-[#969aa1]">
                    Decide whether this moderation action should
                    be overturned.
                  </p>
                </div>

                <div className="p-4">
                  <AppealActions
                    appealId={appeal.id}
                    banId={ban?.id ?? null}
                  />
                </div>
              </div>
            )}
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

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "Pending"
      ? "bg-amber-50 text-amber-700"
      : status === "Approved"
        ? "bg-emerald-50 text-emerald-700"
        : "bg-red-50 text-red-700";

  return (
    <span
      className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-semibold ${styles}`}
    >
      {status === "Pending" ? (
        <Clock3 size={12} />
      ) : status === "Approved" ? (
        <CheckCircle2 size={12} />
      ) : (
        <XCircle size={12} />
      )}

      {status}
    </span>
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