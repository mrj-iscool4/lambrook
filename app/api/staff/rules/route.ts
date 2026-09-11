import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireManagement } from "@/lib/management";
import { createAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const { userId } = await requireManagement();

    const body = await request.json();

    const title = String(body.title ?? "").trim();
    const description = String(body.description ?? "").trim();
    const categoryId = String(body.categoryId ?? "").trim();
    const severity = String(body.severity ?? "Standard").trim();
    const published = Boolean(body.published);

    if (title.length > 160 || description.length > 5000) {
      return NextResponse.json(
        { error: "Rule title or description is too long." },
        { status: 400 }
      );
    }

    if (!title || !description || !categoryId) {
      return NextResponse.json(
        { error: "Title, description and category are required." },
        { status: 400 }
      );
    }

    if (!["Standard", "Serious", "Severe"].includes(severity)) {
      return NextResponse.json(
        { error: "Invalid severity." },
        { status: 400 }
      );
    }

    const category = await prisma.ruleCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category || !category.active) {
      return NextResponse.json(
        { error: "Category not found." },
        { status: 400 }
      );
    }

    const latest = await prisma.rule.findFirst({
      orderBy: {
        sortOrder: "desc",
      },
      select: {
        ruleNumber: true,
        sortOrder: true,
      },
    });

    const nextNumber = latest
      ? latest.sortOrder + 1
      : 1;

    const ruleNumber = `R-${String(nextNumber).padStart(2, "0")}`;

    const rule = await prisma.rule.create({
      data: {
        ruleNumber,
        categoryId,
        title,
        description,
        severity,
        published,
        archived: false,
        sortOrder: nextNumber,
      },
      include: {
        category: true,
      },
    });

    await createAuditLog({
      actorId: userId,
      action: "RULE_CREATED",
      targetType: "Rule",
      targetId: rule.id,
      metadata: {
        ruleNumber: rule.ruleNumber,
        title: rule.title,
        category: rule.category.name,
      },
    });

    return NextResponse.json(rule, { status: 201 });
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
      { error: "Unable to create rule." },
      { status: 500 }
    );
  }
}