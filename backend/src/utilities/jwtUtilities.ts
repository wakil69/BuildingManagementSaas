
import jwt from "jsonwebtoken"
import { UsersTable } from "../data/typesTable";

const jwtSecret = process.env.JWT_SECRET!;

export function generateAccessToken(user: UsersTable) {
    return jwt.sign({ user_id: user.user_id, role: user.role, first_name: user.first_name, surname: user.last_name, email: user.email, company_id: user.company_id }, jwtSecret, {
      expiresIn: "24h",
    });
  }