import { Receiver } from "@prisma/client";

export type ReceiverResponse = {
  id: number;
  nama: string;
  email: string;
  created_at: Date;
  updated_at: Date;
};

export type CreateReceiverRequest = {
  nama: string;
  email: string;
};

export type UpdateReceiverRequest = {
  nama?: string;
  email?: string;
};

export type ReceiverWithLetters = ReceiverResponse & {
  total_surat?: number;
  surat_terakhir?: Date | null;
};

export function toReceiverResponse(receiver: Receiver): ReceiverResponse {
  return {
    id: receiver.id,
    nama: receiver.nama,
    email: receiver.email,
    created_at: receiver.createdAt,
    updated_at: receiver.updatedAt,
  };
}
