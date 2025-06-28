import { Router } from "express";
import { DashboardController } from "../controller/dashboard-controller";
import { authMiddleware } from "../middleware/auth-middleware";
import { adminMiddleware } from "../middleware/admin-middleware";

export const dashboardRouter = Router();

dashboardRouter.get(
  "/api/dashboard/admin",
  [authMiddleware, adminMiddleware],
  DashboardController.getAdminStats
);

dashboardRouter.get(
  "/api/dashboard/user",
  authMiddleware,
  DashboardController.getUserStats
);
