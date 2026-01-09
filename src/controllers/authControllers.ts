import { Request, Response } from "express";
import { User } from "../models/userModle";
import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken } from "../util/token";
import { AuthRequest } from "../middlewares/authMiddleware";
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import  sendMail  from "../util/sendMail";
import { OAuth2Client } from 'google-auth-library';
import dotenv from "dotenv";  

dotenv.config();

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

export const userRegister = async (req: Request, res: Response) => {

  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required...!" });
    }

    const exsitingUser = await User.findOne({ email });
    if (exsitingUser) {
      return res.status(400).json({ message: "User already exists...!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ message: "User Registered Successfully...!", data: newUser._id });

  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "User Registration Failed...!" });
  }
}

export const userLogin = async (req: Request, res: Response) => {

  try {
    const { email, password } = req.body;

    const exsitingUser = await User.findOne({ email });
    if (!exsitingUser) {
      return res.status(401).json({ message: "Invalid creadentials...!" });
    }

    const vlaid = await bcrypt.compare(password, exsitingUser.password);

    if (!vlaid) {
      return res.status(401).json({ message: "Invalid creadentials...!" });
    }

    const accessToken = signAccessToken(exsitingUser);
    const refreshToken = signRefreshToken(exsitingUser);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // example 7 days
    });


    res.status(200).json({
      message: "Login successful", data: {
        email: exsitingUser.email,
        id: exsitingUser._id,
        //tokens
        accessToken
      }
    });

  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "User login Failed...!" });
  }
}

export const me = async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;
  const email = req.user.email;
  res.status(200).json({
    message: "ok",
    data: {
      userId,
      email,
    },
  });

}

export const refresh = async (req: AuthRequest, res: Response) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token' });

    const payload: any = jwt.verify(token, REFRESH_TOKEN_SECRET!);

    const user = await User.findById(req.user._id);
    if (!user) return res.status(401).json({ message: 'User not found' });

    const newAccessToken = signAccessToken(user);
    res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const logout = (req: Request, res: Response) => {

  // console.log("Logout called")

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
  return res.status(200).json({ message: 'Logged out' });
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = new Date(Date.now() + 3600000); // 1 hour

    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    const message = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #4f46e5; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">NoteMind</h1>
        </div>
        <div style="padding: 30px; color: #333333; line-height: 1.6;">
          <h2 style="color: #1f2937; margin-top: 0;">Password Reset Request</h2>
          <p>ඔබගේ මුරපදය (Password) අමතක වී ඇති බව අපට දැනගන්නට ලැබුණි. පහත බොත්තම ක්ලික් කිරීමෙන් ඔබට නව මුරපදයක් සැකසිය හැක.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset My Password</a>
          </div>

          <p style="font-size: 14px; color: #666666;">ඉහත බොත්තම වැඩ නොකරන්නේ නම්, පහත සබැඳිය (link) කොපි කර ඔබේ බ්‍රව්සරයට ඇතුළත් කරන්න:</p>
          <p style="font-size: 12px; word-break: break-all; color: #4f46e5;">${resetUrl}</p>
          
          <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999999; text-align: center;">මෙය ඔබ ඉල්ලූ දෙයක් නොවේ නම්, කරුණාකර මෙම ඊමේල් පණිවිඩය නොසලකා හරින්න.</p>
        </div>
        <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #9ca3af;">
          &copy; ${new Date().getFullYear()} NoteMind. All rights reserved.
        </div>
      </div>
    `;

         await sendMail({
        to: user.email,
        subject: "Password Reset Request - NoteMind ",
        text: message,
      });

      res.status(200).json({ success: true, data: "Email Sent" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Forgot password failed..!' });
    }
  }

  export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword; 

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ success: true, data: "Password Updated Success" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Reset password failed' });
  }
};
