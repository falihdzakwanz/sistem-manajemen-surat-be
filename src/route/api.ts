import express from "express";
import { authMiddleware } from "../middleware/auth-middleware";
import { adminMiddleware } from "../middleware/admin-middleware";
import { UserController } from "../controller/user-controller";
import { LetterController } from "../controller/letter-controller";
import { upload } from "../validation/file-validation";

export const apiRouter = express.Router();
apiRouter.use(authMiddleware);

apiRouter.get("/api/users/current", UserController.get);
apiRouter.patch("/api/users/current", UserController.update);
apiRouter.delete("/api/users/current", UserController.logout);

apiRouter.get("/api/surat/me", LetterController.listMyLetters);
apiRouter.patch(
  "/api/surat/:nomor_registrasi/status",
  LetterController.updateStatus
);
apiRouter.get(
  "/api/surat/laporan-bulanan", 
  adminMiddleware,
  LetterController.monthlyReport
);
apiRouter.get("/api/surat/:nomor_registrasi", LetterController.get);
apiRouter.get("/api/surat/:nomor_registrasi/file", LetterController.download);

apiRouter.use(adminMiddleware);
apiRouter.post("/api/users", UserController.register);
apiRouter.get("/api/users", UserController.list);
apiRouter.get("/api/users/:id", UserController.getById);
apiRouter.patch("/api/users/:id", UserController.updateById);
apiRouter.delete("/api/users/:id", UserController.delete);

apiRouter.post("/api/surat", upload.single("file"), LetterController.create);

apiRouter.put(
  "/api/surat/:nomor_registrasi",
  upload.single("file"),
  LetterController.update
);
apiRouter.delete("/api/surat/:nomor_registrasi", LetterController.delete);
apiRouter.get("/api/surat", LetterController.list);
apiRouter.get("/api/surat/user/:userId", LetterController.listByUserId);
