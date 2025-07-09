import { prismaClient } from "../src/application/database";
import bcrypt from "bcrypt";
import { User, Letter } from "@prisma/client";
import { v4 as uuid } from "uuid";
import path from "path";
import fs from "fs";
export class UserTest {
  static async deleteAll() {
    await prismaClient.letter.deleteMany();
    await prismaClient.user.deleteMany();
  }

  static async create(data?: {
    email_instansi: string;
    nama_instansi: string;
    password: string;
    role?: "admin" | "user";
  }) {
    const userData = data || {
      email_instansi: "test@instansi.go.id",
      nama_instansi: "Test Instansi",
      password: "testpassword123",
    };

    return await prismaClient.user.create({
      data: {
        email_instansi: userData.email_instansi,
        nama_instansi: userData.nama_instansi,
        password: await bcrypt.hash(userData.password, 10),
        role: userData.role || "user",
        token: uuid(),
      },
    });
  }

  static async getUser(email: string): Promise<User> {
    const user = await prismaClient.user.findUnique({
      where: { email_instansi: email },
    });

    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }

    return user;
  }

  static async getToken(email: string): Promise<string> {
    const user = await this.getUser(email);
    if (!user.token) {
      throw new Error(`User ${email} has no token`);
    }
    return user.token;
  }

  static async listUsers(): Promise<User[]> {
    return await prismaClient.user.findMany();
  }

  static async createAdminToken(): Promise<string> {
    const admin = await prismaClient.user.create({
      data: {
        email_instansi: "admin@test.go.id",
        nama_instansi: "Admin",
        password: await bcrypt.hash("admin123", 10),
        role: "admin",
        token: uuid(),
      },
    });
    return admin.token!;
  }

  static async createLetterForUser(userId: number): Promise<Letter> {
    return await prismaClient.letter.create({
      data: {
        pengirim: "Test Sender",
        nomor_surat: "001/2023",
        tanggal_masuk: new Date("2023-01-01"),
        tanggal_surat: new Date("2023-01-01"),
        perihal: "Test Letter",
        file_url: "/test/test.pdf",
        status: "pending",
        user_id: userId,
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
    switch (type) {
      case "pdf":
        return Buffer.from(
          "%PDF-1.0\n1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n"
        );
      case "docx":
        return Buffer.from(
          "PK\x03\x04\x14\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00"
        );
      case "txt":
        return Buffer.from(
          "This is a test text file content.\nSecond line of text."
        );
      default:
        throw new Error(`Unsupported file type: ${type}`);
    }
  }

  static getLargeFile(): Buffer {
    return Buffer.alloc(11 * 1024 * 1024, "x");
  }

  static async create(userId: number, data?: Partial<Letter>): Promise<Letter> {
    const fileName = data?.file_url || `test-${uuid()}.pdf`;
    const filePath = path.join("uploads", fileName);

    if (!fs.existsSync("uploads")) {
      fs.mkdirSync("uploads");
    }

    fs.writeFileSync(filePath, this.getTestFile());

    return await prismaClient.letter.create({
      data: {
        pengirim: data?.pengirim || "Kementerian Test",
        nomor_surat: data?.nomor_surat || "001/2023",
        tanggal_masuk: data?.tanggal_masuk || new Date("2023-01-01"),
        tanggal_surat: data?.tanggal_surat || new Date("2023-01-01"),
        perihal: data?.perihal || "Surat Test",
        file_url: filePath,
        status: data?.status || "pending",
        user_id: userId,
      },
      include: { user: true },
    });
  }

  static async get(id: number): Promise<Letter | null> {
    return await prismaClient.letter.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  static async createWithUser(data?: Partial<Letter>): Promise<{
    letter: Letter;
    user: User;
  }> {
    const user = await prismaClient.user.create({
      data: {
        email_instansi: `test-${uuid()}@example.com`,
        nama_instansi: "Test User",
        password: "testpassword",
        role: "user",
      },
    });

    const letter = await this.create(user.id, data);
    return { letter, user };
  }
}
