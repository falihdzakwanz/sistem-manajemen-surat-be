import { prismaClient } from "../application/database";
import { AdminDashboardStats, UserDashboardStats } from "../type/dashboard-stats.type";

export class DashboardService {
  static async getAdminStats(): Promise<AdminDashboardStats> {
    const [totalSurat, totalUsers, recentLetters] = await Promise.all([
      prismaClient.letter.count(),
      prismaClient.user.count(),
      prismaClient.letter.findMany({
        take: 5,
        orderBy: { created_at: "desc" },
        include: {
          user: {
            select: {
              nama_instansi: true,
            },
          },
        },
      }),
    ]);

    return {
      totalSurat,
      totalUsers,
      recentLetters: recentLetters.map((letter) => ({
        id: letter.id,
        nomor_surat: letter.nomor_surat,
        perihal: letter.perihal,
        tanggal_surat: letter.tanggal_surat,
        status: letter.status,
        nama_instansi: letter.user.nama_instansi,
      })),
    };
  }

  static async getUserStats(userId: number): Promise<UserDashboardStats> {
    const [totalSurat, recentLetters] = await Promise.all([
      prismaClient.letter.count({
        where: { user_id: userId },
      }),
      prismaClient.letter.findMany({
        where: { user_id: userId },
        take: 5,
        orderBy: { created_at: "desc" },
        include: {
          user: {
            select: {
              nama_instansi: true,
            },
          },
        },
      }),
    ]);

    return {
      totalSurat,
      recentLetters: recentLetters.map((letter) => ({
        id: letter.id,
        nomor_surat: letter.nomor_surat,
        perihal: letter.perihal,
        tanggal_surat: letter.tanggal_surat,
        status: letter.status,
        nama_instansi: letter.user.nama_instansi,
      })),
    };
  }
}
