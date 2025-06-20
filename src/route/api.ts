import express from "express";
import { authMiddleware } from "../middleware/auth-middleware";
import { UserController } from "../controller/user-controller";
import { ReceiverController } from "../controller/receiver-controller";
import { LetterController } from "../controller/letter-controller";
import { upload } from "../validation/file-validation";

export const apiRouter = express.Router();
apiRouter.use(authMiddleware);

// User API
apiRouter.get("/api/users/current", UserController.get);
apiRouter.patch("/api/users/current", UserController.update);
apiRouter.delete("/api/users/current", UserController.logout);

// Receiver API
apiRouter.post("/api/penerima", ReceiverController.create);
apiRouter.put("/api/penerima/:id", ReceiverController.update);
apiRouter.delete("/api/penerima/:id", ReceiverController.delete);
apiRouter.get("/api/penerima/:id", ReceiverController.get);
apiRouter.get("/api/penerima", ReceiverController.list);

// Letter API
apiRouter.post("/api/surat", upload.single("file"), LetterController.create);
apiRouter.get("/api/surat/:nomor_registrasi", LetterController.get);
apiRouter.put(
  "/api/surat/:nomor_registrasi",
  upload.single("file"),
  LetterController.update
);
apiRouter.patch(
  "/api/surat/:nomor_registrasi/status",
  LetterController.updateStatus
);
apiRouter.delete("/api/surat/:nomor_registrasi", LetterController.delete);
apiRouter.get("/api/surat", LetterController.list);
apiRouter.get("/api/surat/me", LetterController.listMyLetters); 
apiRouter.get("/api/surat/:nomor_registrasi/file", LetterController.download);