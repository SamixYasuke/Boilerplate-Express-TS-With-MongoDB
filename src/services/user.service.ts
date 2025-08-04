import { CustomError } from "@/errors/CustomError";
import User from "@/models/user.model";
import logger from "@/utils/logger";

class UserService {
  constructor() {}

  public async fetchAllUsers() {
    try {
      const users = await User.find().select("-password").exec();
      if (!users || users.length === 0) {
        logger.warn("No users found in database");
        throw new CustomError("No users found", 404);
      }
      logger.info("Fetched all users", { count: users.length });
      return users;
    } catch (error) {
      logger.error("Error fetching all users", { error: error.message });
      throw error;
    }
  }

  public async fetchUserData(userId: string) {
    try {
      const user = await User.findById(userId).select("-password").exec();
      if (!user) {
        logger.warn("User not found", { userId });
        throw new CustomError("User not found", 404);
      }
      logger.info("Fetched user data", { userId });
      return user;
    } catch (error) {
      logger.error("Error fetching user data", {
        userId,
        error: error.message,
      });
      throw error;
    }
  }

  public async createUser(userData: {
    name: string;
    email: string;
    password: string;
    age?: number;
  }) {
    try {
      console.log("Creating user with data:", userData);
      const existingUser = await User.findOne({ email: userData.email }).exec();
      if (existingUser) {
        logger.warn("Attempted to create user with existing email", {
          email: userData.email,
        });
        throw new CustomError("Email already in use", 400);
      }

      const user = new User(userData);
      await user.save();
      logger.info("User created successfully", {
        userId: user._id,
        email: userData.email,
      });
      return user;
    } catch (error) {
      logger.error("Error creating user", {
        email: userData.email,
        error: error.message,
      });
      throw error;
    }
  }

  public async updateUser(
    userId: string,
    userData: Partial<{
      name: string;
      email: string;
      password: string;
      age?: number;
    }>
  ) {
    try {
      const user = await User.findByIdAndUpdate(userId, userData, {
        new: true,
        runValidators: true,
      })
        .select("-password")
        .exec();
      if (!user) {
        logger.warn("User not found for update", { userId });
        throw new CustomError("User not found", 404);
      }
      logger.info("User updated successfully", {
        userId,
        updatedFields: Object.keys(userData),
      });
      return user;
    } catch (error) {
      logger.error("Error updating user", { userId, error: error.message });
      throw error;
    }
  }
}

export default UserService;
