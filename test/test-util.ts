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
        token: uuid()
      }
    });
    return admin.token!;
  }

  static async createLetterForUser(userId: number): Promise<Letter> {
    return await prismaClient.letter.create({
      data: {
        nomor_registrasi: Math.floor(Math.random() * 10000),
        pengirim: "Test Sender",
        tujuan: "Test Receiver",
        nomor_surat: "001/2023",
        tanggal_masuk: "01-01-2023",
        tanggal_surat: "01-01-2023",
        perihal: "Test Letter",
        file_url: "/test/test.pdf",
        status: "pending",
        user_id: userId,
      },
    });
  }
}

// export class LetterTest {
//   static async deleteAll() {
//     await prismaClient.letter.deleteMany();
//   }

//   static async cleanupFiles() {
//     const uploadDir = path.join(process.cwd(), "uploads");

//     if (!fs.existsSync(uploadDir)) {
//       return;
//     }

//     const files = fs.readdirSync(uploadDir);

//     for (const file of files) {
//       const filePath = path.join(uploadDir, file);
//       try {
//         if (
//           file.endsWith(".pdf") ||
//           file.endsWith(".docx") ||
//           file.endsWith(".txt")
//         ) {
//           fs.unlinkSync(filePath);
//         }
//       } catch (err) {
//         console.error(`Failed to delete ${filePath}:`, err);
//       }
//     }
//   }
//   static getTestFile(type: "pdf" | "docx" | "txt" = "pdf"): Buffer {
//     // Generate minimal valid files for testing
//     switch (type) {
//       case "pdf":
//         // Minimal PDF file
//         return Buffer.from(
//           "%PDF-1.0\n1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n"
//         );
//       case "docx":
//         // Minimal DOCX file (ZIP header)
//         return Buffer.from(
//           "PK\x03\x04\x14\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00"
//         );
//       case "txt":
//         // Simple text file
//         return Buffer.from(
//           "This is a test text file content.\nSecond line of text."
//         );
//       default:
//         throw new Error(`Unsupported file type: ${type}`);
//     }
//   }

//   static getLargeFile(): Buffer {
//     // Generate a 11MB buffer for size testing
//     return Buffer.alloc(11 * 1024 * 1024, "x");
//   }

//   static async create(
//     receiverId: number,
//     data?: Partial<Letter>
//   ): Promise<Letter> {
//     const fileName = data?.file_url || `test-${uuid()}.pdf`;
//     const filePath = path.join("uploads", fileName);

//     if (!fs.existsSync("uploads")) {
//       fs.mkdirSync("uploads");
//     }

//     fs.writeFileSync(filePath, this.getTestFile());

//     return await prismaClient.letter.create({
//       data: {
//         pengirim: data?.pengirim || "Kementerian Test",
//         tujuan: data?.tujuan || "Dinas Test",
//         nomor_surat: data?.nomor_surat || "001/2023",
//         tanggal_masuk: data?.tanggal_masuk || new Date(),
//         tanggal_surat: data?.tanggal_surat || new Date(),
//         perihal: data?.perihal || "Surat Test",
//         file_url: filePath,
//         status: data?.status || "pending",
//         penerima_id: receiverId,
//       },
//     });
//   }

//   static async get(id: number): Promise<Letter | null> {
//     return await prismaClient.letter.findUnique({
//       where: { id },
//       include: { penerima: true },
//     });
//   }

//   static async createWithReceiver(data?: Partial<Letter>): Promise<{
//     letter: Letter;
//     receiver: Receiver;
//   }> {
//     const receiver = await prismaClient.receiver.create({
//       data: {
//         nama: "Test Receiver",
//         email: `test-${uuid()}@example.com`,
//       },
//     });

//     const letter = await this.create(receiver.id, data);
//     return { letter, receiver };
//   }
// }
