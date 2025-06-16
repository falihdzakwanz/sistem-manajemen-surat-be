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
import { Receiver } from "@prisma/client";

export class LetterService {
  private static async validateReceiver(receiverId: number): Promise<Receiver> {
    const receiver = await prismaClient.receiver.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      throw new ResponseError(404, "Receiver not found");
    }

    return receiver;
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
    await this.validateReceiver(createRequest.penerima_id);
    
    if (!file) {
      throw new ResponseError(400, "File is required");
    }

    const filePath = await this.saveFile(file);
    const letter = await prismaClient.letter.create({
      data: {
        pengirim: createRequest.pengirim,
        tujuan: createRequest.tujuan,
        nomor_surat: createRequest.nomor_surat,
        tanggal_masuk: new Date(createRequest.tanggal_masuk),
        tanggal_surat: new Date(createRequest.tanggal_surat),
        perihal: createRequest.perihal,
        penerima_id: createRequest.penerima_id,
        file_url: filePath,
        status: "pending",
      },
      include: { penerima: true },
    });

    return toLetterResponse(letter);
  }

  static async get(nomorRegistrasi: number): Promise<LetterResponse> {
    const letter = await prismaClient.letter.findUnique({
      where: { nomor_registrasi: nomorRegistrasi },
      include: { penerima: true },
    });

    if (!letter) {
      throw new ResponseError(404, "Letter not found");
    }

    return toLetterResponse(letter);
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

    if (updateRequest.penerima_id) {
      await this.validateReceiver(updateRequest.penerima_id);
    }

    let filePath = existingLetter.file_url;
    if (file) {
      // Delete old file
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
          ? new Date(updateRequest.tanggal_masuk)
          : undefined,
        tanggal_surat: updateRequest.tanggal_surat
          ? new Date(updateRequest.tanggal_surat)
          : undefined,
        file_url: file ? filePath : undefined,
      },
      include: { penerima: true },
    });

    return toLetterResponse(updatedLetter);
  }

  static async updateStatus(
    nomorRegistrasi: number,
    request: UpdateStatusRequest
  ): Promise<LetterResponse> {
    const updateRequest = Validation.validate(
      LetterValidation.UPDATE_STATUS,
      request
    );

    const letter = await prismaClient.letter.update({
      where: { nomor_registrasi: nomorRegistrasi },
      data: { status: updateRequest.status },
      include: { penerima: true },
    });

    if (!letter) {
      throw new ResponseError(404, "Letter not found");
    }

    return toLetterResponse(letter);
  }

  static async delete(nomorRegistrasi: number): Promise<void> {
    const letter = await prismaClient.letter.findUnique({
      where: { nomor_registrasi: nomorRegistrasi },
    });

    if (!letter) {
      throw new ResponseError(404, "Letter not found");
    }

    // Delete file
    if (fs.existsSync(letter.file_url)) {
      fs.unlinkSync(letter.file_url);
    }

    await prismaClient.letter.delete({
      where: { nomor_registrasi: nomorRegistrasi },
    });
  }

  static async list(): Promise<LetterResponse[]> {
    const letters = await prismaClient.letter.findMany({
      include: { penerima: true },
      orderBy: { createdAt: "desc" },
    });

    return letters.map(toLetterResponse);
  }

  static async download(nomorRegistrasi: number): Promise<{
    filePath: string;
    fileName: string;
  }> {
    const letter = await prismaClient.letter.findUnique({
      where: { nomor_registrasi: nomorRegistrasi },
    });

    if (!letter) {
      throw new ResponseError(404, "Letter not found");
    }

    if (!fs.existsSync(letter.file_url)) {
      throw new ResponseError(404, "File not found");
    }

    const fileName = path.basename(letter.file_url);
    return { filePath: letter.file_url, fileName };
  }
}
