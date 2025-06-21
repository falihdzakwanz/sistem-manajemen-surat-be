import { Request, Response, NextFunction } from "express";
import { UserRequest } from "../type/user-request";
import { ResponseError } from "../error/response-error";

export const adminMiddleware = (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new ResponseError(401, "Unauthorized: No user found in request");
    }

    if (req.user.role !== "admin") {
      throw new ResponseError(403, "Forbidden: Admin access required");
    }

    next();
  } catch (error) {
    next(error);
  }
};
