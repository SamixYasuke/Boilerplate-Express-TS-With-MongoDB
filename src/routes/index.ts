import userRoutes from "@/routes/user.route";
import { Router } from "express";
import logRouter from "./log.route";

const ApiRouters = Router();

ApiRouters.use("/user", userRoutes);
ApiRouters.use("/logs", logRouter);

export default ApiRouters;
