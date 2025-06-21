import { User } from "@prisma/client";

export type UserResponse = {
  id: number;
  email_instansi: string;
  nama_instansi: string;
  role: string;
  token?: string;
  created_at: Date;
  updated_at?: Date;
  total_surat?: number;
};

export type CreateUserRequest = {
  email_instansi: string;
  nama_instansi: string;
  password: string;
  role?: string;
};

export type LoginUserRequest = {
  email_instansi: string;
  password: string;
};

export type UpdateUserRequest = {
  nama_instansi?: string;
  password?: string;
};

export enum UserRole {
  admin = "admin",
  user = "user",
}

export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    email_instansi: user.email_instansi,
    nama_instansi: user.nama_instansi,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}
