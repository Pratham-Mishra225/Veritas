import "dotenv/config";
import { createApp } from "./src/app.js";
import { connectDb } from "./src/config/db.js";
import { initFirebase } from "./src/config/firebase.js";
import { logger } from "./src/utils/logger.js";

const port = Number(process.env.PORT || 3001, 10);

process.on("unhandledRejection", (reason) => {
  console.error("[PROCESS] Unhandled Rejection", reason);
});

process.on("uncaughtException", (err) => {
  console.error("[PROCESS] Uncaught Exception", err);
});

async function main() {
  if (!process.env.MONGODB_URI) {
    logger.error({}, "MONGODB_URI is required.");
    process.exit(1);
  }
  initFirebase();
  await connectDb();
  const app = createApp();
  const server = app.listen(port, () => {
    logger.info({ port }, "Veritas API listening");
  });

  const shutdown = () => {
    server.close(() => process.exit(0));
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  logger.error({ err }, "Fatal startup error");
  process.exit(1);
});
