/*
  Warnings:

  - The values [ditolak] on the enum `LetterStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `penerima_id` on the `surat` table. All the data in the column will be lost.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `penerima` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email_instansi]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `surat` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `tanggal_masuk` on the `surat` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `tanggal_surat` on the `surat` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `email_instansi` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nama_instansi` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'user');

-- AlterEnum
BEGIN;
CREATE TYPE "LetterStatus_new" AS ENUM ('pending', 'diterima');
ALTER TABLE "surat" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "surat" ALTER COLUMN "status" TYPE "LetterStatus_new" USING ("status"::text::"LetterStatus_new");
ALTER TYPE "LetterStatus" RENAME TO "LetterStatus_old";
ALTER TYPE "LetterStatus_new" RENAME TO "LetterStatus";
DROP TYPE "LetterStatus_old";
ALTER TABLE "surat" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;

-- DropForeignKey
ALTER TABLE "surat" DROP CONSTRAINT "surat_penerima_id_fkey";

-- AlterTable
ALTER TABLE "surat" DROP COLUMN "penerima_id",
ADD COLUMN     "user_id" INTEGER NOT NULL,
ALTER COLUMN "nomor_registrasi" DROP DEFAULT,
DROP COLUMN "tanggal_masuk",
ADD COLUMN     "tanggal_masuk" VARCHAR(10) NOT NULL,
DROP COLUMN "tanggal_surat",
ADD COLUMN     "tanggal_surat" VARCHAR(10) NOT NULL;
DROP SEQUENCE "surat_nomor_registrasi_seq";

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "name",
DROP COLUMN "username",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email_instansi" VARCHAR(255) NOT NULL,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "nama_instansi" VARCHAR(255) NOT NULL,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'user',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "password" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "token" SET DATA TYPE VARCHAR(255),
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "penerima";

-- CreateIndex
CREATE UNIQUE INDEX "users_email_instansi_key" ON "users"("email_instansi");

-- AddForeignKey
ALTER TABLE "surat" ADD CONSTRAINT "surat_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
