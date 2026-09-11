import { redirect } from "next/navigation";
import { getStaffAuth } from "@/lib/auth";

export default async function RobloxTestPage() {
  const staff = await getStaffAuth();

  if (!staff.authenticated) {
    redirect("/sign-in");
  }

  if (!staff.authorized) {
    redirect("/staff/access-denied");
  }

  const apiKeyConfigured =
    Boolean(process.env.ROBLOX_OPEN_CLOUD_API_KEY);

  const universeIdConfigured =
    Boolean(process.env.ROBLOX_UNIVERSE_ID);

  let robloxReachable = false;
  let robloxMessage = "Not tested.";

  if (apiKeyConfigured && universeIdConfigured) {
    try {
      const response = await fetch(
        `https://apis.roblox.com/cloud/v2/universes/${process.env.ROBLOX_UNIVERSE_ID}`,
        {
          headers: {
            "x-api-key": process.env.ROBLOX_OPEN_CLOUD_API_KEY!,
          },
          cache: "no-store",
        }
      );

      robloxReachable = response.ok;

      if (response.ok) {
        robloxMessage =
          "Roblox Open Cloud responded successfully.";
      } else {
        robloxMessage =
          `Roblox returned HTTP ${response.status}.`;
      }
    } catch {
      robloxMessage =
        "Unable to connect to Roblox Open Cloud.";
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f9fb]">
      <section className="border-b border-black/[0.06] bg-white">
        <div className="mx-auto max-w-[1000px] px-6 py-12 lg:px-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#969aa1]">
            Staff Portal
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-[#111318]">
            Roblox integration
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-[#777b83]">
            Verify the connection between the UKRP moderation system
            and Roblox Open Cloud.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1000px] px-6 py-8 lg:px-10">
        <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white">
          <div className="border-b border-black/[0.06] px-6 py-5">
            <h2 className="text-sm font-semibold text-[#111318]">
              Connection status
            </h2>

            <p className="mt-1 text-xs text-[#969aa1]">
              No player restrictions are created by this test.
            </p>
          </div>

          <div className="divide-y divide-black/[0.06]">
            <StatusRow
              label="API key"
              value={
                apiKeyConfigured
                  ? "Configured"
                  : "Not configured"
              }
              positive={apiKeyConfigured}
            />

            <StatusRow
              label="Universe ID"
              value={
                universeIdConfigured
                  ? "Configured"
                  : "Not configured"
              }
              positive={universeIdConfigured}
            />

            <StatusRow
              label="Roblox Open Cloud"
              value={robloxMessage}
              positive={robloxReachable}
            />
          </div>

          <div className="border-t border-black/[0.06] bg-[#fafafa] px-6 py-5">
            <p className="text-[11px] leading-5 text-[#858991]">
              This page only performs a read request against your
              configured universe. Your API key remains server-side.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function StatusRow({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-6 px-6 py-4">
      <span className="text-xs font-medium text-[#555a63]">
        {label}
      </span>

      <span className="flex items-center gap-2 text-xs font-semibold text-[#555a63]">
        <span
          className={`h-2 w-2 rounded-full ${
            positive
              ? "bg-emerald-500"
              : "bg-red-500"
          }`}
        />

        {value}
      </span>
    </div>
  );
}