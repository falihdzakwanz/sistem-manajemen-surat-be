import { z } from "zod";

export class LetterValidation {
  static readonly CREATE = z.object({
    pengirim: z.string().min(1).max(100),
    nomor_surat: z.string().min(1).max(50),
    tanggal_masuk: z.string().regex(/^\d{2}-\d{2}-\d{4}$/, {
      message: "Date must be in DD-MM-YYYY format",
    }),
    tanggal_surat: z.string().regex(/^\d{2}-\d{2}-\d{4}$/, {
      message: "Date must be in DD-MM-YYYY format",
    }),
    perihal: z.string().min(1).max(255),
    user_id: z.number().positive(),
  });

  static readonly UPDATE = z.object({
    pengirim: z.string().min(1).max(100).optional(),
    nomor_surat: z.string().min(1).max(50).optional(),
    tanggal_masuk: z.string().regex(/^\d{2}-\d{2}-\d{4}$/, {
      message: "Date must be in DD-MM-YYYY format"
    }).optional(),
    tanggal_surat: z.string().regex(/^\d{2}-\d{2}-\d{4}$/, {
      message: "Date must be in DD-MM-YYYY format"
    }).optional(),
    perihal: z.string().min(1).max(255).optional(),
    user_id: z.number().positive().optional(),
  });

  static readonly UPDATE_STATUS = z.object({
    status: z.enum(["pending", "diterima"]),
  });
}
