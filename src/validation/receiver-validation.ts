import { z, ZodType } from "zod";

export class ReceiverValidation {
  static readonly CREATE: ZodType = z.object({
    nama: z.string().min(1).max(100),
    email: z.string().email().max(100),
  });

  static readonly UPDATE: ZodType = z.object({
    nama: z.string().min(1).max(100).optional(),
    email: z.string().email().max(100).optional(),
  });
}
