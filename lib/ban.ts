export function durationToSeconds(
  duration: string,
  expiresAt?: Date | null
) {
  if (duration === "Permanent") {
    // Internal marker for a permanent Roblox restriction.
    return -1;
  }

  if (expiresAt) {
    return Math.max(
      1,
      Math.floor(
        (expiresAt.getTime() - Date.now()) / 1000
      )
    );
  }

  const map: Record<string, number> = {
    "1 Hour": 3600,
    "6 Hours": 21600,
    "12 Hours": 43200,
    "24 Hours": 86400,
    "3 Days": 259200,
    "7 Days": 604800,
    "14 Days": 1209600,
    "30 Days": 2592000,
  };

  return map[duration] ?? 3600;
}
