import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireManagement } from "@/lib/management";
import { createAuditLog } from "@/lib/audit";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: Request,
  { params }: Context
) {
  try {
    const { userId } = await requireManagement();
    const { id } = await params;

    const existing = await prisma.rule.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Rule not found." },
        { status: 404 }
      );
    }

    const body = await request.json();

    const data: {
      title?: string;
      description?: string;
      categoryId?: string;
      severity?: string;
      published?: boolean;
      archived?: boolean;
      sortOrder?: number;
    } = {};

    if (body.title !== undefined) {
      const title = String(body.title).trim();

      if (!title) {
        return NextResponse.json(
          { error: "Title cannot be empty." },
          { status: 400 }
        );
      }

      if (title.length > 160) {
        return NextResponse.json(
          { error: "Rule title cannot exceed 160 characters." },
          { status: 400 }
        );
      }

      data.title = title;
    }

    if (body.description !== undefined) {
      const description = String(body.description).trim();

      if (!description) {
        return NextResponse.json(
          { error: "Description cannot be empty." },
          { status: 400 }
        );
      }

      if (description.length > 5000) {
        return NextResponse.json(
          { error: "Rule description cannot exceed 5000 characters." },
          { status: 400 }
        );
      }

      data.description = description;
    }

    if (body.categoryId !== undefined) {
      const category = await prisma.ruleCategory.findUnique({
        where: {
          id: String(body.categoryId),
        },
      });

      if (!category || !category.active) {
        return NextResponse.json(
          { error: "Invalid category." },
          { status: 400 }
        );
      }

      data.categoryId = category.id;
    }

    if (body.severity !== undefined) {
      const severity = String(body.severity);

      if (!["Standard", "Serious", "Severe"].includes(severity)) {
        return NextResponse.json(
          { error: "Invalid severity." },
          { status: 400 }
        );
      }

      data.severity = severity;
    }

    if (body.published !== undefined) {
      data.published = Boolean(body.published);
    }

    if (body.archived !== undefined) {
      data.archived = Boolean(body.archived);
    }

    if (body.sortOrder !== undefined) {
      const sortOrder = Number(body.sortOrder);

      if (!Number.isInteger(sortOrder) || sortOrder < 0) {
        return NextResponse.json(
          { error: "Invalid sort order." },
          { status: 400 }
        );
      }

      data.sortOrder = sortOrder;
    }

    const rule = await prisma.rule.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });

    await createAuditLog({
      actorId: userId,
      action: "RULE_UPDATED",
      targetType: "Rule",
      targetId: rule.id,
      metadata: {
        ruleNumber: rule.ruleNumber,
        changes: data,
      },
    });

    return NextResponse.json(rule);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json(
        { error: "Unauthenticated." },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: "Management access required." },
        { status: 403 }
      );
    }

    console.error(error);

    return NextResponse.json(
      { error: "Unable to update rule." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: Context
) {
  try {
    const { userId } = await requireManagement();
    const { id } = await params;

    const existing = await prisma.rule.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Rule not found." },
        { status: 404 }
      );
    }

    const rule = await prisma.rule.update({
      where: { id },
      data: {
        archived: true,
        published: false,
      },
    });

    await createAuditLog({
      actorId: userId,
      action: "RULE_ARCHIVED",
      targetType: "Rule",
      targetId: rule.id,
      metadata: {
        ruleNumber: rule.ruleNumber,
        title: rule.title,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json(
        { error: "Unauthenticated." },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: "Management access required." },
        { status: 403 }
      );
    }

    console.error(error);

    return NextResponse.json(
      { error: "Unable to archive rule." },
      { status: 500 }
    );
  }
}