export interface DashboardStat {
  id: number;
  nomor_surat: string;
  perihal: string;
  tanggal_surat: Date;
  status: string;
  nama_instansi: string;
}

export interface AdminDashboardStats {
  totalSurat: number;
  totalUsers: number;
  recentLetters: DashboardStat[];
}

export interface UserDashboardStats {
  totalSurat: number;
  recentLetters: DashboardStat[];
}
