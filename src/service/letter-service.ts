import {
  CreateLetterRequest,
  LetterResponse,
  toLetterResponse,
  UpdateLetterRequest,
  UpdateStatusRequest,
} from "../model/letter-model";
import { Validation } from "../validation/validation";
import { LetterValidation } from "../validation/letter-validation";
import { prismaClient } from "../application/database";
import { ResponseError } from "../error/response-error";
import path from "path";
import fs from "fs";
import { User } from "@prisma/client";

export class LetterService {
  private static async validateUser(userId: number): Promise<User> {
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ResponseError(404, "User not found");
    }

    return user;
  }

  private static async saveFile(file: Express.Multer.File): Promise<string> {
    try {
      if (!file.path) {
        throw new ResponseError(400, "File path is missing");
      }

      if (!fs.existsSync(file.path)) {
        throw new ResponseError(500, "File was not saved correctly");
      }

      return path.relative(process.cwd(), file.path);
    } catch (error) {
      throw new ResponseError(500, `Failed to process file`);
    }
  }

  static async create(
    request: CreateLetterRequest,
    file?: Express.Multer.File
  ): Promise<LetterResponse> {
    const createRequest = Validation.validate(LetterValidation.CREATE, request);
    await this.validateUser(createRequest.user_id);

    if (!file) {
      throw new ResponseError(400, "File is required");
    }

    const filePath = await this.saveFile(file);

    const letter = await prismaClient.letter.create({
      data: {
        pengirim: createRequest.pengirim,
        nomor_surat: createRequest.nomor_surat,
        tanggal_masuk: createRequest.tanggal_masuk,
        tanggal_surat: createRequest.tanggal_surat,
        perihal: createRequest.perihal,
        user_id: createRequest.user_id,
        file_url: filePath,
        status: "pending",
      },
      include: { user: true },
    });

    return toLetterResponse(letter);
  }

  static async get(nomorRegistrasi: number): Promise<LetterResponse> {
    const letter = await prismaClient.letter.findUnique({
      where: { nomor_registrasi: nomorRegistrasi },
      include: { user: true },
    });

    if (!letter) {
      throw new ResponseError(404, "Letter not found");
    }

    return toLetterResponse(letter);
  }

  static async listByUserId(userId: number, page: number, limit: number) {
    const [letters, total] = await Promise.all([
      prismaClient.letter.findMany({
        where: { user_id: userId },
        skip: (page - 1) * limit,
        take: limit,
        include: { user: true },
        orderBy: { created_at: "desc" },
      }),
      prismaClient.letter.count({ where: { user_id: userId } }),
    ]);

    return {
      data: letters.map(toLetterResponse),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async update(
    nomorRegistrasi: number,
    request: UpdateLetterRequest,
    file?: Express.Multer.File
  ): Promise<LetterResponse> {
    const updateRequest = Validation.validate(LetterValidation.UPDATE, request);

    const existingLetter = await prismaClient.letter.findUnique({
      where: { nomor_registrasi: nomorRegistrasi },
    });

    if (!existingLetter) {
      throw new ResponseError(404, "Letter not found");
    }

    if (updateRequest.user_id) {
      await this.validateUser(updateRequest.user_id);
    }

    let filePath = existingLetter.file_url;
    if (file) {
      if (fs.existsSync(existingLetter.file_url)) {
        fs.unlinkSync(existingLetter.file_url);
      }
      filePath = await this.saveFile(file);
    }

    const updatedLetter = await prismaClient.letter.update({
      where: { nomor_registrasi: nomorRegistrasi },
      data: {
        ...updateRequest,
        tanggal_masuk: updateRequest.tanggal_masuk
          ? updateRequest.tanggal_masuk
          : undefined,
        tanggal_surat: updateRequest.tanggal_surat
          ? updateRequest.tanggal_surat
          : undefined,
        file_url: file ? filePath : undefined,
      },
      include: { user: true },
    });

    return toLetterResponse(updatedLetter);
  }

  static async updateStatus(
    nomorRegistrasi: number,
    request: UpdateStatusRequest,
    currentUser?: { id: number; role: string }
  ): Promise<LetterResponse> {
    const updateRequest = Validation.validate(
      LetterValidation.UPDATE_STATUS,
      request
    );

    const letter = await prismaClient.letter.findUnique({
      where: { nomor_registrasi: nomorRegistrasi },
      include: { user: true },
    });

    if (!letter) {
      throw new ResponseError(404, "Letter not found");
    }

    if (currentUser?.role !== "admin" && letter.user_id !== currentUser?.id) {
      throw new ResponseError(
        403,
        currentUser
          ? "You are not authorized to update this letter's status"
          : "Authentication required to update letter status"
      );
    }

    if (letter.status === "diterima" && updateRequest.status === "pending") {
      throw new ResponseError(
        400,
        "Cannot revert from 'diterima' to 'pending' status"
      );
    }

    const updatedLetter = await prismaClient.letter.update({
      where: { nomor_registrasi: nomorRegistrasi },
      data: {
        status: updateRequest.status,
        updated_at: new Date(),
      },
      include: { user: true },
    });

    return toLetterResponse(updatedLetter);
  }

  static async delete(nomorRegistrasi: number): Promise<void> {
    const letter = await prismaClient.letter.findUnique({
      where: { nomor_registrasi: nomorRegistrasi },
    });

    if (!letter) {
      throw new ResponseError(404, "Letter not found");
    }

    if (fs.existsSync(letter.file_url)) {
      fs.unlinkSync(letter.file_url);
    }

    await prismaClient.letter.delete({
      where: { nomor_registrasi: nomorRegistrasi },
    });
  }

  static async list(page = 1, limit?: number, month?: number, year?: number) {
    if (month !== undefined) {
      if (isNaN(month) || month < 1 || month > 12) {
        throw new ResponseError(400, "Month must be between 1-12");
      }
    }

    if (year !== undefined) {
      if (isNaN(year) || year < 2000 || year > 2100) {
        throw new ResponseError(400, "Year must be between 2000-2100");
      }
    }

    if (limit && (isNaN(limit) || limit <= 0)) {
      throw new ResponseError(400, "Limit must be a positive number");
    }

    const dateFilter =
      month && year
        ? {
            tanggal_masuk: {
              gte: new Date(year, month - 1, 1),
              lte: new Date(year, month, 0, 23, 59, 59, 999),
            },
          }
        : {};

    const [letters, total] = await Promise.all([
      prismaClient.letter.findMany({
        where: dateFilter,
        skip: limit ? (page - 1) * limit : undefined,
        take: limit,
        include: { user: true },
        orderBy: { tanggal_masuk: "desc" },
      }),
      prismaClient.letter.count({ where: dateFilter }),
    ]);

    return {
      data: letters.map(toLetterResponse),
      total,
      page,
      totalPages: limit ? Math.ceil(total / limit) : 1,
    };
  }

  static async listByUser(
    userId?: number,
    page = 1,
    limit?: number,
    month?: number,
    year?: number
  ) {
    if (!userId) {
      throw new ResponseError(401, "User not authenticated");
    }

    if (month !== undefined) {
      if (isNaN(month) || month < 1 || month > 12) {
        throw new ResponseError(400, "Month must be between 1-12");
      }
    }

    if (year !== undefined) {
      if (isNaN(year) || year < 2000 || year > 2100) {
        throw new ResponseError(400, "Year must be between 2000-2100");
      }
    }

    if (limit && (isNaN(limit) || limit <= 0)) {
      throw new ResponseError(400, "Limit must be a positive number");
    }

    const dateFilter =
      month && year
        ? {
            tanggal_masuk: {
              gte: new Date(year, month - 1, 1),
              lte: new Date(year, month, 0, 23, 59, 59, 999),
            },
          }
        : {};

    const [letters, total] = await Promise.all([
      prismaClient.letter.findMany({
        where: {
          user_id: userId,
          ...dateFilter,
        },
        skip: limit ? (page - 1) * limit : undefined,
        take: limit,
        include: { user: true },
        orderBy: { created_at: "desc" },
      }),
      prismaClient.letter.count({
        where: {
          user_id: userId,
          ...dateFilter,
        },
      }),
    ]);

    return {
      data: letters.map(toLetterResponse),
      total,
      page,
      totalPages: limit ? Math.ceil(total / limit) : 1,
    };
  }

  static async download(
    nomorRegistrasi: number,
    user: User
  ): Promise<{
    filePath: string;
    fileName: string;
  }> {
    const letter = await prismaClient.letter.findUnique({
      where: { nomor_registrasi: nomorRegistrasi },
      include: { user: true },
    });

    if (!letter) {
      throw new ResponseError(404, "Letter not found");
    }

    if (!fs.existsSync(letter.file_url)) {
      throw new ResponseError(404, "File not found");
    }

    if (letter.user.id !== user.id && user.role !== "admin") {
      throw new ResponseError(403, "Access denied");
    }

    const fileName = path.basename(letter.file_url);

    return { filePath: letter.file_url, fileName };
  }

  static async getMonthlyReport(bulan: number, tahun: number) {
    if (isNaN(bulan)) throw new ResponseError(400, "Bulan harus berupa angka");
    if (isNaN(tahun)) throw new ResponseError(400, "Tahun harus berupa angka");
    if (bulan < 1 || bulan > 12)
      throw new ResponseError(400, "Bulan harus antara 1-12");
    if (tahun < 2000 || tahun > 2100)
      throw new ResponseError(400, "Tahun tidak valid");

    const startDate = new Date(tahun, bulan - 1, 1);
    const endDate = new Date(tahun, bulan, 0, 23, 59, 59, 999);

    const letters = await prismaClient.letter.findMany({
      where: {
        tanggal_masuk: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        nomor_registrasi: true,
        tanggal_masuk: true,
        tanggal_surat: true,
        pengirim: true,
        perihal: true,
        status: true,
        user: {
          select: {
            nama_instansi: true,
          },
        },
      },
      orderBy: {
        tanggal_masuk: "asc",
      },
    });

    return {
      bulan: bulan,
      tahun: tahun,
      total: letters.length,
      periode: `${startDate.toLocaleDateString(
        "id-ID"
      )} s/d ${endDate.toLocaleDateString("id-ID")}`,
      surat: letters.map((l) => ({
        nomor_registrasi: l.nomor_registrasi,
        tanggal_masuk: l.tanggal_masuk,
        tanggal_surat: l.tanggal_surat,
        pengirim: l.pengirim,
        tujuan: l.user.nama_instansi,
        perihal: l.perihal,
        status: l.status,
      })),
    };
  }
}
