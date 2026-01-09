import dotenv from "dotenv";
import { IUser } from "../models/userModle";
import jwt from "jsonwebtoken";
dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;

export const signAccessToken = (user: IUser): string => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
    },
    ACCESS_TOKEN_SECRET,
    {
      expiresIn: "60m",
    }
  );
};

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

export const signRefreshToken = (user: IUser): string => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
    },
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    }
  );
};
