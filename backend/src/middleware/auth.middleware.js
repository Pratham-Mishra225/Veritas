import { getFirebaseAdmin } from "../config/firebase.js";

export async function authMiddleware(req, res, next) {
  if (process.env.DISABLE_AUTH === "true") {
    req.auth = { uid: process.env.DEV_USER_ID || "dev_local" };
    return next();
  }
  const admin = getFirebaseAdmin();
  if (!admin) {
    return res.status(503).json({ error: { message: "Authentication is not configured on the server." } });
  }
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: { message: "Missing or invalid Authorization header." } });
  }
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.auth = { uid: decoded.uid, email: decoded.email ?? null };
    return next();
  } catch {
    return res.status(401).json({ error: { message: "Invalid or expired token." } });
  }
}
