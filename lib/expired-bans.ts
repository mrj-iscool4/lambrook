import { prisma } from "@/lib/prisma";

/**
 * Keeps the local moderation database aligned with timed ban expiry.
 * Roblox enforces the actual restriction duration independently.
 */
export async function syncExpiredBans() {
  const result = await prisma.ban.updateMany({
    where: {
      active: true,
      expiresAt: {
        not: null,
        lte: new Date(),
      },
    },
    data: {
      active: false,
    },
  });

  return result.count;
}
