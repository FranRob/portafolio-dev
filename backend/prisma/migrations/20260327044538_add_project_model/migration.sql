-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('in_progress', 'completed', 'private');

-- CreateEnum
CREATE TYPE "ProjectCategory" AS ENUM ('freelance', 'personal', 'collaborative');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "stack" TEXT[],
    "status" "ProjectStatus" NOT NULL DEFAULT 'in_progress',
    "category" "ProjectCategory" NOT NULL DEFAULT 'personal',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "repoUrl" TEXT,
    "demoUrl" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);
