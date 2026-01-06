import { NextFunction, Response, Request } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: any;
}


export const verifyRefreshToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  
  const refreshToken = req.cookies?.refreshToken as string;
  if (!refreshToken) return res.status(401).json({ message: "Not found refresh token" });

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string, (err, decoded: any) => {
    if (err) return res.status(403).json({ message: "Invalid refresh token" });

    req.user = {
      _id: decoded.sub, 
      email: decoded.email
    }; 
    next();
  });
};