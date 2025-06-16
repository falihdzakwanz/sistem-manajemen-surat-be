import { z } from "zod";

export class LetterValidation {
  static readonly CREATE = z.object({
    pengirim: z.string().min(1).max(100),
    tujuan: z.string().min(1).max(100),
    nomor_surat: z.string().min(1).max(50),
    tanggal_masuk: z.string().min(1),
    tanggal_surat: z.string().min(1),
    perihal: z.string().min(1).max(255),
    penerima_id: z.number().positive(),
  });

  static readonly UPDATE = z.object({
    pengirim: z.string().min(1).max(100).optional(),
    tujuan: z.string().min(1).max(100).optional(),
    nomor_surat: z.string().min(1).max(50).optional(),
    tanggal_masuk: z.string().min(1).optional(),
    tanggal_surat: z.string().min(1).optional(),
    perihal: z.string().min(1).max(255).optional(),
    penerima_id: z.number().positive().optional(),
  });

  static readonly UPDATE_STATUS = z.object({
    status: z.enum(["pending", "diterima", "ditolak"]),
  });
}
