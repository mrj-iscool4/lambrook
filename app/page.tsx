import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Ban,
  BookOpen,
  Gamepad2,
  MessageCircle,
  ShieldCheck,
  Users,
} from "lucide-react";
import { siteConfig } from "@/lib/site";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8f9fb]">
      {/* Hero */}
      <section className="bg-white px-3 pt-3 sm:px-4 sm:pt-4">
        <div className="relative mx-auto h-[560px] max-w-[1600px] overflow-hidden rounded-[24px] bg-[#111318] sm:h-[600px] lg:h-[620px]">
          <Image
            src="/images/ukrp-hero.png"
            alt="UKRP police roleplay"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />

          {/* Controlled image overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/5" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />

          {/* Hero content */}
          <div className="relative flex h-full items-end">
            <div className="mx-auto w-full max-w-[1600px] px-6 pb-10 sm:px-10 sm:pb-12 lg:px-14 lg:pb-14">
              <div className="max-w-2xl">
                {/* Status */}
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />

                  <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/75">
                    Servers operational
                  </span>
                </div>

                {/* Heading */}
                <h1 className="text-[clamp(3rem,7vw,6.5rem)] font-semibold leading-[0.9] tracking-[-0.07em] text-white">
                  British roleplay.
                  <br />
                  <span className="text-white/45">Built for Roblox.</span>
                </h1>

                <p className="mt-6 max-w-lg text-sm leading-6 text-white/65 sm:text-base">
                  Experience immersive UK roleplay with a growing community,
                  dedicated staff and realistic gameplay.
                </p>

                {/* Buttons */}
                <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
                  {siteConfig.robloxGameUrl ? (
                    <a
                      href={siteConfig.robloxGameUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-[#111318] transition hover:bg-[#eeeeef]"
                    >
                    <Gamepad2 size={16} />
                    Play on Roblox
                    <ArrowUpRight
                      size={14}
                      className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                    </a>
                  ) : (
                    <span
                      title="Set NEXT_PUBLIC_ROBLOX_GAME_URL to enable this link."
                      className="inline-flex h-11 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-white/50 px-5 text-sm font-semibold text-white/80"
                    >
                      <Gamepad2 size={16} />
                      Play on Roblox
                    </span>
                  )}

                  {siteConfig.discordUrl ? (
                    <a
                      href={siteConfig.discordUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/15"
                    >
                    <MessageCircle size={16} />
                    Join Discord
                    </a>
                  ) : (
                    <span
                      title="Set NEXT_PUBLIC_DISCORD_URL to enable this link."
                      className="inline-flex h-11 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white/50"
                    >
                      <MessageCircle size={16} />
                      Join Discord
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Small bottom information */}
          <div className="absolute bottom-5 right-6 hidden items-center gap-3 sm:flex lg:right-10">
            <div className="rounded-xl border border-white/15 bg-black/25 px-4 py-2.5 backdrop-blur-md">
              <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/35">
                Server
              </p>

              <div className="mt-1 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                <span className="text-xs font-medium text-white/80">
                  Online
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-white/15 bg-black/25 px-4 py-2.5 backdrop-blur-md">
              <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/35">
                Players
              </p>

              <p className="mt-1 text-xs font-semibold text-white/80">—</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-black/[0.06] bg-white">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 lg:grid-cols-4">
          <Stat
            icon={<Users size={16} />}
            label="Players Online"
            value="—"
          />

          <Stat
            icon={<Gamepad2 size={16} />}
            label="Server Status"
            value="Online"
            active
          />

          <Stat
            icon={<MessageCircle size={16} />}
            label="Discord Members"
            value="—"
          />

          <Stat
            icon={<ShieldCheck size={16} />}
            label="Community"
            value="Active"
          />
        </div>
      </section>

      {/* Introduction */}
      <section className="mx-auto max-w-[1400px] px-6 py-24 lg:px-10 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#969aa1]">
              About UKRP
            </p>

            <h2 className="mt-4 max-w-md text-4xl font-semibold leading-[1] tracking-[-0.055em] text-[#111318] sm:text-5xl">
              A community built around roleplay.
            </h2>
          </div>

          <div className="max-w-2xl lg:pt-2">
            <p className="text-base leading-7 text-[#686d75]">
              UKRP is a Roblox roleplay community focused on creating
              enjoyable and immersive British roleplay. From emergency
              services and realistic scenarios to everyday community
              interactions, there's always something happening.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <InfoItem
                icon={<ShieldCheck size={17} />}
                title="Immersive"
                text="Realistic roleplay"
              />

              <InfoItem
                icon={<Users size={17} />}
                title="Community"
                text="Player driven"
              />

              <InfoItem
                icon={<Gamepad2 size={17} />}
                title="Roblox"
                text="Built to play"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Explore */}
      <section className="border-y border-black/[0.06] bg-white">
        <div className="mx-auto max-w-[1400px] px-6 py-24 lg:px-10 lg:py-28">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#969aa1]">
              Explore UKRP
            </p>

            <div className="mt-4 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <h2 className="text-4xl font-semibold tracking-[-0.055em] text-[#111318]">
                Everything you need.
              </h2>

              <p className="max-w-md text-sm leading-6 text-[#777b83]">
                Find community information, moderation records and support
                whenever you need it.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <ExploreCard
              icon={<Ban size={20} />}
              label="Transparency"
              title="Ban Database"
              description="View public moderation records across the UKRP community."
              href="/bans"
            />

            <ExploreCard
              icon={<BookOpen size={20} />}
              label="Information"
              title="Community Rules"
              description="Understand the rules and standards expected across UKRP."
              href="/rules"
            />

            <ExploreCard
              icon={<ShieldCheck size={20} />}
              label="Support"
              title="Appeals"
              description="Request a review of a moderation action through our appeals system."
              href="/appeals"
            />
          </div>
        </div>
      </section>

      {/* Discord */}
      <section className="bg-[#f8f9fb]">
        <div className="mx-auto max-w-[1400px] px-6 py-20 lg:px-10 lg:py-24">
          <div className="flex flex-col justify-between gap-8 rounded-[24px] bg-[#111318] px-7 py-10 sm:px-10 lg:flex-row lg:items-center lg:px-12 lg:py-12">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-white/35">
                Join the community
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
                Get involved with UKRP.
              </h2>

              <p className="mt-3 max-w-lg text-sm leading-6 text-white/50">
                Join our Discord to meet other players, keep up with
                announcements and see what's happening across the community.
              </p>
            </div>

            {siteConfig.discordUrl ? (
              <a
                href={siteConfig.discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-[#111318] transition hover:bg-[#eeeeef]"
              >
                Join Discord
                <ArrowUpRight size={15} />
              </a>
            ) : (
              <span
                title="Set NEXT_PUBLIC_DISCORD_URL to enable this link."
                className="inline-flex h-11 shrink-0 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-white/20 px-5 text-sm font-semibold text-white/60"
              >
                Join Discord
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/[0.06] bg-white">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-7 px-6 py-9 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <div>
            <p className="text-sm font-semibold tracking-[-0.02em] text-[#111318]">
              UKRP
            </p>

            <p className="mt-1 text-xs text-[#969aa1]">
              A Roblox roleplay community.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <Link
              href="/rules"
              className="text-xs font-medium text-[#777b83] transition hover:text-[#111318]"
            >
              Rules
            </Link>

            <Link
              href="/appeals"
              className="text-xs font-medium text-[#777b83] transition hover:text-[#111318]"
            >
              Appeals
            </Link>

            <Link
              href="/bans"
              className="text-xs font-medium text-[#777b83] transition hover:text-[#111318]"
            >
              Ban Database
            </Link>

            <Link
              href="/staff"
              className="text-xs font-medium text-[#777b83] transition hover:text-[#111318]"
            >
              Staff Portal
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Stat({
  icon,
  label,
  value,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  active?: boolean;
}) {
  return (
    <div className="border-r border-black/[0.06] px-6 py-7 last:border-r-0 lg:px-8">
      <div className="flex items-center gap-2 text-[#9b9ea5]">
        {icon}

        <span className="text-[9px] font-bold uppercase tracking-[0.14em]">
          {label}
        </span>
      </div>

      <div className="mt-2.5 flex items-center gap-2">
        {active && (
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        )}

        <span className="text-lg font-semibold tracking-[-0.03em] text-[#111318]">
          {value}
        </span>
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-black/[0.07] bg-white p-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f2f3f4] text-[#111318]">
        {icon}
      </div>

      <p className="mt-4 text-xs font-semibold text-[#111318]">{title}</p>

      <p className="mt-1 text-[10px] text-[#969aa1]">{text}</p>
    </div>
  );
}

function ExploreCard({
  icon,
  label,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-black/[0.07] bg-[#f9f9fa] p-7 transition duration-300 hover:-translate-y-1 hover:border-black/[0.12] hover:bg-white hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)]"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#111318] shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition group-hover:bg-[#111318] group-hover:text-white">
        {icon}
      </div>

      <p className="mt-8 text-[9px] font-bold uppercase tracking-[0.15em] text-[#969aa1]">
        {label}
      </p>

      <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#111318]">
        {title}
      </h3>

      <p className="mt-3 max-w-sm text-sm leading-6 text-[#777b83]">
        {description}
      </p>

      <div className="absolute bottom-7 right-7 flex h-8 w-8 items-center justify-center rounded-full border border-black/[0.07] text-[#777b83] transition group-hover:bg-[#111318] group-hover:text-white">
        <ArrowUpRight size={14} />
      </div>
    </Link>
  );
}