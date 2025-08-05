import express, { Request, Response } from "express";
import { db } from "../data/db";
import dotenv from "dotenv";
import { SurfacePrixUG } from "../types/TablesTypes";
import {
  BatimentsResponse,
  HistoriqueSurfacePrixResponseItem,
  Surface,
  SurfacePrixResponse,
  SurfacePrixUGWithoutDates,
  SurfacePrixUGWithoutDatesAndId,
  SurfacesResponse,
} from "../types/adminRouterTypes";
import { UserRequest, verifyUser } from "../middlewares/checkUser";
import { AdminRequest, verifyAdmin } from "../middlewares/checkAdmin";
import { checkHasBatimentAccess } from "../middlewares/checkHasBatiment";

dotenv.config();

const router = express.Router();

router.get("/batiments", verifyUser, async (req: UserRequest, res) => {
  /* 
     #swagger.tags = ['Admin']
        #swagger.description = "Get all batiments for the specified company"
     #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/BatimentsResponse' }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
  try {
    const company_id = req.company_id;

    if (!company_id) {
      res.status(400).json({ message: "Company ID is required." });
      return;
    }

    const batiments: BatimentsResponse = await db("ugbats")
      .select("batiment_id", "name")
      .where({ company_id, is_deleted: false });

    res.status(200).json(batiments);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

router.get("/surfaces", verifyUser, async (req: UserRequest, res) => {
  /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Get all surfaces of for a specified building"     
  #swagger.parameters['batiment_id'] = {
          in: 'query',
          description: 'ID of the batiment',
          required: true,
          type: 'integer'
     }
     #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/SurfacesResponse' }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
  try {
    const { batiment_id } = req.query;

    if (!batiment_id) {
      res.status(400).json({ message: "Le batiment est requis." });
      return;
    }

    const surfacesResponse = await db("ugdesc")
      .distinct("surface")
      .where({ batiment_id, is_deleted: false })
      .whereNotNull("surface")
      .whereNot("surface", "=", 0)
      .orderBy("surface");

    const surfaces: SurfacesResponse = surfacesResponse.map(
      (row) => row.surface
    );

    res.status(200).json(surfaces);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

router.get(
  "/prix-current-ugs",
  verifyUser,
  checkHasBatimentAccess,
  async (req, res) => {
    /* 
     #swagger.tags = ['Admin']
     #swagger.description = "Get current price"
     
             #swagger.parameters['batiment_id'] = {
          in: 'path',
          description: 'ID of the batiment to filter prices',
          required: true,
          type: 'integer'
     }
          #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/SurfacePrixResponse' }
    } 
  #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
    try {
      const { batiment_id } = req.query;

      if (!batiment_id) {
        res.status(400).json({ message: "Le batiment est requis." });
        return;
      }

      const currentDate = new Date();

      const parisDate = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Paris",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(currentDate);

      const year = parisDate.find((part) => part.type === "year")?.value;
      const month = parisDate.find((part) => part.type === "month")?.value;
      const day = parisDate.find((part) => part.type === "day")?.value;

      const formattedCurrentDate = `${year}-${month}-${day}`;

      const surfacePrixResults: SurfacePrixUG[] = await db("surface_prix_ugs")
        .select(
          "prix_id",
          "batiment_id",
          "surface",
          "prix_type",
          "prix_an_1",
          "prix_an_2",
          "prix_an_3",
          "prix_centre_affaires",
          "prix_coworking",
          "prix_date_debut",
          "prix_date_fin"
        )
        .where("prix_date_debut", "<=", formattedCurrentDate)
        .where({ batiment_id })
        .andWhere((builder) =>
          builder
            .where("prix_date_fin", ">=", formattedCurrentDate)
            .orWhereNull("surface_prix_ugs.prix_date_fin")
        )
        .orderBy("surface");

      const firstRowPepiniere = surfacePrixResults.find(
        (surfacePrix) => surfacePrix.prix_type === "pepiniere"
      );
      const firstRowCentreAffaires = surfacePrixResults.find(
        (surfacePrix) => surfacePrix.prix_type === "centre_affaires"
      );
      const firstRowCoworking = surfacePrixResults.find(
        (surfacePrix) => surfacePrix.prix_type === "coworking"
      );

      const surfacePrixCurrentDate: SurfacePrixResponse = {
        pepiniere: {
          prix: [],
          prix_date_debut: firstRowPepiniere
            ? firstRowPepiniere.prix_date_debut
            : "",
          prix_date_fin:
            firstRowPepiniere && firstRowPepiniere.prix_date_fin
              ? firstRowPepiniere.prix_date_fin
              : undefined,
        },
        centre_affaires: {
          prix: [],
          prix_date_debut: firstRowCentreAffaires
            ? firstRowCentreAffaires.prix_date_debut
            : "",
          prix_date_fin:
            firstRowCentreAffaires && firstRowCentreAffaires.prix_date_fin
              ? firstRowCentreAffaires.prix_date_fin
              : undefined,
        },
        coworking: {
          prix: [],
          prix_date_debut: firstRowCoworking
            ? firstRowCoworking.prix_date_debut
            : "",
          prix_date_fin:
            firstRowCoworking && firstRowCoworking.prix_date_fin
              ? firstRowCoworking.prix_date_fin
              : undefined,
        },
      };

      surfacePrixResults.forEach((row) => {
        const { prix_date_debut, prix_date_fin, ...rest } = row;
        if (row.prix_type === "pepiniere") {
          surfacePrixCurrentDate.pepiniere.prix.push(rest);
        } else if (row.prix_type === "centre_affaires") {
          surfacePrixCurrentDate.centre_affaires.prix.push(rest);
        } else if (row.prix_type === "coworking") {
          surfacePrixCurrentDate.coworking.prix.push(rest);
        }
      });

      res.status(200).json(surfacePrixCurrentDate);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

router.get(
  "/historique-prix-ugs",
  verifyUser,
  checkHasBatimentAccess,
  async (req: Request, res: Response) => {
    /* 
     #swagger.tags = ['Admin']
     #swagger.description = "Get historical price data"
     #swagger.parameters['batiment_id'] = {
          in: 'query',
          description: 'ID of the batiment',
          required: true,
          type: 'integer'
     }
     #swagger.parameters['limit'] = {
          in: 'query',
          description: 'Limit the number of results returned',
          required: false,
          type: 'integer',
          default: 5
     }
     #swagger.parameters['offset'] = {
          in: 'query',
          description: 'Number of records to skip for pagination',
          required: false,
          type: 'integer',
          default: 0
     }
     #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/HistoriqueSurfacePrixResponse' }
     } 
     #swagger.responses[400] = {
          schema: { $ref: '#/components/schemas/BadRequest' }
     } 
     #swagger.responses[500] = {
          schema: { $ref: '#/components/schemas/ErrorResponse' }
     }        
 */
    try {
      const { batiment_id, limit = 5, offset = 0 } = req.query;

      if (!batiment_id) {
        res.status(400).json({ message: "Le batiment est requis." });
        return;
      }

      // Fetch all records for the specified batiment_id
      const rawData: SurfacePrixUG[] = await db("surface_prix_ugs")
        .select(
          "prix_id",
          "surface",
          "prix_type",
          "prix_an_1",
          "prix_an_2",
          "prix_an_3",
          "prix_centre_affaires",
          "prix_coworking",
          "prix_date_debut",
          "prix_date_fin"
        )
        .where({ batiment_id })
        .orderBy("prix_date_debut", "desc");

      if (!rawData || rawData.length === 0) {
        res.status(200).json({
          historique: [],
          cursor: null,
        });
        return;
      }

      const fullHistoriquePrix: HistoriqueSurfacePrixResponseItem[] =
        rawData.reduce((acc, item) => {
          const { prix_type, prix_date_debut, prix_date_fin, ...rest } = item;

          let existingEntry = acc.find(
            (entry: HistoriqueSurfacePrixResponseItem) =>
              entry.prix_type === prix_type &&
              entry.prix_date_debut === prix_date_debut &&
              entry.prix_date_fin === prix_date_fin
          );

          if (!existingEntry) {
            existingEntry = {
              prix_type: prix_type,
              prix_date_debut: prix_date_debut,
              prix_date_fin: prix_date_fin,
              prix: [],
            };
            acc.push(existingEntry);
          }

          existingEntry.prix.push(rest as SurfacePrixUG);

          return acc;
        }, [] as HistoriqueSurfacePrixResponseItem[]);

      const total = fullHistoriquePrix.length;

      const historiquePrix = fullHistoriquePrix.slice(
        Number(offset),
        Number(offset) + Number(limit)
      );

      const nextCursor =
        Number(offset) + Number(limit) < total
          ? Number(offset) + Number(limit)
          : null;

      res.status(200).json({
        historique: historiquePrix,
        cursor: nextCursor,
        total,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json();
    }
  }
);

router.put("/prix-current-ugs", verifyAdmin, async (req: AdminRequest, res) => {
  /* 
     #swagger.tags = ['Admin']
     #swagger.description = "update current prices"
     #swagger.requestBody = {
            schema: { $ref: '#/components/schemas/SurfacePrixUpdateBody' }
    }
   #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/SuccessResponse' }
    } 
    #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }   
    } */
  const trx = await db.transaction();
  try {
    const user_id = req.user_id;

    const { prix_type, prix, prix_date_debut, prix_date_fin = null } = req.body;

    const prixIdsToExclude = prix.map((item: SurfacePrixUG) => item.prix_id);

    const batiment_id = prix[0].batiment_id;

    if (!prix_date_debut) {
      await trx.rollback()
      res.status(400).json({ message: "La date de début n'est pas spécifié." });
      return;
    }

    if (prix_date_fin) {
      const startDate = new Date(prix_date_debut);
      const endDate = new Date(prix_date_fin);

      const isStartDateBeforeEndDate = startDate < endDate;

      if (!isStartDateBeforeEndDate) {
        await trx.rollback()
        res.status(400).json({
          message:
            "La date de fin ne peut pas être inférieur ou égale à la date de début.",
        });
        return;
      }
    }

    const existingDates = await db("surface_prix_ugs")
      .select("prix_date_debut", "prix_date_fin")
      .where({ prix_type, batiment_id })
      .whereNotIn("prix_id", prixIdsToExclude);

    const newStartDate = new Date(prix_date_debut);
    const newEndDate = prix_date_fin ? new Date(prix_date_fin) : null;

    const isOverlapping = existingDates.some(
      ({ prix_date_debut, prix_date_fin }) => {
        const existingStartDate = new Date(prix_date_debut);
        const existingEndDate = prix_date_fin ? new Date(prix_date_fin) : null;

        const overlapsWithExistingRange =
          (newStartDate >= existingStartDate &&
            (!existingEndDate || newStartDate <= existingEndDate)) ||
          (newEndDate &&
            newEndDate >= existingStartDate &&
            (!existingEndDate || newEndDate <= existingEndDate)) ||
          (newStartDate <= existingStartDate &&
            newEndDate &&
            (!existingEndDate || newEndDate >= existingEndDate));

        return overlapsWithExistingRange;
      }
    );

    if (isOverlapping) {
      await trx.rollback()
      res.status(400).json({
        message: "La date de début ou de fin chevauche une période existante.",
      });
      return;
    }

    const updatePromises = prix.map((item: SurfacePrixUGWithoutDates) =>
      trx("surface_prix_ugs")
        .where("prix_id", item.prix_id)
        .update({
          ...item,
          prix_date_debut,
          prix_date_fin: prix_date_fin || null,
          update_user: user_id,
        })
    );

    await Promise.all(updatePromises);
    await trx.commit();
    res.status(200).json({ message: "La mise à jour des prix est un succès." });
  } catch (err) {
    await trx.rollback();
    console.error(err);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

router.post("/prix-ugs", verifyAdmin, async (req: AdminRequest, res) => {
  /* 
     #swagger.tags = ['Admin']
     #swagger.description = "Post prices"
     #swagger.requestBody = {
            schema: { $ref: '#/components/schemas/SurfacePrixUpdateBody' }
    }
   #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/SuccessResponse' }
    } 
    #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }   
  */

  try {
    const user_id = req.user_id;

    const { prix_type, prix, prix_date_debut, prix_date_fin, batiment_id } =
      req.body;

    const trx = await db.transaction();

    const nullEndDateCheck = await trx("surface_prix_ugs")
      .select("prix_id")
      .where({ prix_type, batiment_id })
      .whereNull("prix_date_fin");

    if (nullEndDateCheck.length > 0) {
      await trx.rollback();
      res.status(400).json({
        message:
          "Il existe déjà un prix sans date de fin pour ce bâtiment et type de prix. Veuillez clôturer la période en cours avant d'ajouter une nouvelle période.",
      });
      return;
    }

    const existingPeriods = await trx("surface_prix_ugs")
      .select("prix_date_debut", "prix_date_fin")
      .where("prix_type", prix_type)
      .andWhere("batiment_id", batiment_id)
      .andWhere((builder) =>
        builder
          .whereBetween("prix_date_debut", [
            prix_date_debut,
            prix_date_fin || new Date(9999, 11, 31),
          ])
          .orWhereBetween("prix_date_fin", [
            prix_date_debut,
            prix_date_fin || new Date(9999, 11, 31),
          ])
          .orWhere((b) =>
            b
              .where("prix_date_debut", "<=", prix_date_debut)
              .andWhere(
                "prix_date_fin",
                ">=",
                prix_date_fin || new Date(9999, 11, 31)
              )
          )
      );

    if (existingPeriods.length > 0) {
      await trx.rollback();
      res.status(400).json({
        message:
          "Une période existante chevauche la nouvelle période pour ce bâtiment et type de prix.",
      });
      return;
    }

    const newPrix = prix.map((row: SurfacePrixUGWithoutDatesAndId) => ({
      ...row,
      prix_type,
      prix_date_debut,
      batiment_id,
      prix_date_fin: prix_date_fin || null,
      update_user: user_id,
      creation_user: user_id,
    }));

    await trx("surface_prix_ugs").insert(newPrix);

    await trx.commit();

    res.status(200).json({ message: "La mise à jour des prix est un succès." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

router.get("/etages", verifyUser, async (req: UserRequest, res) => {
  /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Get all etages of for a specified building"
     #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/SurfacesResponse' }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
  try {
    const { batiment_id } = req.query;

    if (!batiment_id) {
      res.status(400).json({ message: "Le batiment est requis." });
      return;
    }

    const etages = await db("ugetages")
      .distinct("etage_id", "num_etage")
      .where({ batiment_id })
      .orderBy("num_etage");

    res.status(200).json(etages);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

router.get("/action-collective", verifyUser, async (req: UserRequest, res) => {
  /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Get all actions collectives"
     #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/ActionCollectiveResponse' }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
  try {
    const company_id = req.company_id;

    const actionCollectiveId = await db("type_accompagnements_params")
      .select("typ_accompagnement_id")
      .where({ company_id, name: "ACTION COLLECTIVE" })
      .first();

    if (!actionCollectiveId) {
      res.status(400).json({
        message:
          "Vous n'avez pas ajouté dans les types d'entreties le paramètre ACTION COLLECTIVE.",
      });
      return;
    }

    const allActionCollectivesResponse = await db("tieppaccsuivi")
      .select(
        "tieppaccsuivi.tiepp_id",
        db.raw(`
          CONCAT(
              COALESCE(tiepp.surname, ''), ' ', 
              COALESCE(tiepp.first_name, '')
          ) AS libelle
          `),
        "tieppaccsuivi.date_acc_suivi",
        "tieppaccsuivi.hour_begin",
        "tieppaccsuivi.hour_end",
        "tieppaccsuivi.sujet_accompagnement_id",
        "tieppaccsuivi.suivi_id",
        db.raw(
          `${actionCollectiveId.typ_accompagnement_id} as typ_accompagnement_id`
        )
      )
      .leftJoin(
        "sujets_accompagnements_params",
        "sujets_accompagnements_params.sujet_accompagnement_id",
        "tieppaccsuivi.sujet_accompagnement_id"
      )
      .leftJoin("tiepp", "tiepp.tiepp_id", "tieppaccsuivi.tiepp_id")
      .where({
        "tieppaccsuivi.typ_accompagnement_id":
          actionCollectiveId.typ_accompagnement_id,
      })
      .orderBy("sujets_accompagnements_params.creation_date", "desc");

    const allActionCollectives = allActionCollectivesResponse.reduce(
      (acc, cur) => {
        let existingEntry = acc.find(
          (item: {
            tiepp_id: number;
            libelle: string;
            date_acc_suivi: string;
            hour_begin: string;
            hour_end: string;
            sujet_accompagnement_id: number;
          }) => item.sujet_accompagnement_id === cur.sujet_accompagnement_id
        );

        if (!existingEntry) {
          existingEntry = {
            sujet_accompagnement_id: cur.sujet_accompagnement_id,
            typ_accompagnement_id: cur.typ_accompagnement_id,
            hour_begin: cur.hour_begin,
            hour_end: cur.hour_end,
            date_acc_suivi: cur.date_acc_suivi,
            attendants: [],
          };
          acc.push(existingEntry);
        }

        existingEntry.attendants.push({
          tiepp_id: cur.tiepp_id,
          libelle: cur.libelle,
          suivi_id: cur.suivi_id,
        });

        return acc;
      },
      []
    );

    res.status(200).json(allActionCollectives);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

router.post(
  "/action-collective",
  verifyAdmin,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Post a new action collective"

    #swagger.requestBody = {
            schema: { $ref: '#/components/schemas/ActionCollectiveBody' }
    }
    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/SuccessResponse' }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
    const trx = await db.transaction();
    try {
      const {
        hour_end,
        hour_begin,
        date_acc_suivi,
        typ_accompagnement_id,
        sujet_accompagnement_id,
        attendants,
      } = req.body;

      const { user_id } = req;

      await Promise.all(
        attendants.map((attendant: { tiepp_id: number }) => {
          return trx("tieppaccsuivi").insert({
            hour_end,
            hour_begin,
            date_acc_suivi,
            typ_accompagnement_id,
            sujet_accompagnement_id,
            tiepp_id: attendant.tiepp_id,
            creation_user: user_id,
            update_user: user_id,
          });
        })
      );

      await trx.commit();

      res.status(200).json({
        message: "L'ajout d'une nouvelle action collective est un succès.",
      });
    } catch (err) {
      await trx.rollback();
      console.error(err);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

router.put(
  "/action-collective",
  verifyAdmin,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Update an action collective"

    #swagger.requestBody = {
            schema: { $ref: '#/components/schemas/ActionCollectiveBody' }
    }
    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/SuccessResponse' }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
    const trx = await db.transaction();
    try {
      const {
        hour_end,
        hour_begin,
        date_acc_suivi,
        sujet_accompagnement_id,
        typ_accompagnement_id,
        attendants,
      } = req.body;

      const { user_id } = req;

      await Promise.all(
        attendants.map(
          (attendant: {
            suivi_id: number;
            tiepp_id: number;
            statut?: "removed" | "added";
          }) => {
            if (attendant.statut === "removed") {
              return trx("tieppaccsuivi")
                .delete()
                .where({ suivi_id: attendant.suivi_id });
            } else if (attendant.statut === "added") {
              return trx("tieppaccsuivi").insert({
                hour_end,
                hour_begin,
                date_acc_suivi,
                sujet_accompagnement_id,
                typ_accompagnement_id,
                tiepp_id: attendant.tiepp_id,
                creation_user: user_id,
                update_user: user_id,
              });
            } else {
              return trx("tieppaccsuivi")
                .update({
                  hour_end,
                  hour_begin,
                  date_acc_suivi,
                  sujet_accompagnement_id,
                  typ_accompagnement_id,
                  update_user: user_id,
                })
                .where({ suivi_id: attendant.suivi_id });
            }
          }
        )
      );

      await trx.commit();

      res.status(200).json({
        message: "La mise à jour de l'action collective est un succès.",
      });
    } catch (err) {
      await trx.rollback();
      console.error(err);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

router.delete(
  "/action-collective/:sujet_accompagnement_id",
  verifyAdmin,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Delete an action collective"
         #swagger.requestBody = {
            schema: { $ref: '#/components/schemas/SurfacePrixUpdateBody' }
    }
                 #swagger.parameters['nature_equipement_id'] = {
          in: 'path',
          description: 'ID of the equipment type',
          required: true,
          schema: { type: 'integer' }
     }

    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/SuccessResponse' }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
    const trx = await db.transaction();
    try {
      const { sujet_accompagnement_id } = req.params;

      await trx("tieppaccsuivi").delete().where({ sujet_accompagnement_id });

      await trx("sujets_accompagnements_params")
        .update({ is_deleted: true })
        .where({ sujet_accompagnement_id: sujet_accompagnement_id });

      await trx.commit();

      res.status(200).json({
        message: `La suppression de l'action collective est un succès.`,
      });
    } catch (err) {
      await trx.rollback();
      console.error(err);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

router.get("/nature-equipements", verifyUser, async (req: UserRequest, res) => {
  /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Get all nature equipements"
     #swagger.responses[200] = {
            schema: { type: "array", items : {
            type: "object", properties: {
            name: { type: "string" },
            nature_equipement_id: { type: "number" }
            }
            } }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
  try {
    const company_id = req.company_id;

    const natureEquipements = await db("nature_equipements_params")
      .select("name", "nature_equipement_id")
      .where({ company_id, is_deleted: false });

    res.status(200).json(natureEquipements);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

router.post(
  "/nature-equipements",
  verifyAdmin,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Post a new equipement type"

    #swagger.requestBody = {
            schema: { type: "object", properties: { name: {
            type: "string"} } }
    }
    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/SuccessResponse' }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
    const trx = await db.transaction();
    try {
      const { name } = req.body;
      const { user_id, company_id } = req;


      await trx("nature_equipements_params")
        .insert({
          name,
          creation_user: user_id,
          company_id,
          is_deleted: false,
        })
        .onConflict(["name", "company_id"])
        .merge({ is_deleted: false });

      await trx.commit();

      res.status(200).json({
        message: "L'ajout d'un nouveau type d'équipement est un succès.",
      });
    } catch (err) {
      await trx.rollback();
      console.error(err);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

router.delete(
  "/nature-equipements/:nature_equipement_id",
  verifyAdmin,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Delete an equipement type"
         #swagger.requestBody = {
            schema: { $ref: '#/components/schemas/SurfacePrixUpdateBody' }
    }
                 #swagger.parameters['nature_equipement_id'] = {
          in: 'path',
          description: 'ID of the equipment type',
          required: true,
          schema: { type: 'integer' }
     }

    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/SuccessResponse' }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
    const trx = await db.transaction();
    try {
      const { nature_equipement_id } = req.params;

      await trx("nature_equipements_params")
        .update({ is_deleted: true })
        .where({ nature_equipement_id });

      await trx("ugequip")
        .update({ is_deleted: true })
        .where({ nature_equipement_id });

      await trx.commit();

      res.status(200).json({
        message: `La suppression du type d'unité de gestion est un succès.`,
      });
    } catch (err) {
      await trx.rollback();
      console.error(err);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

router.get("/nature-ug", verifyUser, async (req: UserRequest, res) => {
  /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Get all nature ugs"
      #swagger.responses[200] = {
            schema: { type: "array", items : {
            type: "object", properties: {
            name: { type: "string" },
            nature_ug_id: { type: "number" }
            }
            } }
    } 

             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
  try {
    const company_id = req.company_id;

    const natureUg = await db("nature_ug_params")
      .select("name", "nature_ug_id")
      .where({ company_id, is_deleted: false });

    res.status(200).json(natureUg);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

router.post("/nature-ug", verifyAdmin, async (req: AdminRequest, res) => {
  /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Post a new ug type"
         #swagger.requestBody = {
            schema: { $ref: '#/components/schemas/SurfacePrixUpdateBody' }
    }
    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/SuccessResponse' }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
  const trx = await db.transaction();
  try {
    const { name } = req.body;
    const { user_id, company_id } = req;

    await trx("nature_ug_params")
      .insert({
        name,
        creation_user: user_id,
        company_id,
        is_deleted: false,
      })
      .onConflict(["name", "company_id"])
      .merge({ is_deleted: false });

    await trx.commit();
    res.status(200).json({
      message: "L'ajout d'un nouveau type d'unité de gestion est un succès.",
    });
  } catch (err) {
    await trx.rollback();
    console.error(err);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

router.delete(
  "/nature-ug/:nature_ug_id",
  verifyAdmin,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Delete an equipement type"
         #swagger.requestBody = {
            schema: { $ref: '#/components/schemas/SurfacePrixUpdateBody' }
    }
      #swagger.parameters['nature_ug_id'] = {
          in: 'path',
          description: 'ID of the ug type',
          required: true,
          schema: { type: 'integer' }
     }

    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/SuccessResponse' }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
    const trx = await db.transaction();
    try {
      const { nature_ug_id } = req.params;

      await trx("nature_ug_params")
        .update({ is_deleted: true })
        .where({ nature_ug_id });

      await trx("ugdesc").update({ is_deleted: true }).where({ nature_ug_id });

      await trx.commit();
      res.status(200).json({
        message: `La suppression du type d'unité de gestion est un succès.`,
      });
    } catch (err) {
      await trx.rollback();
      console.error(err);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

router.get("/study-levels", verifyUser, async (req: UserRequest, res) => {
  /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Get all study levels"
     #swagger.responses[200] = {
            schema: { type: "array", items : {
            type: "object", properties: {
            name: { type: "string" },
            study_level_id: { type: "number" }
            }
            } }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
  try {
    const company_id = req.company_id;

    const studyLevels = await db("study_level_params")
      .select("name", "study_level_id")
      .where({ company_id, is_deleted: false });

    res.status(200).json(studyLevels);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

router.post("/study-levels", verifyAdmin, async (req: AdminRequest, res) => {
  /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Post a new study level"

    #swagger.requestBody = {
            schema: { type: "object", properties: { name: {
            type: "string"} } }
    }
    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/SuccessResponse' }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
  const trx = await db.transaction();
  try {
    const { name } = req.body;
    const { user_id, company_id } = req;

    await trx("study_level_params").insert({
      name,
      creation_user: user_id,
      company_id,
    })
      .onConflict(["name", "company_id"])
      .merge({
        is_deleted: false,
      });

    await trx.commit();
    res.status(200).json({
      message: "L'ajout d'un nouveau niveau d'études est un succès.",
    });
  } catch (err) {
    await trx.rollback();
    console.error(err);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

router.delete("/study-levels/:study_level_id", verifyAdmin, async (req: AdminRequest, res) => {
  /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Delete a study level"
         #swagger.requestBody = {
            schema: { $ref: '#/components/schemas/SurfacePrixUpdateBody' }
    }
                 #swagger.parameters['study_level_id'] = {
          in: 'path',
          description: 'ID of the equipment type',
          required: true,
          schema: { type: 'integer' }
     }

    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/SuccessResponse' }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
  const trx = await db.transaction();
  try {
    const { study_level_id } = req.params;

    await trx("study_level_params")
      .update({ is_deleted: true })
      .where({ study_level_id });

    await trx.commit();

    res.status(200).json({
      message: `La suppression du niveau d'études est un succès.`,
    });
  } catch (err) {
    await trx.rollback();
    console.error(err);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

router.get("/secteurs-activites", verifyUser, async (req: UserRequest, res) => {
  /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Get all secteurs activites"
     #swagger.responses[200] = {
            schema: { type: "array", items : {
            type: "object", properties: {
            name: { type: "string" },
            secteur_activite_id: { type: "number" }
            }
            } }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
  try {
    const company_id = req.company_id;

    const secteursActivites = await db("secteurs_activites_params")
      .select("name", "secteur_activite_id")
      .where({ company_id, is_deleted: false });

    res.status(200).json(secteursActivites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

router.post("/secteurs-activites", verifyAdmin, async (req: AdminRequest, res) => {
  /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Post a new study level"

    #swagger.requestBody = {
            schema: { type: "object", properties: { name: {
            type: "string"} } }
    }
    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/SuccessResponse' }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
  const trx = await db.transaction();
  try {
    const { name } = req.body;
    const { user_id, company_id } = req;

    await trx("secteurs_activites_params").insert({
      name,
      creation_user: user_id,
      company_id,
    })
      .onConflict(["name", "company_id"])
      .merge({
        is_deleted: false,
      });

    await trx.commit();
    res.status(200).json({
      message: "L'ajout d'un nouveau secteur d'activité est un succès.",
    });
  } catch (err) {
    await trx.rollback();
    console.error(err);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

router.delete("/secteurs-activites/:secteur_activite_id", verifyAdmin, async (req: AdminRequest, res) => {
  /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Delete a secteur activite"
         #swagger.requestBody = {
            schema: { $ref: '#/components/schemas/SurfacePrixUpdateBody' }
    }
                 #swagger.parameters['secteur_activite_id'] = {
          in: 'path',
          description: 'ID of the secteur activite',
          required: true,
          schema: { type: 'integer' }
     }

    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/SuccessResponse' }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
  const trx = await db.transaction();
  try {
    const { secteur_activite_id } = req.params;

    await trx("secteurs_activites_params")
      .update({ is_deleted: true })
      .where({ secteur_activite_id });

    await trx.commit();

    res.status(200).json({
      message: `La suppression du secteur d'activité est un succès.`,
    });
  } catch (err) {
    await trx.rollback();
    console.error(err);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});


router.get(
  "/situation-before-prjs",
  verifyUser,
  async (req: UserRequest, res) => {
    /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Get all situation before projects parameter"
     #swagger.responses[200] = {
            schema: { type: "array", items : {
            type: "object", properties: {
            name: { type: "string" },
            situation_before_prj_id: { type: "number" }
            }
            } }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
    try {
      const company_id = req.company_id;

      const situationsBeforePrjs = await db("situation_before_prj_params")
        .select("name", "situation_before_prj_id")
        .where({ company_id, is_deleted: false });

      res.status(200).json(situationsBeforePrjs);
    } catch (err) {
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

router.post(
  "/situation-before-prjs",
  verifyAdmin,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Post a new study level"

    #swagger.requestBody = {
            schema: { type: "object", properties: { name: {
            type: "string"} } }
    }
    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/SuccessResponse' }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
    const trx = await db.transaction();
    try {
      const { name } = req.body;
      const { user_id, company_id } = req;

      await trx("situation_before_prj_params").insert({
        name,
        creation_user: user_id,
        company_id,
      })
        .onConflict(["name", "company_id"])
        .merge({
          is_deleted: false,
        });

      await trx.commit();
      res.status(200).json({
        message: "L'ajout d'une nouvelle situation avant projet est un succès.",
      });
    } catch (err) {
      await trx.rollback();
      console.error(err);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

router.delete(
  "/situation-before-prjs/:situation_before_prj_id",
  verifyAdmin,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Delete a situation before project"
         #swagger.requestBody = {
            schema: { $ref: '#/components/schemas/SurfacePrixUpdateBody' }
    }
                 #swagger.parameters['situation_before_prj_id'] = {
          in: 'path',
          description: 'ID of the equipment type',
          required: true,
          schema: { type: 'integer' }
     }

    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/SuccessResponse' }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
    const trx = await db.transaction();
    try {
      const { situation_before_prj_id } = req.params;

      await trx("situation_before_prj_params")
        .update({ is_deleted: true })
        .where({ situation_before_prj_id });

      await trx.commit();

      res.status(200).json({
        message: `La suppression du niveau d'études est un succès.`,
      });
    } catch (err) {
      await trx.rollback();
      console.error(err);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

router.get("/legal-forms", verifyUser, async (req: UserRequest, res) => {
  /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Get all legal forms parameter"
     #swagger.responses[200] = {
            schema: { type: "array", items : {
            type: "object", properties: {
            name: { type: "string" },
            legal_form_id: { type: "number" }
            }
            } }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
  try {
    const company_id = req.company_id;

    const legalForms = await db("legal_forms_params")
      .select("name", "legal_form_id")
      .where({ company_id, is_deleted: false });

    res.status(200).json(legalForms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

router.post("/legal-forms", verifyAdmin, async (req: AdminRequest, res) => {
  /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Post a new legal form"

    #swagger.requestBody = {
            schema: { type: "object", properties: { name: {
            type: "string"} } }
    }
    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/SuccessResponse' }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
  const trx = await db.transaction();
  try {
    const { name } = req.body;
    const { user_id, company_id } = req;

    await trx("legal_forms_params")
      .insert({
        name,
        creation_user: user_id,
        company_id,
        is_deleted: false,
      })
      .onConflict(["name", "company_id"])
      .merge({ is_deleted: false });

    await trx.commit();
    res.status(200).json({
      message: "L'ajout d'un nouveau statut juridique est un succès.",
    });
  } catch (err) {
    await trx.rollback();
    console.error(err);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

router.delete(
  "/legal-forms/:legal_form_id",
  verifyAdmin,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Delete a legal form"
         #swagger.requestBody = {
            schema: { $ref: '#/components/schemas/SurfacePrixUpdateBody' }
    }
                 #swagger.parameters['legal_form_id'] = {
          in: 'path',
          description: 'ID of the legal form',
          required: true,
          schema: { type: 'integer' }
     }

    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/SuccessResponse' }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
    const trx = await db.transaction();
    try {
      const { legal_form_id } = req.params;

      await trx("legal_forms_params")
        .update({ is_deleted: true })
        .where({ legal_form_id });

      await trx.commit();

      res.status(200).json({
        message: `La suppression du statut juridique est un succès.`,
      });
    } catch (err) {
      await trx.rollback();
      console.error(err);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

router.get("/formules", verifyUser, async (req: UserRequest, res) => {
  /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Get all formules tiers"
     #swagger.responses[200] = {
            schema: { type: "array", items : {
            type: "object", properties: {
            name: { type: "string" },
            formule_id: { type: "number" }
            }
            } }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
  try {
    const company_id = req.company_id;

    const formules = await db("formules_params")
      .select("name", "formule_id")
      .where({ company_id, is_deleted: false });

    res.status(200).json(formules);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

router.post("/formules", verifyAdmin, async (req: AdminRequest, res) => {
  /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Post a formule"

    #swagger.requestBody = {
            schema: { type: "object", properties: { name: {
            type: "string"} } }
    }
    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/SuccessResponse' }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
  const trx = await db.transaction();
  try {
    const { name } = req.body;
    const { user_id, company_id } = req;

    await trx("formules_params").insert({
      name,
      creation_user: user_id,
      company_id,
    })
      .onConflict(["name", "company_id"])
      .merge({
        is_deleted: false,
      });

    await trx.commit();
    res.status(200).json({
      message: "L'ajout d'une nouvelle formule est un succès.",
    });
  } catch (err) {
    await trx.rollback();
    console.error(err);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

router.delete("/formules", verifyAdmin, async (req: AdminRequest, res) => {
  /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Delete a formule"
                 #swagger.parameters['formule_id'] = {
          in: 'path',
          description: 'ID of the formule to remove',
          required: true,
          schema: { type: 'integer' }
     }

    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/SuccessResponse' }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
  const trx = await db.transaction();
  try {
    const { formule_id } = req.params;

    await trx("formules_params")
      .update({ is_deleted: true })
      .where({ formule_id });

    await trx.commit();

    res.status(200).json({
      message: `La suppression de la formule est un succès.`,
    });
  } catch (err) {
    await trx.rollback();
    console.error(err);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

router.get("/relations-pm-pp", verifyUser, async (req: UserRequest, res) => {
  /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Get all relations pm pp"
     #swagger.responses[200] = {
            schema: { type: "array", items : {
            type: "object", properties: {
            name: { type: "string" },
            rel_typ_id: { type: "number" }
            }
            } }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
  try {
    const company_id = req.company_id;

    const relationsPMPP = await db("relations_pm_pp_params")
      .select("name", "rel_typ_id")
      .where({ company_id, is_deleted: false });

    res.status(200).json(relationsPMPP);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

router.post("/relations-pm-pp", verifyAdmin, async (req: AdminRequest, res) => {
  /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Post a relation pm pp"

    #swagger.requestBody = {
            schema: { type: "object", properties: { name: {
            type: "string"} } }
    }
    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/SuccessResponse' }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
  const trx = await db.transaction();
  try {
    const { name } = req.body;
    const { user_id, company_id } = req;

    await trx("relations_pm_pp_params")
      .insert({
        name,
        creation_user: user_id,
        company_id,
        is_deleted: false,
      })
      .onConflict(["name", "company_id"])
      .merge({ is_deleted: false });

    await trx.commit();
    res.status(200).json({
      message: "L'ajout d'une nouvelle relation est un succès.",
    });
  } catch (err) {
    await trx.rollback();
    console.error(err);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

router.delete(
  "/relations-pm-pp/:rel_typ_id",
  verifyAdmin,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Delete a relation"
                 #swagger.parameters['rel_typ_id'] = {
          in: 'path',
          description: 'ID of the relation to remove',
          required: true,
          schema: { type: 'integer' }
     }

    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/SuccessResponse' }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
    const trx = await db.transaction();
    try {
      const { rel_typ_id } = req.params;

      await trx("relations_pm_pp_params")
        .update({ is_deleted: true })
        .where({ rel_typ_id });

      await trx.commit();

      res.status(200).json({
        message: `La suppression de la relation est un succès.`,
      });
    } catch (err) {
      await trx.rollback();
      console.error(err);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

router.get(
  "/statuts-post-pepiniere",
  verifyUser,
  async (req: UserRequest, res) => {
    /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Get all statuts post pepiniere"
     #swagger.responses[200] = {
            schema: { type: "array", items : {
            type: "object", properties: {
            name: { type: "string" },
            statut_id: { type: "number" }
            }
            } }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
    try {
      const company_id = req.company_id;

      const statutsPostPep = await db("statuts_post_pep_params")
        .select("name", "statut_id")
        .where({ company_id, is_deleted: false });

      res.status(200).json(statutsPostPep);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

router.post(
  "/statuts-post-pepiniere",
  verifyAdmin,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Post a statut post pep"

    #swagger.requestBody = {
            schema: { type: "object", properties: { name: {
            type: "string"} } }
    }
    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/SuccessResponse' }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
    const trx = await db.transaction();
    try {
      const { name } = req.body;
      const { user_id, company_id } = req;

      await trx("statuts_post_pep_params")
        .insert({
          name,
          creation_user: user_id,
          company_id,
          is_deleted: false,
        })
        .onConflict(["name", "company_id"])
        .merge({ is_deleted: false });

      await trx.commit();
      res.status(200).json({
        message: "L'ajout d'un nouveau statut post-pépinière est un succès.",
      });
    } catch (err) {
      await trx.rollback();
      console.error(err);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

router.delete(
  "/statuts-post-pepiniere/:statut_id",
  verifyAdmin,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Delete a statut post pep"
                 #swagger.parameters['statut_id'] = {
          in: 'path',
          description: 'ID of the statut post pep to remove',
          required: true,
          schema: { type: 'integer' }
     }

    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/SuccessResponse' }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
    const trx = await db.transaction();
    try {
      const { statut_id } = req.params;

      await trx("statuts_post_pep_params")
        .update({ is_deleted: true })
        .where({ statut_id });

      await trx.commit();

      res.status(200).json({
        message: `La suppression du statut post-pépinière est un succès.`,
      });
    } catch (err) {
      await trx.rollback();
      console.error(err);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

router.get("/motifs-sortie-pep", verifyUser, async (req: UserRequest, res) => {
  /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Get all motifs sortie pep"
     #swagger.responses[200] = {
            schema: { type: "array", items : {
            type: "object", properties: {
            name: { type: "string" },
            motif_id: { type: "number" }
            }
            } }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
  try {
    const company_id = req.company_id;

    const motifsSortiePep = await db("motifs_sortie_pep_params")
      .select("name", "motif_id")
      .where({ company_id, is_deleted: false });

    res.status(200).json(motifsSortiePep);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

router.post(
  "/motifs-sortie-pep",
  verifyAdmin,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Post a motif sortie pep"

    #swagger.requestBody = {
            schema: { type: "object", properties: { name: {
            type: "string"} } }
    }
    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/SuccessResponse' }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
    const trx = await db.transaction();
    try {
      const { name } = req.body;
      const { user_id, company_id } = req;

      await trx("motifs_sortie_pep_params")
        .insert({
          name,
          creation_user: user_id,
          company_id,
          is_deleted: false,
        })
        .onConflict(["name", "company_id"])
        .merge({ is_deleted: false });

      await trx.commit();
      res.status(200).json({
        message: "L'ajout d'un nouveau motif est un succès.",
      });
    } catch (err) {
      await trx.rollback();
      console.error(err);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

router.delete(
  "/motifs-sortie-pep/:motif_id",
  verifyAdmin,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Delete a motif sortie pep"
                 #swagger.parameters['motif_id'] = {
          in: 'path',
          description: 'ID of the statut post pep to remove',
          required: true,
          schema: { type: 'integer' }
     }

    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/SuccessResponse' }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
    const trx = await db.transaction();
    try {
      const { motif_id } = req.params;

      await trx("motifs_sortie_pep_params")
        .update({ is_deleted: true })
        .where({ motif_id });

      await trx.commit();

      res.status(200).json({
        message: `La suppression du motif est un succès.`,
      });
    } catch (err) {
      await trx.rollback();
      console.error(err);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

router.get("/prescribers", verifyUser, async (req: UserRequest, res) => {
  /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Get all prescribers"
     #swagger.responses[200] = {
            schema: { type: "array", items : {
            type: "object", properties: {
            name: { type: "string" },
            prescriber_id: { type: "number" }
            }
            } }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
  try {
    const company_id = req.company_id;

    const prescribers = await db("prescribers_params")
      .select("name", "prescriber_id")
      .where({ company_id, is_deleted: false });

    res.status(200).json(prescribers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

router.post("/prescribers", verifyAdmin, async (req: AdminRequest, res) => {
  /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Post a prescriber"

    #swagger.requestBody = {
            schema: { type: "object", properties: { name: {
            type: "string"} } }
    }
    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/SuccessResponse' }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
  const trx = await db.transaction();
  try {
    const { name } = req.body;
    const { user_id, company_id } = req;

    await trx("prescribers_params").insert({
      name,
      creation_user: user_id,
      company_id,
    })
      .onConflict(["name", "company_id"])
      .merge({
        is_deleted: false,
      });

    await trx.commit();
    res.status(200).json({
      message: "L'ajout d'un nouveau prescripteur est un succès.",
    });
  } catch (err) {
    await trx.rollback();
    console.error(err);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

router.delete(
  "/prescribers/:prescriber_id",
  verifyAdmin,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Delete a motif sortie pep"
                 #swagger.parameters['prescriber_id'] = {
          in: 'path',
          description: 'ID of the prescriber to remove',
          required: true,
          schema: { type: 'integer' }
     }

    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/SuccessResponse' }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
    const trx = await db.transaction();
    try {
      const { prescriber_id } = req.params;

      await trx("prescriber_params")
        .update({ is_deleted: true })
        .where({ prescriber_id });

      await trx.commit();

      res.status(200).json({
        message: `La suppression du prescripteur est un succès.`,
      });
    } catch (err) {
      await trx.rollback();
      console.error(err);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

router.get(
  "/types-accompagnements",
  verifyUser,
  async (req: UserRequest, res) => {
    /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Get all types accompagnements"
     #swagger.responses[200] = {
            schema: { type: "array", items : {
            type: "object", properties: {
            name: { type: "string" },
            typ_accompagnement_id: { type: "number" }
            }
            } }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
    try {
      const company_id = req.company_id;

      const typesAcc = await db("type_accompagnements_params")
        .select("name", "typ_accompagnement_id")
        .where({ company_id, is_deleted: false });

      res.status(200).json(typesAcc);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

router.post(
  "/types-accompagnements",
  verifyAdmin,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Post an accompagnement type"

    #swagger.requestBody = {
            schema: { type: "object", properties: { name: {
            type: "string"} } }
    }
    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/SuccessResponse' }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
    const trx = await db.transaction();
    try {
      const { name } = req.body;
      const { user_id, company_id } = req;

      await trx("type_accompagnements_params").insert({
        name,
        creation_user: user_id,
        company_id,
      })
        .onConflict(["name", "company_id"])
        .merge({
          is_deleted: false,
        });

      await trx.commit();
      res.status(200).json({
        message: "L'ajout d'un nouveau type d'accompagnement est un succès.",
      });
    } catch (err) {
      await trx.rollback();
      console.error(err);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

router.delete(
  "/types-accompagnements",
  verifyAdmin,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Delete an accompagnement type"
                 #swagger.parameters['typ_accompagnement_id'] = {
          in: 'path',
          description: 'ID of the accompagnement type to remove',
          required: true,
          schema: { type: 'integer' }
     }

    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/SuccessResponse' }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
    const trx = await db.transaction();
    try {
      const { typ_accompagnement_id } = req.params;

      await trx("type_accompagnements_params")
        .update({ is_deleted: true })
        .where({ typ_accompagnement_id });

      await trx.commit();

      res.status(200).json({
        message: `La suppression du type d'accompagnement est un succès.`,
      });
    } catch (err) {
      await trx.rollback();
      console.error(err);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

router.get(
  "/sujets-accompagnements",
  verifyUser,
  async (req: UserRequest, res) => {
    /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Get all sujets accompagnements"
     #swagger.responses[200] = {
            schema: { type: "array", items : {
            type: "object", properties: {
            name: { type: "string" },
            typ_accompagnement_id: { type: "number" },
            sujet_accompagnement_id: { type: "number" },
            }
            } }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
    try {
      const company_id = req.company_id;

      const sujetsAcc = await db("sujets_accompagnements_params")
        .select("name", "typ_accompagnement_id", "sujet_accompagnement_id")
        .where({ company_id, is_deleted: false });

      res.status(200).json(sujetsAcc);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

router.post(
  "/sujets-accompagnements",
  verifyAdmin,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Post an accompagnement type"

    #swagger.requestBody = {
            schema: { type: "object", properties: { name: {
            type: "string"}, typ_accompagnement_id: { type: "number" }, } }
    }
    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/SuccessResponse' }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
    const trx = await db.transaction();
    try {
      const { name, typ_accompagnement_id } = req.body;
      const { user_id, company_id } = req;

      await trx("sujets_accompagnements_params")
        .insert({
          name,
          creation_user: user_id,
          company_id,
          typ_accompagnement_id,
          is_deleted: false,
        })
        .onConflict(["name", "company_id", "typ_accompagnement_id"])
        .merge({ is_deleted: false });

      await trx.commit();
      res.status(200).json({
        message: "L'ajout d'un nouveau sujet d'accompagnement est un succès.",
      });
    } catch (err) {
      await trx.rollback();
      console.error(err);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

router.delete(
  "/sujets-accompagnements/:sujet_accompagnement_id",
  verifyAdmin,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Delete an accompagnement sujet"
                 #swagger.parameters['sujet_accompagnement_id'] = {
          in: 'path',
          description: 'ID of the accompagnement sujet to remove',
          required: true,
          schema: { type: 'integer' }
     }

    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/SuccessResponse' }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
    const trx = await db.transaction();
    try {
      const { sujet_accompagnement_id } = req.params;

      await trx("sujets_accompagnements_params")
        .update({ is_deleted: true })
        .where({ sujet_accompagnement_id });

      await trx.commit();

      res.status(200).json({
        message: `La suppression du sujet d'accompagnement est un succès.`,
      });
    } catch (err) {
      await trx.rollback();
      console.error(err);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

router.get("/all-pm", verifyUser, async (req: UserRequest, res) => {
  /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Get all PMs"
    #swagger.parameters['search'] = {
          in: 'query',
          description: 'ID of the batiment',
          required: true,
          type: 'string'
     }
     #swagger.responses[200] = {
            schema: { type: "array", items : {
            type: "object", properties: {
            raison_sociale: { type: "string" },
            tiepm_id: { type: "number" }
            }
            } }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
  try {
    const company_id = req.company_id;
    const { search } = req.query;

    const allPMs = await db("tiepm")
      .select("tiepm_id", "raison_sociale")
      .where({ company_id })
      .where("raison_sociale", "like", `%${search}%`);

    res.status(200).json(allPMs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

router.get("/all-pp", verifyUser, async (req: UserRequest, res) => {
  /* 
     #swagger.tags = ['Admin']
         #swagger.description = "Get all PPs"
    #swagger.parameters['search'] = {
          in: 'query',
          description: 'ID of the batiment',
          required: true,
          type: 'string'
     }
     #swagger.responses[200] = {
            schema: { type: "array", items : {
            type: "object", properties: {
            libelle: { type: "string" },
            tiepp_id: { type: "number" }
            }
            } }
    } 
             #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
    } 
    #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }        
    */
  try {
    const company_id = req.company_id;
    const { search } = req.query;

    const allPPs = await db("tiepp")
      .select(
        "tiepp_id",
        db.raw(`
        CONCAT(
            COALESCE(tiepp.surname, ''), ' ', 
            COALESCE(tiepp.first_name, '')
        ) AS libelle
        `)
      )
      .where({ company_id })
      .where((builder) => {
        builder
          .where("surname", "like", `%${search}%`)
          .orWhere("first_name", "like", `%${search}%`);
      });

    res.status(200).json(allPPs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

export { router as adminRouter };
