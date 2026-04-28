/*
  Warnings:

  - The `color` column on the `Project` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "color",
ADD COLUMN     "color" TEXT NOT NULL DEFAULT '#4F46E5';

-- DropEnum
DROP TYPE "ProjectColor";
