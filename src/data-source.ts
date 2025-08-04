import mongoose from "mongoose";
import dotenv from "dotenv";
import { type Application } from "express";
import logger from "./utils/logger";

dotenv.config();

const PORT = process.env.PORT || 3000;
const ENV = process.env.ENV as "dev" | "prod";
const MONGODB_URI =
  ENV === "dev" ? process.env.MONGODB_DEV_URI : process.env.MONGODB_PROD_URI;

const initializeDatabaseAndServer = async (app: Application): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI as string);
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT} in ${ENV} mode`);
      logger.info("Database has connected successfully");
    });
  } catch (error) {
    logger.error(`Error connecting to the server: ${error}`);
    process.exit(1);
  }
};

export default initializeDatabaseAndServer;
