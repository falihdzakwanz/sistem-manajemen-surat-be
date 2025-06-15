import { Response, NextFunction } from "express";
import {
  CreateReceiverRequest,
  UpdateReceiverRequest,
} from "../model/receiver-model";
import { ReceiverService } from "../service/receiver-service";
import { UserRequest } from "../type/user-request";

export class ReceiverController {
  static async create(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const request: CreateReceiverRequest = req.body;
      const response = await ReceiverService.create(request);
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  static async update(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const request: UpdateReceiverRequest = req.body;
      const id = Number(req.params.id);
      const response = await ReceiverService.update(id, request);
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  static async delete(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await ReceiverService.delete(id);
      res.status(200).json({
        data: "OK",
        message: "Receiver deleted successfully",
      });
    } catch (e) {
      next(e);
    }
  }

  static async get(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const response = await ReceiverService.get(id);
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  static async list(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const response = await ReceiverService.list();
      res.status(200).json({
        data: response,
        meta: {
          total: response.length,
          page: 1,
        },
      });
    } catch (e) {
      next(e);
    }
  }
}
