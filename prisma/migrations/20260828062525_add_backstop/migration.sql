-- CreateTable
CREATE TABLE "ZendeskAccount" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subdomain" TEXT NOT NULL,
    "displayName" TEXT,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "lastSyncedAt" TIMESTAMP(3),

    CONSTRAINT "ZendeskAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketSnapshot" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" TEXT NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "cycle" TEXT NOT NULL,
    "groupId" INTEGER,
    "groupName" TEXT,
    "aiAssisted" BOOLEAN NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "TicketSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ZendeskAccount_subdomain_key" ON "ZendeskAccount"("subdomain");

-- CreateIndex
CREATE INDEX "TicketSnapshot_accountId_cycle_idx" ON "TicketSnapshot"("accountId", "cycle");

-- CreateIndex
CREATE UNIQUE INDEX "TicketSnapshot_accountId_ticketId_cycle_key" ON "TicketSnapshot"("accountId", "ticketId", "cycle");

-- AddForeignKey
ALTER TABLE "TicketSnapshot" ADD CONSTRAINT "TicketSnapshot_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "ZendeskAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
