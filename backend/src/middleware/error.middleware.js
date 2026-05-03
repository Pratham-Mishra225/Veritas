import { logger } from "../utils/logger.js";

// eslint-disable-next-line no-unused-vars
export function errorMiddleware(err, req, res, next) {
  const status = Number(err.statusCode || err.status || 500, 10);
  console.error("[ERROR]", err?.stack || err);
  logger.error({ err, requestId: req.id, path: req.path, status }, err?.message || "unhandled error");
  res.status(status).json({
    success: false,
    message: err?.message || "Internal server error",
  });
}
