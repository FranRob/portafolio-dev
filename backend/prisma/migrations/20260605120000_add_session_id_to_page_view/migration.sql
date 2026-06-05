-- AlterTable
ALTER TABLE "PageView" ADD COLUMN "sessionId" TEXT;

-- CreateIndex
CREATE INDEX "PageView_sessionId_idx" ON "PageView"("sessionId");
