import express from "express";
import { authMiddleware } from "../middleware/auth-middleware";
import { adminMiddleware } from "../middleware/admin-middleware";
import { UserController } from "../controller/user-controller";
import { LetterController } from "../controller/letter-controller";
import { upload } from "../validation/file-validation";

export const apiRouter = express.Router();
apiRouter.use(authMiddleware);

// User endpoints
apiRouter.get("/api/users/current", UserController.get);
apiRouter.patch("/api/users/current", UserController.update);
apiRouter.post("/api/users/logout", UserController.logout);

// Letter API (accessible to all authenticated users)
apiRouter.get("/api/surat/me", LetterController.listMyLetters);
apiRouter.patch(
  "/api/surat/:nomor_registrasi/status",
  LetterController.updateStatus
);

// Admin-only endpoints
apiRouter.use(adminMiddleware);
apiRouter.post("/api/users", UserController.register);
apiRouter.get("/api/users", UserController.list);
apiRouter.get("/api/users/:id", UserController.getById);
apiRouter.patch("/api/users/:id", UserController.updateById);
apiRouter.delete("/api/users/:id", UserController.delete);

// Letter API
apiRouter.post("/api/surat", upload.single("file"), LetterController.create);
apiRouter.get("/api/surat/:nomor_registrasi", LetterController.get);
apiRouter.put(
  "/api/surat/:nomor_registrasi",
  upload.single("file"),
  LetterController.update
);
apiRouter.delete("/api/surat/:nomor_registrasi", LetterController.delete);
apiRouter.get("/api/surat", LetterController.list);

apiRouter.get("/api/surat/:nomor_registrasi/file", LetterController.download);
