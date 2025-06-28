import { Request, Response, NextFunction } from "express";
import { DashboardService } from "../service/dashboard-service";
import { UserRequest } from "../type/user-request";

export class DashboardController {
  static async getAdminStats(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const stats = await DashboardService.getAdminStats();
      res.status(200).json({
        data: stats,
      });
    } catch (e) {
      next(e);
    }
  }

  static async getUserStats(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const stats = await DashboardService.getUserStats(req.user!.id);
      res.status(200).json({
        data: stats,
      });
    } catch (e) {
      next(e);
    }
  }
}
