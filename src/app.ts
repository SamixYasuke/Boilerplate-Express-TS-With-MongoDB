import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { errorHandler } from "@/errors/error";
import dotenv from "dotenv";
import cors from "cors";
import ApiRouters from "@/routes";
import initializeDatabaseAndServer from "./data-source";

dotenv.config();

const app: Application = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use("/api", ApiRouters);
app.use(errorHandler);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript + Express!");
});

initializeDatabaseAndServer(app);
