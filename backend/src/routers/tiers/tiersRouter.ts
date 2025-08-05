import express, { Request, Response } from "express";
import XLSX from "xlsx";
import { db } from "../../data/db";
import multer from "multer";
import dotenv from "dotenv";
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { verifyUser } from "../../middlewares/checkUser";
import { checkHasBatimentAccess } from "../../middlewares/checkHasBatiment";
import { checkHasTiersAccess } from "../../middlewares/checkHasAccessTiers";
import { verifyAdmin } from "../../middlewares/checkAdmin";
import { r2 } from "../../r2Client";
import { CronJob } from "cron";

dotenv.config();

const router = express.Router();

// Configure multer for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME as string;

// new
router.get("/", verifyUser, checkHasBatimentAccess, async (req, res) => {
  /* 
     #swagger.tags = ['Tiers']
     #swagger.description = "Get tiers with pagination"
     #swagger.parameters['batiment_id'] = {
          in: 'query',
          description: 'ID of the batiment',
          required: true,
          type: 'integer'
     }
    #swagger.parameters['formule_id'] = {
          in: 'query',
          description: 'ID of the formule',
          required: true,
          type: 'integer'
     }
    #swagger.parameters['selectedDate'] = {
          in: 'query',
          description: 'date to look for formules',
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
      #swagger.parameters['pm'] = {
          in: 'query',
          description: 'PM field',
          required: false,
          type: 'boolean',
          default: true
     }
    #swagger.parameters['pp'] = {
          in: 'query',
          description: 'PP field',
          required: false,
          type: 'boolean',
          default: true
     }
     #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/TiersSearchResponse' }
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
      formule_id,
      selectedDate,
      limit = 10,
      offset = 0,
      pm = "true",
      pp = "true",
    } = req.query;

    if (!batiment_id) {
      res.status(400).json({ message: "Le batiment est requis." });
      return;
    }

    limit = Number(limit);
    offset = Number(offset);
    const isPM = pm === "true";
    const isPP = pp === "true";

    let globalQuery;
    let totalGlobalQuery;

    if (isPM && isPP) {
      globalQuery = db
        .union([
          db("tiepm")
            .select(
              "tiepm.tiepm_id as id",
              "tiepm.raison_sociale as libelle",
              db.raw("'PM' as qualite"),
              "tiepm.email",
              "tiepm.phone_number"
            )
            .leftJoin("tieformpm", "tieformpm.tiepm_id", "tiepm.tiepm_id")
            .where({ "tiepm.batiment_id": batiment_id })
            .modify((query) => {
              if (selectedDate && formule_id) {
                query
                  .andWhere("tieformpm.date_debut_formule", "<=", selectedDate)
                  .andWhere((subQuery) => {
                    subQuery
                      .where("tieformpm.date_fin_formule", ">=", selectedDate)
                      .orWhereNull("tieformpm.date_fin_formule");
                  });
              }
              if (formule_id) {
                query.andWhere("tieformpm.formule_id", formule_id);
              } else {
                query.whereNull("tieformpm.formule_id");
              }

              if (search) {
                query.andWhere("raison_sociale", "like", `%${search}%`);
              }
            })
            .groupBy(
              "tiepm.tiepm_id",
              "tiepm.raison_sociale",
              "tiepm.email",
              "tiepm.phone_number"
            ),

          db("tiepp")
            .select(
              "tiepp.tiepp_id as id",
              db.raw(`
          CONCAT(
              COALESCE(tiepp.surname, ''), ' ', 
              COALESCE(tiepp.first_name, '')
          ) AS libelle
          `),
              db.raw("'PP' as qualite"),
              "tiepp.email",
              "tiepp.phone_number"
            )
            .leftJoin("tieformpp", "tieformpp.tiepp_id", "tiepp.tiepp_id")
            .where({ "tiepp.batiment_id": batiment_id })
            .modify((query) => {
              if (selectedDate && formule_id) {
                query
                  .andWhere("tieformpp.date_debut_formule", "<=", selectedDate)
                  .andWhere((subQuery) => {
                    subQuery
                      .where("tieformpp.date_fin_formule", ">=", selectedDate)
                      .orWhereNull("tieformpp.date_fin_formule");
                  });
              }
              if (formule_id) {
                query.andWhere("tieformpp.formule_id", formule_id);
              } else {
                query.whereNull("tieformpp.formule_id");
              }

              if (search) {
                query.andWhere((query) => {
                  query
                    .where("tiepp.surname", "like", `%${search}%`)
                    .orWhere("tiepp.first_name", "like", `%${search}%`);
                });
              }
            })
            .groupBy(
              "tiepp.tiepp_id",
              "tiepp.surname",
              "tiepp.first_name",
              "tiepp.email",
              "tiepp.phone_number"
            ),
        ])
        .orderBy("libelle", "asc")
        .limit(limit)
        .offset(offset);

      totalGlobalQuery = db
        .from(
          db
            .union([
              db("tiepm")
                .select("tiepm.tiepm_id as id")
                .leftJoin("tieformpm", "tieformpm.tiepm_id", "tiepm.tiepm_id")
                .where({ "tiepm.batiment_id": batiment_id })
                .modify((query) => {
                  if (selectedDate && formule_id) {
                    query
                      .andWhere(
                        "tieformpm.date_debut_formule",
                        "<=",
                        selectedDate
                      )
                      .andWhere((subQuery) => {
                        subQuery
                          .where(
                            "tieformpm.date_fin_formule",
                            ">=",
                            selectedDate
                          )
                          .orWhereNull("tieformpm.date_fin_formule");
                      });
                  }
                  if (formule_id) {
                    query.andWhere("tieformpm.formule_id", formule_id);
                  } else {
                    query.whereNull("tieformpm.formule_id");
                  }

                  if (search) {
                    query.where("raison_sociale", "like", `%${search}%`);
                  }
                })
                .groupBy("tiepm.tiepm_id"),

              db("tiepp")
                .select("tiepp.tiepp_id as id")
                .leftJoin("tieformpp", "tieformpp.tiepp_id", "tiepp.tiepp_id")
                .where({ "tiepp.batiment_id": batiment_id })
                .modify((query) => {
                  if (selectedDate && formule_id) {
                    query
                      .andWhere(
                        "tieformpp.date_debut_formule",
                        "<=",
                        selectedDate
                      )
                      .andWhere((subQuery) => {
                        subQuery
                          .where(
                            "tieformpp.date_fin_formule",
                            ">=",
                            selectedDate
                          )
                          .orWhereNull("tieformpp.date_fin_formule");
                      });
                  }
                  if (formule_id) {
                    query.andWhere("tieformpp.formule_id", formule_id);
                  } else {
                    query.whereNull("tieformpp.formule_id");
                  }

                  if (search) {
                    query.andWhere((query) => {
                      query
                        .where("tiepp.surname", "like", `%${search}%`)
                        .orWhere("tiepp.first_name", "like", `%${search}%`);
                    });
                  }
                })
                .groupBy("tiepp.tiepp_id"), // Ensures uniqueness for PPs
            ])
            .as("all_tiers")
        )
        .count("* as count")
        .first();
    } else if (isPM) {
      let baseQueryPM = db("tiepm")
        .select(
          "tiepm.tiepm_id as id",
          "tiepm.raison_sociale as libelle",
          db.raw("'PM' as qualite"),
          "tiepm.email",
          "tiepm.phone_number"
        )
        .leftJoin("tieformpm", "tieformpm.tiepm_id", "tiepm.tiepm_id")
        .where({ "tiepm.batiment_id": batiment_id })
        .modify((query) => {
          if (selectedDate && formule_id) {
            query.andWhere((dateQuery) => {
              dateQuery
                .where("tieformpm.date_debut_formule", "<=", selectedDate)
                .andWhere((subQuery) => {
                  subQuery
                    .where("tieformpm.date_fin_formule", ">=", selectedDate)
                    .orWhereNull("tieformpm.date_fin_formule");
                });
            });
          }
          if (formule_id) {
            query.andWhere("tieformpm.formule_id", formule_id);
          } else {
            query.whereNull("tieformpm.formule_id");
          }
        });
      // .groupBy(
      //   "tiepm.tiepm_id",
      //   "tiepm.raison_sociale",
      //   "tiepm.email",
      //   "tiepm.phone_number"
      // );

      if (search) {
        baseQueryPM = baseQueryPM.andWhere(
          "raison_sociale",
          "like",
          `%${search}%`
        );
      }

      globalQuery = baseQueryPM
        .clone()
        .orderBy("libelle", "asc")
        .limit(limit)
        .offset(offset);

      totalGlobalQuery = baseQueryPM
        .clone()
        .clearSelect()
        .count("* as count")
        .first();
    } else if (isPP) {
      let baseQueryPP = db("tiepp")
        .select(
          "tiepp.tiepp_id as id",
          db.raw(`
          CONCAT(
              COALESCE(tiepp.surname, ''), ' ', 
              COALESCE(tiepp.first_name, '')
          ) AS libelle
      `),
          db.raw("'PP' as qualite"),
          "tiepp.email",
          "tiepp.phone_number"
        )
        .leftJoin("tieformpp", "tieformpp.tiepp_id", "tiepp.tiepp_id")
        .where({ "tiepp.batiment_id": batiment_id })
        .modify((query) => {
          if (selectedDate && formule_id) {
            query.andWhere((dateQuery) => {
              dateQuery
                .where("tieformpp.date_debut_formule", "<=", selectedDate)
                .andWhere((subQuery) => {
                  subQuery
                    .where("tieformpp.date_fin_formule", ">=", selectedDate)
                    .orWhereNull("tieformpp.date_fin_formule");
                });
            });
          }

          if (formule_id) {
            query.andWhere("tieformpp.formule_id", formule_id);
          } else {
            query.whereNull("tieformpp.formule_id");
          }
        });
      // .groupBy(
      //   "tiepp.tiepp_id",
      //   "tiepp.surname",
      //   "tiepp.first_name",
      //   "tiepp.email",
      //   "tiepp.phone_number"
      // );

      if (search) {
        baseQueryPP = baseQueryPP.andWhere((query) => {
          query
            .where("tiepp.surname", "like", `%${search}%`)
            .orWhere("tiepp.first_name", "like", `%${search}%`);
        });
      }

      globalQuery = baseQueryPP
        .clone()
        .orderBy("libelle", "asc")
        .limit(limit)
        .offset(offset);

      totalGlobalQuery = baseQueryPP
        .clone()
        .clearSelect()
        .count("* as count")
        .first();
    }

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

// new
router.get(
  "/infos/:qualite/:id",
  verifyUser,
  checkHasTiersAccess,
  async (req, res) => {
    /* 
     #swagger.tags = ['Tiers']
     #swagger.description = "Get tiers PP or PM infos (two schemas possible PMResponse or PPResponse)"
     #swagger.parameters['qualite'] = {
          in: 'path',
          description: 'Quality of the tiers (PP or PM)',
          required: false,
          type: 'string'
     }
     #swagger.parameters['id'] = {
          in: 'path',
          description: 'Tier Id',
          required: false,
          type: 'integer',
          default: 10
     }
      #swagger.responses[200] = {
          content: {
              "application/json": {
                  schema: {
                      oneOf: [
                          { $ref: '#/components/schemas/PMResponse' },
                          { $ref: '#/components/schemas/PPResponse' }
                      ]
                  }
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

    const { qualite, id } = req.params;

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
      if (qualite === "PP") {
        const infosQuery = db("tiepp")
          .select(
            "batiment_id",
            "civilite",
            "surname",
            "first_name",
            "birth_date",
            "birth_name",
            "email",
            "phone_number",
            "num_voie",
            "typ_voie",
            "complement_voie",
            "code_postal",
            "commune",
            "cedex",
            "pays",
            "qpv",
            "zfu",
            "study_level_id",
            "situation_before_prj_id",
            "situation_socio_pro_id",
            "image_authorisation",
            "first_meeting_date",
            "first_meeting_hour_begin",
            "first_meeting_hour_end",
            "prescriber_id",
            "first_meeting_feedback"
          )
          .where({ "tiepp.tiepp_id": id })
          .first();

        const projetsQuery = db("tieppprj")
          .select(
            "prj_id",
            "raison_social_prj",
            "activite_prj",
            "date_debut_prj",
            "nb_dirigeants_prj",
            "effectif_prj",
            "legal_form_id"
          )
          .where({ tiepp_id: id })
          .orderBy("creation_date");

        const accompagnementSouhaitQuery = db("tieppaccsouhait")
          .select(
            "souhait_id",
            "formule_wishes",
            "surface_wishes",
            "date_entree_wished"
          )
          .where({ tiepp_id: id })
          .first();

        const formulesQuery = db("tieformpp")
          .select(
            "form_pp_id",
            "formule_id",
            "date_debut_formule",
            "date_fin_formule"
          )
          .where({ "tieformpp.tiepp_id": id })
          .orderBy("tieformpp.date_debut_formule", "desc");

        const companiesQuery = await db("tierel")
          .select(
            "tierel.rel_id",
            "tierel.tiepm_id",
            "tiepm.raison_sociale",
            "tierel.rel_typ_id",
            "tierel.relation_date_debut",
            "tierel.relation_date_fin",
            db.raw(
              `CASE 
                 WHEN relation_date_fin IS NULL THEN 'Active'
                 WHEN relation_date_fin >= ? THEN 'Active'
                 ELSE 'Expiré'
               END AS relation_status`,
              [formattedCurrentDate]
            )
          )
          .leftJoin("tiepm", "tiepm.tiepm_id", "tierel.tiepm_id")
          .where({ "tierel.tiepp_id": id });

        const [
          infosNotProcessed,
          projets,
          accompagnementSouhait,
          formulesPP,
          companies,
        ] = await Promise.all([
          infosQuery,
          projetsQuery,
          accompagnementSouhaitQuery,
          formulesQuery,
          companiesQuery,
        ]);

        const {
          first_meeting_date,
          first_meeting_hour_begin,
          first_meeting_hour_end,
          prescriber_id,
          first_meeting_feedback,
          ...infosPP
        } = infosNotProcessed;

        const firstMeeting = {
          first_meeting_date,
          first_meeting_hour_begin,
          first_meeting_hour_end,
          prescriber_id,
          first_meeting_feedback,
        };

        res.status(200).json({
          infosPP,
          projets,
          accompagnementSouhait,
          formulesPP,
          firstMeeting,
          companies,
        });
      } else if (qualite === "PM") {
        const infosQuery = db("tiepm")
          .select(
            "batiment_id",
            "raison_sociale",
            "sigle",
            "legal_form_id",
            "secteur_activite_id",
            "activite",
            "date_creation_company",
            "siret",
            "code_ape",
            "date_end_exercise",
            "email",
            "phone_number",
            "capital_amount",
            "num_voie",
            "typ_voie",
            "complement_voie",
            "code_postal",
            "commune",
            "cedex",
            "pays",
            "qpv",
            "zfu"
          )
          .where({ tiepm_id: id })
          .first();

        const formulesQuery = db("tieformpm")
          .select(
            "form_pm_id",
            "formule_id",
            "date_debut_formule",
            "date_fin_formule"
          )
          .where({ tiepm_id: id })
          .orderBy("date_debut_formule", "desc");

        const dirigeantsQuery = await db("tierel")
          .select(
            "tierel.rel_id",
            "tierel.tiepp_id",
            db.raw(`
            CONCAT(
                COALESCE(tiepp.surname, ''), ' ', 
                COALESCE(tiepp.first_name, '')
            ) AS libelle
        `),
            "tierel.rel_typ_id",
            "tierel.relation_date_debut",
            "tierel.relation_date_fin",
            db.raw(
              `CASE 
                 WHEN relation_date_fin IS NULL THEN 'Active'
                 WHEN relation_date_fin >= ? THEN 'Active'
                 ELSE 'Expiré'
               END AS relation_status`,
              [formattedCurrentDate]
            )
          )
          .leftJoin("tiepp", "tiepp.tiepp_id", "tierel.tiepp_id")
          .where({ "tierel.tiepm_id": id });

        const effectifsQuery = db("tiepmeff")
          .select(
            "year",
            "nb_cdi",
            "nb_cdd",
            "nb_int",
            "nb_caid",
            "nb_alt",
            "nb_stg"
          )
          .where({ tiepm_id: id })
          .orderBy("year", "desc");

        const casQuery = db("tiepmca")
          .select("year", "ca")
          .where({ tiepm_id: id })
          .orderBy("year", "desc");

        const sortiePepQuery = db("tiepmsortie")
          .select("date_sortie", "motif_id", "new_implantation")
          .where({ tiepm_id: id })
          .first();

        const postPepQuery = db("tiepmpostpep")
          .select("actualisation_date", "statut_id")
          .where({ tiepm_id: id })
          .first();

        const [
          infosPM,
          formulesPM,
          dirigeants,
          effectifs,
          cas,
          sortiePep,
          postPep,
        ] = await Promise.all([
          infosQuery,
          formulesQuery,
          dirigeantsQuery,
          effectifsQuery,
          casQuery,
          sortiePepQuery,
          postPepQuery,
        ]);

        res.status(200).json({
          infosPM,
          formulesPM,
          dirigeants,
          effectifs,
          cas,
          sortiePep: sortiePep || {},
          postPep: postPep || {},
        });
      } else {
        res.status(400).json({ message: "Un problème est survenu." });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

// new
router.put(
  "/infos-gen/:qualite/:id",
  verifyAdmin,
  checkHasTiersAccess,
  async (req, res) => {
    /* 
     #swagger.tags = ['Tiers']
     #swagger.description = "Update tiers PP general infos"
     #swagger.parameters['id'] = {
          in: 'path',
          description: 'Tier Id',
          required: false,
          type: 'integer',
          default: 10
     }
   #swagger.requestBody = {
      schema: { oneOf: [ { $ref: '#/components/schemas/TiersPPInfosGenBody' },
      { $ref: '#/components/schemas/TiersPMInfosGenBody' } ] }
    }
      #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/SuccessRequest' }
     } 
     #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
     } 
     #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }  
  */

    const { id, qualite } = req.params;

    const trx = await db.transaction();
    try {
      if (qualite === "PP") {
        const {
          batiment_id,
          civilite,
          surname,
          first_name,
          birth_date,
          birth_name,
          email,
          phone_number,
          num_voie,
          typ_voie,
          complement_voie,
          code_postal,
          commune,
          cedex,
          pays,
          qpv,
          zfu,
          study_level_id,
          situation_before_prj_id,
          situation_socio_pro_id,
          image_authorisation,
        } = req.body;

        await trx("tiepp")
          .update({
            batiment_id,
            civilite: civilite || null,
            surname,
            first_name,
            birth_date: birth_date || null,
            birth_name: birth_name || null,
            email,
            phone_number: phone_number || null,
            num_voie: num_voie || null,
            typ_voie: typ_voie || null,
            complement_voie: complement_voie || null,
            code_postal: code_postal || null,
            commune: commune || null,
            cedex: cedex || null,
            pays: pays || null,
            qpv: qpv || null,
            zfu: zfu || null,
            study_level_id: study_level_id || null,
            situation_before_prj_id: situation_before_prj_id || null,
            situation_socio_pro_id: situation_socio_pro_id || null,
            image_authorisation: image_authorisation || null,
          })
          .where({ tiepp_id: id });

        await trx.commit();

        res.status(200).json({
          message: `La mise à jour du tiers ${surname} ${first_name} est un succès.`,
        });
      } else if (qualite === "PM") {
        const {
          batiment_id,
          raison_sociale,
          sigle,
          legal_form_id,
          activite,
          date_creation_company,
          email,
          phone_number,
          num_voie,
          typ_voie,
          complement_voie,
          code_postal,
          commune,
          cedex,
          pays,
          qpv,
          zfu,
          siret,
          secteur_activite_id,
          capital_amount,
          date_end_exercise,
        } = req.body;

        await trx("tiepm")
          .update({
            batiment_id,
            raison_sociale,
            sigle: sigle || null,
            legal_form_id: legal_form_id || null,
            activite: activite || null,
            date_creation_company: date_creation_company || null,
            email: email || null,
            phone_number: phone_number || null,
            num_voie: num_voie || null,
            typ_voie: typ_voie || null,
            complement_voie: complement_voie || null,
            code_postal: code_postal || null,
            commune: commune || null,
            cedex: cedex || null,
            pays: pays || null,
            qpv: qpv || null,
            zfu: zfu || null,
            siret: siret || null,
            secteur_activite_id: secteur_activite_id || null,
            capital_amount: capital_amount || null,
            date_end_exercise: date_end_exercise || null,
          })
          .where({ tiepm_id: id });

        await trx.commit();
        res.status(200).json({
          message: `La mise à jour du tiers ${raison_sociale} est un succès.`,
        });
      } else {
        await trx.rollback();
        res.status(400).json({ message: "Un problème est survenu." });
      }
    } catch (err) {
      await trx.rollback();
      console.error(err);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

// new
router.get("/files/:qualite/:id", verifyUser, async (req, res) => {
  /* 
     #swagger.tags = ['Tiers']
     #swagger.description = "Get the files of a specified tiers"
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
    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/TiersFilesResponse' }
     } 
     #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequestFiles' }
     } 
     #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }  
  */

  const { qualite, id } = req.params;

  if (!id) {
    res.status(400).json({ message: "L'identifiant est requis." });
    return;
  }

  if (!qualite) {
    res.status(400).json({ message: "La qualité est requise." });
    return;
  }

  try {
    const prefix =
      qualite === "PP"
        ? `Pepiniere Tiers/PP/${id}/Fiche/imported`
        : `Pepiniere Tiers/PM/${id}/imported`;

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
  }
});

//new
router.post(
  "/files/:qualite/:id",
  verifyAdmin,
  upload.array("files"),
  async (req, res) => {
    /* 
     #swagger.tags = ['Tiers']
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
    const { qualite, id } = req.params;

    if (!id) {
      res.status(400).json({ message: "L'identifiant est requis." });
      return;
    }

    if (!qualite) {
      res.status(400).json({ message: "La qualité est requise." });
      return;
    }

    if (!req.files || !Array.isArray(req.files)) {
      res
        .status(400)
        .json({ message: "Des fichiers sont requis pour l'importation." });
      return;
    }

    try {
      const prefix =
        qualite === "PP"
          ? `Pepiniere Tiers/PP/${id}/Fiche/imported`
          : `Pepiniere Tiers/PM/${id}/imported`;

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
router.put("/files/:qualite/:id", verifyAdmin, async (req, res) => {
  /* 
     #swagger.tags = ['Tiers']
     #swagger.description = "Move to the archive a file"
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
  const { id, qualite } = req.params;
  const { filename } = req.body;

  if (!id) {
    res.status(400).json({ message: "L'identifiant est requis." });
    return;
  }

  if (!qualite) {
    res.status(400).json({ message: "La qualité est requise." });
    return;
  }

  if (!filename) {
    res.status(400).json({ message: "Le nom du fichier sont requis." });
    return;
  }

  const prefix =
    qualite === "PP"
      ? `Pepiniere Tiers/PP/${id}/Fiche`
      : `Pepiniere Tiers/PM/${id}`;

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
router.get("/categories-socio-pro", async (req, res) => {
  /* 
     #swagger.tags = ['Tiers']
     #swagger.description = "Get the socio pro categories"
     #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/SuccessRequest' }
     } 
     #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
     } 
     #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }  
  */

  const key = `PCS-ESE_2017_Liste.xls`;

  const params = {
    Bucket: R2_BUCKET_NAME,
    Key: key,
  };

  try {
    const data = await r2.send(new GetObjectCommand(params));

    if (data.Body) {
      const buffer = await (data.Body as any).transformToByteArray();

      const workbook = XLSX.read(buffer, { type: "buffer" });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const categSocioPro = XLSX.utils.sheet_to_json(worksheet);

      res.status(200).json(categSocioPro);
    } else {
      res.status(404).send("File not found");
    }
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).send("Failed to process file");
  }
});

//new
router.get("/code-ape", async (req, res) => {
  /* 
     #swagger.tags = ['Tiers']
     #swagger.description = "Get all the ape codes"
      #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/SuccessRequest' }
     } 
     #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
     } 
     #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }  

  */
  const key = `Liste-des-codes-APE-NAF-excel-2017.xlsx`;

  const params = {
    Bucket: R2_BUCKET_NAME,
    Key: key,
  };

  try {
    const data = await r2.send(new GetObjectCommand(params));

    if (data.Body) {
      const buffer = await (data.Body as any).transformToByteArray();

      const workbook = XLSX.read(buffer, { type: "buffer" });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const codeApeList = XLSX.utils.sheet_to_json(worksheet);

      res.status(200).json(codeApeList);
    } else {
      res.status(404).send("File not found");
    }
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).send("Failed to process file");
  }
});


//new
// router.get("/code-ape-dictionary", async (req, res) => {
//   /* 
//     #swagger.tags = ['Tiers']
//     #swagger.description = "Get all the ape codes"
//      #swagger.responses[200] = {
//            schema: { $ref: '#/components/schemas/SuccessRequest' }
//     } 
//     #swagger.responses[400] = {
//            schema: { $ref: '#/components/schemas/BadRequest' }
//     } 
//     #swagger.responses[500] = {
//            schema: { $ref: '#/components/schemas/ErrorResponse' }
//    }  

//  */
//   const key = `Liste-des-codes-APE-NAF-excel-2017.xlsx`;

//   const codes = [
//     "71.12B", "43.99C", "96.04Z", "56.10C", "85.59A", "66.21Z", "81.30Z", "33.11Z", "43.22A", "43.31Z",
//     "70.22Z", "49.41A", "49.32Z", "46.52Z", "95.12Z", "73.11Z", "47.91B", "46.62Z", "62.02A", "81.21Z",
//     "43.21A", "74.10Z", "96.02B", "80.20Z", "69.20Z", "82.99Z", "90.04Z", "47.91A", "96.09Z", "46.69B",
//     "46.90Z", "62.01Z", "49.31Z", "45.19Z", "45.11Z", "SECTION A", "93.29Z", "46.39B", "43.32A", "82.11Z",
//     "82.19Z", "80.10Z", "59.11B", "71.12", "82.11", "62", "70", "77.29Z", "41.20A", "47.11B", "53.20Z",
//     "47.22Z", "68.31Z"
//   ];

//   const params = {
//     Bucket: R2_BUCKET_NAME,
//     Key: key,
//   };

//   try {
//     const data = await r2.send(new GetObjectCommand(params));

//     if (data.Body) {
//       const buffer = await (data.Body as any).transformToByteArray();
//       const workbook = XLSX.read(buffer, { type: "buffer" });
//       const sheetName = workbook.SheetNames[0];
//       const worksheet = workbook.Sheets[sheetName];

//       // Convert sheet to JSON
//       const codeApeList = XLSX.utils.sheet_to_json(worksheet);

//       const codeDictionary: Record<string, string> = {};
//       codeApeList.forEach((row: any) => {
//         if (row['Code APE'] && row[' Intitulés de la NAF']) {
//           codeDictionary[row['Code APE']] = row[' Intitulés de la NAF'];
//         }
//       });

//       const filteredDictionary: Record<string, string> = {};
//       codes.forEach(code => {
//         const matchedCode = Object.keys(codeDictionary).find(
//           k => k === code
//         );
//         if (matchedCode) {
//           console.log(code, matchedCode)
//           filteredDictionary[code] = codeDictionary[matchedCode];
//         } else {
//           console.log(code)
//           filteredDictionary[code] = "Description not found";
//         }
//       });

//       res.status(200).json(filteredDictionary);
//     } else {
//       res.status(404).json({ message: "File not found" });
//     }
//   } catch (error) {
//     console.error("Error processing file:", error);
//     res.status(500).json({ message: "Failed to process file" });
//   }
// });

//new
router.get("/download-search", async (req, res) => {
  /* 
     #swagger.tags = ['Unité de gestion']
     #swagger.description = "Get the downloaded search"
     #swagger.parameters['batiment_id'] = {
          in: 'query',
          description: 'ID of the batiment to filter prices',
          required: true,
          type: 'integer'
     }
     #swagger.parameters['formule'] = {
          in: 'query',
          description: 'Search term',
          required: false,
          type: 'string'
     }
      #swagger.parameters['pm'] = {
          in: 'query',
          description: 'Search term',
          required: false,
          type: 'string'
     }
    #swagger.parameters['pp'] = {
          in: 'query',
          description: 'Search term',
          required: false,
          type: 'string'
     }
      #swagger.parameters['search'] = {
          in: 'query',
          description: 'Search term',
          required: false,
          type: 'string'
     }
    #swagger.parameters['dateFormule'] = {
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
  try {
    const {
      batiment_id,
      search = "",
      formule,
      pm,
      pp,
      dateFormule,
    } = req.query;

    if (!batiment_id) {
      res.status(400).json({ message: "Le batiment est requis." });
      return;
    }

    const batimentQuery = await db("ugbats")
      .select("name")
      .where({ batiment_id })
      .first();

    const formuleQuery = await db("formules_params")
      .select("name")
      .where({ formule_id: formule })
      .first();

    if (!batimentQuery) {
      res.status(404).json({ message: "Batiment not found." });
      return;
    }

    const batimentName = batimentQuery.name.replace(/[^a-zA-Z0-9]/g, "_");

    let formuleName;
    if (formuleQuery) {
      formuleName = formuleQuery.name.replace(/[^a-zA-Z0-9]/g, "_");
    }

    let baseQueryPP;
    if (pp === "true") {
      baseQueryPP = db("tiepp")
        .select(
          "tiepp.tiepp_id as id",
          "tiepp.civilite",
          "tiepp.surname as nom_famille",
          "tiepp.first_name as prenom",
          "tiepp.sex as sexe",
          "tiepp.birth_name as nom_naissance",
          "tiepp.birth_date as date_naissance",
          "tiepp.nationality as nationalite",
          "tiepp.phone_fixed_number as telephone_fixe",
          "tiepp.phone_number as numero_telephone",
          "tiepp.email",
          "tiepp.death_date as date_deces",
          "tiepp.image_authorisation as image_autorisation",
          "tiepp.num_voie as numero_voie",
          "tiepp.typ_voie as type_voie",
          "tiepp.int_voie as intitule_voie",
          "tiepp.complement_voie as complement_voie",
          "tiepp.code_postal",
          "tiepp.commune",
          "tiepp.cedex",
          "tiepp.pays",
          "tiepp.qpv",
          "tiepp.zfu",
          "tiepp.first_meeting_date as premier_entretien_date",
          "tiepp.first_meeting_hour_begin as heure_debut",
          "tiepp.first_meeting_hour_end as heure_fin",
          "prescribers_params.name as prescripteur",
          "tiepp.first_meeting_feedback as commentaire",
          "tiepp.situation_socio_pro_id",
          "study_level_params.name as niveau_etudes",
          "situation_before_prj_params.name as situation_avant_projet",
          "formules_params.name as formule",
          "tieformpp.date_debut_formule",
          "tieformpp.date_fin_formule"
        )

        .leftJoin(
          "prescribers_params",
          "prescribers_params.prescriber_id",
          "tiepp.prescriber_id"
        )
        .leftJoin(
          "study_level_params",
          "study_level_params.study_level_id",
          "tiepp.study_level_id"
        )
        .leftJoin(
          "situation_before_prj_params",
          "situation_before_prj_params.situation_before_prj_id",
          "tiepp.situation_before_prj_id"
        )
        .leftJoin("tieformpp", "tieformpp.tiepp_id", "tiepp.tiepp_id")
        .leftJoin(
          "formules_params",
          "formules_params.formule_id",
          "tieformpp.formule_id"
        )
        .modify((query) => {
          if (dateFormule && formule) {
            query.andWhere((dateQuery) => {
              dateQuery
                .where("tieformpp.date_debut_formule", "<=", dateFormule)
                .andWhere((subQuery) => {
                  subQuery
                    .where("tieformpp.date_fin_formule", ">=", dateFormule)
                    .orWhereNull("tieformpp.date_fin_formule");
                });
            });
          }

          if (formule) {
            query.andWhere("tieformpp.formule_id", formule);
          } else {
            query.whereNull("tieformpp.formule_id");
          }
        })
        .groupBy(
          "tiepp.tiepp_id",
          "tiepp.surname",
          "tiepp.first_name",
          "tiepp.email",
          "tiepp.phone_number"
        );

      if (search) {
        baseQueryPP = baseQueryPP.andWhere((query) => {
          query
            .where("tiepp.surname", "like", `%${search}%`)
            .orWhere("tiepp.first_name", "like", `%${search}%`);
        });
      }
    }

    let baseQueryPM;
    if (pm === "true") {
      baseQueryPM = db("tiepm")
        .select(
          "tiepm.tiepm_id as id",
          "tiepm.raison_sociale",
          "tiepm.sigle",
          "tiepm.date_creation_company as date_creation_entreprise",
          "tiepm.activite",
          "legal_forms_params.name as statut_juridique",
          "tiepm.siret",
          "secteurs_activites_params.name as secteur_activite",
          "tiepm.date_end_exercise as date_fin_exercice",
          "tiepm.tva",
          "tiepm.capital_amount as montant_capital",
          "tiepm.phone_fixed_number as telephone_fixe",
          "tiepm.phone_number as numero_telephone",
          "tiepm.email",
          "tiepm.num_voie as numero_voie",
          "tiepm.typ_voie as type_voie",
          "tiepm.int_voie as intitule_voie",
          "tiepm.complement_voie as complement_voie",
          "tiepm.code_postal",
          "tiepm.commune",
          "tiepm.cedex",
          "tiepm.pays",
          "tiepm.qpv",
          "tiepm.zfu",
          "formules_params.name as formule",
          "tieformpm.date_debut_formule",
          "tieformpm.date_fin_formule"
        )
        .leftJoin(
          "legal_forms_params",
          "legal_forms_params.legal_form_id",
          "tiepm.legal_form_id"
        )
        .leftJoin(
          "secteurs_activites_params",
          "secteurs_activites_params.secteur_activite_id",
          "tiepm.secteur_activite_id"
        )
        .leftJoin("tieformpm", "tieformpm.tiepm_id", "tiepm.tiepm_id")
        .leftJoin(
          "formules_params",
          "formules_params.formule_id",
          "tieformpm.formule_id"
        )
        .modify((query) => {
          if (dateFormule && formule) {
            query.andWhere((dateQuery) => {
              dateQuery
                .where("tieformpm.date_debut_formule", "<=", dateFormule)
                .andWhere((subQuery) => {
                  subQuery
                    .where("tieformpm.date_fin_formule", ">=", dateFormule)
                    .orWhereNull("tieformpm.date_fin_formule");
                });
            });
          }
          if (formule) {
            query.andWhere("tieformpm.formule_id", formule);
          } else {
            query.whereNull("tieformpm.formule_id");
          }
        })
        .groupBy(
          "tiepm.tiepm_id",
          "tiepm.raison_sociale",
          "tiepm.email",
          "tiepm.phone_number"
        );
    }

    const [PPResults, PMResults] = await Promise.all([
      baseQueryPP,
      baseQueryPM,
    ]);

    let dirigeantsPPQuery;
    let rencontresPPQuery;
    let projetsPPQuery;
    if (PPResults?.length) {
      dirigeantsPPQuery = db("tierel")
        .select(
          db.raw(`
          CONCAT(
              COALESCE(tiepp.surname, ''), ' ', 
              COALESCE(tiepp.first_name, '')
          ) AS libelle
      `),
          "tiepm.raison_sociale",
          "relations_pm_pp_params.name",
          "tierel.relation_date_debut",
          "tierel.relation_date_fin"
        )
        .leftJoin(
          "relations_pm_pp_params",
          "relations_pm_pp_params.rel_typ_id",
          "tierel.rel_typ_id"
        )
        .leftJoin("tiepp", "tiepp.tiepp_id", "tierel.tiepp_id")
        .leftJoin("tiepm", "tiepm.tiepm_id", "tierel.tiepm_id");

      rencontresPPQuery = db("tieppaccsuivi")
        .select(
          db.raw(`
            CONCAT(
                COALESCE(tiepp.surname, ''), ' ', 
                COALESCE(tiepp.first_name, '')
            ) AS libelle
        `),
          "tieppaccsuivi.date_acc_suivi as date_suivi_accompagnement",
          "tieppaccsuivi.hour_begin as heure_debut",
          "tieppaccsuivi.hour_end as heure_fin",
          "type_accompagnements_params.name as type",
          "sujets_accompagnements_params.name as sujet",
          "tieppaccsuivi.feedback as commentaire"
        )
        .leftJoin("tiepp", "tiepp.tiepp_id", "tieppaccsuivi.tiepp_id")
        .leftJoin(
          "sujets_accompagnements_params",
          "sujets_accompagnements_params.sujet_accompagnement_id",
          "tieppaccsuivi.sujet_accompagnement_id"
        )
        .leftJoin(
          "type_accompagnements_params",
          "type_accompagnements_params.typ_accompagnement_id",
          "tieppaccsuivi.typ_accompagnement_id"
        );

      projetsPPQuery = db("tieppprj")
        .select(
          db.raw(`
            CONCAT(
                COALESCE(tiepp.surname, ''), ' ', 
                COALESCE(tiepp.first_name, '')
            ) AS libelle
        `),
          "raison_social_prj as nom_projet",
          "activite_prj as activite_projet",
          "date_debut_prj as date_debut_projet",
          "nb_dirigeants_prj as nb_dirigeants_projet",
          "effectif_prj as effectif_projet",
          "legal_forms_params.name as statut_juridique"
        )
        .leftJoin("tiepp", "tiepp.tiepp_id", "tieppprj.tiepp_id")
        .leftJoin(
          "legal_forms_params",
          "legal_forms_params.legal_form_id",
          "tieppprj.legal_form_id"
        );
    }

    let effectifsPMQuery;
    let CAPMQuery;
    if (PMResults?.length) {
      effectifsPMQuery = db("tiepmeff")
        .select(
          "tiepm.raison_sociale",
          "tiepmeff.year as annee",
          "tiepmeff.nb_cdi",
          "tiepmeff.nb_cdd",
          "tiepmeff.nb_int",
          "tiepmeff.nb_caid",
          "tiepmeff.nb_alt",
          "tiepmeff.nb_stg"
        )
        .leftJoin("tiepm", "tiepm.tiepm_id", "tiepmeff.tiepm_id");

      CAPMQuery = db("tiepmca")
        .select(
          "tiepm.raison_sociale",
          "tiepmca.year as annee",
          "tiepmca.ca as chiffre_affaires"
        )
        .leftJoin("tiepm", "tiepm.tiepm_id", "tiepmca.tiepm_id");
    }

    const [dirigeantsPP, rencontresPP, projetsPP, effectifsPM, CAPM] =
      await Promise.all([
        dirigeantsPPQuery,
        rencontresPPQuery,
        projetsPPQuery,
        effectifsPMQuery,
        CAPMQuery,
      ]);

    const workbook = XLSX.utils.book_new();
    if (PPResults && PPResults.length) {
      const worksheetPP = XLSX.utils.json_to_sheet(PPResults);
      XLSX.utils.book_append_sheet(
        workbook,
        worksheetPP,
        "Personnes Physiques"
      );

      if (rencontresPP?.length) {
        const worksheetRencontresPP = XLSX.utils.json_to_sheet(rencontresPP);
        XLSX.utils.book_append_sheet(
          workbook,
          worksheetRencontresPP,
          "Rencontres Personnes Physiques"
        );
      }

      if (projetsPP?.length) {
        const worksheetprojetsPP = XLSX.utils.json_to_sheet(projetsPP);
        XLSX.utils.book_append_sheet(
          workbook,
          worksheetprojetsPP,
          "Projets Personnes Physiques"
        );
      }

      if (dirigeantsPP?.length) {
        const worksheetDirigeantsPP = XLSX.utils.json_to_sheet(dirigeantsPP);
        XLSX.utils.book_append_sheet(
          workbook,
          worksheetDirigeantsPP,
          "Relations PP-PM"
        );
      }
    }

    if (PMResults && PMResults.length) {
      const worksheetPM = XLSX.utils.json_to_sheet(PMResults);
      XLSX.utils.book_append_sheet(workbook, worksheetPM, "Personnes Morales");

      if (effectifsPM?.length) {
        const worksheetEffectifsPM = XLSX.utils.json_to_sheet(effectifsPM);
        XLSX.utils.book_append_sheet(
          workbook,
          worksheetEffectifsPM,
          "Effectifs Personnes Morales"
        );
      }

      if (CAPM?.length) {
        const worksheetCAPM = XLSX.utils.json_to_sheet(CAPM);
        XLSX.utils.book_append_sheet(
          workbook,
          worksheetCAPM,
          "CA Personnes Physiques"
        );
      }
    }

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" +
      `Beneficiaires_${batimentName}_${formuleName || ""}_${dateFormule || ""}_${pm === "true" ? "PM" : ""}_${pp === "true" ? "PP" : ""}.xlsx`
    );
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    res.end(buffer);
  } catch (e) {
    console.log(e);
    res.json(e);
  }
});

//new
router.get("/download-template", async (req: Request, res: Response) => {
  const fileKey = `TRAM_TIERS.xlsx`;

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
router.get("/download-ape", async (req: Request, res: Response) => {
  const fileKey = `Liste-des-codes-APE-NAF-excel-2017.xlsx`;

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
router.get("/download-socio-pro", async (req: Request, res: Response) => {
  const fileKey = `PCS-ESE_2017_Liste.xls`;

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

const job = new CronJob(
  "0 0 3 1 1 *",
  async () => {
    console.log("Running yearly update for PORTEUR PROJET...");
    try {
      await updatePorteurProjetAn();
      console.log("Yearly update completed successfully.");
    } catch (error) {
      console.error(error);
    }
  },
  null,
  true,
  "Europe/Paris"
);

async function updatePorteurProjetAn() {
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

    const previousYear = new Date(currentDate);
    previousYear.setFullYear(currentDate.getFullYear() - 1);

    const date_fin_formule = `${previousYear.getFullYear()}-12-31`;

    await trx("tieformpp")
      .update({ date_fin_formule })
      .where({ formule: 2, date_fin_formule: null });

    await trx("tieformpm")
      .update({ date_fin_formule })
      .where({ formule: 2, date_fin_formule: null });

    await trx.commit();
    console.log("Updated ending date for PORTEUR PROJET");
  } catch (e) {
    await trx.rollback();
    console.error("Error updating PORTEUR PROJET:", e);
    throw e;
  }
}

// a corriger and set cron job
router.get("/update-porteur-projet-an", async (req, res) => {
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

    const previousDate = new Date(currentDate);
    previousDate.setDate(currentDate.getDate() - 1);

    const previousYear = new Date(currentDate);
    previousYear.setFullYear(currentDate.getFullYear() - 1);

    const date_fin_formule = `${previousYear.getFullYear()}-12-31`;

    console.log("Previous Date:", previousDate);
    console.log("Previous Year's End:", date_fin_formule);

    await trx("tieformpp")
      .update({ date_fin_formule })
      .where({ formule: 2, date_fin_formule: null });

    await trx("tieformpm")
      .update({ date_fin_formule })
      .where({ formule: 2, date_fin_formule: null });

    await trx.commit();
    res.status(200).json({ message: "Set ending date to PORTEUR PROJET" });
  } catch (e) {
    await trx.rollback();
    console.log(e);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer" });
  }
});

export { router as tiersRouter };
