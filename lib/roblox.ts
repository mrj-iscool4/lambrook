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
      error: "Roblox Open Cloud is not configured.",
    };
  }

  const restriction = {
    active: true,
    privateReason:
      reason || "UKRP moderation action.",
    displayReason:
      reason ||
      "You have been banned from this experience.",
    excludeAltAccounts: false,
  };

  const payload = active
    ? {
        gameJoinRestriction:
          durationSeconds === -1
            ? restriction
            : {
                ...restriction,
                duration: `${Math.max(
                  1,
                  durationSeconds ?? 1
                )}s`,
              },
      }
    : {
        gameJoinRestriction: {
          active: false,
        },
      };

  const url =
    `${BASE_URL}/universes/${config.universeId}` +
    `/user-restrictions/${userId}`;

  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-api-key": config.apiKey,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    const responseText = await response.text();

    if (!response.ok) {
      let errorMessage = responseText;

      try {
        const errorJson = JSON.parse(responseText);

        errorMessage =
          errorJson.message ||
          errorJson.error?.message ||
          errorJson.code ||
          responseText;
      } catch {
        // Response wasn't JSON.
      }

      console.error(
        "Roblox Open Cloud restriction failed:",
        {
          status: response.status,
          statusText: response.statusText,
          userId,
          universeId: config.universeId,
          response: responseText,
        }
      );

      return {
        configured: true,
        success: false,
        status: response.status,
        error: `Roblox API ${response.status}: ${errorMessage}`,
      };
    }

    return {
      configured: true,
      success: true,
      status: response.status,
    };
  } catch (error) {
    console.error(
      "Roblox Open Cloud request failed:",
      error
    );

    return {
      configured: true,
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown Roblox API error.",
    };
  }
}
