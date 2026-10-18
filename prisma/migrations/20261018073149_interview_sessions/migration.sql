-- CreateTable
CREATE TABLE "interview_session" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "interviewer" VARCHAR(32) NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "transcript" JSONB NOT NULL,
    "report" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interview_session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "interview_session_userId_createdAt_idx" ON "interview_session"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "interview_session" ADD CONSTRAINT "interview_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "userinfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
