import { Letter, Receiver } from "@prisma/client";

export type LetterResponse = {
  id: number;
  nomor_registrasi: number;
  pengirim: string;
  tujuan: string;
  nomor_surat: string;
  tanggal_masuk: Date;
  tanggal_surat: Date;
  perihal: string;
  file_url: string;
  status: string;
  penerima: {
    id: number;
    nama: string;
    email: string;
  };
  created_at: Date;
  updated_at: Date;
};

export type CreateLetterRequest = {
  pengirim: string;
  tujuan: string;
  nomor_surat: string;
  tanggal_masuk: string;
  tanggal_surat: string;
  perihal: string;
  penerima_id: number;
};

export type UpdateLetterRequest = {
  pengirim?: string;
  tujuan?: string;
  nomor_surat?: string;
  tanggal_masuk?: string;
  tanggal_surat?: string;
  perihal?: string;
  penerima_id?: number;
};

export type UpdateStatusRequest = {
  status: "pending" | "diterima" | "ditolak";
};

export function toLetterResponse(
  letter: Letter & { penerima: Receiver }
): LetterResponse {
  return {
    id: letter.id,
    nomor_registrasi: letter.nomor_registrasi,
    pengirim: letter.pengirim,
    tujuan: letter.tujuan,
    nomor_surat: letter.nomor_surat,
    tanggal_masuk: letter.tanggal_masuk,
    tanggal_surat: letter.tanggal_surat,
    perihal: letter.perihal,
    file_url: letter.file_url,
    status: letter.status,
    penerima: {
      id: letter.penerima.id,
      nama: letter.penerima.nama,
      email: letter.penerima.email,
    },
    created_at: letter.createdAt,
    updated_at: letter.updatedAt,
  };
}
