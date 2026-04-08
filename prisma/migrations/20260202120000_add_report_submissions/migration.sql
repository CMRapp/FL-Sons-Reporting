-- CreateTable
CREATE TABLE "report_submissions" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "reportName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "userTitle" TEXT NOT NULL,
    "squadronNumber" TEXT NOT NULL,
    "districtNumber" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "submitterIp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "report_submissions_reportId_createdAt_idx" ON "report_submissions"("reportId", "createdAt");

-- CreateIndex
CREATE INDEX "report_submissions_createdAt_idx" ON "report_submissions"("createdAt");
