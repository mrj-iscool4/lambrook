-- CreateTable
CREATE TABLE "Ban" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "robloxUserId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT,
    "reason" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "issuedBy" TEXT NOT NULL,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ban_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ban_caseId_key" ON "Ban"("caseId");

-- CreateIndex
CREATE INDEX "Ban_robloxUserId_idx" ON "Ban"("robloxUserId");

-- CreateIndex
CREATE INDEX "Ban_username_idx" ON "Ban"("username");

-- CreateIndex
CREATE INDEX "Ban_active_idx" ON "Ban"("active");

-- CreateIndex
CREATE INDEX "Ban_issuedAt_idx" ON "Ban"("issuedAt");
