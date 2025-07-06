import { logger } from "./application/logging";
import { web } from "./application/web";
import dotenv from "dotenv";

dotenv.config();

const PORT = parseInt(process.env.WEB_PORT || "3001", 10);

web.listen(PORT, () => {
  logger.info(`Listening on port ${PORT}`);
});
