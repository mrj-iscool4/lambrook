import type { Metadata } from "next";
import {
  AlertTriangle,
  BookOpen,
  ChevronDown,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Community Rules",
  description: "Read the current UKRP community rules and standards.",
};

export const dynamic = "force-dynamic";

export default async function RulesPage() {
  const categories = await prisma.ruleCategory.findMany({
    where: {
      active: true,
    },
    include: {
      rules: {
        where: {
          published: true,
          archived: false,
        },
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
    orderBy: {
      sortOrder: "asc",
    },
  });

  const visibleCategories = categories.filter(
    (category) => category.rules.length > 0
  );

  const totalRules = visibleCategories.reduce(
    (total, category) => total + category.rules.length,
    0
  );

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#f7f8fa]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-black/[0.06] bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(0,0,0,0.035),transparent_32%)]" />

        <div className="relative mx-auto max-w-[1200px] px-6 py-14 lg:px-10 lg:py-20">
          <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/[0.07] bg-[#fafafa] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#777b83]">
                <ShieldCheck size={13} />
                UKRP community standards
              </div>

              <h1 className="text-4xl font-semibold tracking-[-0.055em] text-[#111318] sm:text-5xl lg:text-[52px] lg:leading-[1.05]">
                Community Rules
              </h1>

              <p className="mt-5 max-w-xl text-[14px] leading-7 text-[#777b83]">
                The rules and standards that help keep UKRP fair,
                realistic and enjoyable for everyone.
              </p>
            </div>

            {/* Stats */}
            <div className="flex shrink-0 gap-3">
              <RuleStat
                icon={<BookOpen size={16} />}
                label="Categories"
                value={visibleCategories.length}
              />

              <RuleStat
                icon={<FileText size={16} />}
                label="Rules"
                value={totalRules}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Rules */}
      <section className="mx-auto max-w-[1000px] px-6 py-10 lg:px-10 lg:py-14">
        {visibleCategories.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-black/[0.07] bg-white px-6 text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-black/[0.07] bg-[#fafafa]">
              <BookOpen size={21} className="text-[#969aa1]" />
            </div>

            <h2 className="text-sm font-semibold text-[#111318]">
              No rules published
            </h2>

            <p className="mt-2 max-w-sm text-xs leading-5 text-[#858991]">
              There are currently no published community rules.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {visibleCategories.map((category, categoryIndex) => (
              <section key={category.id}>
                {/* Category heading */}
                <div className="mb-4 flex items-end justify-between gap-4 px-1">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#a0a3a9]">
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-md bg-[#111318] px-1.5 text-[8px] text-white">
                        {String(categoryIndex + 1).padStart(2, "0")}
                      </span>

                      Section
                    </div>

                    <h2 className="text-xl font-semibold tracking-[-0.035em] text-[#111318]">
                      {category.name}
                    </h2>

                    {category.description && (
                      <p className="mt-1.5 max-w-2xl text-xs leading-5 text-[#858991]">
                        {category.description}
                      </p>
                    )}
                  </div>

                  <span className="hidden shrink-0 rounded-full border border-black/[0.07] bg-white px-3 py-1.5 text-[10px] font-medium text-[#858991] sm:block">
                    {category.rules.length}{" "}
                    {category.rules.length === 1 ? "rule" : "rules"}
                  </span>
                </div>

                {/* Rule list */}
                <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                  {category.rules.map((rule, index) => (
                    <article
                      key={rule.id}
                      className={`group p-5 sm:p-6 ${
                        index !== category.rules.length - 1
                          ? "border-b border-black/[0.06]"
                          : ""
                      }`}
                    >
                      <div className="flex gap-4 sm:gap-5">
                        {/* Rule number */}
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-black/[0.07] bg-[#fafafa] font-mono text-[10px] font-semibold text-[#777b83] transition-colors group-hover:border-black/[0.12] group-hover:bg-white group-hover:text-[#111318]">
                          {rule.ruleNumber}
                        </div>

                        <div className="min-w-0 flex-1">
                          {/* Title row */}
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <h3 className="text-[14px] font-semibold tracking-[-0.015em] text-[#111318]">
                              {rule.title}
                            </h3>

                            <SeverityBadge severity={rule.severity} />
                          </div>

                          {/* Description */}
                          <p className="mt-2.5 max-w-3xl text-[12px] leading-6 text-[#777b83]">
                            {rule.description}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Footer notice */}
        {visibleCategories.length > 0 && (
          <div className="mt-12 flex gap-4 rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] sm:p-6">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fafafa]">
              <AlertTriangle size={16} className="text-[#777b83]" />
            </div>

            <div>
              <h3 className="text-xs font-semibold text-[#111318]">
                Please read before playing
              </h3>

              <p className="mt-1.5 text-[11px] leading-5 text-[#858991]">
                By participating in the UKRP community, you are expected
                to understand and follow these rules. Ignorance of the
                rules does not exempt you from moderation action.
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function RuleStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex min-w-[110px] items-center gap-3 rounded-2xl border border-black/[0.07] bg-[#fafafa] px-4 py-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        {icon}
      </div>

      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#a0a3a9]">
          {label}
        </p>

        <p className="mt-0.5 text-lg font-semibold tracking-[-0.03em] text-[#111318]">
          {value}
        </p>
      </div>
    </div>
  );
}

function SeverityBadge({
  severity,
}: {
  severity: string;
}) {
  const normalized = severity.toLowerCase();

  let classes =
    "border-black/[0.07] bg-[#fafafa] text-[#777b83]";

  if (
    normalized === "serious" ||
    normalized === "high" ||
    normalized === "severe"
  ) {
    classes = "border-red-100 bg-red-50 text-red-600";
  }

  if (
    normalized === "critical" ||
    normalized === "major"
  ) {
    classes = "border-orange-100 bg-orange-50 text-orange-600";
  }

  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] ${classes}`}
    >
      {severity}
    </span>
  );
}