import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;

export interface AuthRequest extends Request {
  user?: any; // you can define a more specific type based on your payload
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization header missing or invalid" });
  }

  // barer 
  const token = authHeader.split(' ')[1]; // ['barer' , 'token']
  try {
    // const payload = jwt.verify(token, ACCESS_TOKEN_SECRET)
    // req.user = payload; // add user info to request object
    const decoded: any = jwt.verify(token, ACCESS_TOKEN_SECRET || 'secret');
    console.log("decoded token:", decoded);
    req.user = {
      _id: decoded.sub,
      email: decoded.email,
    };

    next();
  } catch (error) {
    console.log(error)
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}


