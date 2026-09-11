-- CreateTable
CREATE TABLE "RuleCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RuleCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rule" (
    "id" TEXT NOT NULL,
    "ruleNumber" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'Standard',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RuleCategory_active_idx" ON "RuleCategory"("active");

-- CreateIndex
CREATE INDEX "RuleCategory_sortOrder_idx" ON "RuleCategory"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Rule_ruleNumber_key" ON "Rule"("ruleNumber");

-- CreateIndex
CREATE INDEX "Rule_categoryId_idx" ON "Rule"("categoryId");

-- CreateIndex
CREATE INDEX "Rule_published_idx" ON "Rule"("published");

-- CreateIndex
CREATE INDEX "Rule_archived_idx" ON "Rule"("archived");

-- CreateIndex
CREATE INDEX "Rule_sortOrder_idx" ON "Rule"("sortOrder");

-- AddForeignKey
ALTER TABLE "Rule" ADD CONSTRAINT "Rule_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "RuleCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
