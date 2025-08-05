import jwt from "jsonwebtoken";
import { TokenPayload } from "../types/userRouterTypes";
import { NextFunction, Request, Response } from "express";

export interface AdminRequest extends Request {
    first_name?: string;
    last_name?: string;
    role?: string;
    email?: string;
    user_id?: number;
    company_id?: number;
}

export function verifyAdmin(req: AdminRequest, res: Response, next: NextFunction) {
  const token = req.cookies.token;

  if (!token) {
    res.status(403).json({ message: "Veuillez vous connecter." });
    return;
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || "default_secret";
    const decoded = jwt.verify(token, jwtSecret) as TokenPayload;

    if (decoded.role !== "admin") {
      res
        .status(403)
        .json({
          message: "Vous n'avez pas les droits pour réaliser cette action.",
        });
      return;
    }

    req.first_name = decoded.first_name;
    req.last_name = decoded.last_name;
    req.role = decoded.role;
    req.email = decoded.email;
    req.user_id = decoded.user_id;
    req.company_id = decoded.company_id;
    next();
  } catch (error) {
    res.status(401).json({ message: "Le token a expiré." });
  }
}
