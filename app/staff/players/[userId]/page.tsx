import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Ban,
  CalendarDays,
  ExternalLink,
  FileText,
  Shield,
  User,
} from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStaffAuth } from "@/lib/auth";
import RobloxAvatar from "@/components/roblox-avatar";

type PageProps = {
  params: Promise<{
    userId: string;
  }>;
};

export default async function StaffPlayerPage({
  params,
}: PageProps) {
  const staff = await getStaffAuth();

  if (!staff.authenticated) {
    redirect("/sign-in");
  }

  if (!staff.authorized) {
    redirect("/staff/access-denied");
  }

  const { userId } = await params;

  const [bans, appeals] = await Promise.all([
    prisma.ban.findMany({
      where: {
        robloxUserId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.appeal.findMany({
      where: {
        robloxUserId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  if (bans.length === 0 && appeals.length === 0) {
    notFound();
  }

  const player = bans[0] ?? {
    username: appeals[0].username,
    displayName: null,
    robloxUserId: userId,
  };

  const activeBan = bans.find((ban) => ban.active);

  return (
    <main className="min-h-screen bg-[#f8f9fb]">
      <section className="border-b border-black/[0.06] bg-white">
        <div className="mx-auto max-w-[1200px] px-6 py-8 lg:px-10">
          <Link
            href="/staff/players"
            className="mb-6 inline-flex items-center gap-2 text-xs font-medium text-[#858991] transition hover:text-[#111318]"
          >
            <ArrowLeft size={14} />
            Back to players
          </Link>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <RobloxAvatar
              userId={userId}
              size={80}
              className="rounded-2xl"
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-semibold tracking-[-0.05em] text-[#111318]">
                  {player.displayName || player.username}
                </h1>

                {activeBan && (
                  <span className="rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-red-600">
                    Active Ban
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm text-[#777b83]">
                @{player.username}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-[#a0a3a9]">
                <span>Roblox ID: {userId}</span>

                <a
                  href={`https://www.roblox.com/users/${userId}/profile`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-[#777b83] hover:text-[#111318]"
                >
                  Roblox Profile
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-8 lg:px-10 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-3">
          <Summary
            icon={<Ban size={16} />}
            label="Ban records"
            value={bans.length}
          />

          <Summary
            icon={<FileText size={16} />}
            label="Appeals"
            value={appeals.length}
          />

          <Summary
            icon={<Shield size={16} />}
            label="Current status"
            value={activeBan ? "Banned" : "Clear"}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white">
            <div className="border-b border-black/[0.06] px-5 py-4">
              <div className="flex items-center gap-2">
                <Ban size={15} className="text-[#686d75]" />
                <h2 className="text-sm font-semibold text-[#111318]">
                  Moderation history
                </h2>
              </div>
            </div>

            {bans.length === 0 ? (
              <Empty text="No ban records." />
            ) : (
              <div className="divide-y divide-black/[0.05]">
                {bans.map((ban) => (
                  <Link
                    key={ban.id}
                    href={`/staff/bans/${ban.id}`}
                    className="group flex items-center gap-4 px-5 py-4 hover:bg-[#fafafa]"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f3f4f5] text-[#686d75]">
                      <Ban size={15} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-semibold text-[#111318]">
                          {ban.reason}
                        </p>

                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                            ban.active
                              ? "bg-red-50 text-red-600"
                              : "bg-[#f3f4f5] text-[#858991]"
                          }`}
                        >
                          {ban.active ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <p className="mt-1 text-[10px] text-[#a0a3a9]">
                        Case {ban.caseId} · {ban.duration}
                      </p>
                    </div>

                    <ArrowRight
                      size={13}
                      className="text-[#b0b2b6] group-hover:text-[#111318]"
                    />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white">
            <div className="border-b border-black/[0.06] px-5 py-4">
              <div className="flex items-center gap-2">
                <FileText size={15} className="text-[#686d75]" />
                <h2 className="text-sm font-semibold text-[#111318]">
                  Appeal history
                </h2>
              </div>
            </div>

            {appeals.length === 0 ? (
              <Empty text="No appeals." />
            ) : (
              <div className="divide-y divide-black/[0.05]">
                {appeals.map((appeal) => (
                  <Link
                    key={appeal.id}
                    href={`/staff/appeals/${appeal.id}`}
                    className="group block px-5 py-4 hover:bg-[#fafafa]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-[#111318]">
                        Case {appeal.caseId}
                      </p>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                          appeal.status === "Pending"
                            ? "bg-amber-50 text-amber-700"
                            : appeal.status === "Approved"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                        }`}
                      >
                        {appeal.status}
                      </span>
                    </div>

                    <p className="mt-1 text-[10px] text-[#858991]">
                      {appeal.reason}
                    </p>

                    <p className="mt-2 text-[10px] text-[#a0a3a9]">
                      {formatDate(appeal.createdAt)}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-black/[0.06] bg-white p-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f3f4f5] text-[#858991]">
            <User size={15} />
          </div>

          <div>
            <p className="text-xs font-semibold text-[#555a63]">
              Player record
            </p>

            <p className="mt-1 text-[11px] text-[#969aa1]">
              This profile combines moderation and appeal records
              associated with this Roblox User ID.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function Summary({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
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

function Empty({ text }: { text: string }) {
  return (
    <div className="px-5 py-12 text-center text-xs text-[#969aa1]">
      {text}
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