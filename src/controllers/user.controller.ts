import { type Request, type Response } from "express";
import { UserService } from "@/services";
import asyncHandler from "@/utils/asyncHandler";

class UserController {
  constructor() {}

  private userService = new UserService();

  public getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await this.userService.fetchAllUsers();
    return res.status(200).json(users);
  });

  public getUserById = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id;
    const user = await this.userService.fetchUserData(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  });

  public createUser = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password, age } = req.body;
    const userData = { name, email, password, age };
    console.log("Creating user with data:", userData);
    const newUser = await this.userService.createUser(userData);
    return res.status(201).json(newUser);
  });

  public updateUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id;
    const { name, email, password, age } = req.body;
    const updatedUser = await this.userService.updateUser(userId, {
      name,
      email,
      password,
      age,
    });
    return res.status(200).json(updatedUser);
  });
}

export default UserController;
