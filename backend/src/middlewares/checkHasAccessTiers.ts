import { NextFunction, Request, Response } from "express";
import { db } from "../data/db";
import { UserRequest } from "./checkUser";

export async function checkHasTiersAccess(
  req: UserRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { qualite, id } = req.params;

    if (!id) {
      res.status(403).json({ message: "L'id du tiers est requise." });
      return;
    }

    if (!qualite) {
      res.status(403).json({ message: "L'id du tiers est requise." });
      return;
    }

    const company_id = req.company_id;

    if (qualite === "PP") {
      const checkTiersPP = await db("tiepp").select().where({ "tiepp_id": id }).first();

      if (checkTiersPP.company_id !== company_id) {
        res
          .status(403)
          .json({ message: "Vous n'avez pas les accès à ce tiers" });
        return;
      }
    }

    if (qualite === "PM") {
        const checkTiersPM = await db("tiepm").select().where({ "tiepm_id":id }).first();

      if (checkTiersPM.company_id !== company_id) {
        res
          .status(403)
          .json({ message: "Vous n'avez pas les accès à ce tiers" });
        return;
      }
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
}
