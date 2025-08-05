import express, { Request, Response } from "express";
import multer from "multer";
import XLSX from "xlsx";
import { db } from "../data/db";
import dotenv from "dotenv";
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { verifyUser } from "../middlewares/checkUser";
import { Equipement, Prix, UgInfos } from "../types/ugRouterTypes";
import { checkHasBatimentAccess } from "../middlewares/checkHasBatiment";
import { r2 } from "../r2Client";
import { AdminRequest, verifyAdmin } from "../middlewares/checkAdmin";

dotenv.config();

const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME as string;
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * Converts an Excel date format to a JavaScript date string in the format YYYY-MM-DD.
 * @param dateToChange - The Excel date value to convert.
 * @returns A formatted date string in the format YYYY-MM-DD.
 */
function ExcelDateToJSDate(dateToChange: number): string {
  const date = new Date(Math.round((dateToChange - 25569) * 86400 * 1000));
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
}

router.get("/download-template", async (req: Request, res: Response) => {
  const fileKey = `TRAM_UG.xlsx`;

  try {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fileKey,
    });

    const url = await getSignedUrl(r2, command, { expiresIn: 60 * 5 });

    res.status(200).json({ downloadLink: url });
  } catch (err) {
    console.error("Error generating signed URL", err);
    res.status(500).send("Error generating file link");
  }
});

//new

router.post("/", verifyAdmin, async (req: AdminRequest, res) => {
  /* 
     #swagger.tags = ['Unité de gestion']
     #swagger.description = "Create a single ug"
     #swagger.parameters['ug_id'] = {
          in: 'path',
          description: 'ID of the batiment to filter prices',
          required: true,
          schema: { type: 'integer' }
     }
    #swagger.requestBody = {
      schema: { $ref: '#/components/schemas/UgInfosBody' }
    }
    #swagger.responses[200] = {
            schema: { type: "object", properties: { message: { type: "string" }, ugId : { type: "number" } } }
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
      name,
      nature_ug_id,
      batiment_id,
      num_voie,
      typ_voie,
      int_voie,
      complement_voie,
      code_postal,
      commune,
      cedex,
      pays,
      surface,
      etage_id,
      date_construction,
      date_entree,
    } = req.body;

    const user_id = req.user_id;
    const company_id = req.company_id;
    if (surface) {
      const getAllSurfacesResponse: { surface: number }[] = await trx(
        "surface_prix_ugs"
      )
        .distinct("surface")
        .where({ batiment_id });

      const checkSurfaceAlreadyExisting = getAllSurfacesResponse.find(
        (surfaceExisting) => surfaceExisting.surface === surface
      );

      if (!checkSurfaceAlreadyExisting) {
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

        const getAllPeriodsAndTypesResponse: {
          prix_date_debut: string;
          prix_date_fin: string;
          prix_type: "string";
        }[] = await trx("surface_prix_ugs")
          .distinct("prix_type", "prix_date_debut", "prix_date_fin")
          .where({ batiment_id })
          .whereIn("prix_type", ["pepiniere", "centre_affaires"])
          .where((builder) =>
            builder
              .where("prix_date_debut", ">=", formattedCurrentDate)
              .orWhereNull("prix_date_fin")
              .orWhere((subBuilder) =>
                subBuilder
                  .where("prix_date_debut", "<=", formattedCurrentDate)
                  .andWhere("prix_date_fin", ">=", formattedCurrentDate)
              )
          );

        await Promise.all(
          getAllPeriodsAndTypesResponse.map((period) => {
            return trx("surface_prix_ugs").insert({
              surface,
              batiment_id,
              prix_type: period.prix_type,
              prix_date_debut: period.prix_date_debut,
              prix_date_fin: period.prix_date_fin,
              creation_user: user_id,
              update_user: user_id,
            });
          })
        );

        let allSurfacesWishes: {
          surface_wishes: string;
          souhait_id: number;
        }[] = await trx("tieppaccsouhait")
          .select("souhait_id", "surface_wishes")
          .leftJoin("tiepp", "tiepp.tiepp_id", "tieppaccsouhait.tiepp_id")
          .where({ "tiepp.batiment_id": batiment_id });

        allSurfacesWishes = allSurfacesWishes.map((surfaceWish) => {
          try {
            const parsedSouhaits = JSON.parse(surfaceWish.surface_wishes);

            if (
              !Object.prototype.hasOwnProperty.call(parsedSouhaits, surface)
            ) {
              parsedSouhaits[surface] = false;
            }

            return {
              souhait_id: surfaceWish.souhait_id,
              surface_wishes: JSON.stringify(parsedSouhaits),
            };
          } catch (error) {
            console.error(
              "Invalid JSON in surface_wishes:",
              surfaceWish.surface_wishes
            );
            throw new Error("Failed to parse surface_wishes.");
          }
        });

        await Promise.all(
          allSurfacesWishes.map((wish) =>
            trx("tieppaccsouhait")
              .update({ surface_wishes: wish.surface_wishes })
              .where({ souhait_id: wish.souhait_id })
          )
        );
      }
    }

    const result = await trx("ugdesc").insert({
      name,
      nature_ug_id,
      batiment_id,
      num_voie: num_voie || null,
      typ_voie: typ_voie || null,
      int_voie,
      complement_voie: complement_voie || null,
      code_postal,
      commune,
      cedex: cedex || null,
      pays,
      surface,
      etage_id,
      date_construction: date_construction || null,
      date_entree: date_entree || null,
      company_id,
      creation_user: user_id,
      update_user: user_id,
    });

    await trx.commit();

    res
      .status(200)
      .json({ message: "La création de l'ug est un succès", ugId: result[0] });
  } catch (e) {
    await trx.rollback();
    console.log(e);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

//new
router.post(
  "/import-excel",
  verifyAdmin,
  upload.single("file"),
  async (req: AdminRequest, res: Response) => {
    /* 
     #swagger.tags = ['Unité de gestion']
     #swagger.description = "Upload excel file to import ugs."
    #swagger.requestBody = {
      content: {
        "multipart/form-data": {
          schema: {
            type: "object",
            properties: {
              file: { 
             type: "string",
             format: "binary"
           }
            }
          }
        }
      }
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
    if (!req.file) {
      res.status(400).json({
        message: "Le fichier n'a pas été importé, veuillez réessayer.",
      });
      return;
    }

    const company_id = req.company_id;
    const user_id = req.user_id;

    const trx = await db.transaction();

    try {
      const batimentsQuery = trx("ugbats")
        .select("batiment_id", "name")
        .where({ company_id });

      const etagesQuery = trx("ugetages")
        .select("batiment_id", "etage_id", "num_etage")
        .where({ company_id });

      const natureUgsQuery = trx("nature_ug_params")
        .select("nature_ug_id", "name")
        .where({ company_id });

      const natureEquipementsQuery = trx("nature_equipements_params")
        .select("nature_equipement_id", "name")
        .where({ company_id });

      let [batiments, etages, natureUgs, natureEquipements] = await Promise.all(
        [batimentsQuery, etagesQuery, natureUgsQuery, natureEquipementsQuery]
      );

      batiments = batiments.reduce((acc, cur) => {
        if (!acc[cur.name]) {
          acc[cur.name] = cur.batiment_id;
        }
        return acc;
      }, {});

      natureUgs = natureUgs.reduce((acc, cur) => {
        if (!acc[cur.name]) {
          acc[cur.name] = cur.nature_ug_id;
        }
        return acc;
      }, {});

      natureEquipements = natureEquipements.reduce((acc, cur) => {
        if (!acc[cur.name]) {
          acc[cur.name] = cur.nature_equipement_id;
        }
        return acc;
      }, {});

      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      let linkBetweenUgsAndEquipments: Record<number, number> = {};
      for (const ws of workbook.SheetNames) {
        const worksheet = workbook.Sheets[ws];
        const data = XLSX.utils.sheet_to_json(worksheet);

        if (data.length === 0) continue;

        if (ws === "UG LOCAUX") {
          let batimentsIdsSurfaces: Record<number, number[]> = {};
          let ugIds: number[] = [];
          const ugs = data.map((row: any, index: number) => {
            if (row["IDENTIFIANT UG"]) {
              ugIds.push(row["IDENTIFIANT UG"]);
            }

            const batiment_id = row["BATIMENT"]
              ? batiments[row["BATIMENT"].trim()]
              : null;

            if (!batiment_id) {
              throw `Erreur: Batiment manquant pour la ligne ${index + 2}`;
            }

            const nature_ug_id = row["NATURE"]
              ? natureUgs[row["NATURE"]?.trim()]
              : null;

            if (!nature_ug_id) {
              throw `Erreur: NATURE manquant pour la ligne ${index + 2}`;
            }

            const etage_id = etages.find(
              (etage) =>
                etage.batiment_id === batiments[row["BATIMENT"]] &&
                etage.num_etage === row["ETAGE"]
            ).etage_id;

            if (!etage_id) {
              throw `Erreur: ETAGE manquant pour la ligne ${index + 2}`;
            }

            const int_voie = row["ADRESSE INTITULE"]
              ? row["ADRESSE INTITULE"].trim()
              : null;

            if (!int_voie) {
              throw `Erreur: ADRESSE INTITULE manquant pour la ligne ${index + 2}`;
            }

            const code_postal =
              typeof row["CODE POSTAL"] === "string"
                ? row["CODE POSTAL"].trim()
                : String(parseInt(row["CODE POSTAL"]));

            if (!code_postal) {
              throw `Erreur: CODE POSTAL manquant pour la ligne ${index + 2}`;
            }

            const pays = row["PAYS"] ? row["PAYS"].trim() : null;

            if (!pays) {
              throw `Erreur: PAYS manquant pour la ligne ${index + 2}`;
            }

            const name = row["INTITULE"] ? row["INTITULE"].trim() : null;

            if (!name) {
              throw `Erreur: INTITULE manquant pour la ligne ${index + 2}`;
            }

            const surface = parseFloat(row["SURFACE"]) || 0;
            if (batiment_id && surface) {
              batimentsIdsSurfaces[batiment_id] =
                batimentsIdsSurfaces[batiment_id] || [];
              batimentsIdsSurfaces[batiment_id].push(surface);
            }

            return {
              company_id,
              batiment_id,
              etage_id,
              name,
              nature_ug_id,
              date_construction: row["DATE CONSTRUCTION"]
                ? ExcelDateToJSDate(row["DATE CONSTRUCTION"])
                : null,
              date_entree: row["DATE ENTREE"]
                ? ExcelDateToJSDate(row["DATE ENTREE"])
                : null,
              num_voie: row["ADRESSE N° VOIE"]
                ? parseInt(row["ADRESSE N° VOIE"])
                : null,
              typ_voie: row["ADRESSE TYPE VOIE"]
                ? row["ADRESSE TYPE VOIE"].trim()
                : null,
              int_voie,
              complement_voie: row["ADRESSE COMPLEMENT"]
                ? row["ADRESSE COMPLEMENT"].trim()
                : null,
              code_postal,
              commune: row["COMMUNE"] ? row["COMMUNE"].trim() : null,
              cedex: row["CEDEX"] ? row["CEDEX"].trim() : null,
              pays,
              surface,
              creation_user: user_id,
              update_user: user_id,
            };
          });

          for (const [batiment_id, surfacesInserted] of Object.entries(
            batimentsIdsSurfaces
          )) {
            if (surfacesInserted.length) {
              const getAllSurfacesResponse: { surface: number }[] = await trx(
                "surface_prix_ugs"
              )
                .distinct("surface")
                .where({ batiment_id });

              for (const surface of surfacesInserted) {
                const checkSurfaceAlreadyExisting = getAllSurfacesResponse.find(
                  (surfaceExisting) => surfaceExisting.surface === surface
                );

                if (!checkSurfaceAlreadyExisting) {
                  const currentDate = new Date();

                  const parisDate = new Intl.DateTimeFormat("en-GB", {
                    timeZone: "Europe/Paris",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  }).formatToParts(currentDate);

                  const year = parisDate.find(
                    (part) => part.type === "year"
                  )?.value;
                  const month = parisDate.find(
                    (part) => part.type === "month"
                  )?.value;
                  const day = parisDate.find(
                    (part) => part.type === "day"
                  )?.value;

                  const formattedCurrentDate = `${year}-${month}-${day}`;

                  const getAllPeriodsAndTypesResponse: {
                    prix_date_debut: string;
                    prix_date_fin: string;
                    prix_type: "string";
                  }[] = await trx("surface_prix_ugs")
                    .distinct("prix_type", "prix_date_debut", "prix_date_fin")
                    .where({ batiment_id })
                    .whereIn("prix_type", ["pepiniere", "centre_affaires"])
                    .where((builder) =>
                      builder
                        .where("prix_date_debut", ">=", formattedCurrentDate)
                        .orWhereNull("prix_date_fin")
                        .orWhere((subBuilder) =>
                          subBuilder
                            .where(
                              "prix_date_debut",
                              "<=",
                              formattedCurrentDate
                            )
                            .andWhere(
                              "prix_date_fin",
                              ">=",
                              formattedCurrentDate
                            )
                        )
                    );

                  if (getAllPeriodsAndTypesResponse.length) {
                    await Promise.all(
                      getAllPeriodsAndTypesResponse.map((period) => {
                        return trx("surface_prix_ugs").insert({
                          surface,
                          batiment_id,
                          prix_type: period.prix_type,
                          prix_date_debut: period.prix_date_debut,
                          prix_date_fin: period.prix_date_fin || null,
                          creation_user: user_id,
                          update_user: user_id,
                        });
                      })
                    );
                  } else {
                    // case where no prices for the batiment_id
                    await Promise.all(
                      getAllPeriodsAndTypesResponse.map((period) => {
                        return trx("surface_prix_ugs").insert({
                          surface,
                          batiment_id,
                          prix_type: period.prix_type,
                          prix_date_debut: formattedCurrentDate,
                          creation_user: user_id,
                          update_user: user_id,
                        });
                      })
                    );
                  }

                  let allSurfacesWishes: {
                    surface_wishes: string;
                    souhait_id: number;
                  }[] = await trx("tieppaccsouhait")
                    .select("souhait_id", "surface_wishes")
                    .leftJoin(
                      "tiepp",
                      "tiepp.tiepp_id",
                      "tieppaccsouhait.tiepp_id"
                    )
                    .where({ "tiepp.batiment_id": batiment_id });

                  allSurfacesWishes = allSurfacesWishes.map((surfaceWish) => {
                    try {
                      const parsedSouhaits = JSON.parse(
                        surfaceWish.surface_wishes
                      );

                      if (
                        !Object.prototype.hasOwnProperty.call(
                          parsedSouhaits,
                          surface
                        )
                      ) {
                        parsedSouhaits[surface] = false;
                      }

                      return {
                        souhait_id: surfaceWish.souhait_id,
                        surface_wishes: JSON.stringify(parsedSouhaits),
                      };
                    } catch (error) {
                      console.error(
                        "Invalid JSON in surface_wishes:",
                        surfaceWish.surface_wishes
                      );
                      throw new Error("Failed to parse surface_wishes.");
                    }
                  });

                  await Promise.all(
                    allSurfacesWishes.map((wish) =>
                      trx("tieppaccsouhait")
                        .update({ surface_wishes: wish.surface_wishes })
                        .where({ souhait_id: wish.souhait_id })
                    )
                  );
                }
              }
            } else {
              continue;
            }
          }

          const results = await Promise.all(
            ugs.map(async (ug) => {
              const [insertedId] = await trx("ugdesc").insert(ug);
              return insertedId;
            })
          );

          if (ugIds.length) {
            linkBetweenUgsAndEquipments = ugIds.reduce<Record<number, number>>(
              (acc, cur, index) => {
                acc[cur] = results[index];
                return acc;
              },
              {}
            );
          }
        } else if (ws === "UG EQUIPEMENTS") {
          const equipements = data.map((row: any, index: number) => {
            const ug_id = row["IDENTIFIANT UG"]
              ? linkBetweenUgsAndEquipments[row["IDENTIFIANT UG"]]
              : null;

            if (!ug_id) {
              throw `Erreur: IDENTIFIANT UG manquant pour la ligne ${index + 2} dans la feuille UG EQUIPEMENTS`;
            }

            const nature_equipement_id = row["NATURE EQUIPEMENT"]
              ? natureEquipements[row["NATURE EQUIPEMENT"].trim()]
              : null;

            if (!nature_equipement_id) {
              throw `Erreur: NATURE EQUIPEMENT manquant pour la ligne ${index + 2}`;
            }

            const name = row["NOM EQUIPEMENT"]
              ? row["NOM EQUIPEMENT"].trim()
              : null;

            if (!name) {
              throw `Erreur: NOM EQUIPEMENT manquant pour la ligne ${index + 2}`;
            }

            return {
              ug_id,
              name,
              nature_equipement_id,
              equipement_prix: parseFloat(row["PRIX"]) || 0,
              creation_user: user_id,
              update_user: user_id,
            };
          });

          await trx("ugequip").insert(equipements);
        }
      }

      await trx.commit();

      res
        .status(200)
        .json({ message: "L'importation des données est un succès !" });
    } catch (e: any) {
      await trx.rollback();
      console.error(e);
      if (typeof e === "string" && e.startsWith("Erreur:")) {
        res.status(400).json({ message: e });
      } else {
        res
          .status(500)
          .json({ message: "Une erreur inattendue est survenue." });
      }
    }
  }
);

// new
router.get("/", verifyUser, checkHasBatimentAccess, async (req, res) => {
  /* 
     #swagger.tags = ['Unité de gestion']
     #swagger.description = "Get ugs with pagination"
     #swagger.parameters['batiment_id'] = {
          in: 'query',
          description: 'ID of the batiment to filter prices',
          required: true,
          type: 'integer'
     }
     #swagger.parameters['search'] = {
          in: 'query',
          description: 'Search term',
          required: false,
          type: 'string'
     }
     #swagger.parameters['limit'] = {
          in: 'query',
          description: 'Number of records per page',
          required: false,
          type: 'integer',
          default: 10
     }
     #swagger.parameters['offset'] = {
          in: 'query',
          description: 'Offset for pagination',
          required: false,
          type: 'integer',
          default: 0
     }
     #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/UgsSearchResponse' }
     } 
     #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
     } 
     #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }  
  */

  try {
    let {
      search,
      batiment_id,
      limit = 10,
      offset = 0,
      dateAvailable,
      loue,
      disponible,
    } = req.query;

    if (!batiment_id) {
      res.status(400).json({ message: "Le batiment est requis." });
      return;
    }

    limit = Number(limit);
    offset = Number(offset);
    const isLoue = loue === "true";
    const isDisponible = disponible === "true";

    if (!dateAvailable) {
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

      dateAvailable = `${year}-${month}-${day}`;
    }

    let baseQuery = db("ugdesc")
      .select(
        "ugdesc.ug_id",
        "ugdesc.name",
        "nature_ug_params.name as nature",
        db.raw(`
        CONCAT(
            COALESCE(ugdesc.num_voie, ''), ' ', 
            COALESCE(ugdesc.typ_voie, ''), ' ', 
            COALESCE(ugdesc.int_voie, ''), ' ', 
            COALESCE(ugdesc.complement_voie, ''), ' ', 
            COALESCE(ugdesc.code_postal, ''), ' ', 
            COALESCE(ugdesc.commune, ''), ' ', 
            COALESCE(ugdesc.cedex, ''), ' ', 
            COALESCE(ugdesc.pays, '')
        ) AS address
      `),
        "ugdesc.surface",
        "ugetages.num_etage",
        db.raw("COALESCE(surface_occupied.surface_rent, 0) as surface_occupe")
      )
      .leftJoin("ugetages", "ugetages.etage_id", "ugdesc.etage_id")
      .leftJoin(
        "nature_ug_params",
        "nature_ug_params.nature_ug_id",
        "ugdesc.nature_ug_id"
      )
      .leftJoin(
        db("ugconv")
          .select("ugconv.ug_id")
          .sum("ugconv.surface_rent as surface_rent")
          .join(
            db("ugconv as sub")
              .select("sub.conv_id")
              .max("sub.version as max_version")
              .groupBy("sub.conv_id")
              .as("max_versions"),
            function () {
              this.on("ugconv.conv_id", "=", "max_versions.conv_id").andOn(
                "ugconv.version",
                "=",
                "max_versions.max_version"
              );
            }
          )
          .where(function () {
            this.where("ugconv.date_debut", "<=", dateAvailable).andWhere(
              function () {
                this.where("ugconv.date_fin", ">=", dateAvailable).orWhereNull(
                  "ugconv.date_fin"
                );
              }
            );
          })
          .groupBy("ugconv.ug_id")
          .as("surface_occupied"),
        "ugdesc.ug_id",
        "surface_occupied.ug_id"
      )
      .where({ "ugdesc.batiment_id": batiment_id, "ugdesc.is_deleted": false });

    if (search) {
      baseQuery = baseQuery.where(function () {
        this.where("ugdesc.name", "like", `%${search}%`)
          .orWhere("nature_ug_params.name", "like", `%${search}%`)
          .orWhere("ugdesc.ug_id", "like", `%${search}%`);
      });
    }

    if (isLoue) {
      baseQuery.andWhereRaw(
        "COALESCE(surface_occupied.surface_rent, 0) = ugdesc.surface"
      );
    }

    if (isDisponible) {
      baseQuery.andWhereRaw(
        "COALESCE(surface_occupied.surface_rent, 0) < ugdesc.surface"
      );
    }

    const ugsQuery = baseQuery
      .clone()
      .orderBy("ugetages.num_etage", "asc")
      .limit(limit)
      .offset(offset);

    const totalQuery = baseQuery
      .clone()
      .clearSelect()
      .count("* as count")
      .first();

    const [ugs, total] = await Promise.all([ugsQuery, totalQuery]);

    const totalCount = total ? total.count : 0;

    const nextCursor =
      offset + limit < Number(totalCount) ? offset + limit : null;
    const prevCursor = offset > 0 ? offset - limit : null;

    res.status(200).json({
      ugs,
      cursor: { next: nextCursor, prev: prevCursor },
      totalCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

// new
router.get(
  "/download-search",
  verifyUser,
  checkHasBatimentAccess,
  async (req, res) => {
    /* 
     #swagger.tags = ['Unité de gestion']
     #swagger.description = "Get the downloaded search"
     #swagger.parameters['batiment_id'] = {
          in: 'query',
          description: 'ID of the batiment to filter prices',
          required: true,
          type: 'integer'
     }
     #swagger.parameters['search'] = {
          in: 'query',
          description: 'Search term',
          required: false,
          type: 'string'
     }
     #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
     } 
     #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }  
  */
    let {
      batiment_id,
      search = "",
      loue,
      disponible,
      dateAvailable,
    } = req.query;

    if (!batiment_id) {
      res.status(400).json({ message: "Le batiment est requis." });
      return;
    }

    const batiment = await db("ugbats")
      .select("name")
      .where({ batiment_id })
      .first();

    if (!batiment) {
      res.status(404).json({ message: "Batiment not found." });
      return;
    }

    const batimentName = batiment.name.replace(/[^a-zA-Z0-9]/g, "_");

    const isLoue = loue === "true";
    const isDisponible = disponible === "true";

    if (!dateAvailable) {
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

      dateAvailable = `${year}-${month}-${day}`;
    }

    let baseQuery = db("ugdesc")
      .select(
        "ugdesc.ug_id",
        "ugdesc.name",
        "nature_ug_params.name as nature",
        "ugbats.name as batiment_name",
        db.raw(`
    CONCAT(
        COALESCE(ugdesc.num_voie, ''), ' ', 
        COALESCE(ugdesc.typ_voie, ''), ' ', 
        COALESCE(ugdesc.int_voie, ''), ' ', 
        COALESCE(ugdesc.complement_voie, ''), ' ', 
        COALESCE(ugdesc.code_postal, ''), ' ', 
        COALESCE(ugdesc.commune, ''), ' ', 
        COALESCE(ugdesc.cedex, ''), ' ', 
        COALESCE(ugdesc.pays, '')
    ) AS address
`),
        "ugdesc.surface",
        "ugetages.num_etage",
        db.raw("COALESCE(surface_occupied.surface_rent, 0) as surface_occupe"),
        "ugdesc.date_construction",
        "ugdesc.date_entree"
      )
      .leftJoin("ugetages", "ugetages.etage_id", "ugdesc.etage_id")
      .leftJoin("ugbats", "ugbats.batiment_id", "ugbats.batiment_id")
      .leftJoin(
        "nature_ug_params",
        "nature_ug_params.nature_ug_id",
        "ugdesc.nature_ug_id"
      )
      .leftJoin(
        db("ugconv")
          .select("ugconv.ug_id")
          .sum("ugconv.surface_rent as surface_rent")
          .join(
            db("ugconv as sub")
              .select("sub.conv_id")
              .max("sub.version as max_version")
              .groupBy("sub.conv_id")
              .as("max_versions"),
            function () {
              this.on("ugconv.conv_id", "=", "max_versions.conv_id").andOn(
                "ugconv.version",
                "=",
                "max_versions.max_version"
              );
            }
          )
          .where(function () {
            this.where("ugconv.date_debut", "<=", dateAvailable).andWhere(
              function () {
                this.where("ugconv.date_fin", ">=", dateAvailable).orWhereNull(
                  "ugconv.date_fin"
                );
              }
            );
          })
          .groupBy("ugconv.ug_id")
          .as("surface_occupied"),
        "ugdesc.ug_id",
        "surface_occupied.ug_id"
      )
      .where({ "ugdesc.batiment_id": batiment_id, "ugdesc.is_deleted": false });

    if (search) {
      baseQuery = baseQuery.where(function () {
        this.where("ugdesc.name", "like", `%${search}%`)
          .orWhere("nature_ug_params.name", "like", `%${search}%`)
          .orWhere("ugdesc.ug_id", "like", `%${search}%`);
      });
    }

    if (isLoue) {
      baseQuery.andWhereRaw(
        "COALESCE(surface_occupied.surface_rent, 0) = ugdesc.surface"
      );
    }

    if (isDisponible) {
      baseQuery.andWhereRaw(
        "COALESCE(surface_occupied.surface_rent, 0) < ugdesc.surface"
      );
    }

    const ugs = await baseQuery.orderBy("ugetages.num_etage", "asc");

    const ugIds = ugs.map((ug) => ug.ug_id);

    const ugequip = await db("ugequip")
      .select(
        "ugequip.equipement_id",
        "ugequip.ug_id",
        "ugdesc.name as ug_name",
        "nature_equipements_params.name as equipement_nature",
        "ugequip.name as equipement_name",
        "ugequip.equipement_prix"
      )
      .leftJoin("ugdesc", "ugdesc.ug_id", "ugequip.ug_id")
      .leftJoin(
        "nature_equipements_params",
        "nature_equipements_params.nature_equipement_id",
        "ugequip.nature_equipement_id"
      )
      .whereIn("ugequip.ug_id", ugIds)
      .where({ "ugequip.is_deleted": false })
      .orderBy("ugequip.ug_id");

    const ugsHeaders = [
      "UG ID",
      "Name",
      "Nature",
      "Batiment Name",
      "Address",
      "Surface",
      "Etage",
      "Surface Occupée",
      "Date Construction",
      "Date Entrée",
    ];
    const ugequipHeaders = [
      "Equipement ID",
      "UG ID",
      "UG Name",
      "Nature Equipement",
      "Nom Equipement",
      "Prix Equipement",
    ];

    const worksheetUGDESC = XLSX.utils.json_to_sheet(ugs, { skipHeader: true });
    const worksheetUGEQUIP = XLSX.utils.json_to_sheet(ugequip, {
      skipHeader: true,
    });

    ugsHeaders.forEach((header, index) => {
      const cellAddress = XLSX.utils.encode_cell({ c: index, r: 0 });
      worksheetUGDESC[cellAddress] = { t: "s", v: header };
    });

    ugequipHeaders.forEach((header, index) => {
      const cellAddress = XLSX.utils.encode_cell({ c: index, r: 0 });
      worksheetUGEQUIP[cellAddress] = { t: "s", v: header };
    });

    XLSX.utils.sheet_add_json(worksheetUGDESC, ugs, {
      skipHeader: true,
      origin: { r: 1, c: 0 },
    });

    XLSX.utils.sheet_add_json(worksheetUGEQUIP, ugequip, {
      skipHeader: true,
      origin: { r: 1, c: 0 },
    });

    worksheetUGDESC["!ref"] = XLSX.utils.encode_range({
      s: { c: 0, r: 0 }, 
      e: { c: ugsHeaders.length - 1, r: ugs.length }, 
    });

    worksheetUGEQUIP["!ref"] = XLSX.utils.encode_range({
      s: { c: 0, r: 0 }, 
      e: { c: ugequipHeaders.length - 1, r: ugequip.length },
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheetUGDESC, "Unité de gestion");
    XLSX.utils.book_append_sheet(workbook, worksheetUGEQUIP, "Equipements");
    const filename = `${batimentName}_Locaux${isLoue ? "_Loue" : ""}${isDisponible ? "_Disponible" : ""}${dateAvailable ? `_${dateAvailable}` : ""}${search ? `_${search}` : ""}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    res.end(buffer);
  }
);

// new
router.get("/ug-infos/:ug_id", verifyUser, async (req, res) => {
  /* 
     #swagger.tags = ['Unité de gestion']
     #swagger.description = "Get the downloaded search"
     #swagger.parameters['ug_id'] = {
          in: 'path',
          description: 'ID of the batiment to filter prices',
          required: true,
          schema: { type: 'integer' }
     }
    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/UgInfosResponse' }
     } 
     #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
     } 
     #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }  
  */
  try {
    const { ug_id } = req.params;

    if (!ug_id) {
      res.status(400).json({ message: "L'identifiant est requis." });
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

    const ugInfos: UgInfos = await db("ugdesc")
      .select(
        "ugdesc.ug_id",
        "ugdesc.name",
        "ugdesc.nature_ug_id",
        "ugdesc.batiment_id",
        "ugdesc.num_voie",
        "ugdesc.typ_voie",
        "ugdesc.int_voie",
        "ugdesc.complement_voie",
        "ugdesc.code_postal",
        "ugdesc.commune",
        "ugdesc.cedex",
        "ugdesc.pays",
        "ugdesc.surface",
        "ugdesc.etage_id",
        "ugdesc.date_construction",
        "ugdesc.date_entree"
      )
      .where({ ug_id, is_deleted: false })
      .first();

    let prixPepiniereQuery = Promise.resolve({
      prix_an_1: undefined,
      prix_an_2: undefined,
      prix_an_3: undefined,
    });
    let prixCentreQuery = Promise.resolve({
      prix_centre_affaires: undefined,
    });

    if (ugInfos.surface) {
      prixPepiniereQuery = db("surface_prix_ugs")
        .select("prix_an_1", "prix_an_2", "prix_an_3")
        .where({ surface: ugInfos.surface, prix_type: "pepiniere" })
        .where(
          db.raw(
            `? BETWEEN prix_date_debut AND COALESCE(prix_date_fin, '9999-12-31')`,
            [formattedCurrentDate]
          )
        )
        .first();

      prixCentreQuery = db("surface_prix_ugs")
        .select("prix_centre_affaires")
        .where({ surface: ugInfos.surface, prix_type: "centre_affaires" })
        .where(
          db.raw(
            `? BETWEEN prix_date_debut AND COALESCE(prix_date_fin, '9999-12-31')`,
            [formattedCurrentDate]
          )
        )
        .first();
    }

    const equipementsQuery = db("ugequip")
      .select(
        "nature_equipements_params.name as type",
        "ugequip.name",
        "ugequip.equipement_prix",
        "ugequip.equipement_id",
        "convdesc.tiepm_id",
        "convdesc.raison_sociale",
        "convdesc.conv_id",
        "convdesc.version"
      )
      .leftJoin(
        "nature_equipements_params",
        "nature_equipements_params.nature_equipement_id",
        "ugequip.nature_equipement_id"
      )
      .leftJoin(
        db("eqconv")
          .select(
            "eqconv.equipement_id",
            "eqconv.conv_id",
            "max_versions.max_version"
          )
          .join(
            db("eqconv as sub")
              .select("sub.conv_id")
              .max("sub.version as max_version")
              .groupBy("sub.conv_id")
              .as("max_versions"),
            function () {
              this.on("eqconv.conv_id", "=", "max_versions.conv_id").andOn(
                "eqconv.version",
                "=",
                "max_versions.max_version"
              );
            }
          )
          .as("latest_eqconv"),
        "ugequip.equipement_id",
        "latest_eqconv.equipement_id"
      )
      .leftJoin("convdesc", function () {
        this.on("latest_eqconv.conv_id", "=", "convdesc.conv_id").andOn(
          "latest_eqconv.max_version",
          "=",
          "convdesc.version"
        );
      })
      .where({ "ugequip.ug_id": ug_id, "ugequip.is_deleted": false });

    const locatairesQuery = db("ugconv")
      .select(
        "convdesc.conv_id",
        "convdesc.version",
        "convdesc.raison_sociale",
        "ugconv.date_debut",
        "ugconv.date_fin",
        "ugconv.surface_rent"
      )
      .join(
        db("ugconv as sub")
          .select("sub.conv_id")
          .max("sub.version as max_version")
          .groupBy("sub.conv_id")
          .as("max_versions"),
        function () {
          this.on("ugconv.conv_id", "=", "max_versions.conv_id").andOn(
            "ugconv.version",
            "=",
            "max_versions.max_version"
          );
        }
      )
      .join("convdesc", function () {
        this.on("ugconv.conv_id", "=", "convdesc.conv_id").andOn(
          "ugconv.version",
          "=",
          "convdesc.version"
        );
      })
      .where({ "ugconv.ug_id": ug_id })
      .where(
        db.raw(
          `? BETWEEN ugconv.date_debut AND COALESCE(ugconv.date_fin, '9999-12-31')`,
          [formattedCurrentDate]
        )
      );

    const [prixPepiniere, prixCentre, equipements, locataires] =
      await Promise.all([
        prixPepiniereQuery,
        prixCentreQuery,
        equipementsQuery,
        locatairesQuery,
      ]);

    const prix: Prix = {
      prix_an_1: prixPepiniere?.prix_an_1,
      prix_an_2: prixPepiniere?.prix_an_2,
      prix_an_3: prixPepiniere?.prix_an_3,
      prix_centre_affaires: prixCentre?.prix_centre_affaires,
    };

    res.status(200).json({
      ugInfos,
      prix,
      equipements: equipements as Equipement[],
      locataires,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

// new
router.put("/ug-infos/:ug_id", verifyAdmin, async (req: AdminRequest, res) => {
  /* 
     #swagger.tags = ['Unité de gestion']
     #swagger.description = "Modify ug infos"
     #swagger.parameters['ug_id'] = {
          in: 'path',
          description: 'ID of the batiment to filter prices',
          required: true,
          schema: { type: 'integer' }
     }
    #swagger.requestBody = {
      schema: { $ref: '#/components/schemas/UgInfosBody' }
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
    const user_id = req.user_id;
    const { ug_id } = req.params;
    const {
      name,
      nature_ug_id,
      batiment_id,
      num_voie,
      typ_voie,
      int_voie,
      complement_voie,
      code_postal,
      commune,
      cedex,
      pays,
      surface,
      etage_id,
      date_construction,
      date_entree,
    } = req.body;

    if (!ug_id) {
      await trx.rollback();
      res.status(400).json({ message: "L'identifiant est requis." });
      return;
    }

    if (surface) {
      const getAllSurfacesResponse: { surface: number }[] = await trx(
        "surface_prix_ugs"
      )
        .distinct("surface")
        .where({ batiment_id });

      const checkSurfaceAlreadyExisting = getAllSurfacesResponse.find(
        (surfaceExisting) => surfaceExisting.surface === surface
      );

      if (!checkSurfaceAlreadyExisting) {
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

        const getAllPeriodsAndTypesResponse: {
          prix_date_debut: string;
          prix_date_fin: string;
          prix_type: "string";
        }[] = await trx("surface_prix_ugs")
          .distinct("prix_type", "prix_date_debut", "prix_date_fin")
          .where({ batiment_id })
          .whereIn("prix_type", ["pepiniere", "centre_affaires"])
          .where((builder) =>
            builder
              .where("prix_date_debut", ">=", formattedCurrentDate)
              .orWhereNull("prix_date_fin")
              .orWhere((subBuilder) =>
                subBuilder
                  .where("prix_date_debut", "<=", formattedCurrentDate)
                  .andWhere("prix_date_fin", ">=", formattedCurrentDate)
              )
          );

        await Promise.all(
          getAllPeriodsAndTypesResponse.map((period) => {
            return trx("surface_prix_ugs").insert({
              surface,
              batiment_id,
              prix_type: period.prix_type,
              prix_date_debut: period.prix_date_debut,
              prix_date_fin: period.prix_date_fin || null,
              creation_user: user_id,
              update_user: user_id,
            });
          })
        );
      }
    }

    await trx("ugdesc")
      .update({
        name,
        nature_ug_id,
        batiment_id,
        num_voie: num_voie || null,
        typ_voie: typ_voie || null,
        int_voie,
        complement_voie: complement_voie || null,
        code_postal,
        commune,
        cedex: cedex || null,
        pays,
        surface,
        etage_id,
        date_construction: date_construction || null,
        date_entree: date_entree || null,
      })
      .where({ "ugdesc.ug_id": ug_id });

    await trx.commit();

    res.status(200).json({ message: "La modification est un succès" });
  } catch (err) {
    await trx.rollback();
    console.error(err);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

// new
router.get("/files/:ug_id", verifyUser, async (req, res) => {
  /* 
     #swagger.tags = ['Unité de gestion']
     #swagger.description = "Get the downloaded search"
     #swagger.parameters['ug_id'] = {
          in: 'path',
          description: 'ID of the batiment to filter prices',
          required: true,
          schema: { type: 'integer' }
     }
    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/UgFilesResponse' }
     } 
     #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequestFiles' }
     } 
     #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }  
  */

  const { ug_id } = req.params;

  if (!ug_id) {
    res.status(400).json({ message: "L'identifiant est requis." });
    return;
  }

  try {
    const listParams = {
      Bucket: R2_BUCKET_NAME,
      Prefix: `Pepiniere Patrimoine/${ug_id}/imported`,
    };

    const data = await r2.send(new ListObjectsV2Command(listParams));
    const files = data.Contents || [];

    const fileObjects = files.filter(
      (file) => file.Key && file.Size !== undefined && file.Size > 0
    );

    const filesWithUrls = await Promise.all(
      fileObjects.map(async (file) => {
        const command = new GetObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: file.Key!,
        });

        const url = await getSignedUrl(r2, command, { expiresIn: 60 * 5 });
        const filename = file.Key!.split("/").pop();

        return { url, filename };
      })
    );

    res.status(200).json(filesWithUrls);
  } catch (error) {
    console.error("Error listing files:", error);
  }
});

//new
router.post(
  "/files/:ug_id",
  verifyAdmin,
  upload.array("files"),
  async (req, res) => {
    /* 
     #swagger.tags = ['Unité de gestion']
     #swagger.description = "Upload multiple files to the imported folder for a specific ug"
     #swagger.parameters['ug_id'] = {
          in: 'path',
          description: 'ID of the bâtiment to filter prices',
          required: true,
          schema: { type: 'integer' }
     }
    #swagger.requestBody = {
      content: {
        "multipart/form-data": {
          schema: {
            type: "object",
            properties: {
              files: {
                type: "array",
                items: { type: "string", format: "binary" }
              }
            }
          }
        }
      }
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
    const { ug_id } = req.params;

    if (!ug_id) {
      res.status(400).json({ message: "L'identifiant est requis." });
      return;
    }

    if (!req.files || !Array.isArray(req.files)) {
      res
        .status(400)
        .json({ message: "Des fichiers sont requis pour l'importation." });
      return;
    }

    try {
      await Promise.all(
        req.files.map(async (file) => {
          const key = `Pepiniere Patrimoine/${ug_id}/imported/${file.originalname}`;

          const uploadCommand = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
          });

          await r2.send(uploadCommand);

          return {
            filename: file.originalname,
            path: key,
            success: true,
          };
        })
      );

      res.status(200).json({
        message: "Les fichiers ont été importés avec succès.",
      });
    } catch (error) {
      console.error("Error uploading files to R2:", error);
      res.status(500).json({ message: "Error uploading files" });
    }
  }
);

//new
router.put("/files/:ug_id", verifyAdmin, async (req, res) => {
  /* 
     #swagger.tags = ['Unité de gestion']
     #swagger.description = "Move to the archive a file"
     #swagger.parameters['ug_id'] = {
          in: 'path',
          description: 'ID of the batiment to filter prices',
          required: true,
          schema: { type: 'integer' }
     }
    #swagger.requestBody = {
      schema: { type: "object", properties: { filename: { type: "string" } } }
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
  const { ug_id } = req.params;
  const { filename } = req.body;

  if (!ug_id || !filename) {
    res
      .status(400)
      .json({ message: "L'identifiant et le nom du fichier sont requis." });
    return;
  }

  const sourceKey = `Pepiniere Patrimoine/${ug_id}/imported/${filename}`;
  const destinationKey = `Pepiniere Patrimoine/${ug_id}/archived/${filename}`;

  console.log(R2_BUCKET_NAME, sourceKey, destinationKey)

  try {
    await r2.send(
      new CopyObjectCommand({
        Bucket: R2_BUCKET_NAME,
        CopySource: `${R2_BUCKET_NAME}/${sourceKey}`,
        Key: destinationKey,
      })
    );

    await r2.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: sourceKey,
      })
    );

    res.status(200).json({
      message: "Fichier déplacé vers le dossier 'archived' avec succès.",
    });
  } catch (error) {
    console.error("Erreur lors du déplacement du fichier:", error);
    res.status(500).json({ message: "Erreur lors du déplacement du fichier." });
  }
});

router.get("/occupants/:id", async (req, res) => {
  const { id } = req.params;
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  const formatter = new Intl.DateTimeFormat("en-GB", options);
  const parisDate = formatter.format(now);
  const formattedDate = parisDate.split("/").reverse().join("-");
  const responseSIGCONV = await db.raw(
    `
  SELECT 
    SIGCONV.convId,
    SIGCONV.convVrs,
    GROUP_CONCAT(DISTINCT TIEDESC.tiLib SEPARATOR ' ET ') AS tiLibs, 
    UGCONV.ugId,
    UGCONV.ugconvSurf,
    UGCONV.ugconvDtd,
    UGCONV.ugconvDtf
  FROM 
      SIGCONV
  LEFT JOIN 
      UGCONV ON UGCONV.convId = SIGCONV.convId AND UGCONV.convVrs = SIGCONV.convVrs
  LEFT JOIN 
      TIEDESC ON TIEDESC.tiId = SIGCONV.tiId
  INNER JOIN 
      (SELECT 
          convId,
          MAX(convVrs) AS maxConvVrs
      FROM 
          UGCONV
      GROUP BY 
          convId
      ) AS MaxVrs ON MaxVrs.convId = SIGCONV.convId AND MaxVrs.maxConvVrs = SIGCONV.convVrs
   WHERE 
    UGCONV.ugId = ?
AND ? BETWEEN UGCONV.ugconvDtd AND COALESCE(NULLIF(UGCONV.ugconvDtf, ''), '9999-12-31')  
GROUP BY 
    SIGCONV.convId,
    SIGCONV.convVrs,
    UGCONV.ugId,
    UGCONV.ugconvSurf,
    UGCONV.ugconvDtd,
    UGCONV.ugconvDtf
  ORDER BY
    UGCONV.ugconvDtd DESC
    `,
    [id, formattedDate]
  );

  res.json(responseSIGCONV);
});

// new
router.post(
  "/equipement/:ug_id",
  verifyAdmin,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Unité de gestion']
     #swagger.description = "Post new equipment"
      #swagger.parameters['ug_id'] = {
          in: 'query',
          description: 'ID of the ug',
          required: true,
          type: 'integer'
     }
    #swagger.requestBody = {
      schema: { $ref: '#/components/schemas/UgInfosBody' }
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
    const user_id = req.user_id;
    const { ug_id } = req.params;
    const { name, nature_equipement_id, equipement_prix } = req.body;

    if (!ug_id) {
      res.status(400).json({ message: "L'identifiant de l'ug est requis." });
      return;
    }

    const trx = await db.transaction();

    try {
      await trx("ugequip").insert({
        name,
        nature_equipement_id,
        equipement_prix,
        ug_id,
        creation_user: user_id,
        update_user: user_id,
      });

      await trx.commit();

      res
        .status(200)
        .json({ message: "La création de l'équipement est un succès." });
    } catch (err) {
      await trx.rollback();
      console.error(err);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer" });
    }
  }
);

// new
router.delete("/equipement/:equipement_id", async (req, res) => {
  const { equipement_id } = req.params;

  if (!equipement_id) {
    res
      .status(400)
      .json({ message: "L'identifiant de l'équipement est requis." });
    return;
  }
  const trx = await db.transaction();

  try {
    await trx("ugequip")
      .update({ is_deleted: true })
      .where({ equipement_id });

    await trx.commit()
    res.status(200).json({ message: "La suppression est un succès." });
  } catch (err) {
    await trx.rollback();
    console.error(err);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer" });
  }
});

export { router as ugRouter };
