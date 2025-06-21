import { z } from "zod";
import { UserRole } from "@prisma/client";

export class UserValidation {
  static readonly REGISTER = z.object({
    email_instansi: z
      .string()
      .email()
      .max(255)
      .transform((val) => val.toLowerCase()),
    password: z.string().min(6).max(255),
    nama_instansi: z.string().min(3).max(255),
    role: z.nativeEnum(UserRole).default(UserRole.user),
  });

  static readonly LOGIN = z.object({
    email_instansi: z.string().email().max(255),
    password: z.string().min(1).max(255),
  });

  static readonly UPDATE = z.object({
    nama_instansi: z.string().min(3).max(255).optional(),
    password: z.string().min(6).max(255).optional(),
  });

  static readonly LIST = z
    .object({
      page: z.number().int().positive().default(1),
      pageSize: z.number().int().positive().max(100).default(10),
    })
    .partial();
}
