/*
  Warnings:

  - You are about to drop the `Script` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Script";

-- CreateTable
CREATE TABLE "ScriptFile" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScriptFile_pkey" PRIMARY KEY ("id")
);
