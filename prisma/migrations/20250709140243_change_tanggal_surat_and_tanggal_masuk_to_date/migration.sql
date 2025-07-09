/*
  Warnings:

  - Changed the type of `tanggal_masuk` on the `surat` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `tanggal_surat` on the `surat` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "surat" DROP COLUMN "tanggal_masuk",
ADD COLUMN     "tanggal_masuk" DATE NOT NULL,
DROP COLUMN "tanggal_surat",
ADD COLUMN     "tanggal_surat" DATE NOT NULL;
