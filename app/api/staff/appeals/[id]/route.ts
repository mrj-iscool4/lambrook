import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStaffAuth } from "@/lib/auth";
import { updateRobloxBan } from "@/lib/roblox";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  { params }: RouteProps
) {
  const staff = await getStaffAuth();

  if (!staff.authenticated) {
    return NextResponse.json(
      { error: "Unauthenticated." },
      { status: 401 }
    );
  }

  if (!staff.authorized) {
    return NextResponse.json(
      { error: "Forbidden." },
      { status: 403 }
    );
  }

  if (!staff.userId) {
    return NextResponse.json(
      { error: "Unable to identify the authenticated staff member." },
      { status: 401 }
    );
  }

  const staffUserId = staff.userId;

  const { id } = await params;

  try {
    const body = await request.json();

    const action = body.action;
    const responseText =
      typeof body.response === "string"
        ? body.response.trim()
        : "";

    if (action !== "approve" && action !== "deny") {
      return NextResponse.json(
        { error: "Invalid appeal action." },
        { status: 400 }
      );
    }

    if (responseText.length > 3000) {
      return NextResponse.json(
        {
          error:
            "Staff response cannot exceed 3000 characters.",
        },
        { status: 400 }
      );
    }

    const appeal = await prisma.appeal.findUnique({
      where: { id },
    });

    if (!appeal) {
      return NextResponse.json(
        { error: "Appeal not found." },
        { status: 404 }
      );
    }

    if (appeal.status !== "Pending") {
      return NextResponse.json(
        {
          error:
            "This appeal has already been reviewed.",
        },
        { status: 409 }
      );
    }

    const ban = await prisma.ban.findFirst({
      where: {
        caseId: appeal.caseId,
        robloxUserId: appeal.robloxUserId,
      },
    });

    if (!ban) {
      return NextResponse.json(
        {
          error:
            "The moderation record associated with this appeal could not be found.",
        },
        { status: 404 }
      );
    }

    if (action === "approve") {
      if (!ban.active) {
        return NextResponse.json(
          {
            error:
              "This ban is already inactive. The appeal cannot be approved because no active restriction remains.",
          },
          { status: 400 }
        );
      }

      // Remove the Roblox restriction FIRST.
      const robloxResult = await updateRobloxBan({
        userId: ban.robloxUserId,
        active: false,
      });

      if (!robloxResult.configured) {
        return NextResponse.json(
          {
            error:
              "Roblox Open Cloud is not configured.",
          },
          { status: 503 }
        );
      }

      await prisma.$transaction(async (tx) => {
        await tx.ban.update({
          where: {
            id: ban.id,
          },
          data: {
            active: false,
          },
        });

        await tx.appeal.update({
          where: {
            id: appeal.id,
          },
          data: {
            status: "Approved",
            reviewedBy: staffUserId,
            reviewedAt: new Date(),
            response:
              responseText ||
              "Your appeal has been approved and the moderation action has been removed.",
          },
        });

        await tx.auditLog.create({
          data: {
            actorId: staffUserId,
            action: "APPEAL_APPROVED",
            targetType: "Appeal",
            targetId: appeal.id,
            metadata: JSON.stringify({
              caseId: appeal.caseId,
              banId: ban.id,
              robloxUserId: appeal.robloxUserId,
            }),
          },
        });

        await tx.auditLog.create({
          data: {
            actorId: staffUserId,
            action: "BAN_REVOKED_APPEAL",
            targetType: "Ban",
            targetId: ban.id,
            metadata: JSON.stringify({
              appealId: appeal.id,
              caseId: appeal.caseId,
              robloxUserId: appeal.robloxUserId,
            }),
          },
        });
      });

      return NextResponse.json({
        success: true,
        status: "Approved",
      });
    }

    await prisma.appeal.update({
      where: {
        id: appeal.id,
      },
      data: {
        status: "Denied",
        reviewedBy: staffUserId,
        reviewedAt: new Date(),
        response:
          responseText ||
          "Your appeal has been reviewed and denied.",
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: staffUserId,
        action: "APPEAL_DENIED",
        targetType: "Appeal",
        targetId: appeal.id,
        metadata: JSON.stringify({
          caseId: appeal.caseId,
          banId: ban.id,
          robloxUserId: appeal.robloxUserId,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      status: "Denied",
    });
  } catch (error) {
    console.error("Appeal review failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to review appeal.",
      },
      { status: 500 }
    );
  }
}
