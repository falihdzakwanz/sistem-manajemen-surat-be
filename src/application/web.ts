import express from "express";
import cors from "cors";
import { publicRouter } from "../route/public-api";
import { errorMiddleware } from "../middleware/error-middleware";
import { apiRouter } from "../route/api";
import { dashboardRouter } from "../route/dashboard-api";
import dotenv from "dotenv";

dotenv.config();

const ORIGIN = process.env.WEB_ORIGIN || "http://localhost:3000";

export const web = express();
web.use(
  cors({
    origin: ORIGIN,
    credentials: true, 
    exposedHeaders: ["Content-Disposition"],
    allowedHeaders: ["X-API-TOKEN", "Content-Type"],
  })
);
web.use(express.json());
web.use(publicRouter);
web.use(dashboardRouter);
web.use(apiRouter);
web.use(
  (
    error: unknown,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    errorMiddleware(error, req, res, next);
  }
);
