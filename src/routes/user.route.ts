import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { UserController } from "@/controllers";

const userRoutes = Router();

const userController = new UserController();

userRoutes.get("/", userController.getAllUsers);

userRoutes.get("/:id", userController.getUserById);

userRoutes.post("/", userController.createUser);

userRoutes.put("/:id", userController.updateUser);

export default userRoutes;
