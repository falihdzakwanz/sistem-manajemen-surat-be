import { Request, Response, NextFunction } from "express";
import {
  CreateUserRequest,
  LoginUserRequest,
  UpdateUserRequest,
  UserResponse,
} from "../model/user-model";
import { UserService } from "../service/user-service";
import { UserRequest } from "../type/user-request";

export class UserController {

  static async register(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const request: CreateUserRequest = req.body;
      const response = await UserService.register(request);
      res.status(201).json({
        data: {
          id: response.id,
          email_instansi: response.email_instansi,
          nama_instansi: response.nama_instansi,
          role: response.role,
          created_at: response.created_at,
        },
      });
    } catch (e) {
      next(e);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const request: LoginUserRequest = req.body;
      const { token, user } = await UserService.login(request);
      res.status(200).json({
        data: {
          token,
          user: {
            id: user.id,
            email_instansi: user.email_instansi,
            nama_instansi: user.nama_instansi,
            role: user.role,
          },
        },
      });
    } catch (e) {
      next(e);
    }
  }
  static async get(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      res.status(200).json({
        data: {
          id: user.id,
          email_instansi: user.email_instansi,
          nama_instansi: user.nama_instansi,
          role: user.role,
          created_at: user.created_at,
        },
      });
    } catch (e) {
      next(e);
    }
  }

  static async getById(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const response = await UserService.getById(id);

      res.status(200).json({
        data: {
          id: response.id,
          email_instansi: response.email_instansi,
          nama_instansi: response.nama_instansi,
          role: response.role,
          created_at: response.created_at,
          total_surat: response.total_surat,
        },
      });
    } catch (e) {
      next(e);
    }
  }

  static async update(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const request: UpdateUserRequest = req.body;
      const response = await UserService.updateCurrent(req.user!, request);
      res.status(200).json({
        data: {
          email_instansi: response.email_instansi,
          nama_instansi: response.nama_instansi,
        },
      });
    } catch (e) {
      next(e);
    }
  }

  static async updateById(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const request: UpdateUserRequest = req.body;
      const response = await UserService.updateById(id, request);

      res.status(200).json({
        data: {
          email_instansi: response.email_instansi,
          nama_instansi: response.nama_instansi,
        },
      });
    } catch (e) {
      next(e);
    }
  }

  static async list(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;

      const result = await UserService.listUsers(page, pageSize);

      res.status(200).json({
        data: result.data,
        meta: result.meta,
      });
    } catch (e) {
      next(e);
    }
  }

  static async delete(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await UserService.deleteUser(id);
      res.status(200).json({
        data: "OK",
      });
    } catch (e) {
      next(e);
    }
  }

  static async logout(req: UserRequest, res: Response, next: NextFunction) {
    try {
      await UserService.logout(req.user!);
      res.status(200).json({
        data: "OK",
      });
    } catch (e) {
      next(e);
    }
  }
}
