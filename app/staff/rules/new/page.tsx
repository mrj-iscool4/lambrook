import Link from "next/link";
import { ArrowLeft, Plus, Shield } from "lucide-react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireManagement } from "@/lib/management";
import NewRuleForm from "@/components/new-rule-form";

export default async function NewRulePage() {
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

  const categories = await prisma.ruleCategory.findMany({
    where: {
      active: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
  });

  return (
    <main className="min-h-screen bg-[#f8f9fb]">
      <section className="border-b border-black/[0.06] bg-white">
        <div className="mx-auto max-w-[900px] px-6 py-8 lg:px-10">
          <Link
            href="/staff/rules"
            className="mb-6 inline-flex items-center gap-2 text-xs font-medium text-[#858991] transition hover:text-[#111318]"
          >
            <ArrowLeft size={14} />
            Rules management
          </Link>

          <div>
            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#969aa1]">
              <Shield size={13} />
              Management
            </div>

            <h1 className="text-3xl font-semibold tracking-[-0.05em] text-[#111318]">
              Create Rule
            </h1>

            <p className="mt-2 text-sm text-[#777b83]">
              Add a new rule to the UKRP ruleset.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[900px] px-6 py-8 lg:px-10">
        <NewRuleForm
          categories={categories.map((category) => ({
            id: category.id,
            name: category.name,
          }))}
        />
      </section>
    </main>
  );
}