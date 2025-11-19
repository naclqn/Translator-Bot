-- CreateTable
CREATE TABLE "ChannelSetting" (
    "channelId" TEXT NOT NULL PRIMARY KEY,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "rate_limits" (
    "modelName" TEXT NOT NULL PRIMARY KEY,
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "tokenCount" INTEGER NOT NULL DEFAULT 0,
    "lastResetMin" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastResetDay" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dailyRequests" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "api_usage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "modelName" TEXT NOT NULL,
    "tokens" INTEGER NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT
);

-- CreateIndex
CREATE INDEX "api_usage_modelName_timestamp_idx" ON "api_usage"("modelName", "timestamp");
