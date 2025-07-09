import { Letter, User } from "@prisma/client";

export type LetterResponse = {
  id: number;
  nomor_registrasi: number;
  pengirim: string;
  nomor_surat: string;
  tanggal_masuk: Date; 
  tanggal_surat: Date; 
  perihal: string;
  file_url: string;
  status: "pending" | "diterima";
  user: {
    id: number;
    nama_instansi: string;
    email_instansi: string;
  };
  created_at: Date;
  updated_at: Date;
};

export type CreateLetterRequest = {
  pengirim: string;
  tujuan: string;
  nomor_surat: string;
  tanggal_masuk: Date; 
  tanggal_surat: Date; 
  perihal: string;
  user_id: number;
  file?: File;
};

export type UpdateLetterRequest = {
  pengirim?: string;
  tujuan?: string;
  nomor_surat?: string;
  tanggal_masuk?: Date; 
  tanggal_surat?: Date; 
  perihal?: string;
  user_id?: number;
  file?: File;
};

export type UpdateStatusRequest = {
  status: "pending" | "diterima";
};

export function toLetterResponse(
  letter: Letter & { user: User }
): LetterResponse {
  return {
    id: letter.id,
    nomor_registrasi: letter.nomor_registrasi,
    pengirim: letter.pengirim,
    nomor_surat: letter.nomor_surat,
    tanggal_masuk: letter.tanggal_masuk,
    tanggal_surat: letter.tanggal_surat,
    perihal: letter.perihal,
    file_url: letter.file_url,
    status: letter.status as "pending" | "diterima",
    user: {
      id: letter.user.id,
      nama_instansi: letter.user.nama_instansi,
      email_instansi: letter.user.email_instansi,
    },
    created_at: letter.created_at,
    updated_at: letter.updated_at,
  };
}

export type LetterListResponse = {
  data: LetterResponse[];
};

export type SingleLetterResponse = {
  data: LetterResponse;
};

export type StatusUpdateResponse = {
  data: {
    nomor_registrasi: number;
    status: "pending" | "diterima";
    updated_at: Date;
  };
};

export type DeleteLetterResponse = {
  data: string;
};

export type ErrorResponse = {
  errors: string;
};
