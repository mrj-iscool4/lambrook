import Link from "next/link";
import {
  ArrowRight,
  Search,
  Shield,
  Users,
} from "lucide-react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStaffAuth } from "@/lib/auth";
import RobloxAvatar from "@/components/roblox-avatar";

type SearchParams = Promise<{
  q?: string;
}>;

export default async function StaffPlayersPage({
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

  const players = await prisma.ban.findMany({
    where: query
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
          ],
        }
      : undefined,
    orderBy: {
      updatedAt: "desc",
    },
    distinct: ["robloxUserId"],
    take: 50,
    select: {
      robloxUserId: true,
      username: true,
      displayName: true,
      active: true,
      updatedAt: true,
    },
  });

  const totalPlayers = await prisma.ban.findMany({
    distinct: ["robloxUserId"],
    select: {
      robloxUserId: true,
    },
  });

  return (
    <main className="min-h-screen bg-[#f8f9fb]">
      <section className="border-b border-black/[0.06] bg-white">
        <div className="mx-auto max-w-[1200px] px-6 py-8 lg:px-10">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#969aa1]">
                <Users size={13} />
                Moderation
              </div>

              <h1 className="text-3xl font-semibold tracking-[-0.05em] text-[#111318]">
                Players
              </h1>

              <p className="mt-2 text-sm text-[#777b83]">
                Search players and review their moderation history.
              </p>
            </div>

            <Link
              href="/staff"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-black/[0.08] px-3.5 text-xs font-semibold text-[#555a63] transition hover:bg-[#f7f7f8]"
            >
              Staff Dashboard
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-8 lg:px-10 lg:py-10">
        <div className="mb-6 rounded-2xl border border-black/[0.07] bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f3f4f5] text-[#686d75]">
              <Users size={16} />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#a0a3a9]">
                Known players
              </p>

              <p className="mt-0.5 text-lg font-semibold text-[#111318]">
                {totalPlayers.length}
              </p>
            </div>
          </div>
        </div>

        <form
          method="GET"
          className="mb-4 rounded-2xl border border-black/[0.07] bg-white p-4"
        >
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#969aa1]"
            />

            <input
              name="q"
              defaultValue={query}
              placeholder="Search username, display name or Roblox ID..."
              className="h-11 w-full rounded-xl border border-black/[0.08] bg-white pl-10 pr-4 text-sm text-[#111318] outline-none placeholder:text-[#a0a3a9] focus:border-black/[0.18]"
            />
          </div>
        </form>

        {players.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-black/[0.07] bg-white text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#f3f4f5] text-[#969aa1]">
              <Users size={20} />
            </div>

            <h2 className="text-sm font-semibold text-[#111318]">
              No players found
            </h2>

            <p className="mt-2 text-xs text-[#858991]">
              Try another username or Roblox User ID.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white">
            <div className="divide-y divide-black/[0.05]">
              {players.map((player) => (
                <Link
                  key={player.robloxUserId}
                  href={`/staff/players/${player.robloxUserId}`}
                  className="group flex items-center gap-4 px-5 py-4 transition hover:bg-[#fafafa]"
                >
                  <RobloxAvatar
                    userId={player.robloxUserId}
                    size={46}
                    className="rounded-xl"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-[#111318]">
                        {player.displayName || player.username}
                      </p>

                      {player.active && (
                        <span className="rounded-full bg-red-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-red-600">
                          Banned
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-[#858991]">
                      @{player.username}
                    </p>

                    <p className="mt-1 text-[10px] text-[#a0a3a9]">
                      Roblox ID: {player.robloxUserId}
                    </p>
                  </div>

                  <ArrowRight
                    size={15}
                    className="shrink-0 text-[#b0b2b6] transition group-hover:translate-x-0.5 group-hover:text-[#111318]"
                  />
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}