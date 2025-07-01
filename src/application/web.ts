import express from "express";
import cors from "cors";
import { publicRouter } from "../route/public-api";
import { errorMiddleware } from "../middleware/error-middleware";
import { apiRouter } from "../route/api";
import { dashboardRouter } from "../route/dashboard-api";

export const web = express();
web.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
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
