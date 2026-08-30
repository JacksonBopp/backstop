-- CreateTable
CREATE TABLE "LoginAttempt" (
    "ip" TEXT NOT NULL,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "lastFailedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedUntil" TIMESTAMP(3),

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("ip")
);
