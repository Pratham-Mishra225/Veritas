const isDev = process.env.NODE_ENV !== "production";

export const logger = {
  info(obj, msg) {
    if (isDev) console.log(msg, obj ?? "");
    else console.log(JSON.stringify({ level: "info", msg, ...obj }));
  },
  warn(obj, msg) {
    console.warn(msg, obj ?? "");
  },
  error(obj, msg) {
    console.error(msg, obj ?? "");
  },
};
