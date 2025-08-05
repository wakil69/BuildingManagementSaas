import express, { Request, Response } from "express";
import { db } from "../../data/db";
import dotenv from "dotenv";
import { checkHasTiersAccess } from "../../middlewares/checkHasAccessTiers";
import { AdminRequest, verifyAdmin } from "../../middlewares/checkAdmin";

dotenv.config();

const router = express.Router();


//new
router.post(
  "/formule/:qualite/:id",
  verifyAdmin,
  checkHasTiersAccess,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Tiers']
     #swagger.description = "Add a formule"
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
      schema: { type: "object", properties: { formule_id: { type: "number" }, 
                                            date_debut_formule: { type: "string" }, 
                                            date_fin_formule: { type: "string" }  } }
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
    const { formule_id, date_debut_formule, date_fin_formule } = req.body;
    const user_id = req.user_id;

    const trx = await db.transaction();
    try {
      if (qualite === "PP") {
        const overlappingFormules = await trx("tieformpp")
          .select("date_debut_formule", "date_fin_formule")
          .whereRaw(
            `
          NOT (
            (? > COALESCE(date_fin_formule, '9999-12-31')) OR
            (? < date_debut_formule)
          )
          `,
            [date_debut_formule, date_fin_formule || "9999-12-31"]
          )
          .where({ tiepp_id: id });

        if (overlappingFormules.length > 0) {
          await trx.rollback();
          res.status(400).json({
            message:
              "La nouvelle formule interfère avec les formules existantes. Veuillez revoir les dates.",
          });
          return;
        }

        await trx("tieformpp").insert({
          formule_id,
          tiepp_id: id,
          date_debut_formule,
          date_fin_formule: date_fin_formule || null,
          creation_user: user_id,
          update_user: user_id,
        });

        await trx.commit();
        res
          .status(200)
          .json({ message: "L'ajout de la nouvelle formule est un succès." });
      } else if (qualite === "PM") {
        const overlappingFormules = await trx("tieformpm")
          .select("date_debut_formule", "date_fin_formule")
          .whereRaw(
            `
          NOT (
            (? > COALESCE(date_fin_formule, '9999-12-31')) OR
            (? < date_debut_formule)
          )
          `,
            [date_debut_formule, date_fin_formule || "9999-12-31"]
          )
          .where({ tiepm_id: id });

        if (overlappingFormules.length > 0) {
          await trx.rollback();
          res.status(400).json({
            message:
              "La nouvelle formule interfère avec les formules existantes. Veuillez revoir les dates.",
          });
          return;
        }

        await trx("tieformpm").insert({
          formule_id,
          tiepm_id: id,
          date_debut_formule,
          date_fin_formule: date_fin_formule || null,
          creation_user: user_id,
          update_user: user_id,
        });

        await trx.commit();
        res
          .status(200)
          .json({ message: "L'ajout de la nouvelle formule est un succès." });
      } else {
        res.status(400).json({ message: "Un problème est survenu." });
      }
    } catch (e) {
      await trx.rollback();
      console.error(e);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

//new
router.put(
  "/formule/:qualite/:id/:form_id",
  verifyAdmin,
  checkHasTiersAccess,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Tiers']
     #swagger.description = "Modify a formule"
     #swagger.parameters['qualite'] = {
          in: 'path',
          description: 'Quality Tier',
          required: true,
          schema: { type: 'integer' }
     }
     #swagger.parameters['form_id'] = {
          in: 'path',
          description: 'id of the tieformpp or tieformpm',
          required: true,
          schema: { type: 'integer' }
     }
    #swagger.requestBody = {
      schema: { type: "object", properties: { formule_id: { type: "number" }, 
                                            date_debut_formule: { type: "string" }, 
                                            date_fin_formule: { type: "string" }  } }
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
    const { qualite, id, form_id } = req.params;
    const { formule_id, date_debut_formule, date_fin_formule } = req.body;
    const user_id = req.user_id;

    const trx = await db.transaction();
    try {
      if (qualite === "PP") {
        const overlappingFormules = await trx("tieformpp")
          .select("date_debut_formule", "date_fin_formule")
          .whereRaw(
            `
          NOT (
            (? > COALESCE(date_fin_formule, '9999-12-31')) OR
            (? < date_debut_formule)
          )
          `,
            [date_debut_formule, date_fin_formule || "9999-12-31"]
          )
          .where("form_pp_id", "!=", form_id)
          .where({ tiepp_id: id });

        if (overlappingFormules.length > 0) {
          await trx.rollback();
          res.status(400).json({
            message:
              "La formule interfère avec les formules existantes. Veuillez revoir les dates.",
          });
          return;
        }

        await trx("tieformpp")
          .update({
            formule_id,
            date_debut_formule,
            date_fin_formule: date_fin_formule || null,
            update_user: user_id,
          })
          .where({ form_pp_id: form_id });

        await trx.commit();
        res
          .status(200)
          .json({ message: "La mise à jour de la formule est un succès." });
      } else if (qualite === "PM") {
        const overlappingFormules = await trx("tieformpm")
          .select("date_debut_formule", "date_fin_formule")
          .whereRaw(
            `
          NOT (
            (? > COALESCE(date_fin_formule, '9999-12-31')) OR
            (? < date_debut_formule)
          )
          `,
            [date_debut_formule, date_fin_formule || "9999-12-31"]
          )
          .where("form_pm_id", "!=", form_id)
          .where({ tiepm_id: id });

        if (overlappingFormules.length > 0) {
          await trx.rollback();
          res.status(400).json({
            message:
              "La formule interfère avec les formules existantes. Veuillez revoir les dates.",
          });
          return;
        }

        await trx("tieformpm")
          .insert({
            formule_id,
            date_debut_formule,
            date_fin_formule: date_fin_formule || null,
            update_user: user_id,
          })
          .where({ form_pm_id: form_id });

        await trx.commit();
        res
          .status(200)
          .json({ message: "La mise à jour de la formule est un succès." });
      } else {
        res.status(400).json({ message: "Un problème est survenu." });
      }
    } catch (e) {
      await trx.rollback();
      console.log(e);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

//new
router.delete(
  "/formule/:qualite/:id/:form_id",
  verifyAdmin,
  checkHasTiersAccess,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Tiers']
     #swagger.description = "Delete a formule"
     #swagger.parameters['qualite'] = {
          in: 'path',
          description: 'Quality Tier',
          required: true,
          schema: { type: 'integer' }
     }
     #swagger.parameters['form_id'] = {
          in: 'path',
          description: 'id of the tieformpp or tieformpm',
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
    const { qualite, form_id } = req.params;

    const trx = await db.transaction();
    try {
      if (qualite === "PP") {
        await trx("tieformpp").delete().where({ form_pp_id: form_id });

        await trx.commit();
        res
          .status(200)
          .json({ message: "La suppression de la formule est un succès." });
      } else if (qualite === "PM") {
        await trx("tieformpm").delete().where({ form_pm_id: form_id });

        await trx.commit();
        res
          .status(200)
          .json({ message: "La suppression de la formule est un succès." });
      } else {
        await trx.rollback(); 
        res.status(400).json({ message: "Un problème est survenu." });
      }
    } catch (e) {
      await trx.rollback();
      console.log(e);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

//new
router.post(
  "/relations/:qualite/:id",
  verifyAdmin,
  checkHasTiersAccess,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Tiers']
     #swagger.description = "Add a formule"
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
      schema: { type: "object", properties: { rel_typ_id: { type: "number" }, 
      tiepm_id: { type: "number", nullable: true }, tiepp_id: { type: "number", nullable: true }, 
                                            relation_date_debut: { type: "string" }, 
                                            relation_date_fin: { type: "string" }  } }
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
      const { id, qualite } = req.params;
      const user_id = req.user_id;
      if (qualite === "PP") {
        const { rel_typ_id, tiepm_id, relation_date_debut, relation_date_fin } =
          req.body;

        if (!tiepm_id) {
          await trx.rollback();
          res
            .status(400)
            .json({ message: "Veuillez ajouter une personne morale." });
        }

        await trx("tierel").insert({
          rel_typ_id: rel_typ_id || null,
          tiepm_id,
          tiepp_id: id,
          relation_date_debut: relation_date_debut || null,
          relation_date_fin: relation_date_fin || null,
          creation_user: user_id,
          update_user: user_id,
        });

        await trx.commit();

        res
          .status(200)
          .json({ message: "L'ajout de la relation est un succès." });
      } else if (qualite === "PM") {
        const { rel_typ_id, tiepp_id, relation_date_debut, relation_date_fin } =
          req.body;

        if (!tiepp_id) {
          await trx.rollback();
          res
            .status(400)
            .json({ message: "Veuillez ajouter une personne physique." });
        }

        await trx("tierel").insert({
          rel_typ_id: rel_typ_id || null,
          tiepp_id,
          tiepm_id: id,
          relation_date_debut: relation_date_debut || null,
          relation_date_fin: relation_date_fin || null,
          creation_user: user_id,
          update_user: user_id,
        });

        await trx.commit();

        res
          .status(200)
          .json({ message: "L'ajout de la relation est un succès." });
      } else {
        await trx.rollback();
        res.status(400).json({ message: "Un problème est survenu." });
      }
    } catch (e) {
      await trx.rollback();
      console.log(e);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

//new
router.put(
  "/relations/:qualite/:id/:rel_id",
  verifyAdmin,
  checkHasTiersAccess,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Tiers']
     #swagger.description = "Update a relation"
     #swagger.parameters['qualite'] = {
          in: 'path',
          description: 'Quality Tier',
          required: true,
          schema: { type: 'integer' }
     }
     #swagger.parameters['id'] = {
          in: 'path',
          description: 'id of the PP or PM',
          required: true,
          schema: { type: 'integer' }
     }
    #swagger.parameters['rel_id'] = {
          in: 'path',
          description: 'id of the relation',
          required: true,
          schema: { type: 'integer' }
     }
    #swagger.requestBody = {
      schema: { type: "object", properties: { rel_typ_id: { type: "number" }, 
                                            relation_date_debut: { type: "string" }, 
                                            relation_date_fin: { type: "string" }  } }
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
      const { rel_id } = req.params;
      const user_id = req.user_id;
      const { rel_typ_id, relation_date_debut, relation_date_fin } = req.body;

      await trx("tierel")
        .update({
          rel_typ_id: rel_typ_id || null,
          relation_date_debut: relation_date_debut || null,
          relation_date_fin: relation_date_fin || null,
          update_user: user_id,
        })
        .where({
          rel_id,
        });

      await trx.commit();

      res
        .status(200)
        .json({ message: "La mise à jour de la relation est un succès." });
    } catch (e) {
      await trx.rollback();
      console.log(e);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

//new
router.delete("/relations/:qualite/:id/:rel_id", async (req, res) => {
  /* 
     #swagger.tags = ['Tiers']
     #swagger.description = "Delete a relation"
     #swagger.parameters['qualite'] = {
          in: 'path',
          description: 'Quality Tier',
          required: true,
          schema: { type: 'integer' }
     }
     #swagger.parameters['id'] = {
          in: 'path',
          description: 'id of the PP or PM',
          required: true,
          schema: { type: 'integer' }
     }
    #swagger.parameters['rel_id'] = {
          in: 'path',
          description: 'id of the relation',
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
    const { rel_id } = req.params;

    await trx("tierel").delete().where({
      rel_id,
    });

    await trx.commit();

    res.status(200).json({ message: "La suppression de la relation est un succès." });
  } catch (e) {
    await trx.rollback();
    console.log(e);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

//new
router.put(
  "/wishes/:qualite/:id",
  verifyAdmin,
  checkHasTiersAccess,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Tiers']
          #swagger.parameters['qualite'] = {
          in: 'path',
          description: 'Quality Tier',
          required: true,
          schema: { type: 'integer' }
     }
     #swagger.parameters['id'] = {
          in: 'path',
          description: 'id of the PP or PM',
          required: true,
          schema: { type: 'integer' }
     }
     #swagger.description = "Update wishes of PP"
       #swagger.requestBody = {
      schema: { type: "object", properties: { 
      souhait_id: { type: "number" },
      formule_wishes: { type: "string" }, 
      surface_wishes: { type: "string" }, 
      date_entree_wished: { type: "string", nullable: true }  } }
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
      const { souhait_id, formule_wishes, surface_wishes, date_entree_wished } =
        req.body;

      await trx("tieppaccsouhait")
        .update({
          formule_wishes,
          surface_wishes,
          date_entree_wished,
          update_user: user_id,
        })
        .where({
          souhait_id,
        });

      await trx.commit();

      res
        .status(200)
        .json({ message: "La mise à jour des souhaits est un succès." });
    } catch (e) {
      await trx.rollback();
      console.error(e);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

//new
router.put(
  "/first-meeting/:qualite/:id",
  verifyAdmin,
  checkHasTiersAccess,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Tiers']
          #swagger.parameters['qualite'] = {
          in: 'path',
          description: 'Quality Tier',
          required: true,
          schema: { type: 'integer' }
     }
     #swagger.parameters['id'] = {
          in: 'path',
          description: 'id of the PP or PM',
          required: true,
          schema: { type: 'integer' }
     }
     #swagger.description = "Update first meeting infos"
       #swagger.requestBody = {
      schema: { type: "object", properties: { 
      first_meeting_date: { type: "string" },
      first_meeting_hour_begin: { type: "string" }, 
      first_meeting_hour_end: { type: "string" }, 
      prescriber_id: { type: "string", nullable: true },
      first_meeting_feedback: { type: "string", nullable: true },
        } }
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
      const {
        first_meeting_date,
        first_meeting_hour_begin,
        first_meeting_hour_end,
        prescriber_id,
        first_meeting_feedback,
      } = req.body;
      const { id: tiepp_id } = req.params;

      await trx("tiepp")
        .update({
          first_meeting_date: first_meeting_date || null,
          first_meeting_hour_begin: first_meeting_hour_begin || null,
          first_meeting_hour_end: first_meeting_hour_end || null,
          prescriber_id: prescriber_id || null,
          first_meeting_feedback: first_meeting_feedback || null,
          update_user: user_id,
        })
        .where({
          tiepp_id,
        });

      await trx.commit();

      res.status(200).json({
        message: "La mise à jour du premier entretien est un succès.",
      });
    } catch (e) {
      await trx.rollback();
      console.error(e);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

//new
router.post(
  "/projet/:qualite/:id",
  verifyAdmin,
  checkHasTiersAccess,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Tiers']
     #swagger.description = "post a project"
     #swagger.parameters['qualite'] = {
          in: 'path',
          description: 'Quality Tier',
          required: true,
          schema: { type: 'integer' }
     }
     #swagger.parameters['id'] = {
          in: 'path',
          description: 'id of the PP or PM',
          required: true,
          schema: { type: 'integer' }
     }
    #swagger.requestBody = {
      schema: { $ref: '#/components/schemas/ProjetPostBody' }
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
      const { id } = req.params;
      const user_id = req.user_id;
      const {
        activite_prj,
        raison_social_prj,
        date_debut_prj,
        nb_dirigeants_prj,
        effectif_prj,
        legal_form_id,
      } = req.body;

      await trx("tieppprj").insert({
        activite_prj,
        tiepp_id: id,
        raison_social_prj: raison_social_prj || null,
        date_debut_prj: date_debut_prj || null,
        nb_dirigeants_prj: nb_dirigeants_prj || null,
        effectif_prj: effectif_prj || null,
        legal_form_id: legal_form_id || null,
        creation_user: user_id,
        update_user: user_id,
      });

      await trx.commit();

      res.status(200).json({ message: "L'ajout du projet est un succès." });
    } catch (e) {
      await trx.rollback();
      console.error(e);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

//new
router.put(
  "/projet/:qualite/:id",
  verifyAdmin,
  checkHasTiersAccess,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Tiers']
     #swagger.description = "Update a project"
     #swagger.parameters['qualite'] = {
          in: 'path',
          description: 'Quality Tier',
          required: true,
          schema: { type: 'integer' }
     }
     #swagger.parameters['id'] = {
          in: 'path',
          description: 'id of the PP or PM',
          required: true,
          schema: { type: 'integer' }
     }
    #swagger.requestBody = {
      schema: { $ref: '#/components/schemas/ProjetUpdateBody' }
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
      const {
        prj_id,
        activite_prj,
        raison_social_prj,
        date_debut_prj,
        nb_dirigeants_prj,
        effectif_prj,
        legal_form_id,
      } = req.body;

      await trx("tieppprj")
        .update({
          activite_prj,
          raison_social_prj: raison_social_prj || null,
          date_debut_prj: date_debut_prj || null,
          nb_dirigeants_prj: nb_dirigeants_prj || null,
          effectif_prj: effectif_prj || null,
          legal_form_id: legal_form_id || null,
          update_user: user_id,
        })
        .where({
          prj_id,
        });

      await trx.commit();

      res
        .status(200)
        .json({ message: "La mise à jour du projet est un succès." });
    } catch (e) {
      await trx.rollback();
      console.error(e);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

//new
router.delete("/projet/:qualite/:id/:prj_id", async (req, res) => {
  /* 
     #swagger.tags = ['Tiers']
     #swagger.description = "Delete a project"
     #swagger.parameters['qualite'] = {
          in: 'path',
          description: 'Quality Tier',
          required: true,
          schema: { type: 'integer' }
     }
     #swagger.parameters['id'] = {
          in: 'path',
          description: 'id of the PP or PM',
          required: true,
          schema: { type: 'integer' }
     }
    #swagger.parameters['prj_id'] = {
          in: 'path',
          description: 'id of the project',
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
    const { prj_id } = req.params;

    await trx("tieppprj").delete().where({
      prj_id,
    });

    await trx.commit();

    res.status(200).json({ message: "La suppression du projet est un succès." });
  } catch (e) {
    await trx.rollback();
    console.log(e);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

//new
router.put(
  "/sortie-pep/:qualite/:id",
  verifyAdmin,
  checkHasTiersAccess,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Tiers']
          #swagger.parameters['qualite'] = {
          in: 'path',
          description: 'Quality Tier',
          required: true,
          schema: { type: 'integer' }
     }
     #swagger.parameters['id'] = {
          in: 'path',
          description: 'id of the PP or PM',
          required: true,
          schema: { type: 'integer' }
     }
     #swagger.description = "Update sortie pepiniere info"
       #swagger.requestBody = {
      schema: { type: "object", properties: { 
      date_sortie: { type: "string", nullable: true },
      motif_id: { type: "string", nullable: true }, 
      new_implantation: { type: "string", nullable: true }, 
        } }
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
      const { date_sortie, motif_id, new_implantation } = req.body;
      const { id: tiepm_id } = req.params;

      const rowsAffected = await trx("tiepmsortie")
        .update({
          date_sortie: date_sortie || null,
          motif_id: motif_id || null,
          new_implantation: new_implantation || null,
          update_user: user_id,
        })
        .where({ tiepm_id });

      if (rowsAffected === 0) {
        await trx("tiepmsortie").insert({
          tiepm_id,
          date_sortie: date_sortie || null,
          motif_id: motif_id || null,
          new_implantation: new_implantation || null,
          creation_user: user_id,
          update_user: user_id,
        });
      }

      await trx.commit();

      res.status(200).json({
        message: "La mise à jour de la sortie pépinière est un succès.",
      });
    } catch (e) {
      await trx.rollback();
      console.error(e);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

//new
router.put(
  "/statut-post-pep/:qualite/:id",
  verifyAdmin,
  checkHasTiersAccess,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Tiers']
          #swagger.parameters['qualite'] = {
          in: 'path',
          description: 'Quality Tier',
          required: true,
          schema: { type: 'integer' }
     }
     #swagger.parameters['id'] = {
          in: 'path',
          description: 'id of the PP or PM',
          required: true,
          schema: { type: 'integer' }
     }
     #swagger.description = "Update statut post pepiniere"
       #swagger.requestBody = {
      schema: { type: "object", properties: { 
      actualisation_date: { type: "string", nullable: true },
      statut_id: { type: "string", nullable: true }, 
        } }
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
      const { actualisation_date, statut_id } = req.body;
      const { id: tiepm_id } = req.params;

      const rowsAffected = await trx("tiepmpostpep")
        .update({
          statut_id: statut_id || null,
          actualisation_date: actualisation_date || null,
          update_user: user_id,
        })
        .where({ tiepm_id });

      if (rowsAffected === 0) {
        await trx("tiepmpostpep").insert({
          tiepm_id,
          statut_id: statut_id || null,
          actualisation_date: actualisation_date || null,
          creation_user: user_id,
          update_user: user_id,
        });
      }

      await trx.commit();

      res.status(200).json({
        message: "La mise à jour du statut post-pépinière est un succès.",
      });
    } catch (e) {
      await trx.rollback();
      console.error(e);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

//new
router.post(
  "/effectif/:qualite/:id",
  verifyAdmin,
  checkHasTiersAccess,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Tiers']
          #swagger.parameters['qualite'] = {
          in: 'path',
          description: 'Quality Tier',
          required: true,
          schema: { type: 'integer' }
     }
     #swagger.parameters['id'] = {
          in: 'path',
          description: 'id of the PP or PM',
          required: true,
          schema: { type: 'integer' }
     }
     #swagger.description = "add an effectfif"
       #swagger.requestBody = {
      schema: { type: "object", properties: { 
      year: { type: "number" },
      nb_cdi: { type: "number", nullable: true }, 
      nb_cdd: { type: "number", nullable: true }, 
      nb_int: { type: "number", nullable: true }, 
      nb_caid: { type: "number", nullable: true }, 
      nb_alt: { type: "number", nullable: true }, 
      nb_stg: { type: "number", nullable: true }, 
        } }
    }
    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/SuccessResponse' }
     } 
     #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
     } 
    #swagger.responses[409] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
     } 
     #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }  
  */
    const trx = await db.transaction();
    try {
      const { id: tiepm_id } = req.params;
      const { nb_cdi, nb_cdd, nb_int, nb_caid, nb_alt, nb_stg, year } =
        req.body;
      const user_id = req.user_id;

      await trx("tiepmeff").insert({
        year,
        nb_cdi: nb_cdi ?? null,
        nb_cdd: nb_cdd ?? null,
        nb_int: nb_int ?? null,
        nb_caid: nb_caid ?? null,
        nb_alt: nb_alt ?? null,
        nb_stg: nb_stg ?? null,
        tiepm_id: tiepm_id ?? null,
        creation_user: user_id,
        update_user: user_id,
      });

      await trx.commit();

      res.status(200).json({ message: "L'ajout de l'effectif est un succès." });
    } catch (e) {
      await trx.rollback();
      console.log(e);
      if ((e as any).code === "ER_DUP_ENTRY") {
        res.status(409).json({
          message:
            "Conflit: Une entrée pour cet identifiant et cette année existe déjà.",
        });
        return;
      }

      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

//new
router.put(
  "/effectif/:qualite/:id",
  verifyAdmin,
  checkHasTiersAccess,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Tiers']
          #swagger.parameters['qualite'] = {
          in: 'path',
          description: 'Quality Tier',
          required: true,
          schema: { type: 'integer' }
     }
     #swagger.parameters['id'] = {
          in: 'path',
          description: 'id of the PP or PM',
          required: true,
          schema: { type: 'integer' }
     }
     #swagger.description = "update an effectfif"
       #swagger.requestBody = {
      schema: { type: "object", properties: { 
    nb_cdi: { type: "number", nullable: true }, 
      nb_cdd: { type: "number", nullable: true }, 
      nb_int: { type: "number", nullable: true }, 
      nb_caid: { type: "number", nullable: true }, 
      nb_alt: { type: "number", nullable: true }, 
      nb_stg: { type: "number", nullable: true }, 
      year: { type: "number" }, 
        } }
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
      const { id: tiepm_id } = req.params;
      const { nb_cdi, nb_cdd, nb_int, nb_caid, nb_alt, nb_stg, year } =
        req.body;
      const user_id = req.user_id;

      await trx("tiepmeff")
        .update({
          nb_cdi: nb_cdi ?? null,
          nb_cdd: nb_cdd ?? null,
          nb_int: nb_int ?? null,
          nb_caid: nb_caid ?? null,
          nb_alt: nb_alt ?? null,
          nb_stg: nb_stg ?? null,
          update_user: user_id,
        })
        .where({ year, tiepm_id });

      await trx.commit();

      res
        .status(200)
        .json({ message: "La mise à jour de l'effectif est un succès." });
    } catch (e) {
      await trx.rollback();
      console.log(e);
      res
        .status(500)
        .json({ message: "La mise à jour de l'effectif est un succès." });
    }
  }
);

//new
router.delete(
  "/effectif/:qualite/:id/:year",
  verifyAdmin,
  checkHasTiersAccess,
  async (req, res) => {
    /* 
     #swagger.tags = ['Tiers']
          #swagger.parameters['qualite'] = {
          in: 'path',
          description: 'Quality Tier',
          required: true,
          schema: { type: 'integer' }
     }
     #swagger.parameters['id'] = {
          in: 'path',
          description: 'id of the PP or PM',
          required: true,
          schema: { type: 'integer' }
     }
      #swagger.parameters['year'] = {
          in: 'path',
          description: 'year',
          required: true,
          schema: { type: 'integer' }
     }
     #swagger.description = "delete an effectfif"
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
      const { id: tiepm_id, year } = req.params;

      await trx("tiepmeff").delete().where({ year, tiepm_id });
      await trx.commit();
      res
        .status(200)
        .json({ message: "La suppression de l'effectif est un succès." });
    } catch (e) {
      await trx.rollback();
      console.log(e);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

//new
router.post(
  "/ca/:qualite/:id",
  verifyAdmin,
  checkHasTiersAccess,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Tiers']
          #swagger.parameters['qualite'] = {
          in: 'path',
          description: 'Quality Tier',
          required: true,
          schema: { type: 'integer' }
     }
     #swagger.parameters['id'] = {
          in: 'path',
          description: 'id of the PP or PM',
          required: true,
          schema: { type: 'integer' }
     }
     #swagger.description = "add a ca"
       #swagger.requestBody = {
      schema: { type: "object", properties: { 
      year: { type: "number" },
      ca: { type: "number", nullable: true }, 
        } }
    }
    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/SuccessResponse' }
     } 
     #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
     } 
    #swagger.responses[409] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
     } 
     #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }  
  */
    const trx = await db.transaction();
    try {
      const { id: tiepm_id } = req.params;
      const { ca, year } = req.body;
      const user_id = req.user_id;

      await trx("tiepmca").insert({
        year,
        tiepm_id,
        ca: ca ?? null,
        creation_user: user_id,
        update_user: user_id,
      });

      await trx.commit();

      res
        .status(200)
        .json({ message: "L'ajout du chiffre d'affaires est un succès." });
    } catch (e) {
      await trx.rollback();
      console.log(e);
      if ((e as any).code === "ER_DUP_ENTRY") {
        res.status(409).json({
          message:
            "Conflit: Une entrée pour cet identifiant et cette année existe déjà.",
        });
        return;
      }

      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

//new
router.put(
  "/ca/:qualite/:id",
  verifyAdmin,
  checkHasTiersAccess,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Tiers']
          #swagger.parameters['qualite'] = {
          in: 'path',
          description: 'Quality Tier',
          required: true,
          schema: { type: 'integer' }
     }
     #swagger.parameters['id'] = {
          in: 'path',
          description: 'id of the PP or PM',
          required: true,
          schema: { type: 'integer' }
     }
      #swagger.parameters['year'] = {
          in: 'path',
          description: 'year',
          required: true,
          schema: { type: 'integer' }
     }
     #swagger.description = "update a ca"
       #swagger.requestBody = {
      schema: { type: "object", properties: { 
      ca: { type: "number", nullable: true }, 
      year: { type: "number" }, 
        } }
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
      const { id: tiepm_id } = req.params;
      const { ca, year } = req.body;
      const user_id = req.user_id;

      await trx("tiepmca")
        .update({
          ca: ca ?? null,
          update_user: user_id,
        })
        .where({ year, tiepm_id });

      await trx.commit();

      res.status(200).json({
        message: "La mise à jour du chiffre d'affaires est un succès.",
      });
    } catch (e) {
      await trx.rollback();
      console.log(e);
      res
        .status(500)
        .json({ message: "La mise à jour de l'effectif est un succès." });
    }
  }
);

//new
router.delete(
  "/ca/:qualite/:id/:year",
  verifyAdmin,
  checkHasTiersAccess,
  async (req, res) => {
    /* 
     #swagger.tags = ['Tiers']
          #swagger.parameters['qualite'] = {
          in: 'path',
          description: 'Quality Tier',
          required: true,
          schema: { type: 'integer' }
     }
     #swagger.parameters['id'] = {
          in: 'path',
          description: 'id of the PP or PM',
          required: true,
          schema: { type: 'integer' }
     }
      #swagger.parameters['year'] = {
          in: 'path',
          description: 'year',
          required: true,
          schema: { type: 'integer' }
     }
     #swagger.description = "delete a ca"
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
      const { id: tiepm_id, year } = req.params;
      await trx("tiepmca").delete().where({ year, tiepm_id });
      await trx.commit();
      res.status(200).json({
        message: "La suppression du chiffre d'affaires est un succès.",
      });
    } catch (e) {
      await trx.rollback();
      console.log(e);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

export { router as propertiesTiersRouter };
