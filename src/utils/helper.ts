import { JwtPayload } from "@/types/util";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = "1d";

export const generateJwtToken = (payload: JwtPayload): string => {
  try {
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    return token;
  } catch (error) {
    throw new Error(`Failed to generate JWT: ${error.message}`);
  }
};

export const verifyJwtToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    throw new Error(`Invalid JWT: ${error.message}`);
  }
};
