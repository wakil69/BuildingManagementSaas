import { NextFunction, Request, Response } from "express";
import { db } from "../data/db";
import { UserRequest } from "./checkUser";

export async function checkHasConventionAccess(
  req: UserRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { conv_id, version } = req.params;

    if (!conv_id) {
      res.status(403).json({ message: "L'id de la convention est requise." });
      return;
    }

    if (!version) {
      res.status(403).json({ message: "La version est requise." });
      return;
    }

    const company_id = req.company_id;

    const checkConventionAccess = await db("convdesc")
      .select()
      .where({ conv_id, version })
      .first();

    if (checkConventionAccess.company_id !== company_id) {
      res.status(403).json({ message: "Vous n'avez pas les accès à cette convention" });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
}
