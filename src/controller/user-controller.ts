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
  // Register (Admin only)
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

  // Login
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

  // Get Current User
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

  // Update Current User
  static async update(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ) {
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

  // Admin: List All Users
  static async list(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const { users, total } = await UserService.listUsers();
      res.status(200).json({
        data: users.map((user) => ({
          id: user.id,
          email_instansi: user.email_instansi,
          nama_instansi: user.nama_instansi,
          role: user.role,
          total_surat: user.total_surat, // Now comes directly from service
          created_at: user.created_at,
        })),
        meta: {
          total,
          page: 1,
          pageSize: users.length,
          totalPages: Math.ceil(total / 10), // Assuming default page size 10
        },
      });
    } catch (e) {
      next(e);
    }
  }

  // Admin: Delete User
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

  // Logout
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
