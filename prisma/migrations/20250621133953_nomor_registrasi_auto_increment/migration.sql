-- AlterTable
CREATE SEQUENCE surat_nomor_registrasi_seq;
ALTER TABLE "surat" ALTER COLUMN "nomor_registrasi" SET DEFAULT nextval('surat_nomor_registrasi_seq');
ALTER SEQUENCE surat_nomor_registrasi_seq OWNED BY "surat"."nomor_registrasi";
