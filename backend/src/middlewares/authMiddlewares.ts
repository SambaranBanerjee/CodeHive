import { Request, Response, NextFunction } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "defaultsecret");
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: err instanceof TokenExpiredError ? "Token expired" : "Invalid token" });
  }
};
