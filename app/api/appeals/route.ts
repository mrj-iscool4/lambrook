import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncExpiredBans } from "@/lib/expired-bans";
import { checkRateLimit } from "@/lib/rate-limit";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(request);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many appeal submissions. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
          "Cache-Control": "no-store",
        },
      }
    );
  }

  const origin = request.headers.get("origin");

  if (origin) {
    try {
      if (new URL(origin).host !== new URL(request.url).host) {
        return NextResponse.json(
          { error: "Invalid request origin." },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid request origin." },
        { status: 403 }
      );
    }
  }

  const contentLength = Number(request.headers.get("content-length") || 0);

  if (contentLength > 20_000) {
    return NextResponse.json(
      { error: "Request is too large." },
      { status: 413 }
    );
  }

  try {
    await syncExpiredBans();

    const body = await request.json();

    const robloxUserId = clean(body.robloxUserId);
    const username = clean(body.username);
    const caseId = clean(body.caseId);
    const email = clean(body.email);
    const reason = clean(body.reason);
    const statement = clean(body.statement);

    if (
      !robloxUserId ||
      !username ||
      !caseId ||
      !email ||
      !reason ||
      !statement
    ) {
      return NextResponse.json(
        {
          error: "Please complete all required fields.",
        },
        { status: 400 }
      );
    }

    if (!/^\d+$/.test(robloxUserId)) {
      return NextResponse.json(
        {
          error: "Roblox User ID must contain numbers only.",
        },
        { status: 400 }
      );
    }

    if (robloxUserId.length > 30) {
      return NextResponse.json(
        {
          error: "Invalid Roblox User ID.",
        },
        { status: 400 }
      );
    }

    if (username.length > 100) {
      return NextResponse.json(
        {
          error: "Username is too long.",
        },
        { status: 400 }
      );
    }

    if (caseId.length > 100) {
      return NextResponse.json(
        {
          error: "Case ID is too long.",
        },
        { status: 400 }
      );
    }

    if (reason.length > 500) {
      return NextResponse.json(
        {
          error: "Appeal reason is too long.",
        },
        { status: 400 }
      );
    }

    if (statement.length < 20) {
      return NextResponse.json(
        {
          error:
            "Please provide a more detailed statement.",
        },
        { status: 400 }
      );
    }

    if (statement.length > 5000) {
      return NextResponse.json(
        {
          error: "Your statement cannot exceed 5000 characters.",
        },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        {
          error: "Please provide a valid email address.",
        },
        { status: 400 }
      );
    }

    const ban = await prisma.ban.findFirst({
      where: {
        caseId,
        robloxUserId,
      },
    });

    if (!ban) {
      return NextResponse.json(
        {
          error:
            "We could not find a moderation record matching that Roblox User ID and Case ID.",
        },
        { status: 404 }
      );
    }

    if (!ban.active) {
      return NextResponse.json(
        {
          error:
            "This moderation record is no longer active and does not require an appeal.",
        },
        { status: 400 }
      );
    }

    const existingAppeal = await prisma.appeal.findFirst({
      where: {
        caseId,
        robloxUserId,
        status: "Pending",
      },
    });

    if (existingAppeal) {
      return NextResponse.json(
        {
          error:
            "There is already a pending appeal for this case.",
        },
        { status: 409 }
      );
    }

    const appeal = await prisma.appeal.create({
      data: {
        robloxUserId,
        username,
        caseId,
        email,
        reason,
        statement,
        status: "Pending",
      },
    });

    return NextResponse.json(
      {
        success: true,
        appeal: {
          id: appeal.id,
          status: appeal.status,
          createdAt: appeal.createdAt,
        },
      },
      {
        status: 201,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("Appeal submission failed:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while submitting your appeal.",
      },
      { status: 500 }
    );
  }
}