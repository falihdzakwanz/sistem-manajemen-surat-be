import { z } from "zod";

export class LetterValidation {
  static readonly CREATE = z.object({
    pengirim: z.string().min(1).max(100),
    nomor_surat: z.string().min(1).max(50),
    tanggal_masuk: z.coerce.date(),
    tanggal_surat: z.coerce.date(),
    perihal: z.string().min(1),
    user_id: z.number().positive(),
  });

  static readonly UPDATE = z.object({
    pengirim: z.string().min(1).max(100).optional(),
    nomor_surat: z.string().min(1).max(50).optional(),
    tanggal_masuk: z.coerce.date().optional(), 
    tanggal_surat: z.coerce.date().optional(), 
    perihal: z.string().min(1).optional(),
    user_id: z.number().positive().optional(),
  });

  static readonly UPDATE_STATUS = z.object({
    status: z.enum(["pending", "diterima"]),
  });
}