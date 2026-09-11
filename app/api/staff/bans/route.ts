import { NextResponse } from "next/server";
import { getStaffAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateRobloxBan } from "@/lib/roblox";
import { durationToSeconds } from "@/lib/ban";

function generateCaseId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();

  return `UKRP-${timestamp}-${random}`;
}

export async function POST(request: Request) {
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

    const body = await request.json();

    const robloxUserId = String(body.robloxUserId ?? "").trim();
    const username = String(body.username ?? "").trim();
    const displayName = String(body.displayName ?? "").trim();
    const reason = String(body.reason ?? "").trim();
    const duration = String(body.duration ?? "").trim();
    const notes = String(body.notes ?? "").trim();
    const expiresAtValue = body.expiresAt;

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

    if (!robloxUserId || !username || !reason || !duration) {
      return NextResponse.json(
        {
          error:
            "Roblox User ID, username, reason and duration are required.",
        },
        { status: 400 }
      );
    }

    if (!allowedDurations.includes(duration)) {
      return NextResponse.json(
        { error: "Invalid moderation duration." },
        { status: 400 }
      );
    }

    if (username.length > 100 || displayName.length > 100) {
      return NextResponse.json(
        { error: "Player name is too long." },
        { status: 400 }
      );
    }

    if (reason.length > 500) {
      return NextResponse.json(
        { error: "Reason cannot exceed 500 characters." },
        { status: 400 }
      );
    }

    if (notes.length > 5000) {
      return NextResponse.json(
        { error: "Notes cannot exceed 5000 characters." },
        { status: 400 }
      );
    }

    if (!/^\d+$/.test(robloxUserId)) {
      return NextResponse.json(
        {
          error: "Roblox User ID must contain only numbers.",
        },
        { status: 400 }
      );
    }

    let expiresAt: Date | null = null;

    if (expiresAtValue) {
      const parsedDate = new Date(expiresAtValue);

      if (Number.isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid expiry date." },
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

    const isWarning = duration === "Warning";

    const ban = await prisma.ban.create({
      data: {
        caseId: generateCaseId(),
        robloxUserId,
        username,
        displayName: displayName || null,
        reason,
        duration,
        expiresAt,
        issuedBy: staff.userId,
        notes: notes || null,
        active: !isWarning,
      },
    });

    if (!isWarning) {
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
        await prisma.ban.update({
          where: {
            id: ban.id,
          },
          data: {
            active: false,
          },
        });

        await prisma.auditLog.create({
          data: {
            actorId: staff.userId,
            action: "BAN_ROBLOX_SYNC_FAILED",
            targetType: "Ban",
            targetId: ban.id,
            metadata: JSON.stringify({
              caseId: ban.caseId,
              robloxUserId: ban.robloxUserId,
              configured: robloxResult.configured,
            }),
          },
        });

        return NextResponse.json(
          {
            error: robloxResult.configured
              ? "Ban was created, but Roblox could not be updated. The ban has been marked inactive."
              : "Roblox integration is not configured. The ban has been marked inactive.",
          },
          { status: 502 }
        );
      }
    } catch (error) {
      console.error("Roblox ban synchronization failed:", error);

      await prisma.ban.update({
        where: {
          id: ban.id,
        },
        data: {
          active: false,
        },
      });

      await prisma.auditLog.create({
        data: {
          actorId: staff.userId,
          action: "BAN_ROBLOX_SYNC_FAILED",
          targetType: "Ban",
          targetId: ban.id,
          metadata: JSON.stringify({
            caseId: ban.caseId,
            robloxUserId: ban.robloxUserId,
          }),
        },
      });

        return NextResponse.json(
          {
            error:
              "The moderation record was created, but Roblox rejected the restriction. The ban has been marked inactive.",
          },
          { status: 502 }
        );
      }
    }

    await prisma.auditLog.create({
      data: {
        actorId: staff.userId,
        action: isWarning ? "WARNING_CREATED" : "BAN_CREATED",
        targetType: "Ban",
        targetId: ban.id,
        metadata: JSON.stringify({
          caseId: ban.caseId,
          robloxUserId: ban.robloxUserId,
          username: ban.username,
          reason: ban.reason,
          duration: ban.duration,
        }),
      },
    });

    return NextResponse.json(
      {
        success: true,
        ban,
        roblox: {
          synced: !isWarning,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create ban:", error);

    return NextResponse.json(
      {
        error: "Failed to create ban.",
      },
      { status: 500 }
    );
  }
}