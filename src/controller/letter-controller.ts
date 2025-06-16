import { Request, Response, NextFunction } from "express";
import {
  CreateLetterRequest,
  UpdateLetterRequest,
  UpdateStatusRequest,
} from "../model/letter-model";
import { LetterService } from "../service/letter-service";
import { UserRequest } from "../type/user-request";

export class LetterController {
  static async create(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const request: CreateLetterRequest = {
        ...req.body,
        penerima_id: parseInt(req.body.penerima_id),
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
      res.status(200).json({ data: response });
    } catch (e) {
      next(e);
    }
  }

  static async update(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const nomorRegistrasi = parseInt(req.params.nomor_registrasi);
      const request: UpdateLetterRequest = {
        ...req.body,
        penerima_id: req.body.penerima_id
          ? parseInt(req.body.penerima_id)
          : undefined,
      };

      const response = await LetterService.update(
        nomorRegistrasi,
        request,
        req.file
      );
      res.status(200).json({ data: response });
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
        request
      );
      res.status(200).json({ data: response });
    } catch (e) {
      next(e);
    }
  }

  static async delete(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const nomorRegistrasi = parseInt(req.params.nomor_registrasi);
      await LetterService.delete(nomorRegistrasi);
      res.status(200).json({ data: "OK" });
    } catch (e) {
      next(e);
    }
  }

  static async list(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const response = await LetterService.list();
      res.status(200).json({ data: response });
    } catch (e) {
      next(e);
    }
  }

  static async download(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const nomorRegistrasi = parseInt(req.params.nomor_registrasi);
      const { filePath, fileName } = await LetterService.download(
        nomorRegistrasi
      );

      res.download(filePath, fileName, (err) => {
        if (err) {
          next(err);
        }
      });
    } catch (e) {
      next(e);
    }
  }
}
