import { NextFunction, Request, Response } from "express";
import { db } from "../data/db";
import { UserRequest } from "./checkUser";


export async function checkHasBatimentAccess(req: UserRequest, res: Response, next: NextFunction) {
  try {
    const { batiment_id } = req.query;

    if (!batiment_id) {
      res.status(403).json({ message: "Veuillez vous connecter." });
      return;
    }

    const company_id = req.company_id;

    const checkBatiment = await db("ugbats")
      .where({ batiment_id, company_id })
      .first();

    if (!checkBatiment) {
      res.status(403).json({ message: "Vous n'avez pas les accès à ce bâtiment" });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
}
