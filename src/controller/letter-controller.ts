import { Request, Response, NextFunction } from "express";
import {
  CreateLetterRequest,
  LetterListResponse,
  SingleLetterResponse,
  StatusUpdateResponse,
  UpdateLetterRequest,
  UpdateStatusRequest,
  DeleteLetterResponse,
} from "../model/letter-model";
import { LetterService } from "../service/letter-service";
import { UserRequest } from "../type/user-request";
import fs from "fs";

export class LetterController {
  static async create(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const request: CreateLetterRequest = {
        ...req.body,
        user_id: parseInt(req.body.user_id),
      };

      const response = await LetterService.create(request, req.file);
      res.status(200).json({ data: response });
    } catch (e) {
      next(e);
    }
  }

  static async get(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const nomorRegistrasi = parseInt(req.params.nomor_registrasi);
      const response = await LetterService.get(nomorRegistrasi);
      res.status(200).json({ data: response } as SingleLetterResponse);
    } catch (e) {
      next(e);
    }
  }

  static async update(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const nomorRegistrasi = parseInt(req.params.nomor_registrasi);
      const request: UpdateLetterRequest = {
        ...req.body,
        user_id: req.body.user_id ? parseInt(req.body.user_id) : undefined,
      };

      const response = await LetterService.update(
        nomorRegistrasi,
        request,
        req.file
      );
      res.status(200).json({ data: response } as SingleLetterResponse);
    } catch (e) {
      next(e);
    }
  }

  static async updateStatus(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const nomorRegistrasi = parseInt(req.params.nomor_registrasi);
      const request: UpdateStatusRequest = req.body;

      const response = await LetterService.updateStatus(
        nomorRegistrasi,
        request,
        req.user
      );
      res.status(200).json({
        data: {
          nomor_registrasi: response.nomor_registrasi,
          status: response.status,
          updated_at: response.updated_at,
        },
      } as StatusUpdateResponse);
    } catch (e) {
      next(e);
    }
  }

  static async delete(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const nomorRegistrasi = parseInt(req.params.nomor_registrasi);
      await LetterService.delete(nomorRegistrasi);
      res.status(200).json({ data: "OK" } as DeleteLetterResponse);
    } catch (e) {
      next(e);
    }
  }

  static async list(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const response = await LetterService.list();
      res.status(200).json({ data: response } as LetterListResponse);
    } catch (e) {
      next(e);
    }
  }

  static async listMyLetters(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const response = await LetterService.list(req.user.id);
      res.status(200).json({ data: response } as LetterListResponse);
    } catch (e) {
      next(e);
    }
  }

  static async download(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const nomorRegistrasi = parseInt(req.params.nomor_registrasi);

      const { filePath, fileName } = await LetterService.download(
        nomorRegistrasi,
        req.user!
      );

      res.setHeader("Access-Control-Allow-Origin", "http://localhost:3001");
      res.setHeader("Access-Control-Allow-Credentials", "true");

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );
      res.setHeader("Content-Type", "application/octet-stream");

      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    } catch (e) {
      next(e);
    }
  }
}
