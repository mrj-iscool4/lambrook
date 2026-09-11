import { NextResponse } from "next/server";
import { getStaffAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateRobloxBan } from "@/lib/roblox";
import { durationToSeconds } from "@/lib/ban";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  try {
    const staff = await getStaffAuth();

    if (!staff.authenticated) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    if (!staff.authorized) {
      return NextResponse.json(
        { error: "You do not have permission to perform this action." },
        { status: 403 }
      );
    }

if (!staff.userId) {
  return NextResponse.json(
    { error: "Unable to identify the authenticated staff member." },
    { status: 401 }
  );
}

    const { id } = await params;
    const body = await request.json();

    const ban = await prisma.ban.findUnique({
      where: { id },
    });

    if (!ban) {
      return NextResponse.json(
        { error: "Ban record not found." },
        { status: 404 }
      );
    }

    const action = String(body.action ?? "").trim();

    if (!["revoke", "restore", "edit"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action." },
        { status: 400 }
      );
    }

    /*
     * REVOKE
     */
    if (action === "revoke") {
      try {
        const robloxResult = await updateRobloxBan({
          userId: ban.robloxUserId,
          active: false,
        });

        if (!robloxResult.success) {
          return NextResponse.json(
            {
              error: "Roblox integration is not configured. The ban was not changed.",
            },
            { status: 503 }
          );
        }
      } catch (error) {
        console.error(
          "Failed to revoke Roblox restriction:",
          error
        );

        await prisma.auditLog.create({
          data: {
            actorId: staff.userId,
            action: "BAN_ROBLOX_SYNC_FAILED",
            targetType: "Ban",
            targetId: ban.id,
            metadata: JSON.stringify({
              caseId: ban.caseId,
              robloxUserId: ban.robloxUserId,
              operation: "revoke",
            }),
          },
        });

        return NextResponse.json(
          {
            error:
              "Roblox could not remove the restriction. The UKRP ban remains active.",
          },
          { status: 502 }
        );
      }

      const updatedBan = await prisma.ban.update({
        where: { id },
        data: {
          active: false,
        },
      });

      await prisma.auditLog.create({
        data: {
          actorId: staff.userId,
          action: "BAN_REVOKED",
          targetType: "Ban",
          targetId: ban.id,
          metadata: JSON.stringify({
            caseId: ban.caseId,
            robloxUserId: ban.robloxUserId,
          }),
        },
      });

      return NextResponse.json({
        success: true,
        ban: updatedBan,
        roblox: {
          synced: true,
        },
      });
    }

    /*
     * RESTORE
     */
    if (action === "restore") {
      if (ban.duration === "Warning") {
        return NextResponse.json(
          { error: "Warning records do not have a Roblox restriction to restore." },
          { status: 400 }
        );
      }

      try {
        const robloxResult = await updateRobloxBan({
          userId: ban.robloxUserId,
          active: true,
          durationSeconds: durationToSeconds(
            ban.duration,
            ban.expiresAt
          ),
          reason: ban.reason,
        });

        if (!robloxResult.success) {
          return NextResponse.json(
            {
              error: "Roblox integration is not configured. The ban was not changed.",
            },
            { status: 503 }
          );
        }
      } catch (error) {
        console.error(
          "Failed to restore Roblox restriction:",
          error
        );

        await prisma.auditLog.create({
          data: {
            actorId: staff.userId,
            action: "BAN_ROBLOX_SYNC_FAILED",
            targetType: "Ban",
            targetId: ban.id,
            metadata: JSON.stringify({
              caseId: ban.caseId,
              robloxUserId: ban.robloxUserId,
              operation: "restore",
            }),
          },
        });

        return NextResponse.json(
          {
            error:
              "Roblox could not restore the restriction. The UKRP ban remains inactive.",
          },
          { status: 502 }
        );
      }

      const updatedBan = await prisma.ban.update({
        where: { id },
        data: {
          active: true,
        },
      });

      await prisma.auditLog.create({
        data: {
          actorId: staff.userId,
          action: "BAN_RESTORED",
          targetType: "Ban",
          targetId: ban.id,
          metadata: JSON.stringify({
            caseId: ban.caseId,
            robloxUserId: ban.robloxUserId,
          }),
        },
      });

      return NextResponse.json({
        success: true,
        ban: updatedBan,
        roblox: {
          synced: true,
        },
      });
    }

    /*
     * EDIT
     */
    const reason =
      typeof body.reason === "string"
        ? body.reason.trim()
        : ban.reason;

    const duration =
      typeof body.duration === "string"
        ? body.duration.trim()
        : ban.duration;

    const notes =
      typeof body.notes === "string"
        ? body.notes.trim()
        : ban.notes;

    const displayName =
      typeof body.displayName === "string"
        ? body.displayName.trim()
        : ban.displayName;

    const allowedDurations = [
      "Warning",
      "1 Hour",
      "6 Hours",
      "12 Hours",
      "24 Hours",
      "3 Days",
      "7 Days",
      "14 Days",
      "30 Days",
      "Permanent",
    ];

    if (!allowedDurations.includes(duration)) {
      return NextResponse.json(
        { error: "Invalid moderation duration." },
        { status: 400 }
      );
    }

    if (reason.length > 500) {
      return NextResponse.json(
        { error: "Reason cannot exceed 500 characters." },
        { status: 400 }
      );
    }

    if (notes && notes.length > 5000) {
      return NextResponse.json(
        { error: "Notes cannot exceed 5000 characters." },
        { status: 400 }
      );
    }

    if (!reason || !duration) {
      return NextResponse.json(
        {
          error: "Reason and duration are required.",
        },
        { status: 400 }
      );
    }

    let expiresAt = ban.expiresAt;

    if (body.expiresAt === null || body.expiresAt === "") {
      expiresAt = null;
    } else if (typeof body.expiresAt === "string") {
      const parsedDate = new Date(body.expiresAt);

      if (Number.isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          {
            error: "Invalid expiry date.",
          },
          { status: 400 }
        );
      }

      expiresAt = parsedDate;
    }

    if (duration === "Permanent" || duration === "Warning") {
      expiresAt = null;
    }

    if (expiresAt && expiresAt.getTime() <= Date.now()) {
      return NextResponse.json(
        { error: "Expiry date must be in the future." },
        { status: 400 }
      );
    }

    const becomesWarning = duration === "Warning";

    /*
     * Keep Roblox synchronized before changing an active moderation record.
     * Warning records are database-only and do not create a Roblox restriction.
     */
    const needsRobloxSync =
      ban.active || (ban.duration === "Warning" && !becomesWarning);

    if (needsRobloxSync) {
      try {
        const robloxResult = await updateRobloxBan({
          userId: ban.robloxUserId,
          active: !becomesWarning,
          ...(becomesWarning
            ? {}
            : {
                durationSeconds: durationToSeconds(
                  duration,
                  expiresAt
                ),
                reason,
              }),
        });

        if (!robloxResult.success) {
          return NextResponse.json(
            {
              error: "Roblox integration is not configured. The moderation record was not changed.",
            },
            { status: 503 }
          );
        }
      } catch (error) {
        console.error(
          "Failed to update Roblox restriction:",
          error
        );

        await prisma.auditLog.create({
          data: {
            actorId: staff.userId,
            action: "BAN_ROBLOX_SYNC_FAILED",
            targetType: "Ban",
            targetId: ban.id,
            metadata: JSON.stringify({
              caseId: ban.caseId,
              robloxUserId: ban.robloxUserId,
              operation: "edit",
            }),
          },
        });

        return NextResponse.json(
          {
            error:
              "Roblox could not be updated. The moderation record was not changed.",
          },
          { status: 502 }
        );
      }
    }

    const updatedBan = await prisma.ban.update({
      where: { id },
      data: {
        reason,
        duration,
        notes: notes || null,
        displayName: displayName || null,
        expiresAt,
        active: becomesWarning
          ? false
          : ban.duration === "Warning"
            ? true
            : ban.active,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: staff.userId,
        action: "BAN_EDITED",
        targetType: "Ban",
        targetId: ban.id,
        metadata: JSON.stringify({
          caseId: ban.caseId,
          robloxUserId: ban.robloxUserId,
          duration,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      ban: updatedBan,
      roblox: {
        synced: needsRobloxSync,
      },
    });
  } catch (error) {
    console.error("Failed to update ban:", error);

    return NextResponse.json(
      {
        error: "Failed to update ban.",
      },
      { status: 500 }
    );
  }
}
