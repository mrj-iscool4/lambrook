import { isRobloxConfigured } from "@/lib/env";

const BASE_URL = "https://apis.roblox.com/cloud/v2";

function getConfig() {
  const apiKey = process.env.ROBLOX_OPEN_CLOUD_API_KEY;
  const universeId = process.env.ROBLOX_UNIVERSE_ID;

  if (!isRobloxConfigured()) {
    return null;
  }

  return {
    apiKey: apiKey!,
    universeId: universeId!,
  };
}

export async function updateRobloxBan({
  userId,
  active,
  durationSeconds,
  reason,
}: {
  userId: string;
  active: boolean;
  durationSeconds?: number;
  reason?: string;
}) {
  const config = getConfig();

  if (!config) {
    return {
      configured: false,
      success: false,
    };
  }

  const payload = active
    ? {
        gameJoinRestriction: {
          active: true,
          duration: `${Math.max(
            1,
            durationSeconds ?? 315576000000
          )}s`,
          privateReason:
            reason || "UKRP moderation action.",
          displayReason:
            reason ||
            "You have been banned from this experience.",
          excludeAltAccounts: false,
        },
      }
    : {
        gameJoinRestriction: {
          active: false,
        },
      };

  const response = await fetch(
    `${BASE_URL}/universes/${config.universeId}/user-restrictions/${userId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.apiKey,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    }
  );

  if (!response.ok) {
    const text = await response.text();

    throw new Error(
      `Roblox API ${response.status}: ${text}`
    );
  }

  return {
    configured: true,
    success: true,
  };
}