export function requestLoggerMiddleware(req, res, next) {
  const start = process.hrtime.bigint();
  console.log(`[REQUEST] ${req.method} ${req.originalUrl}`);
  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    console.log(
      `[RESPONSE] ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs.toFixed(1)}ms`,
    );
  });
  next();
}
