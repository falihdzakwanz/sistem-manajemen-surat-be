import {
  CreateUserRequest,
  LoginUserRequest,
  UpdateUserRequest,
  UserResponse,
  toUserResponse,
} from "../model/user-model";
import { Validation } from "../validation/validation";
import { UserValidation } from "../validation/user-validation";
import { prismaClient } from "../application/database";
import { ResponseError } from "../error/response-error";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import { User, UserRole } from "@prisma/client";

export class UserService {
  static async register(request: CreateUserRequest): Promise<UserResponse> {
    const registerRequest = Validation.validate(
      UserValidation.REGISTER,
      request
    );

    const emailExists = await prismaClient.user.count({
      where: { email_instansi: registerRequest.email_instansi },
    });

    if (emailExists !== 0) {
      throw new ResponseError(400, "Email already registered");
    }

    const hashedPassword = await bcrypt.hash(registerRequest.password, 10);

    const user = await prismaClient.user.create({
      data: {
        email_instansi: registerRequest.email_instansi,
        password: hashedPassword,
        nama_instansi: registerRequest.nama_instansi,
        role: registerRequest.role as UserRole,
      },
    });

    return toUserResponse(user);
  }

  static async login(
    request: LoginUserRequest
  ): Promise<{ token: string; user: UserResponse }> {
    const loginRequest = Validation.validate(UserValidation.LOGIN, request);

    let user = await prismaClient.user.findUnique({
      where: {
        email_instansi: loginRequest.email_instansi,
      },
    });

    if (!user) {
      throw new ResponseError(401, "Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(
      loginRequest.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new ResponseError(401, "Invalid credentials");
    }

    const token = uuid();
    user = await prismaClient.user.update({
      where: {
        id: user.id,
      },
      data: {
        token,
      },
    });

    return {
      token,
      user: toUserResponse(user),
    };
  }

  static async getCurrent(user: User): Promise<UserResponse> {
    const total_surat = await prismaClient.letter.count({
      where: { user_id: user.id },
    });

    return {
      ...toUserResponse(user),
      total_surat,
    };
  }

  static async updateCurrent(
    user: User,
    request: UpdateUserRequest
  ): Promise<UserResponse> {
    const updateRequest = Validation.validate(UserValidation.UPDATE, request);

    if (updateRequest.nama_instansi) {
      user.nama_instansi = updateRequest.nama_instansi;
    }

    if (updateRequest.password) {
      user.password = await bcrypt.hash(updateRequest.password, 10);
    }

    const result = await prismaClient.user.update({
      where: {
        id: user.id,
      },
      data: user,
    });

    return toUserResponse(result);
  }

  static async logout(user: User): Promise<void> {
    await prismaClient.user.update({
      where: {
        id: user.id,
      },
      data: {
        token: null,
      },
    });
  }

  static async listUsers(
    page: number = 1,
    pageSize: number = 10
  ): Promise<{
    data: Array<UserResponse & { total_surat: number }>;
    meta: {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
  }> {
    const [users, total] = await Promise.all([
      prismaClient.user.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          _count: {
            select: { letters: true },
          },
        },
        orderBy: { created_at: "desc" },
      }),
      prismaClient.user.count(),
    ]);

    return {
      data: users.map((user) => ({
        id: user.id,
        email_instansi: user.email_instansi,
        nama_instansi: user.nama_instansi,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at,
        total_surat: user._count.letters,
      })),
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  static async deleteUser(id: number): Promise<void> {
    const user = await prismaClient.user.findUnique({
      where: { id },
      include: { _count: { select: { letters: true } } },
    });

    if (!user) {
      throw new ResponseError(404, "User not found");
    }

    if (user._count.letters > 0) {
      throw new ResponseError(
        400,
        `Cannot delete user: ${user._count.letters} letters are assigned`
      );
    }

    await prismaClient.user.delete({
      where: { id },
    });
  }

  static async getById(
    id: number
  ): Promise<UserResponse & { total_surat: number }> {
    const user = await prismaClient.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: { letters: true },
        },
      },
    });

    if (!user) {
      throw new ResponseError(404, "User not found");
    }

    return {
      ...toUserResponse(user),
      total_surat: user._count.letters,
    };
  }

  static async updateById(
    id: number,
    request: UpdateUserRequest
  ): Promise<UserResponse> {
    const updateRequest = Validation.validate(UserValidation.UPDATE, request);

    const user = await prismaClient.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new ResponseError(404, "User not found");
    }

    if (updateRequest.nama_instansi) {
      user.nama_instansi = updateRequest.nama_instansi;
    }

    if (updateRequest.password) {
      user.password = await bcrypt.hash(updateRequest.password, 10);
    }

    const result = await prismaClient.user.update({
      where: {
        id: user.id,
      },
      data: user,
    });

    return toUserResponse(result);
  }
}
