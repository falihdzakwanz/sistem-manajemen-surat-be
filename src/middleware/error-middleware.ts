import { ZodError } from "zod";
import { ResponseError } from "../error/response-error";
import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { logger } from "../application/logging";

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      errors: error.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
  } else if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      error.message = "File size exceeds 10MB limit";
    } else if (
      error.code === "LIMIT_UNEXPECTED_FILE" &&
      error.message.includes("Only PDF and DOCX")
    ) {
      error.message = "Only PDF and DOCX files are allowed";
    }

    return res.status(400).json({
      errors: error.message,
    });
  } else if (error instanceof ResponseError) {
    return res.status(error.status).json({
      errors: error.message,
    });
  } else {
    logger.error(error);
    return res.status(500).json({
      errors: "Internal Server Error",
    });
  }
};
