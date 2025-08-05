import express, { Request, Response } from "express";
import { db } from "../data/db";
import multer from "multer";
import * as XLSX from "xlsx";
import dotenv from "dotenv";
import { s3 } from "../s3Client";
import {
  PutObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { UserRequest, verifyUser } from "../middlewares/checkUser";
import { checkHasBatimentAccess } from "../middlewares/checkHasBatiment";
import { checkHasConventionAccess } from "../middlewares/checkHasConventionAccess";
import { AdminRequest, verifyAdmin } from "../middlewares/checkAdmin";
import { r2 } from "../r2Client";
import {
  PrixCentre,
  PrixPepiniere,
  Rubrique,
  SurfaceUg,
  UgVersion,
} from "../types/convRouterTypes";
import { CronJob } from "cron";

dotenv.config();

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME as string;

//new
router.get("/", verifyUser, checkHasBatimentAccess, async (req, res) => {
  /* 
     #swagger.tags = ['Conventions']
     #swagger.description = "Get conventions with pagination"
     #swagger.parameters['batiment_id'] = {
          in: 'query',
          description: 'ID of the batiment',
          required: true,
          type: 'integer'
     }
    #swagger.parameters['typ_conv'] = {
          in: 'query',
          description: 'Type of conventions (PEPINIERE, COWORKING)',
          required: true,
          type: 'integer'
     }
    #swagger.parameters['selectedDate'] = {
          in: 'query',
          description: 'date to look for conventions',
          required: false,
          type: 'string'
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
      #swagger.parameters['active'] = {
          in: 'query',
          description: 'Active field',
          required: false,
          type: 'boolean',
          default: true
     }
    #swagger.parameters['resilie'] = {
          in: 'query',
          description: 'Expired field',
          required: false,
          type: 'boolean',
          default: true
     }
     #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/ConventionSearchResponse' }
     } 
     #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
     } 
     #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }  
  */
  let {
    search,
    limit = 10,
    offset = 0,
    batiment_id,
    typ_conv,
    selectedDate,
    active,
    resilie,
  } = req.query;

  if (!batiment_id) {
    res.status(400).json({ message: "Le batiment est requis." });
    return;
  }

  limit = Number(limit);
  offset = Number(offset);
  const isActive = active === "true";
  const isResilie = resilie === "true";

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

  try {
    let globalQuery;
    let totalGlobalQuery;

    const baseQuery = db
      .from(
        db("convdesc as cd")
          .select(
            "cd.conv_id",
            "cd.version",
            "cd.raison_sociale",
            "cd.typ_conv",
            "cd.date_debut",
            "cd.date_fin",
            db.raw(
              `
        CASE 
         WHEN cd.date_fin is NULL OR cd.date_fin >= ? THEN 'Active'
         WHEN cd.date_fin < ? THEN 'Résilié'
        END AS statut
        `,
              [formattedCurrentDate, formattedCurrentDate]
            )
          )
          .join(
            db("convdesc as sub")
              .select("sub.conv_id")
              .max("sub.version as max_version")
              .groupBy("sub.conv_id")
              .as("maxVersions"),
            function () {
              this.on("cd.conv_id", "=", "maxVersions.conv_id").andOn(
                "cd.version",
                "=",
                "maxVersions.max_version"
              );
            }
          )
          .modify((query) => {
            if (typ_conv) {
              query.where({ "cd.typ_conv": typ_conv });
            }

            if (selectedDate) {
              query
                .andWhere("cd.date_debut", "<=", selectedDate)
                .andWhere((subQuery) => {
                  subQuery
                    .where("cd.date_fin", ">=", selectedDate)
                    .orWhereNull("cd.date_fin");
                });
            }

            if (search) {
              query.andWhere("cd.raison_sociale", "like", `%${search}%`);
            }
          })
          .as("base")
      )
      .modify((query) => {
        if (isActive) {
          query.where({ statut: "Active" });
        }

        if (isResilie) {
          query.orWhere({ statut: "Résilié" });
        }
      });

    globalQuery = baseQuery.clone().limit(limit).offset(offset);

    totalGlobalQuery = baseQuery
      .clone()
      .clearSelect()
      .count("* as count")
      .first();

    const [global, total] = await Promise.all([globalQuery, totalGlobalQuery]);

    const totalCount = total ? total.count : 0;

    const nextCursor =
      offset + limit < Number(totalCount) ? offset + limit : null;
    const prevCursor = offset > 0 ? offset - limit : null;

    res.status(200).json({
      global,
      cursor: { next: nextCursor, prev: prevCursor },
      totalCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

// job to update anniversaire conventions
const job = new CronJob(
  "0 3 * * *",
  async () => {
    console.log("Running yearly update for PORTEUR PROJET...");
    try {
      await anniversaireJob();
      console.log("anniversaire update completed successfully.");
    } catch (error) {
      console.error(error);
    }
  },
  null,
  true,
  "Europe/Paris"
);

// function /anniversaire get
async function anniversaireJob() {
  const trx = await db.transaction();
  try {
    const currentDate = new Date(
      new Intl.DateTimeFormat("fr-FR", {
        timeZone: "Europe/Paris",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
        .format(new Date())
        .replace(
          /(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}):(\d{2})/,
          "$3-$2-$1T$4:$5:$6"
        )
    );

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

    const allActiveConventions = await trx("convdesc as cd")
      .select(
        "cd.conv_id",
        "cd.version",
        "cd.company_id",
        "cd.conv_age",
        "cd.date_debut"
      )
      .join(
        db("convdesc as sub")
          .select("sub.conv_id")
          .max("sub.version as max_version")
          .groupBy("sub.conv_id")
          .as("maxVersions"),
        function () {
          this.on("cd.conv_id", "=", "maxVersions.conv_id").andOn(
            "cd.version",
            "=",
            "maxVersions.max_version"
          );
        }
      )
      .where("cd.date_debut", "<=", formattedCurrentDate)
      .andWhere((subQuery) => {
        subQuery
          .where("cd.date_fin", ">=", formattedCurrentDate)
          .orWhereNull("cd.date_fin");
      });

    const queries = allActiveConventions.map(async (convention) => {
      const dateDebutConvention = new Date(convention.date_debut);
      const difference_ms =
        currentDate.getTime() - dateDebutConvention.getTime();
      const age = Math.floor(difference_ms / 1000 / 60 / 60 / 24 / 365);
      if (age != convention.conv_age) {
        const notificationQuery = trx("notifications")
          .insert({
            company_id: convention.company_id,
            conv_id: convention.conv_id,
          })
          .onConflict(["company_id", "conv_id"])
          .ignore();

        const convdescQuery = trx("convdesc")
          .update({ conv_age: age })
          .where({ conv_id: convention.conv_id, version: convention.version });

        await Promise.all([notificationQuery, convdescQuery]);
      }
    });

    await Promise.all(queries);

    await trx.commit();
  } catch (e) {
    await trx.rollback();
    console.error(e);
  }
}

//new
router.get("/anniversaire", async (req, res) => {
  /* 
     #swagger.tags = ['Conventions']
     #swagger.description = "Cron job to update conventions ages"
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
    const currentDate = new Date(
      new Intl.DateTimeFormat("fr-FR", {
        timeZone: "Europe/Paris",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
        .format(new Date())
        .replace(
          /(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}):(\d{2})/,
          "$3-$2-$1T$4:$5:$6"
        )
    );

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

    const allActiveConventions = await trx("convdesc as cd")
      .select(
        "cd.conv_id",
        "cd.version",
        "cd.company_id",
        "cd.conv_age",
        "cd.date_debut"
      )
      .join(
        db("convdesc as sub")
          .select("sub.conv_id")
          .max("sub.version as max_version")
          .groupBy("sub.conv_id")
          .as("maxVersions"),
        function () {
          this.on("cd.conv_id", "=", "maxVersions.conv_id").andOn(
            "cd.version",
            "=",
            "maxVersions.max_version"
          );
        }
      )
      .where("cd.date_debut", "<=", formattedCurrentDate)
      .andWhere((subQuery) => {
        subQuery
          .where("cd.date_fin", ">=", formattedCurrentDate)
          .orWhereNull("cd.date_fin");
      });

    const queries = allActiveConventions.map(async (convention) => {
      const dateDebutConvention = new Date(convention.date_debut);
      const difference_ms =
        currentDate.getTime() - dateDebutConvention.getTime();
      const age = Math.floor(difference_ms / 1000 / 60 / 60 / 24 / 365);
      if (age != convention.conv_age) {
        const notificationQuery = trx("notifications").insert({
          company_id: convention.company_id,
          conv_id: convention.conv_id,
        });
        const convdescQuery = trx("convdesc")
          .update({ conv_age: age })
          .where({ conv_id: convention.conv_id, version: convention.version });

        await Promise.all([notificationQuery, convdescQuery]);
      }
    });

    await Promise.all(queries);

    await trx.commit();

    res.status(200).json({ message: "Les notifications ont bien été créées." });
  } catch (e) {
    await trx.rollback();
    console.error(e);
    res.status(500).json({
      message: "Erreur serveur, lors de l'actualisation des conventions",
    });
  }
});

//new
router.get(
  "/checks/:conv_id/:version",
  verifyAdmin,
  checkHasConventionAccess,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Conventions']
     #swagger.description = "Get the checks of a specific convention"
     #swagger.parameters['conv_id'] = {
          in: 'path',
          description: 'Convention ID',
          required: true,
          type: 'integer'
     }
    #swagger.parameters['version'] = {
          in: 'path',
          description: 'Version convention',
          required: true,
          type: 'integer'
     }
     #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/ConventionChecksResponse' }
     } 
     #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
     } 
     #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }  
  */
    try {
      //first check anniversaire
      const { conv_id } = req.params;
      const company_id = req.company_id;

      const allVersionsConvention = await db("convdesc")
        .select("version", "conv_age", "statut")
        .where({ conv_id })
        .orderBy("version", "desc");

      const conventionAge = allVersionsConvention[0].conv_age;

      let checkAnniversaire;
      if (conventionAge > 0) {
        const allStatutsAvenantAnniversaire = Array.from(
          { length: conventionAge },
          (_, i) => i + 1
        ).map((age) => {
          return `AVENANT ${age}A`;
        });

        checkAnniversaire = allStatutsAvenantAnniversaire.every((statut) => {
          return allVersionsConvention.some(
            (convention) => convention.statut === statut
          );
        });
      } else {
        checkAnniversaire = true;
      }

      //check files
      //statut: name_of_file
      //INITIAL = INITIAL
      //AVENANT {NUMBER}A = AVENANT_{}A_whatever
      //AVENANT STATUT JURIDIQUE {number} = AVENANT_STATUT_JURIDIQUE_{NUMBER}
      //AVENANT ENTITE {NUMBER} = AVENANT_ENTITE_{NUMBER}
      //AVENANT LOCAL {NUMBER} = AVENANT_LOCAL_{NUMBER}

      let allStatutsAvenants = allVersionsConvention.map((convention) => {
        return { statut: convention.statut, verified: false };
      });

      const prefix = `${R2_BUCKET_NAME}/Pepiniere Conventions/${conv_id}/imported`;

      const listParams = {
        Bucket: R2_BUCKET_NAME,
        Prefix: prefix,
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

      if (filesWithUrls.length) {
        allStatutsAvenants = allStatutsAvenants.map((statutAvenant) => {
          const statut = statutAvenant.statut;

          const patterns = [
            { regex: /^INITIAL$/, template: "INITIAL" },
            { regex: /^AVENANT (\d+)A$/, template: "AVENANT_${number}A" },
            {
              regex: /^AVENANT STATUT JURIDIQUE (\d+)$/,
              template: "AVENANT_STATUT_JURIDIQUE_${number}",
            },
            {
              regex: /^AVENANT ENTITE (\d+)$/,
              template: "AVENANT_ENTITE_${number}",
            },
            {
              regex: /^AVENANT LOCAL (\d+)$/,
              template: "AVENANT_LOCAL_${number}",
            },
          ];

          const isVerified = filesWithUrls.some(({ filename }) => {
            const filenameWithoutExtension =
              filename && filename.split(".").slice(0, -1).join(".");
            for (const { regex, template } of patterns) {
              const match = statut.match(regex);
              if (match && filenameWithoutExtension) {
                const expectedFilename = template.replace(
                  /\${number}/g,
                  match[1]
                );
                if (filenameWithoutExtension.startsWith(expectedFilename)) {
                  return true;
                }
              }
            }
            return false;
          });

          return { ...statutAvenant, verified: isVerified };
        });
      }

      const checkFiles = allStatutsAvenants.filter(
        (item) => item.verified === false
      );

      if (checkAnniversaire && checkFiles.length === 0) {
        await db("notifications").delete().where({ conv_id });
      } else {
        await db("notifications")
          .insert({ company_id, conv_id })
          .onConflict(["company_id", "conv_id"])
          .ignore();
      }

      res.status(200).json({ checkAnniversaire, checkFiles });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

//new
router.post(
  "/anniversaire/:conv_id/:version",
  verifyAdmin,
  checkHasConventionAccess,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Conventions']
     #swagger.description = "update the statut of a specific convention for convention birthday"
     #swagger.parameters['conv_id'] = {
          in: 'path',
          description: 'Convention ID',
          required: true,
          type: 'integer'
     }
    #swagger.parameters['version'] = {
          in: 'path',
          description: 'Version convention',
          required: true,
          type: 'integer'
     }
     #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/ConventionAvenantResponse' }
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
      let { conv_id, version: version_str } = req.params;
      const user_id = req.user_id;

      let version = Number(version_str);

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

      const allVersionsConvention = await trx("convdesc")
        .select("version", "conv_age", "statut", "typ_conv")
        .where({ conv_id })
        .orderBy("version", "desc");

      const conventionAge = allVersionsConvention[0].conv_age;
      const typeConvention = allVersionsConvention[0].typ_conv;

      let newVersion;
      if (conventionAge > 0) {
        const allStatutsAvenantAnniversaire = Array.from(
          { length: conventionAge },
          (_, i) => i + 1
        ).map((age) => {
          return `AVENANT ${age}A`;
        });

        const avenantsAnniversaireToAdd = allStatutsAvenantAnniversaire.filter(
          (statut) => {
            const isStatutAnniversaireIn = allVersionsConvention.some(
              (convention) => convention.statut === statut
            );
            return !isStatutAnniversaireIn;
          }
        );

        if (avenantsAnniversaireToAdd.length) {
          newVersion = version + avenantsAnniversaireToAdd.length;

          if (typeConvention === "PEPINIERE") {
            const convdescLastVersionQuery = trx("convdesc")
              .select(
                "company_id",
                "batiment_id",
                "date_signature",
                "date_debut",
                "date_fin",
                "typ_conv",
                "raison_sociale",
                "legal_form_id",
                "tiepm_id",
                "statut",
                "conv_age",
                "creation_date",
                "creation_user"
              )
              .where({ conv_id, version })
              .first();

            const sigconvLastVersionQuery = trx("sigconv")
              .select("tiepp_id", "creation_date", "creation_user")
              .where({ conv_id, version });

            const ugconvLastVersionQuery = trx("ugconv")
              .select(
                "ug_id",
                "surface_rent",
                "date_debut",
                "date_fin",
                "creation_date",
                "creation_user"
              )
              .where({ conv_id, version });

            const eqconvLastVersionQuery = trx("eqconv")
              .select("equipement_id", "creation_date", "creation_user")
              .where({ conv_id, version });

            const rubconvLastVersionQuery = trx("rubconv")
              .select(
                "ug_id",
                "equipement_id",
                "rubrique",
                "periodicity",
                "condition_payment",
                "montant",
                "creation_date",
                "creation_user"
              )
              .where({ conv_id, version });

            const [
              convdescLastVersion,
              sigconvLastVersion,
              ugconvLastVersion,
              eqconvLastVersion,
              rubconvLastVersion,
            ] = await Promise.all([
              convdescLastVersionQuery,
              sigconvLastVersionQuery,
              ugconvLastVersionQuery,
              eqconvLastVersionQuery,
              rubconvLastVersionQuery,
            ]);

            const convdescNewVersions = avenantsAnniversaireToAdd.map(
              (avenantAnniversaire, index) => ({
                ...convdescLastVersion,
                version: version + index + 1,
                statut: avenantAnniversaire,
                conv_id,
                update_user: user_id,
              })
            );

            const sigconvNewVersions = avenantsAnniversaireToAdd.flatMap(
              (avenantAnniversaire, index) => {
                return sigconvLastVersion.map((signataire) => {
                  return {
                    ...signataire,
                    version: version + index + 1,
                    conv_id,
                    update_user: user_id,
                  };
                });
              }
            );

            const ugconvNewVersions = avenantsAnniversaireToAdd.flatMap(
              (avenantAnniversaire, index) => {
                return ugconvLastVersion.map((ug) => {
                  return {
                    ...ug,
                    version: version + index + 1,
                    conv_id,
                    update_user: user_id,
                  };
                });
              }
            );

            const eqconvNewVersions = avenantsAnniversaireToAdd.flatMap(
              (avenantAnniversaire, index) => {
                return eqconvLastVersion.map((equipement) => {
                  return {
                    ...equipement,
                    version: version + index + 1,
                    conv_id,
                    update_user: user_id,
                  };
                });
              }
            );

            const allUgs = [
              ...new Set(
                ugconvLastVersion
                  .filter((ug: UgVersion) => {
                    return (
                      !ug.date_fin ||
                      new Date(ug.date_fin) > new Date(formattedCurrentDate)
                    );
                  })
                  .map((ug) => ug.ug_id)
              ),
            ];

            const surfaceUgs: SurfaceUg[] = await trx("ugdesc")
              .select("ug_id", "surface")
              .whereIn("ug_id", allUgs);

            const surfacesRentUgs = ugconvLastVersion
              .filter((ug: UgVersion) => {
                return (
                  !ug.date_fin ||
                  new Date(ug.date_fin) > new Date(formattedCurrentDate)
                );
              })
              .map((ug) => ({
                ug_id: ug.ug_id,
                surfaceRent: ug.surface_rent ?? 0,
              }));

            const prixPepiniereSurfaceUgs = await Promise.all(
              surfaceUgs.map(async (item) => {
                const prixPepiniereQuery = trx("surface_prix_ugs")
                  .select("prix_an_1", "prix_an_2", "prix_an_3")
                  .where({ surface: item.surface, prix_type: "pepiniere" })
                  .where(
                    db.raw(
                      `? BETWEEN prix_date_debut AND COALESCE(prix_date_fin, '9999-12-31')`,
                      [formattedCurrentDate]
                    )
                  )
                  .first();

                const prixCentreQuery = trx("surface_prix_ugs")
                  .select("prix_centre_affaires")
                  .where({
                    surface: item.surface,
                    prix_type: "centre_affaires",
                  })
                  .where(
                    db.raw(
                      `? BETWEEN prix_date_debut AND COALESCE(prix_date_fin, '9999-12-31')`,
                      [formattedCurrentDate]
                    )
                  )
                  .first();

                const [prixPepiniere, prixCentre]: [PrixPepiniere, PrixCentre] =
                  await Promise.all([prixPepiniereQuery, prixCentreQuery]);

                const surfaceRent = surfacesRentUgs.find(
                  (ug) => ug.ug_id === item.ug_id
                )?.surfaceRent;

                if (prixPepiniere) {
                  prixPepiniere.prix_an_1 = surfaceRent
                    ? (prixPepiniere.prix_an_1 * surfaceRent) / item.surface
                    : prixPepiniere.prix_an_1;
                  prixPepiniere.prix_an_2 = surfaceRent
                    ? (prixPepiniere.prix_an_2 * surfaceRent) / item.surface
                    : prixPepiniere.prix_an_2;
                  prixPepiniere.prix_an_3 = surfaceRent
                    ? (prixPepiniere.prix_an_3 * surfaceRent) / item.surface
                    : prixPepiniere.prix_an_3;
                }

                if (prixCentre) {
                  prixCentre.prix_centre_affaires = surfaceRent
                    ? (prixCentre.prix_centre_affaires * surfaceRent) /
                    item.surface
                    : prixCentre.prix_centre_affaires;
                }

                return {
                  ug_id: item.ug_id,
                  prixPepiniere,
                  prixCentre,
                };
              })
            );

            const rubconvNewVersions = avenantsAnniversaireToAdd.flatMap(
              (avenantAnniversaire, index) => {
                return rubconvLastVersion.map((rubrique: Rubrique) => {
                  if (rubrique.equipement_id) {
                    return {
                      ...rubrique,
                      version: version + index + 1,
                      conv_id,
                      update_user: user_id,
                    };
                  } else {
                    const prixUg = prixPepiniereSurfaceUgs.find(
                      (item) => item.ug_id === rubrique.ug_id
                    );

                    const newMontant =
                      avenantAnniversaire === "AVENANT 1A"
                        ? prixUg?.prixPepiniere.prix_an_2
                        : avenantAnniversaire === "AVENANT 2A"
                          ? prixUg?.prixPepiniere.prix_an_3
                          : prixUg?.prixCentre.prix_centre_affaires;

                    return {
                      ...rubrique,
                      version: version + index + 1,
                      conv_id,
                      update_user: user_id,
                      montant: newMontant || 0,
                    };
                  }
                });
              }
            );

            await Promise.all([
              trx("convdesc").insert(convdescNewVersions),
              trx("sigconv").insert(sigconvNewVersions),
              trx("ugconv").insert(ugconvNewVersions),
              trx("eqconv").insert(eqconvNewVersions),
              trx("rubconv").insert(rubconvNewVersions),
            ]);
          } else if (typeConvention === "COWORKING") {
            const convdescLastVersionQuery = trx("convdesc")
              .select(
                "company_id",
                "batiment_id",
                "date_signature",
                "date_debut",
                "date_fin",
                "typ_conv",
                "raison_sociale",
                "legal_form_id",
                "tiepm_id",
                "statut",
                "conv_age",
                "creation_date",
                "creation_user"
              )
              .where({ conv_id, version })
              .first();

            const sigconvLastVersionQuery = trx("sigconv")
              .select("tiepp_id", "creation_date", "creation_user")
              .where({ conv_id, version });

            const [convdescLastVersion, sigconvLastVersion] = await Promise.all(
              [convdescLastVersionQuery, sigconvLastVersionQuery]
            );

            const convdescNewVersions = avenantsAnniversaireToAdd.map(
              (avenantAnniversaire, index) => ({
                ...convdescLastVersion,
                version: version + index + 1,
                statut: avenantAnniversaire,
                conv_id,
                update_user: user_id,
              })
            );

            const sigconvNewVersions = avenantsAnniversaireToAdd.flatMap(
              (avenantAnniversaire, index) => {
                return sigconvLastVersion.map((signataire) => {
                  return {
                    ...signataire,
                    version: version + index + 1,
                    conv_id,
                    update_user: user_id,
                  };
                });
              }
            );

            await Promise.all([
              trx("convdesc").insert(convdescNewVersions),
              trx("sigconv").insert(sigconvNewVersions),
            ]);
          } else {
            await trx.rollback();
            res
              .status(400)
              .json({ message: "Erreur serveur, veuillez réessayer." });
          }
        }
      }

      await trx.commit();

      res
        .status(200)
        .json({ message: "La convention a bien été actualisé.", newVersion });
    } catch (err) {
      await trx.rollback();
      console.error(err);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

//new
router.post(
  "/avenant-statut-juridique/:conv_id/:version",
  verifyAdmin,
  checkHasConventionAccess,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Conventions']
     #swagger.description = "update the legal form of a specific convention"
     #swagger.parameters['conv_id'] = {
          in: 'path',
          description: 'Convention ID',
          required: true,
          type: 'integer'
     }
    #swagger.parameters['version'] = {
          in: 'path',
          description: 'Version convention',
          required: true,
          type: 'integer'
     }
    #swagger.requestBody = {
      schema: { type: "object", properties : { legal_form_id: { type: "number" } } }
    }
     #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/ConventionAvenantResponse' }
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
      const { conv_id, version: version_str } = req.params;
      const { legal_form_id } = req.body;
      const user_id = req.user_id;
      const version = Number(version_str);

      const allVersionsConvention = await trx("convdesc")
        .select("statut")
        .where({ conv_id })
        .orderBy("version", "desc");

      const nbAvenantStatutsJuridiques = allVersionsConvention.filter(
        (convention) => convention.statut.includes("STATUT JURIDIQUE")
      ).length;

      const convdescLastVersionQuery = trx("convdesc")
        .select(
          "conv_id",
          "version",
          "company_id",
          "batiment_id",
          "date_signature",
          "date_debut",
          "date_fin",
          "typ_conv",
          "raison_sociale",
          "legal_form_id",
          "tiepm_id",
          "statut",
          "conv_age",
          "creation_date",
          "creation_user"
        )
        .where({ conv_id, version })
        .first();

      const sigconvLastVersionQuery = trx("sigconv")
        .select(
          "conv_id",
          "version",
          "tiepp_id",
          "creation_date",
          "creation_user"
        )
        .where({ conv_id, version });

      const ugconvLastVersionQuery = trx("ugconv")
        .select(
          "conv_id",
          "version",
          "ug_id",
          "surface_rent",
          "date_debut",
          "date_fin",
          "creation_date",
          "creation_user"
        )
        .where({ conv_id, version });

      const eqconvLastVersionQuery = trx("eqconv")
        .select(
          "conv_id",
          "version",
          "equipement_id",
          "creation_date",
          "creation_user"
        )
        .where({ conv_id, version });

      const rubconvLastVersionQuery = trx("rubconv")
        .select(
          "conv_id",
          "version",
          "ug_id",
          "equipement_id",
          "rubrique",
          "periodicity",
          "condition_payment",
          "montant",
          "creation_date",
          "creation_user"
        )
        .where({ conv_id, version });

      const [
        convdescLastVersion,
        sigconvLastVersion,
        ugconvLastVersion,
        eqconvLastVersion,
        rubconvLastVersion,
      ] = await Promise.all([
        convdescLastVersionQuery,
        sigconvLastVersionQuery,
        ugconvLastVersionQuery,
        eqconvLastVersionQuery,
        rubconvLastVersionQuery,
      ]);

      const newVersion = version + 1;
      const tiepm_id = convdescLastVersion.tiepm_id;

      const newConvdesc = {
        ...convdescLastVersion,
        legal_form_id,
        version: newVersion,
        update_user: user_id,
        statut: `AVENANT STATUT JURIDIQUE ${nbAvenantStatutsJuridiques + 1}`,
      };

      const newSigconv = sigconvLastVersion.map((signataire) => {
        return { ...signataire, version: newVersion, update_user: user_id };
      });

      const newUgconv = ugconvLastVersion.map((ug) => {
        return { ...ug, version: newVersion, update_user: user_id };
      });

      const newEqconv = eqconvLastVersion.map((equipement) => {
        return { ...equipement, version: newVersion, update_user: user_id };
      });

      const newRubconv = rubconvLastVersion.map((rubrique) => {
        return { ...rubrique, version: newVersion, update_user: user_id };
      });

      await Promise.all([
        trx("tiepm")
          .update({ legal_form_id, update_user: user_id })
          .where({ tiepm_id }),
        trx("convdesc").insert(newConvdesc),
        trx("sigconv").insert(newSigconv),
        trx("ugconv").insert(newUgconv),
        trx("eqconv").insert(newEqconv),
        trx("rubconv").insert(newRubconv),
      ]);

      await trx.commit();

      res.status(200).json({
        message:
          "L'avenant de changement de statut juridique a été ajouté avec succès.",
        newVersion,
      });
    } catch (err) {
      await trx.rollback();
      console.error(err);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

//new
router.post(
  "/avenant-entite/:conv_id/:version",
  verifyAdmin,
  checkHasConventionAccess,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Conventions']
     #swagger.description = "update the company_name of a specific convention"
     #swagger.parameters['conv_id'] = {
          in: 'path',
          description: 'Convention ID',
          required: true,
          type: 'integer'
     }
    #swagger.parameters['version'] = {
          in: 'path',
          description: 'Version convention',
          required: true,
          type: 'integer'
     }
    #swagger.requestBody = {
      schema: { type: "object", properties : { raison_sociale: { type: "string" } } }
    }
     #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/ConventionAvenantResponse' }
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
      const { conv_id, version: version_str } = req.params;
      const { raison_sociale } = req.body;
      const user_id = req.user_id;
      const version = Number(version_str);

      const allVersionsConvention = await trx("convdesc")
        .select("statut", "tiepm_id")
        .where({ conv_id })
        .orderBy("version", "desc");

      const tiepm_id = allVersionsConvention[0].tiepm_id;

      const nbAvenantEntite = allVersionsConvention.filter((convention) =>
        convention.statut.includes("ENTITE")
      ).length;

      const convdescLastVersionQuery = trx("convdesc")
        .select(
          "conv_id",
          "version",
          "company_id",
          "batiment_id",
          "date_signature",
          "date_debut",
          "date_fin",
          "typ_conv",
          "raison_sociale",
          "legal_form_id",
          "tiepm_id",
          "statut",
          "conv_age",
          "creation_date",
          "creation_user"
        )
        .where({ conv_id, version })
        .first();

      const sigconvLastVersionQuery = trx("sigconv")
        .select(
          "conv_id",
          "version",
          "tiepp_id",
          "creation_date",
          "creation_user"
        )
        .where({ conv_id, version });

      const ugconvLastVersionQuery = trx("ugconv")
        .select(
          "conv_id",
          "version",
          "ug_id",
          "surface_rent",
          "date_debut",
          "date_fin",
          "creation_date",
          "creation_user"
        )
        .where({ conv_id, version });

      const eqconvLastVersionQuery = trx("eqconv")
        .select(
          "conv_id",
          "version",
          "equipement_id",
          "creation_date",
          "creation_user"
        )
        .where({ conv_id, version });

      const rubconvLastVersionQuery = trx("rubconv")
        .select(
          "conv_id",
          "version",
          "ug_id",
          "equipement_id",
          "rubrique",
          "periodicity",
          "condition_payment",
          "montant",
          "creation_date",
          "creation_user"
        )
        .where({ conv_id, version });

      const [
        convdescLastVersion,
        sigconvLastVersion,
        ugconvLastVersion,
        eqconvLastVersion,
        rubconvLastVersion,
      ] = await Promise.all([
        convdescLastVersionQuery,
        sigconvLastVersionQuery,
        ugconvLastVersionQuery,
        eqconvLastVersionQuery,
        rubconvLastVersionQuery,
      ]);

      const newVersion = version + 1;

      const newConvdesc = {
        ...convdescLastVersion,
        raison_sociale,
        version: newVersion,
        update_user: user_id,
        statut: `AVENANT ENTITE ${nbAvenantEntite + 1}`,
      };

      const newSigconv = sigconvLastVersion.map((signataire) => {
        return { ...signataire, version: newVersion, update_user: user_id };
      });

      const newUgconv = ugconvLastVersion.map((ug) => {
        return { ...ug, version: newVersion, update_user: user_id };
      });

      const newEqconv = eqconvLastVersion.map((equipement) => {
        return { ...equipement, version: newVersion, update_user: user_id };
      });

      const newRubconv = rubconvLastVersion.map((rubrique) => {
        return { ...rubrique, version: newVersion, update_user: user_id };
      });

      await Promise.all([
        trx("tiepm")
          .update({ raison_sociale, update_user: user_id })
          .where({ tiepm_id }),
        trx("convdesc").insert(newConvdesc),
        trx("sigconv").insert(newSigconv),
        trx("ugconv").insert(newUgconv),
        trx("eqconv").insert(newEqconv),
        trx("rubconv").insert(newRubconv),
      ]);

      await trx.commit();

      res.status(200).json({
        message: "L'avenant de changement d'entité a été ajouté avec succès.",
        newVersion,
      });
    } catch (err) {
      await trx.rollback();
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

//new
router.post(
  "/resiliation/:conv_id/:version",
  verifyAdmin,
  checkHasConventionAccess,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Conventions']
     #swagger.description = "Termination of the convention"
     #swagger.parameters['conv_id'] = {
          in: 'path',
          description: 'Convention ID',
          required: true,
          type: 'integer'
     }
    #swagger.parameters['version'] = {
          in: 'path',
          description: 'Version convention',
          required: true,
          type: 'integer'
     }
    #swagger.requestBody = {
      schema: { type: "object", properties : { date_fin: { type: "string" } } }
    }
     #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/ConventionAvenantResponse' }
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
      // convdesc, date_fin
      // ugconv, for those who does not have date_fin or date_fin is > date_resiliation, we set date_fin

      const { conv_id, version: version_str } = req.params;
      const { date_fin } = req.body;
      const user_id = req.user_id;
      const version = Number(version_str);

      const convdescLastVersionQuery = trx("convdesc")
        .select(
          "conv_id",
          "version",
          "company_id",
          "batiment_id",
          "date_signature",
          "date_debut",
          "date_fin",
          "typ_conv",
          "raison_sociale",
          "legal_form_id",
          "tiepm_id",
          "statut",
          "conv_age",
          "creation_date",
          "creation_user"
        )
        .where({ conv_id, version })
        .first();

      const sigconvLastVersionQuery = trx("sigconv")
        .select(
          "conv_id",
          "version",
          "tiepp_id",
          "creation_date",
          "creation_user"
        )
        .where({ conv_id, version });

      const ugconvLastVersionQuery = trx("ugconv")
        .select(
          "conv_id",
          "version",
          "ug_id",
          "surface_rent",
          "date_debut",
          "date_fin",
          "creation_date",
          "creation_user"
        )
        .where({ conv_id, version });

      const eqconvLastVersionQuery = trx("eqconv")
        .select(
          "conv_id",
          "version",
          "equipement_id",
          "creation_date",
          "creation_user"
        )
        .where({ conv_id, version });

      const rubconvLastVersionQuery = trx("rubconv")
        .select(
          "conv_id",
          "version",
          "ug_id",
          "equipement_id",
          "rubrique",
          "periodicity",
          "condition_payment",
          "montant",
          "creation_date",
          "creation_user"
        )
        .where({ conv_id, version });

      const [
        convdescLastVersion,
        sigconvLastVersion,
        ugconvLastVersion,
        eqconvLastVersion,
        rubconvLastVersion,
      ] = await Promise.all([
        convdescLastVersionQuery,
        sigconvLastVersionQuery,
        ugconvLastVersionQuery,
        eqconvLastVersionQuery,
        rubconvLastVersionQuery,
      ]);

      const newVersion = version + 1;

      const newConvdesc = {
        ...convdescLastVersion,
        date_fin: date_fin || null,
        version: newVersion,
        update_user: user_id,
        statut: `RÉSILIATION`,
      };

      const newSigconv = sigconvLastVersion.map((signataire) => {
        return { ...signataire, version: newVersion, update_user: user_id };
      });

      const newUgconv = ugconvLastVersion.map((ug) => {
        return {
          ...ug,
          date_fin:
            ug.date_fin && date_fin
              ? new Date(ug.date_fin) > new Date(date_fin)
                ? date_fin
                : ug.date_fin
              : date_fin || null,
          version: newVersion,
          update_user: user_id,
        };
      });

      const newEqconv = eqconvLastVersion.map((equipement) => {
        return { ...equipement, version: newVersion, update_user: user_id };
      });

      const newRubconv = rubconvLastVersion.map((rubrique) => {
        return { ...rubrique, version: newVersion, update_user: user_id };
      });

      await Promise.all([
        trx("convdesc").insert(newConvdesc),
        trx("sigconv").insert(newSigconv),
        trx("ugconv").insert(newUgconv),
        trx("eqconv").insert(newEqconv),
        trx("rubconv").insert(newRubconv),
      ]);

      await trx.commit();

      res.status(200).json({
        message: "La résiliation de la convention est un succès.",
        newVersion,
      });
    } catch (e) {
      await trx.rollback();
      console.error(e);
      res.status(500).json({
        message: "Erreur serveur, veuillez réessayer.",
      });
    }
  }
);

//new
router.post(
  "/avenant-local/:conv_id/:version",
  verifyAdmin,
  checkHasConventionAccess,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Conventions']
     #swagger.description = "update the locaux of a specific convention"
     #swagger.parameters['conv_id'] = {
          in: 'path',
          description: 'Convention ID',
          required: true,
          type: 'integer'
     }
    #swagger.parameters['version'] = {
          in: 'path',
          description: 'Version convention',
          required: true,
          type: 'integer'
     }
    #swagger.requestBody = {
      schema: { $ref: '#/components/schemas/ConventionAvenantLocalBody' }
    }
     #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/ConventionAvenantResponse' }
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
      const { conv_id, version: version_str } = req.params;
      const { ugs } = req.body;
      const user_id = req.user_id;
      const version = Number(version_str);

      const allVersionsConvention = await trx("convdesc")
        .select("statut", "tiepm_id")
        .where({ conv_id })
        .orderBy("version", "desc");

      const nbAvenantLocaux = allVersionsConvention.filter((convention) =>
        convention.statut.includes("LOCAL")
      ).length;

      const convdescLastVersionQuery = trx("convdesc")
        .select(
          "conv_id",
          "company_id",
          "batiment_id",
          "date_signature",
          "date_debut",
          "date_fin",
          "typ_conv",
          "raison_sociale",
          "legal_form_id",
          "tiepm_id",
          "statut",
          "conv_age",
          "creation_date",
          "creation_user"
        )
        .where({ conv_id, version })
        .first();

      const sigconvLastVersionQuery = trx("sigconv")
        .select("conv_id", "tiepp_id", "creation_date", "creation_user")
        .where({ conv_id, version });

      const ugconvLastVersionQuery = trx("ugconv")
        .select(
          "conv_id",
          "ug_id",
          "surface_rent",
          "date_debut",
          "date_fin",
          "creation_date",
          "creation_user"
        )
        .where({ conv_id, version });

      const eqconvLastVersionQuery = trx("eqconv")
        .select("conv_id", "equipement_id", "creation_date", "creation_user")
        .where({ conv_id, version });

      const rubconvLastVersionQuery = trx("rubconv")
        .select(
          "conv_id",
          "ug_id",
          "equipement_id",
          "rubrique",
          "periodicity",
          "condition_payment",
          "montant",
          "creation_date",
          "creation_user"
        )
        .where({ conv_id, version });

      const [
        convdescLastVersion,
        sigconvLastVersion,
        ugconvLastVersion,
        eqconvLastVersion,
        rubconvLastVersion,
      ] = await Promise.all([
        convdescLastVersionQuery,
        sigconvLastVersionQuery,
        ugconvLastVersionQuery,
        eqconvLastVersionQuery,
        rubconvLastVersionQuery,
      ]);

      const newVersion = version + 1;

      const newConvdesc = {
        ...convdescLastVersion,
        version: newVersion,
        update_user: user_id,
        statut: `AVENANT LOCAL ${nbAvenantLocaux + 1}`,
      };

      const newSigconv = sigconvLastVersion.map((signataire) => {
        return { ...signataire, version: newVersion, update_user: user_id };
      });

      const newUgconv = ugs.map(
        (ug: {
          ug_id: number;
          date_debut: string;
          date_fin?: string;
          surface_rent: number;
        }) => {
          return {
            conv_id,
            version: newVersion,
            ug_id: ug.ug_id,
            date_debut: ug.date_debut,
            date_fin: ug.date_fin || null,
            surface_rent: ug.surface_rent,
            creation_user: ugconvLastVersion[0].creation_user,
            creation_date: ugconvLastVersion[0].creation_date,
            update_user: user_id,
          };
        }
      );

      const newEqconv = eqconvLastVersion.map((equipement) => {
        return { ...equipement, version: newVersion, update_user: user_id };
      });

      const dateDebutConvention = convdescLastVersion.date_debut;
      const conventionAge = convdescLastVersion.conv_age;

      const rubconvEquipements = rubconvLastVersion
        .filter((rubrique) => rubrique.equipement_id)
        .map((rubrique) => {
          return {
            ...rubrique,
            version: newVersion,
            update_user: user_id,
          };
        });

      const rubconvUgs = await Promise.all(
        ugs.map(
          async (ug: {
            ug_id: number;
            date_debut: string;
            date_fin?: string;
            surface_rent: number;
            surface: number;
          }) => {
            const prixPepiniereQuery = trx("surface_prix_ugs")
              .select("prix_an_1", "prix_an_2", "prix_an_3")
              .where({ surface: ug.surface, prix_type: "pepiniere" })
              .where(
                db.raw(
                  `? BETWEEN prix_date_debut AND COALESCE(prix_date_fin, '9999-12-31')`,
                  [dateDebutConvention]
                )
              )
              .first();

            const prixCentreQuery = trx("surface_prix_ugs")
              .select("prix_centre_affaires")
              .where({
                surface: ug.surface,
                prix_type: "centre_affaires",
              })
              .where(
                db.raw(
                  `? BETWEEN prix_date_debut AND COALESCE(prix_date_fin, '9999-12-31')`,
                  [dateDebutConvention]
                )
              )
              .first();

            const [prixPepiniere, prixCentre]: [PrixPepiniere, PrixCentre] =
              await Promise.all([prixPepiniereQuery, prixCentreQuery]);

            const prixRef =
              conventionAge === 0
                ? prixPepiniere.prix_an_1
                : conventionAge === 1
                  ? prixPepiniere.prix_an_2
                  : conventionAge === 2
                    ? prixPepiniere.prix_an_3
                    : prixCentre.prix_centre_affaires;

            const montant = ug.surface_rent
              ? (prixRef * ug.surface_rent) / ug.surface
              : prixRef;

            return {
              conv_id,
              version: newVersion,
              ug_id: ug.ug_id,
              equipement_id: null,
              rubrique: "REDEVANCE",
              periodicity: "MENSUEL",
              condition_payment: "A ÉCHOIR",
              montant,
              creation_user: rubconvLastVersion[0].creation_user,
              creation_date: rubconvLastVersion[0].creation_date,
              update_user: user_id,
            };
          }
        )
      );

      const newRubconv = [...rubconvUgs, ...rubconvEquipements];

      await Promise.all([
        trx("convdesc").insert(newConvdesc),
        trx("sigconv").insert(newSigconv),
        trx("ugconv").insert(newUgconv),
        trx("eqconv").insert(newEqconv),
        trx("rubconv").insert(newRubconv),
      ]);

      await trx.commit();

      res.status(200).json({
        message: "L'avenant de changement de local a été ajouté avec succès.",
        newVersion,
      });
    } catch (err) {
      await trx.rollback();
      console.error(err);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

//new
router.get("/notifications", verifyUser, async (req: UserRequest, res) => {
  /* 
     #swagger.tags = ['Conventions']
     #swagger.description = "Get notifications"
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
            schema: { $ref: '#/components/schemas/NotificationsSearchResponse' }
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
    let { limit = 10, offset = 0 } = req.query;

    limit = Number(limit);
    offset = Number(offset);

    const baseQuery = db("notifications as n")
      .select(
        "n.conv_id",
        "maxVersions.max_version",
        "cd.raison_sociale",
        "cd.statut"
      )
      .join(
        db("convdesc as sub")
          .select("sub.conv_id")
          .max("sub.version as max_version")
          .groupBy("sub.conv_id")
          .as("maxVersions"),
        function () {
          this.on("n.conv_id", "=", "maxVersions.conv_id");
        }
      )
      .join("convdesc as cd", function () {
        this.on("cd.conv_id", "=", "n.conv_id").andOn(
          "cd.version",
          "=",
          "maxVersions.max_version"
        );
      })
      .where("cd.company_id", company_id);

    const notificationsQuery = baseQuery.clone().limit(limit).offset(offset);

    const totalGlobalQuery = baseQuery
      .clone()
      .clearSelect()
      .count("* as count")
      .first();

    const [notifications, total] = await Promise.all([
      notificationsQuery,
      totalGlobalQuery,
    ]);

    const totalCount = total ? total.count : 0;

    const nextCursor =
      offset + limit < Number(totalCount) ? offset + limit : null;
    const prevCursor = offset > 0 ? offset - limit : null;

    res.status(200).json({
      notifications,
      cursor: { next: nextCursor, prev: prevCursor },
      totalCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

//new
router.get(
  "/infos/:conv_id/:version",
  verifyUser,
  checkHasConventionAccess,
  async (req, res) => {
    /* 
     #swagger.tags = ['Conventions']
     #swagger.description = "Get infos for a specific convention"
     #swagger.parameters['conv_id'] = {
          in: 'path',
          description: 'Convention ID',
          required: true,
          type: 'integer'
     }
    #swagger.parameters['version'] = {
          in: 'path',
          description: 'Convention version',
          required: true,
          type: 'integer'
     }
     #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/ConventionResponse' }
     } 
     #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
     } 
     #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }  
  */

    try {
      let { conv_id, version } = req.params;

      const conventionInfos = await db("convdesc")
        .select(
          "batiment_id",
          "date_signature",
          "date_debut",
          "date_fin",
          "typ_conv",
          "raison_sociale",
          "legal_form_id",
          "tiepm_id",
          "statut",
          "conv_age"
        )
        .where({ conv_id, version })
        .first();

      const signatairesQuery = db("sigconv")
        .select(
          "sigconv.tiepp_id",
          db.raw(`
            CONCAT(
            COALESCE(tiepp.surname, ''), ' ',
            COALESCE(tiepp.first_name)
            ) as libelle
            `),
          "tierel.relation_date_debut",
          "tierel.relation_date_fin",
          "relations_pm_pp_params.name as fonction"
        )
        .leftJoin("tiepp", "tiepp.tiepp_id", "sigconv.tiepp_id")
        .leftJoin("tierel", "tierel.tiepp_id", "sigconv.tiepp_id")
        .leftJoin(
          "relations_pm_pp_params",
          "relations_pm_pp_params.rel_typ_id",
          "tierel.rel_typ_id"
        )
        .where({
          "sigconv.conv_id": conv_id,
          "sigconv.version": version,
          "tierel.tiepm_id": conventionInfos.tiepm_id,
        });

      const ugsQuery = db("ugconv")
        .select(
          "ugconv.ug_id",
          "ugconv.surface_rent",
          "ugconv.date_debut",
          "ugconv.date_fin",
          "ugdesc.name"
        )
        .leftJoin("ugdesc", "ugconv.ug_id", "ugdesc.ug_id")
        .where({
          "ugconv.conv_id": conv_id,
          "ugconv.version": version,
        });

      const equipementsQuery = db("eqconv")
        .select(
          "ugdesc.name as ug_name",
          "eqconv.equipement_id",
          "ugequip.name as equipement_name",
          "ugequip.equipement_prix",
          "ugequip.is_deleted"
        )
        .leftJoin("ugequip", "ugequip.equipement_id", "eqconv.equipement_id")
        .leftJoin("ugdesc", "ugdesc.ug_id", "ugequip.ug_id")
        .where({
          "eqconv.conv_id": conv_id,
          "eqconv.version": version,
        });

      const rubriquesQuery = db("rubconv")
        .select(
          "rubconv.ug_id",
          "ugdesc.name as ug_name",
          "rubconv.equipement_id",
          "ugequip.name as equipement_name",
          "rubconv.rubrique",
          "rubconv.periodicity",
          "rubconv.condition_payment",
          "rubconv.montant"
        )
        .leftJoin("ugdesc", "ugdesc.ug_id", "rubconv.ug_id")
        .leftJoin("ugequip", "ugequip.equipement_id", "rubconv.equipement_id")
        .where({
          "rubconv.conv_id": conv_id,
          "rubconv.version": version,
        });

      const conventionVersionsQuery = await db("convdesc")
        .select("version", "statut", "update_date")
        .where({ conv_id })
        .orderBy("version", "desc");

      const [signataires, ugs, equipements, rubriques, conventionVersions] =
        await Promise.all([
          signatairesQuery,
          ugsQuery,
          equipementsQuery,
          rubriquesQuery,
          conventionVersionsQuery,
        ]);

      res.status(200).json({
        conventionInfos,
        signataires,
        ugs,
        equipements,
        rubriques,
        conventionVersions,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

//new
router.get("/signataires", verifyAdmin, async (req, res) => {
  /* 
     #swagger.tags = ['Conventions']
     #swagger.description = "Get signataires"
    #swagger.parameters['pm'] = {
          in: 'query',
          description: 'Id of the tier',
          required: true,
          type: 'integer'
     }
     #swagger.responses[200] = {
            schema: { type: "array",
                      items: {
                        $ref: "#/components/schemas/ConventionSignataire",
                      } 
                    }
     } 
     #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
     } 
     #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }  
  */

  try {
    const { pm } = req.query;

    const signataires = await db("tierel")
      .select(
        "tierel.tiepp_id",
        db.raw(`
            CONCAT(
            COALESCE(tiepp.surname, ''), ' ',
            COALESCE(tiepp.first_name)
            ) as libelle
            `),
        "tierel.relation_date_debut",
        "tierel.relation_date_fin",
        "relations_pm_pp_params.name as fonction"
      )
      .leftJoin("tiepp", "tiepp.tiepp_id", "tierel.tiepp_id")
      .leftJoin(
        "relations_pm_pp_params",
        "relations_pm_pp_params.rel_typ_id",
        "tierel.rel_typ_id"
      )
      .where({
        "tierel.tiepm_id": pm,
      });

    res.status(200).json(signataires);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

//new
router.get("/locaux", verifyAdmin, checkHasBatimentAccess, async (req, res) => {
  /* 
     #swagger.tags = ['Conventions']
     #swagger.description = "Get locaux"
    #swagger.parameters['dateDebut'] = {
          in: 'query',
          description: 'Begin date local',
          required: true,
          type: 'integer'
     }
    #swagger.parameters['dateFin'] = {
          in: 'query',
          description: 'End date local',
          required: true,
          type: 'integer'
     }

     #swagger.parameters['batiment_id'] = {
          in: 'query',
          description: 'Building Id',
          required: true,
          type: 'integer'
     }
     #swagger.responses[200] = {
            schema: { 
                        $ref: "#/components/schemas/ConventionSearchLocaux",
                      
                    }
     } 
     #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
     } 
     #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }  
  */

  try {
    const { dateDebut, dateFin, batiment_id } = req.query;

    // we select only the (ugconv.date_debut <= dateFin (can be null)) and (dateDebut <= ugconv.date_fin or ugconv.date_fin is null)
    // we join to work with the max version and to have for each ug_id the surface occupied between dateDebut and dateFin (can be null)
    let locaux;
    if (dateDebut) {
      locaux = await db("ugdesc")
        .select(
          "ugdesc.ug_id",
          "ugdesc.name",
          "ugdesc.surface",
          db.raw(
            "COALESCE(surface_occupied_sum.surface_occupied, 0) as surface_occupied"
          ),
          db.raw(
            "ugdesc.surface - COALESCE(surface_occupied_sum.surface_occupied, 0) as surface_available"
          )
        )
        .leftJoin(
          db("ugconv")
            .select("ugconv.ug_id")
            .sum("ugconv.surface_rent as surface_occupied")
            .join(
              db("ugconv as sub")
                .select("sub.conv_id", "sub.ug_id")
                .max("sub.version as max_version")
                .groupBy("sub.conv_id", "sub.ug_id")
                .as("maxVersions"),
              function () {
                this.on("ugconv.ug_id", "=", "maxVersions.ug_id")
                  .andOn("ugconv.conv_id", "=", "maxVersions.conv_id")
                  .andOn("ugconv.version", "=", "maxVersions.max_version");
              }
            )
            .where(function () {
              this.where(
                "ugconv.date_debut",
                "<=",
                dateFin || new Date().toISOString()
              ).andWhere(function () {
                this.where(
                  "ugconv.date_fin",
                  ">=",
                  db.raw("?", [dateDebut])
                ).orWhereNull("ugconv.date_fin");
              });
            })
            .groupBy("ugconv.ug_id")
            .as("surface_occupied_sum"),
          "ugdesc.ug_id",
          "surface_occupied_sum.ug_id"
        )
        .where({ "ugdesc.batiment_id": batiment_id })
        .andWhere(function () {
          this.where(
            "surface_occupied_sum.surface_occupied",
            "<",
            db.raw("ugdesc.surface")
          ).orWhereNull("surface_occupied_sum.surface_occupied");
        });
    }

    res.status(200).json(locaux || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

//new
router.get(
  "/locaux-for-update",
  verifyAdmin,
  checkHasBatimentAccess,
  async (req, res) => {
    /* 
     #swagger.tags = ['Conventions']
     #swagger.description = "Get locaux for avenants locaux"
    #swagger.parameters['dateDebut'] = {
          in: 'query',
          description: 'Begin date local',
          required: true,
          type: 'integer'
     }
    #swagger.parameters['dateFin'] = {
          in: 'query',
          description: 'End date local',
          required: true,
          type: 'integer'
     }

     #swagger.parameters['batiment_id'] = {
          in: 'query',
          description: 'Building Id',
          required: true,
          type: 'integer'
     }
    #swagger.parameters['conv_id'] = {
          in: 'query',
          description: 'Convention ID',
          required: true,
          type: 'integer'
     }

     #swagger.parameters['version'] = {
          in: 'query',
          description: 'Convention version',
          required: true,
          type: 'integer'
     }
     #swagger.responses[200] = {
            schema: { 
                        $ref: "#/components/schemas/ConventionSearchLocaux",
                      
                    }
     } 
     #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
     } 
     #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }  
  */

    try {
      const { dateDebut, dateFin, batiment_id, conv_id, version } = req.query;

      // we select only the (ugconv.date_debut <= dateFin (can be null)) and (dateDebut <= ugconv.date_fin or ugconv.date_fin is null)
      // we join to work with the max version and to have for each ug_id the surface occupied between dateDebut and dateFin (can be null)
      // we do not sum the surface for the current version and conv_id
      let locaux;
      if (dateDebut) {
        locaux = await db("ugdesc")
          .select(
            "ugdesc.ug_id",
            "ugdesc.name",
            "ugdesc.surface",
            db.raw(
              "COALESCE(surface_occupied_sum.surface_occupied, 0) as surface_occupied"
            ),
            db.raw(
              "ugdesc.surface - COALESCE(surface_occupied_sum.surface_occupied, 0) as surface_available"
            )
          )
          .leftJoin(
            db("ugconv")
              .select("ugconv.ug_id")
              .sum("ugconv.surface_rent as surface_occupied")
              .join(
                db("ugconv as sub")
                  .select("sub.conv_id", "sub.ug_id")
                  .max("sub.version as max_version")
                  .groupBy("sub.conv_id", "sub.ug_id")
                  .as("maxVersions"),
                function () {
                  this.on("ugconv.ug_id", "=", "maxVersions.ug_id")
                    .andOn("ugconv.conv_id", "=", "maxVersions.conv_id")
                    .andOn("ugconv.version", "=", "maxVersions.max_version");
                }
              )
              .where(function () {
                this.where(
                  "ugconv.date_debut",
                  "<=",
                  dateFin || new Date().toISOString()
                ).andWhere(function () {
                  this.where(
                    "ugconv.date_fin",
                    ">=",
                    db.raw("?", [dateDebut])
                  ).orWhereNull("ugconv.date_fin");
                });
              })
              .andWhereNot({
                "ugconv.conv_id": conv_id,
                "ugconv.version": version,
              })
              .groupBy("ugconv.ug_id")
              .as("surface_occupied_sum"),
            "ugdesc.ug_id",
            "surface_occupied_sum.ug_id"
          )
          .where({ "ugdesc.batiment_id": batiment_id })
          .andWhere(function () {
            this.where(
              "surface_occupied_sum.surface_occupied",
              "<",
              db.raw("ugdesc.surface")
            ).orWhereNull("surface_occupied_sum.surface_occupied");
          });
      }

      res.status(200).json(locaux || []);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

//new
router.get("/equipements", verifyAdmin, async (req, res) => {
  /* 
     #swagger.tags = ['Conventions']
     #swagger.description = "Get locaux for avenants locaux"
    #swagger.parameters['dateDebut'] = {
          in: 'query',
          description: 'Begin date local',
          required: true,
          type: 'integer'
     }
    #swagger.parameters['dateFin'] = {
          in: 'query',
          description: 'End date local',
          required: true,
          type: 'integer'
     }

     #swagger.parameters['ug_id'] = {
          in: 'query',
          description: 'Building Id',
          required: true,
          type: 'integer'
     }
     #swagger.responses[200] = {
            schema: { 
                        $ref: "#/components/schemas/ConventionEquipementsAvailable",
                      
                    }
     } 
     #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
     } 
     #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }  
  */

  try {
    const { ug_id, dateDebut, dateFin } = req.query;

    let equipements;

    if (ug_id && dateDebut) {
      equipements = await db("ugequip")
        .select(
          "ugequip.equipement_id",
          "ugequip.name",
          "ugequip.nature_equipement_id",
          "ugequip.equipement_prix"
        )
        .leftJoin(
          db("eqconv")
            .select("eqconv.equipement_id")
            .join(
              db("eqconv as sub")
                .select("sub.conv_id")
                .max("sub.version as max_version")
                .groupBy("sub.conv_id")
                .as("latest_eqconv"),
              function () {
                this.on("eqconv.conv_id", "=", "latest_eqconv.conv_id").andOn(
                  "eqconv.version",
                  "=",
                  "latest_eqconv.max_version"
                );
              }
            )
            .as("filtered_eqconv"),
          "ugequip.equipement_id",
          "filtered_eqconv.equipement_id"
        )
        .where({ "ugequip.ug_id": ug_id, "ugequip.is_deleted": false })
        .whereNull("filtered_eqconv.equipement_id");
    }

    res.status(200).json(equipements || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

//new
router.post(
  "/equipement/:conv_id/:version",
  verifyAdmin,
  checkHasConventionAccess,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Conventions']
     #swagger.description = "add an equipement to  a specific convention"
     #swagger.parameters['conv_id'] = {
          in: 'path',
          description: 'Convention ID',
          required: true,
          type: 'integer'
     }
    #swagger.parameters['version'] = {
          in: 'path',
          description: 'Version convention',
          required: true,
          type: 'integer'
     }
    #swagger.requestBody = {
      schema: { type: "object", properties : { equipement_id: { type: "number" } } }
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
      const { conv_id, version } = req.params;
      const { equipement_id } = req.body;

      await trx("eqconv").insert({
        conv_id,
        version,
        equipement_id,
        creation_user: user_id,
        update_user: user_id,
      });

      await trx.commit();
      res
        .status(200)
        .json({ message: "L'ajout de l'équipement est un succès." });
    } catch (err) {
      await trx.rollback();
      console.error(err);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." })
    }
  }
);

//new
router.delete(
  "/equipement/:conv_id/:version/:equipement_id",
  verifyAdmin,
  checkHasConventionAccess,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Conventions']
     #swagger.description = "add an equipement to  a specific convention"
     #swagger.parameters['conv_id'] = {
          in: 'path',
          description: 'Convention ID',
          required: true,
          type: 'integer'
     }
    #swagger.parameters['version'] = {
          in: 'path',
          description: 'Version convention',
          required: true,
          type: 'integer'
     }
      #swagger.parameters['equipement_id'] = {
        in: 'path',
        description: 'Id equipement',
        required: true,
        type: 'integer'
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
      const { conv_id, version, equipement_id } = req.params;

      await trx("eqconv").delete().where({
        conv_id,
        version,
        equipement_id,
      });

      await trx.commit();

      res
        .status(200)
        .json({ message: "La suppression de l'équipement est un succès." });
    } catch (err) {
      await trx.rollback();
      console.error(err);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });

    }
  }
);

// new
router.get(
  "/files/:conv_id/:version",
  verifyUser,
  checkHasConventionAccess,
  async (req, res) => {
    /* 
     #swagger.tags = ['Conventions']
     #swagger.description = "Get the files of a specified convention"
     #swagger.parameters['conv_id'] = {
          in: 'path',
          description: 'Convention Id',
          required: true,
          schema: { type: 'integer' }
     }
     #swagger.parameters['version'] = {
          in: 'path',
          description: 'Convention version',
          required: true,
          schema: { type: 'integer' }
     }
    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/ConventionsFilesResponse' }
     } 
     #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequestFiles' }
     } 
     #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }  
  */

    const { conv_id } = req.params;

    try {
      const prefix = `Pepiniere Conventions/${conv_id}/imported`;

      const listParams = {
        Bucket: R2_BUCKET_NAME,
        Prefix: prefix,
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
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

//new
router.post(
  "/files/:conv_id/:version",
  verifyAdmin,
  upload.array("files"),
  async (req, res) => {
    /* 
     #swagger.tags = ['Conventions']
     #swagger.description = "Upload multiple files to the imported folder for a specific ug"
     #swagger.parameters['qualite'] = {
          in: 'path',
          description: 'Quality Tier',
          required: true,
          schema: { type: 'integer' }
     }
     #swagger.parameters['id'] = {
          in: 'path',
          description: 'Tier Id',
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
    const { conv_id, id } = req.params;

    if (!req.files || !Array.isArray(req.files)) {
      res
        .status(400)
        .json({ message: "Des fichiers sont requis pour l'importation." });
      return;
    }

    try {
      const prefix = `Pepiniere Conventions/${conv_id}/imported`;

      await Promise.all(
        req.files.map(async (file) => {
          const key = `${prefix}/${file.originalname}`;

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
router.put("/files/:conv_id/:version", verifyAdmin, async (req, res) => {
  /* 
     #swagger.tags = ['Conventions']
     #swagger.description = "Move to the archive a file"
     #swagger.parameters['conv_id'] = {
          in: 'path',
          description: 'Convention Id',
          required: true,
          schema: { type: 'integer' }
     }
     #swagger.parameters['version'] = {
          in: 'path',
          description: 'Convention Version',
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
  const { conv_id } = req.params;
  const { filename } = req.body;

  if (!filename) {
    res.status(400).json({ message: "Le nom du fichier sont requis." });
    return;
  }

  const prefix = `Pepiniere Conventions/${conv_id}`;

  const sourceKey = `${prefix}/imported/${filename}`;
  const destinationKey = `${prefix}/archived/${filename}`;

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

//new
router.post(
  "/create-pepiniere",
  verifyAdmin,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Conventions']
     #swagger.description = "create a convention pepiniere"
    #swagger.requestBody = {
    $ref: '#/components/schemas/ConventionCreationPepiniere'
    }
    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/ConventionCreationResponse' }
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
      const company_id = req.company_id;
      const {
        batiment_id,
        tiepm_id,
        raison_sociale,
        date_signature,
        date_debut,
        date_fin,
        signataires,
        ugs,
        equipements,
      } = req.body;

      const conventionId = await trx("convdesc")
        .max("conv_id as max_conv_id")
        .first();
      const legalFormIdQuery = await trx("tiepm")
        .select("legal_form_id")
        .where({ tiepm_id })
        .first();
      const legal_form_id = legalFormIdQuery.legal_form_id;
      const conv_id = conventionId ? conventionId.max_conv_id + 1 : 1;

      const convdescQuery = trx("convdesc").insert({
        conv_id,
        version: 1,
        company_id,
        batiment_id,
        typ_conv: "PEPINIERE",
        tiepm_id,
        raison_sociale,
        legal_form_id,
        date_signature,
        date_debut,
        date_fin: date_fin || null,
        statut: "INITIAL",
        conv_age: 0,
        creation_user: user_id,
        update_user: user_id,
      });

      const sigconvQuery = trx("sigconv").insert(
        signataires
          .filter(
            (signataire: { checked: boolean; tiepp_id: number }) =>
              signataire.checked
          )
          .map((signataire: { checked: boolean; tiepp_id: number }) => {
            return {
              conv_id,
              version: 1,
              tiepp_id: signataire.tiepp_id,
              creation_user: user_id,
              update_user: user_id,
            };
          })
      );

      const ugconvQuery = trx("ugconv").insert(
        ugs.map(
          (ug: {
            ug_id: number;
            surface_rent: number;
            date_debut: string;
            date_fin?: string;
          }) => {
            return {
              conv_id,
              version: 1,
              ug_id: ug.ug_id,
              surface_rent: ug.surface_rent,
              date_debut: ug.date_debut,
              date_fin: ug.date_fin || null,
              creation_user: user_id,
              update_user: user_id,
            };
          }
        )
      );

      const eqconvQuery = trx("eqconv").insert(
        equipements.map(
          (equipement: {
            ug_id: number;
            equipement_id: number;
            equipement_prix: number;
          }) => {
            return {
              conv_id,
              version: 1,
              equipement_id: equipement.equipement_id,
              creation_user: user_id,
              update_user: user_id,
            };
          }
        )
      );

      const rubriqueUgs = await Promise.all(
        ugs.map(
          async (ug: {
            ug_id: number;
            surface_rent: number;
            date_debut: string;
            date_fin?: string;
            surface: number;
          }) => {
            const prixPepiniereAn1 = await trx("surface_prix_ugs")
              .select("prix_an_1")
              .where({ surface: ug.surface, prix_type: "pepiniere" })
              .where(
                db.raw(
                  `? BETWEEN prix_date_debut AND COALESCE(prix_date_fin, '9999-12-31')`,
                  [ug.date_debut]
                )
              )
              .first();

            const montant =
              (prixPepiniereAn1.prix_an_1 * ug.surface_rent) / ug.surface;

            return {
              conv_id,
              version: 1,
              ug_id: ug.ug_id,
              equipement_id: null,
              rubrique: "REDEVANCE",
              periodicity: "MENSUEL",
              condition_payment: "A ECHOIR",
              montant,
              creation_user: user_id,
              update_user: user_id,
            };
          }
        )
      );

      const rubriquesEquipements = equipements.map(
        (equipement: {
          ug_id: number;
          equipement_id: number;
          equipement_prix: number;
        }) => {
          return {
            conv_id,
            version: 1,
            ug_id: equipement.ug_id,
            equipement_id: equipement.equipement_id,
            rubrique: "CHARGE",
            periodicity: "UNIQUE",
            condition_payment: "A ECHOIR",
            montant: equipement.equipement_prix,
            creation_user: user_id,
            update_user: user_id,
          };
        }
      );

      const rubriquesQuery = trx("rubconv").insert([
        ...rubriqueUgs,
        ...rubriquesEquipements,
      ]);

      await Promise.all([
        convdescQuery,
        sigconvQuery,
        ugconvQuery,
        eqconvQuery,
        rubriquesQuery,
      ]);

      await trx.commit();

      res.status(200).json({
        message: "La création de la convention est un succès.",
        id: conv_id,
      });
    } catch (err) {
      await trx.rollback();
      console.error(err);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

//new
router.post(
  "/create-coworking",
  verifyAdmin,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Conventions']
     #swagger.description = "create a convention coworking"
    #swagger.requestBody = {
    $ref: '#/components/schemas/ConventionCreationCoworking'
    }
    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/ConventionCreationResponse' }
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
      const company_id = req.company_id;
      const {
        batiment_id,
        tiepm_id,
        raison_sociale,
        date_signature,
        date_debut,
        date_fin,
        signataires,
      } = req.body;

      const conventionId = await trx("convdesc")
        .max("conv_id as max_conv_id")
        .first();
      const legalFormIdQuery = await trx("tiepm")
        .select("legal_form_id")
        .where({ tiepm_id })
        .first();
      const legal_form_id = legalFormIdQuery.legal_form_id;
      const conv_id = conventionId ? conventionId.max_conv_id + 1 : 1;

      const convdescQuery = trx("convdesc").insert({
        conv_id,
        version: 1,
        company_id,
        batiment_id,
        typ_conv: "COWORKING",
        tiepm_id,
        raison_sociale,
        legal_form_id,
        date_signature,
        date_debut,
        date_fin: date_fin || null,
        statut: "INITIAL",
        conv_age: 0,
        creation_user: user_id,
        update_user: user_id,
      });

      const sigconvQuery = trx("sigconv").insert(
        signataires
          .filter(
            (signataire: { checked: boolean; tiepp_id: number }) =>
              signataire.checked
          )
          .map((signataire: { checked: boolean; tiepp_id: number }) => {
            return {
              conv_id,
              version: 1,
              tiepp_id: signataire.tiepp_id,
              creation_user: user_id,
              update_user: user_id,
            };
          })
      );

      await Promise.all([convdescQuery, sigconvQuery]);

      await trx.commit();

      res.status(200).json({
        message: "La création de la convention est un succès.",
        id: conv_id,
      });
    } catch (err) {
      await trx.rollback();
      console.error(err);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

export { router as convRouter };
