import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.json({
      space: 2,
    }),
    winston.format.colorize({ all: true }),
    winston.format.printf(({ level, message, timestamp, ...metadata }) => {
      let msg = `${timestamp} [${level}]: ${message}`;
      if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata, null, 2)}`;
      }
      return msg;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: "app.log",
      format: winston.format.combine(
        winston.format.timestamp({
          format: "YYYY-MM-DD HH:mm:ss",
        }),
        winston.format.json({ space: 2 })
      ),
    }),
  ],
});

export default logger;
