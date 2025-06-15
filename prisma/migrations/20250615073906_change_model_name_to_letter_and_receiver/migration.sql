/*
  Warnings:

  - The `status` column on the `surat` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "LetterStatus" AS ENUM ('pending', 'diterima', 'ditolak');

-- AlterTable
ALTER TABLE "surat" DROP COLUMN "status",
ADD COLUMN     "status" "LetterStatus" NOT NULL DEFAULT 'pending';
