import express from "express";
import { authMiddleware } from "../middleware/auth-middleware";
import { UserController } from "../controller/user-controller";
import { ReceiverController } from "../controller/receiver-controller";

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
