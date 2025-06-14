-- CreateTable
CREATE TABLE "penerima" (
    "id" SERIAL NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "penerima_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surat" (
    "id" SERIAL NOT NULL,
    "nomor_registrasi" SERIAL NOT NULL,
    "pengirim" VARCHAR(100) NOT NULL,
    "tujuan" VARCHAR(100) NOT NULL,
    "nomor_surat" VARCHAR(50) NOT NULL,
    "tanggal_masuk" TIMESTAMP(3) NOT NULL,
    "tanggal_surat" TIMESTAMP(3) NOT NULL,
    "perihal" VARCHAR(255) NOT NULL,
    "file_url" VARCHAR(255) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "penerima_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "surat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "penerima_email_key" ON "penerima"("email");

-- CreateIndex
CREATE UNIQUE INDEX "surat_nomor_registrasi_key" ON "surat"("nomor_registrasi");

-- AddForeignKey
ALTER TABLE "surat" ADD CONSTRAINT "surat_penerima_id_fkey" FOREIGN KEY ("penerima_id") REFERENCES "penerima"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
