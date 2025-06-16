import { ZodError } from "zod";
import { ResponseError } from "../error/response-error";
import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { logger } from "../application/logging";

export const errorMiddleware = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const err = error instanceof Error ? error : new Error(String(error));

  if (err instanceof ZodError) {
    return res.status(400).json({
      errors: err.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
  } else if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      err.message = "File size exceeds 10MB limit";
    } else if (
      err.code === "LIMIT_UNEXPECTED_FILE" &&
      err.message.includes("Only PDF and DOCX")
    ) {
      err.message = "Only PDF and DOCX files are allowed";
    }

    return res.status(400).json({
      errors: err.message,
    });
  } else if (err instanceof ResponseError) {
    return res.status(err.status).json({
      errors: err.message,
    });
  } else {
    logger.error(err);
    return res.status(500).json({
      errors: "Internal Server Error",
    });
  }
};
