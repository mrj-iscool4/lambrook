import { prisma } from "@/lib/prisma";

export async function createAuditLog({
  actorId,
  action,
  targetType,
  targetId,
  metadata,
}: {
  actorId: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  return prisma.auditLog.create({
    data: {
      actorId,
      action,
      targetType,
      targetId: targetId ?? null,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
}