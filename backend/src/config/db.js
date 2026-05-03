import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

let readyState = 0;

export function connectionState() {
  return mongoose.connection.readyState;
}

export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    logger.warn({}, "MONGODB_URI not set — skipping MongoDB connection");
    return;
  }
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  readyState = mongoose.connection.readyState;
  logger.info({ uri: uri.replace(/\/\/.*@/, "//***@") }, "MongoDB connected");
}

export async function disconnectDb() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
