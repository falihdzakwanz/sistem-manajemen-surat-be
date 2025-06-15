import { prismaClient } from "../src/application/database";
import bcrypt from "bcrypt";
import { User, Receiver, Letter } from "@prisma/client";
import { v4 as uuid } from "uuid";
import path from "path";

export class UserTest {
  static async delete() {
    await prismaClient.user.deleteMany({
      where: {
        username: "test",
      },
    });
  }

  static async create() {
    await prismaClient.user.create({
      data: {
        username: "test",
        name: "test",
        password: await bcrypt.hash("test", 10),
        token: "test",
      },
    });
  }

  static async get(): Promise<User> {
    const user = await prismaClient.user.findFirst({
      where: {
        username: "test",
      },
    });

    if (!user) {
      throw new Error("User is not found");
    }

    return user;
  }
}
export class ReceiverTest {
  static async deleteAll() {
    await prismaClient.receiver.deleteMany();
  }

  static async create(data?: Partial<Receiver>): Promise<Receiver> {
    return await prismaClient.receiver.create({
      data: {
        nama: data?.nama || "Test Receiver",
        email:
          data?.email ||
          `test${Math.random().toString(36).substring(2, 8)}@example.com`,
        ...data,
      },
    });
  }

  static async get(id: number): Promise<Receiver | null> {
    return await prismaClient.receiver.findUnique({
      where: {
        id: id,
      },
    });
  }
}
export class LetterTest {
  static async deleteAll() {
    await prismaClient.letter.deleteMany();
  }

  static async create(
    receiverId: number,
    data?: Partial<Letter>
  ): Promise<Letter> {
    const fileName = data?.file_url || `test-${uuid()}.pdf`;
    const filePath = path.join("uploads", fileName);

    return await prismaClient.letter.create({
      data: {
        pengirim: data?.pengirim || "Test Sender",
        tujuan: data?.tujuan || "Test Purpose",
        nomor_surat: data?.nomor_surat || "001/2023",
        tanggal_masuk: data?.tanggal_masuk || new Date(),
        tanggal_surat: data?.tanggal_surat || new Date(),
        perihal: data?.perihal || "Test Subject",
        file_url: filePath,
        status: data?.status || "pending",
        penerima_id: receiverId,
      },
    });
  }

  static async get(id: number): Promise<Letter | null> {
    return await prismaClient.letter.findUnique({
      where: { id },
    });
  }

  static async createReceiver(): Promise<Receiver> {
    return await prismaClient.receiver.create({
      data: {
        nama: "Test Receiver",
        email: `test-${uuid()}@example.com`,
      },
    });
  }

  static async createWithReceiver(data?: Partial<Letter>): Promise<{
    letter: Letter;
    receiver: Receiver;
  }> {
    const receiver = await this.createReceiver();
    const letter = await this.create(receiver.id, data);

    return { letter, receiver };
  }
}
