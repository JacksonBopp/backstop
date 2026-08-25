-- CreateEnum
CREATE TYPE "DeploymentTopology" AS ENUM ('AUGMENTATION', 'AUTOMATION', 'DECISION_SUPPORT', 'MIXED');

-- CreateEnum
CREATE TYPE "ChangeReadiness" AS ENUM ('BURNED', 'NEUTRAL', 'ENTHUSIASTIC');

-- CreateEnum
CREATE TYPE "SurveillanceSensitivity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('NEW', 'CONTACTED', 'NOT_YET', 'CLOSED');

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "answers" JSONB NOT NULL,
    "axisScores" JSONB,
    "deploymentTopology" "DeploymentTopology" NOT NULL,
    "changeReadiness" "ChangeReadiness" NOT NULL,
    "surveillanceSensitivity" "SurveillanceSensitivity" NOT NULL,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactOrg" TEXT,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);
