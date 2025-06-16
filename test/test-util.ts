import { prismaClient } from "../src/application/database";
import bcrypt from "bcrypt";
import { User, Receiver, Letter } from "@prisma/client";
import { v4 as uuid } from "uuid";
import path from "path";
import fs from "fs";
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

  static async cleanupFiles() {
    const uploadDir = path.join(process.cwd(), "uploads");

    if (!fs.existsSync(uploadDir)) {
      return;
    }

    const files = fs.readdirSync(uploadDir);

    for (const file of files) {
      const filePath = path.join(uploadDir, file);
      try {
        if (
          file.endsWith(".pdf") ||
          file.endsWith(".docx") ||
          file.endsWith(".txt")
        ) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.error(`Failed to delete ${filePath}:`, err);
      }
    }
  }
  static getTestFile(type: "pdf" | "docx" | "txt" = "pdf"): Buffer {
    // Generate minimal valid files for testing
    switch (type) {
      case "pdf":
        // Minimal PDF file
        return Buffer.from(
          "%PDF-1.0\n1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n"
        );
      case "docx":
        // Minimal DOCX file (ZIP header)
        return Buffer.from(
          "PK\x03\x04\x14\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00"
        );
      case "txt":
        // Simple text file
        return Buffer.from(
          "This is a test text file content.\nSecond line of text."
        );
      default:
        throw new Error(`Unsupported file type: ${type}`);
    }
  }

  static getLargeFile(): Buffer {
    // Generate a 11MB buffer for size testing
    return Buffer.alloc(11 * 1024 * 1024, "x");
  }

  static async create(
    receiverId: number,
    data?: Partial<Letter>
  ): Promise<Letter> {
    const fileName = data?.file_url || `test-${uuid()}.pdf`;
    const filePath = path.join("uploads", fileName);

    if (!fs.existsSync("uploads")) {
      fs.mkdirSync("uploads");
    }

    fs.writeFileSync(filePath, this.getTestFile());

    return await prismaClient.letter.create({
      data: {
        pengirim: data?.pengirim || "Kementerian Test",
        tujuan: data?.tujuan || "Dinas Test",
        nomor_surat: data?.nomor_surat || "001/2023",
        tanggal_masuk: data?.tanggal_masuk || new Date(),
        tanggal_surat: data?.tanggal_surat || new Date(),
        perihal: data?.perihal || "Surat Test",
        file_url: filePath,
        status: data?.status || "pending",
        penerima_id: receiverId,
      },
    });
  }

  static async get(id: number): Promise<Letter | null> {
    return await prismaClient.letter.findUnique({
      where: { id },
      include: { penerima: true },
    });
  }

  static async createWithReceiver(data?: Partial<Letter>): Promise<{
    letter: Letter;
    receiver: Receiver;
  }> {
    const receiver = await prismaClient.receiver.create({
      data: {
        nama: "Test Receiver",
        email: `test-${uuid()}@example.com`,
      },
    });

    const letter = await this.create(receiver.id, data);
    return { letter, receiver };
  }
}
