import { AuthRequest } from "../middlewares/authMiddleware";
import { Response } from "express";
import { User } from "../models/userModle";
import bcrypt from "bcryptjs";

export const getUserProfile = async (req : AuthRequest, res : Response) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if(!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
    
  } catch (error) {
    res.status(500).json({ message: "Can't get user profile...!" });
  }
}

export const updateUser = async (req : AuthRequest, res : Response) => {
  try {
    const userId = req.user._id;

    const { username, email, password  } = req.body;

    if(!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.findById(userId);

    if(!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updateUser = await User.findByIdAndUpdate(userId, {
      username,
      email,
      password : hashedPassword
    }, { new: true });

    res.status(200).json({ user: updateUser });

  } catch (error) {
    res.status(500).json({ message: "Can't get user profile...!" });
  }
}