import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "10");

async function initUsers() {
  const usersToCreate = [
    {
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      name: "Dinas Komunikasi dan Informatika Bandar Lampung",
      role: "admin",
    },
    {
      email: process.env.USER_EMAIL,
      password: process.env.USER_PASSWORD,
      name: "Dinas Pendidikan Bandar Lampung",
      role: "user",
    },
  ];

  try {
    console.log("⏳ Memulai inisialisasi user...");

    for (const userData of usersToCreate) {
      if (!userData.email || !userData.password) {
        throw new Error(
          `Email atau password untuk ${userData.name} tidak ditemukan di .env`
        );
      }

      const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);

      await prisma.user.upsert({
        where: { email_instansi: userData.email },
        update: {
          password: hashedPassword,
          nama_instansi: userData.name,
          role: userData.role as UserRole,
        },
        create: {
          email_instansi: userData.email,
          password: hashedPassword,
          nama_instansi: userData.name,
          role: userData.role as UserRole,
        },
      });

      console.log(
        `✅ Berhasil membuat/mengupdate akun: ${userData.name} (${userData.role})`
      );
    }

    console.log("🎉 Inisialisasi user selesai!");
    console.log("----------------------------------------");
    console.log(`Admin: ${usersToCreate[0].name}`);
    console.log(`Email: ${process.env.ADMIN_EMAIL}`);
    console.log("----------------------------------------");
    console.log(`User: ${usersToCreate[1].name}`);
    console.log(`Email: ${process.env.USER_EMAIL}`);
    console.log("----------------------------------------");
  } catch (error) {
    console.error("❌ Gagal inisialisasi user:");
    console.error(error instanceof Error ? error.message : error);

    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  initUsers();
}

export { initUsers };
