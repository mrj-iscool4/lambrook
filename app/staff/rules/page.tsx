import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Plus,
  Shield,
  SlidersHorizontal,
} from "lucide-react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireManagement } from "@/lib/management";
import RuleManager from "@/components/rule-manager";

export default async function ManagementRulesPage() {
  try {
    await requireManagement();
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "UNAUTHENTICATED"
    ) {
      redirect("/sign-in");
    }

    redirect("/staff/access-denied");
  }

  const [categories, rules, total, published, archived] =
    await Promise.all([
      prisma.ruleCategory.findMany({
        where: {
          active: true,
        },
        orderBy: {
          sortOrder: "asc",
        },
      }),

      prisma.rule.findMany({
        where: {
          archived: false,
        },
        include: {
          category: true,
        },
        orderBy: [
          {
            category: {
              sortOrder: "asc",
            },
          },
          {
            sortOrder: "asc",
          },
        ],
      }),

      prisma.rule.count(),

      prisma.rule.count({
        where: {
          published: true,
          archived: false,
        },
      }),

      prisma.rule.count({
        where: {
          archived: true,
        },
      }),
    ]);

  return (
    <main className="min-h-screen bg-[#f8f9fb]">
      <section className="border-b border-black/[0.06] bg-white">
        <div className="mx-auto max-w-[1200px] px-6 py-8 lg:px-10">
          <Link
            href="/staff"
            className="mb-6 inline-flex items-center gap-2 text-xs font-medium text-[#858991] transition hover:text-[#111318]"
          >
            <ArrowLeft size={14} />
            Staff dashboard
          </Link>

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#969aa1]">
                <Shield size={13} />
                Management
              </div>

              <h1 className="text-3xl font-semibold tracking-[-0.05em] text-[#111318]">
                Rules Management
              </h1>

              <p className="mt-2 text-sm text-[#777b83]">
                Manage the rules displayed on the public website.
              </p>
            </div>

            <Link
              href="/staff/rules/new"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#111318] px-4 text-xs font-semibold text-white transition hover:bg-[#25272d]"
            >
              <Plus size={14} />
              New rule
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-8 lg:px-10">
        <div className="mb-8 grid gap-3 sm:grid-cols-3">
          <Stat
            label="Total rules"
            value={total}
            icon={<FileText size={16} />}
          />

          <Stat
            label="Published"
            value={published}
            icon={<CheckCircle2 size={16} />}
          />

          <Stat
            label="Archived"
            value={archived}
            icon={<SlidersHorizontal size={16} />}
          />
        </div>

        <RuleManager
          initialRules={rules.map((rule) => ({
            id: rule.id,
            ruleNumber: rule.ruleNumber,
            title: rule.title,
            description: rule.description,
            severity: rule.severity,
            published: rule.published,
            archived: rule.archived,
            sortOrder: rule.sortOrder,
            categoryId: rule.categoryId,
            categoryName: rule.category.name,
          }))}
          categories={categories.map((category) => ({
            id: category.id,
            name: category.name,
          }))}
        />
      </section>
    </main>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-black/[0.07] bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#a0a3a9]">
          {label}
        </p>

        <div className="text-[#969aa1]">
          {icon}
        </div>
      </div>

      <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#111318]">
        {value}
      </p>
    </div>
  );
}