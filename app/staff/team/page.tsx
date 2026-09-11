import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Users,
} from "lucide-react";
import { redirect } from "next/navigation";
import { getStaffAuth } from "@/lib/auth";

const roles = [
  {
    key: "org:moderator",
    name: "Moderator",
    description: "Handles day-to-day moderation and player reports.",
  },
  {
    key: "org:senior_moderator",
    name: "Senior Moderator",
    description: "Supervises moderation activity and complex cases.",
  },
  {
    key: "org:adminsitrator",
    name: "Administrator",
    description: "Responsible for wider administrative operations.",
  },
  {
    key: "org:management",
    name: "Management",
    description: "Highest staff level with overall platform oversight.",
  },
];

export default async function StaffTeamPage() {
  const staff = await getStaffAuth();

  if (!staff.authenticated) {
    redirect("/sign-in");
  }

  if (!staff.authorized) {
    redirect("/staff/access-denied");
  }

  return (
    <main className="min-h-screen bg-[#f8f9fb]">
      <section className="border-b border-black/[0.06] bg-white">
        <div className="mx-auto max-w-[1200px] px-6 py-8 lg:px-10">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#969aa1]">
                <Users size={13} />
                Staff Portal
              </div>

              <h1 className="text-3xl font-semibold tracking-[-0.05em] text-[#111318]">
                Staff Team
              </h1>

              <p className="mt-2 text-sm text-[#777b83]">
                Staff roles and permission structure.
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

      <section className="mx-auto max-w-[1000px] px-6 py-8 lg:px-10 lg:py-10">
        <div className="mb-6 rounded-2xl border border-black/[0.07] bg-white p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f3f4f5] text-[#686d75]">
              <Shield size={16} />
            </div>

            <div>
              <p className="text-xs font-semibold text-[#111318]">
                Your current role
              </p>

              <p className="mt-1 text-sm font-medium text-[#555a63]">
                {formatRole(staff.role)}
              </p>

              <p className="mt-1 text-[10px] leading-5 text-[#969aa1]">
                Staff access is controlled through Clerk
                Organizations.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {roles.map((role) => (
            <div
              key={role.key}
              className={`rounded-2xl border bg-white p-5 ${
                role.key === staff.role
                  ? "border-black/[0.14]"
                  : "border-black/[0.07]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f3f4f5] text-[#686d75]">
                  <Shield size={16} />
                </div>

                {role.key === staff.role && (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-emerald-700">
                    You
                  </span>
                )}
              </div>

              <h2 className="mt-5 text-sm font-semibold text-[#111318]">
                {role.name}
              </h2>

              <p className="mt-2 text-xs leading-5 text-[#858991]">
                {role.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function formatRole(role: string | null) {
  switch (role) {
    case "org:management":
      return "Management";

    case "org:adminsitrator":
      return "Administrator";

    case "org:senior_moderator":
      return "Senior Moderator";

    case "org:moderator":
      return "Moderator";

    default:
      return "Staff";
  }
}