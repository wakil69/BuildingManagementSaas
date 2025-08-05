import express from "express";
import { db } from "../../data/db";
import multer from "multer";
import dotenv from "dotenv";
import { AdminRequest, verifyAdmin } from "../../middlewares/checkAdmin";
import XLSX from "xlsx";

dotenv.config();

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.post("/create-pp", verifyAdmin, async (req: AdminRequest, res) => {
  /* 
     #swagger.tags = ['Tiers']
     #swagger.description = "create a tier PP"
    #swagger.requestBody = {
    $ref: '#/components/schemas/TiersCreationPPBody'
    }
    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/TiersCreationResponse' }
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
    const company_id = req.user_id;
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
      int_voie,
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
      activite_prj,
      raison_social_prj,
      date_debut_prj,
      nb_dirigeants_prj,
      effectif_prj,
      legal_form_id,
      first_meeting_date,
      first_meeting_hour_begin,
      first_meeting_hour_end,
      prescriber_id,
      first_meeting_feedback,
      formule_wishes,
      surface_wishes,
      date_entree_wished,
      formule_id,
      date_debut_formule,
      date_fin_formule,
    } = req.body;

    const checkPPAlreadyPresent = await trx("tiepp")
      .select("first_name", "surname")
      .where({ first_name, surname })
      .first()

    if (checkPPAlreadyPresent) {
      await trx.rollback();
      res.status(400).json({ message: "La personne physique est déjà présente." });
      return
    }

    const tieppResponse = await trx("tiepp").insert({
      batiment_id,
      company_id,
      civilite: civilite || null,
      surname,
      first_name,
      birth_date: birth_date || null,
      birth_name: birth_name || null,
      email,
      phone_number: phone_number || null,
      num_voie: num_voie || null,
      int_voie: int_voie || null,
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
      first_meeting_date: first_meeting_date || null,
      first_meeting_hour_begin: first_meeting_hour_begin || null,
      first_meeting_hour_end: first_meeting_hour_end || null,
      prescriber_id: prescriber_id || null,
      first_meeting_feedback: first_meeting_feedback || null,
      update_user: user_id,
      creation_user: user_id,
    });

    const tiepp_id = tieppResponse[0];

    const projetInsertQuery = trx("tieppprj").insert({
      tiepp_id,
      activite_prj,
      raison_social_prj: raison_social_prj || null,
      date_debut_prj: date_debut_prj || null,
      nb_dirigeants_prj: nb_dirigeants_prj || null,
      effectif_prj: effectif_prj || null,
      legal_form_id: legal_form_id || null,
      update_user: user_id,
      creation_user: user_id,
    });

    const souhaitInsertQuery = trx("tieppaccsouhait").insert({
      tiepp_id,
      formule_wishes,
      surface_wishes,
      date_entree_wished: date_entree_wished || null,
      update_user: user_id,
      creation_user: user_id,
    });

    const formuleInsertQuery = trx("tieformpp").insert({
      tiepp_id,
      formule_id,
      date_debut_formule,
      date_fin_formule: date_fin_formule || null,
      update_user: user_id,
      creation_user: user_id,
    });

    await Promise.all([
      projetInsertQuery,
      souhaitInsertQuery,
      formuleInsertQuery,
    ]);

    await trx.commit();

    res.status(200).json({
      message: "La création de la personne physique est un succès",
      id: tiepp_id,
    });
  } catch (err) {
    await trx.rollback();
    console.error(err);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

router.post("/create-pm", verifyAdmin, async (req: AdminRequest, res) => {
  /* 
     #swagger.tags = ['Tiers']
     #swagger.description = "create a tier PM"
    #swagger.requestBody = {
    $ref: '#/components/schemas/TiersCreationPMBody'
    }
    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/TiersCreationResponse' }
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
    const company_id = req.user_id;
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
      int_voie,
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
      formule_id,
      date_debut_formule,
      date_fin_formule,
      relations,
    } = req.body;

    const checkPMAlreadyPresent = await trx("tiepm")
      .select("raison_sociale")
      .where({ raison_sociale })
      .first()

    if (checkPMAlreadyPresent) {
      await trx.rollback();
      res.status(400).json({ message: "La personne morale est déjà présente." });
      return
    }


    const tiepmResponse = await trx("tiepm").insert({
      batiment_id,
      company_id,
      raison_sociale,
      sigle: sigle || null,
      legal_form_id: legal_form_id || null,
      activite: activite || null,
      date_creation_company: date_creation_company || null,
      email: email || null,
      phone_number: phone_number || null,
      num_voie: num_voie || null,
      int_voie: int_voie || null,
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
      update_user: user_id,
      creation_user: user_id,
    });

    const tiepm_id = tiepmResponse[0];

    const relationsInsertQuery = trx("tierel").insert(
      relations.map(
        (relation: {
          tiepp_id: number;
          rel_typ_id: number;
          relation_date_debut: string;
          relation_date_fin: string;
        }) => {
          const {
            tiepp_id,
            rel_typ_id,
            relation_date_debut,
            relation_date_fin,
          } = relation;

          return {
            tiepm_id,
            tiepp_id,
            rel_typ_id: rel_typ_id || null,
            relation_date_debut: relation_date_debut || null,
            relation_date_fin: relation_date_fin || null,
            update_user: user_id,
            creation_user: user_id,
          };
        }
      )
    );

    const formuleInsertQuery = trx("tieformpm").insert({
      tiepm_id,
      formule_id,
      date_debut_formule,
      date_fin_formule: date_fin_formule || null,
      update_user: user_id,
      creation_user: user_id,
    });

    await Promise.all([relationsInsertQuery, formuleInsertQuery]);

    await trx.commit();

    res.status(200).json({
      message: "La création de la personne morale est un succès",
      id: tiepm_id,
    });
  } catch (err) {
    await trx.rollback();
    console.error(err);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

router.post("/create-pp-pm", verifyAdmin, async (req: AdminRequest, res) => {
  /* 
     #swagger.tags = ['Tiers']
     #swagger.description = "create a tier PP and PM"
    #swagger.requestBody = {
    $ref: '#/components/schemas/TiersCreationPPPMBody'
    }
    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/TiersCreationResponse' }
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
    const company_id = req.user_id;
    const { pm, pp } = req.body;

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
      int_voie,
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
      formule_id,
      date_debut_formule,
      date_fin_formule,
      rel_typ_id,
      relation_date_debut,
      relation_date_fin,
    } = pm;

    const checkPMAlreadyPresent = await trx("tiepm")
      .select("raison_sociale")
      .where({ raison_sociale })
      .first()

    if (checkPMAlreadyPresent) {
      await trx.rollback();
      res.status(400).json({ message: "La personne morale est déjà présente." });
      return
    }

    const {
      batiment_id: batiment_id_pp,
      civilite,
      surname,
      first_name,
      birth_date,
      birth_name,
      email: email_pp,
      phone_number: phone_number_pp,
      num_voie: num_voie_pp,
      int_voie: int_voie_pp,
      typ_voie: typ_voie_pp,
      complement_voie: complement_voie_pp,
      code_postal: code_postal_pp,
      commune: commune_pp,
      cedex: cedex_pp,
      pays: pays_pp,
      qpv: qpv_pp,
      zfu: zfu_pp,
      study_level_id,
      situation_before_prj_id,
      situation_socio_pro_id,
      image_authorisation,
      activite_prj,
      raison_social_prj,
      date_debut_prj,
      nb_dirigeants_prj,
      effectif_prj,
      legal_form_id: legal_form_id_pp,
      first_meeting_date,
      first_meeting_hour_begin,
      first_meeting_hour_end,
      prescriber_id,
      first_meeting_feedback,
      formule_wishes,
      surface_wishes,
      date_entree_wished,
      formule_id: formule_id_pp,
      date_debut_formule: date_debut_formule_pp,
      date_fin_formule: date_fin_formule_pp,
    } = pp;

    const checkPPAlreadyPresent = await trx("tiepp")
      .select("first_name", "surname")
      .where({ first_name, surname })
      .first()

    if (checkPPAlreadyPresent) {
      await trx.rollback();
      res.status(400).json({ message: "La personne physique est déjà présente." });
      return
    }

    const tiepmResponseQuery = await trx("tiepm").insert({
      batiment_id,
      company_id,
      raison_sociale,
      sigle: sigle || null,
      legal_form_id: legal_form_id || null,
      activite: activite || null,
      date_creation_company: date_creation_company || null,
      email: email || null,
      phone_number: phone_number || null,
      num_voie: num_voie || null,
      int_voie: int_voie || null,
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
      update_user: user_id,
      creation_user: user_id,
    });

    const tieppResponseQuery = await trx("tiepp").insert({
      batiment_id: batiment_id_pp,
      company_id,
      civilite: civilite || null,
      surname,
      first_name,
      birth_date: birth_date || null,
      birth_name: birth_name || null,
      email: email_pp,
      phone_number: phone_number_pp || null,
      num_voie: num_voie_pp || null,
      int_voie: int_voie_pp || null,
      typ_voie: typ_voie_pp || null,
      complement_voie: complement_voie_pp || null,
      code_postal: code_postal_pp || null,
      commune: commune_pp || null,
      cedex: cedex_pp || null,
      pays: pays_pp || null,
      qpv: qpv_pp || null,
      zfu: zfu_pp || null,
      study_level_id: study_level_id || null,
      situation_before_prj_id: situation_before_prj_id || null,
      situation_socio_pro_id: situation_socio_pro_id || null,
      image_authorisation: image_authorisation || null,
      first_meeting_date: first_meeting_date || null,
      first_meeting_hour_begin: first_meeting_hour_begin || null,
      first_meeting_hour_end: first_meeting_hour_end || null,
      prescriber_id: prescriber_id || null,
      first_meeting_feedback: first_meeting_feedback || null,
      update_user: user_id,
      creation_user: user_id,
    });

    const [tiepmResponse, tieppResponse] = await Promise.all([
      tiepmResponseQuery,
      tieppResponseQuery,
    ]);

    const tiepm_id = tiepmResponse[0];
    const tiepp_id = tieppResponse[0];

    const relationsInsertQuery = trx("tierel").insert({
      tiepm_id,
      tiepp_id,
      rel_typ_id: rel_typ_id || null,
      relation_date_debut: relation_date_debut || null,
      relation_date_fin: relation_date_fin || null,
      update_user: user_id,
      creation_user: user_id,
    });

    const formulePMInsertQuery = trx("tieformpm").insert({
      tiepm_id,
      formule_id,
      date_debut_formule,
      date_fin_formule: date_fin_formule || null,
      update_user: user_id,
      creation_user: user_id,
    });

    const projetInsertQuery = trx("tieppprj").insert({
      tiepp_id,
      activite_prj,
      raison_social_prj: raison_social_prj || null,
      date_debut_prj: date_debut_prj || null,
      nb_dirigeants_prj: nb_dirigeants_prj || null,
      effectif_prj: effectif_prj || null,
      legal_form_id: legal_form_id_pp || null,
      update_user: user_id,
      creation_user: user_id,
    });

    const souhaitInsertQuery = trx("tieppaccsouhait").insert({
      tiepp_id,
      formule_wishes,
      surface_wishes,
      date_entree_wished: date_entree_wished || null,
      update_user: user_id,
      creation_user: user_id,
    });

    const formulePPInsertQuery = trx("tieformpp").insert({
      tiepp_id,
      formule_id: formule_id_pp,
      date_debut_formule: date_debut_formule_pp,
      date_fin_formule: date_fin_formule_pp || null,
      update_user: user_id,
      creation_user: user_id,
    });

    await Promise.all([
      relationsInsertQuery,
      formulePMInsertQuery,
      formulePPInsertQuery,
      souhaitInsertQuery,
      projetInsertQuery,
    ]);

    await trx.commit();

    res.status(200).json({
      message: "La création de la personne morale et physique est un succès",
      id: tiepm_id,
    });
  } catch (err) {
    await trx.rollback();
    console.error(err);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
  }
});

function ExcelDateToJSDate(dateTochange: any) {
  const date = new Date(Math.round((dateTochange - 25569) * 86400 * 1000));
  const resp = `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
  return resp;
}

router.post(
  "/import-excel",
  verifyAdmin,
  upload.single("file"),
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Tiers']
     #swagger.description = "Upload excel file to import tiers."
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

      const legalFormsQuery = trx("legal_forms_params")
        .select("legal_form_id", "name")
        .where({ company_id });

      const prescribersQuery = trx("prescribers_params")
        .select("prescriber_id", "name")
        .where({ company_id });

      const situationBeforePrjQuery = trx("situation_before_prj_params")
        .select("situation_before_prj_id", "name")
        .where({ company_id });

      const relationsPPPMQuery = trx("relations_pm_pp_params")
        .select("rel_typ_id", "name")
        .where({ company_id });

      const studyLevelsQuery = trx("study_level_params")
        .select("study_level_id", "name")
        .where({ company_id });

      const secteursActivitesQuery = trx("secteurs_activites_params")
        .select("secteur_activite_id", "name")
        .where({ company_id });

      const formulesQuery = trx("formules_params")
        .select("formule_id", "name")
        .where({ company_id });

      let [
        batiments,
        legalForms,
        prescribers,
        situationBeforePrj,
        relationsPPPM,
        studyLevels,
        formules,
        secteursActivites
      ] = await Promise.all([
        batimentsQuery,
        legalFormsQuery,
        prescribersQuery,
        situationBeforePrjQuery,
        relationsPPPMQuery,
        studyLevelsQuery,
        formulesQuery,
        secteursActivitesQuery
      ]);

      batiments = batiments.reduce((acc, cur) => {
        if (!acc[cur.name]) {
          acc[cur.name] = cur.batiment_id;
        }
        return acc;
      }, {});

      legalForms = legalForms.reduce((acc, cur) => {
        if (!acc[cur.name]) {
          acc[cur.name] = cur.legal_form_id;
        }
        return acc;
      }, {});

      secteursActivites = secteursActivites.reduce((acc, cur) => {
        if (!acc[cur.name]) {
          acc[cur.name] = cur.secteur_activite_id;
        }
        return acc;
      }, {});

      prescribers = prescribers.reduce((acc, cur) => {
        if (!acc[cur.name]) {
          acc[cur.name] = cur.precriber_id;
        }
        return acc;
      }, {});

      situationBeforePrj = situationBeforePrj.reduce((acc, cur) => {
        if (!acc[cur.name]) {
          acc[cur.name] = cur.situation_before_prj_id;
        }
        return acc;
      }, {});

      relationsPPPM = relationsPPPM.reduce((acc, cur) => {
        if (!acc[cur.name]) {
          acc[cur.name] = cur.rel_typ_id;
        }
        return acc;
      }, {});

      studyLevels = studyLevels.reduce((acc, cur) => {
        if (!acc[cur.name]) {
          acc[cur.name] = cur.study_level_id;
        }
        return acc;
      }, {});

      formules = formules.reduce((acc, cur) => {
        if (!acc[cur.name]) {
          acc[cur.name] = cur.formule_id;
        }
        return acc;
      }, {});

      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      let linkTiersPPAndTieppIds: Record<number, number> = {};
      let linkTiersPMAndTiepmIds: Record<number, number> = {};
      for (const ws of workbook.SheetNames) {
        const worksheet = workbook.Sheets[ws];
        const data = XLSX.utils.sheet_to_json(worksheet);

        if (data.length === 0) continue;

        if (ws == "INFOS PERSONNES PHYSIQUES") {

          let tiersIds: number[] = [];
          const tiers = data.map((row: any, index: number) => {
            if (row["IDENTIFIANT TIERS"]) {
              tiersIds.push(row["IDENTIFIANT TIERS"]);
            } else {
              tiersIds.push(0);
            }

            const batiment_id = row["BATIMENT"]
              ? batiments[row["BATIMENT"].trim()]
              : null;

            if (!batiment_id) {
              throw `Erreur: Batiment manquant dans la feuille INFOS PERSONNES PHYSIQUES pour la ligne ${index + 2}`;
            }

            const surname = row["NOM"] ? row["NOM"].trim() : null;

            if (!surname) {
              throw `Erreur: NOM manquant dans la feuille INFOS PERSONNES PHYSIQUES pour la ligne ${index + 2}`;
            }

            const first_name = row["PRENOM"] ? row["PRENOM"].trim() : null;

            if (!first_name) {
              throw `Erreur: PRENOM manquant dans la feuille INFOS PERSONNES PHYSIQUES pour la ligne ${index + 2}`;
            }

            const email = row["E-MAIL"] ? row["E-MAIL"].trim() : null;

            if (!email) {
              throw `Erreur: E-MAIL manquant dans la feuille INFOS PERSONNES PHYSIQUES pour la ligne ${index + 2}`;
            }

            const formule_id = row["FORMULE"]
              ? formules[row["FORMULE"].trim()]
              : null;

            if (!formule_id) {
              throw `Erreur: FORMULE manquant dans la feuille INFOS PERSONNES PHYSIQUES pour la ligne ${index + 2}`;
            }

            const date_debut_formule = row["DATE DEBUT FORMULE"]
              ? ExcelDateToJSDate(row["DATE DEBUT FORMULE"])
              : null;

            if (!date_debut_formule) {
              throw `Erreur: DATE DEBUT FORMULE dans la feuille INFOS PERSONNES PHYSIQUES manquant pour la ligne ${index + 2}`;
            }

            if (
              row["PREMIER ENTRETIEN HEURE DEBUT"] &&
              row["PREMIER ENTRETIEN HEURE DEBUT"].length !== 5
            ) {
              throw `Erreur: le format de PREMIER ENTRETIEN HEURE DEBUT dans la feuille INFOS PERSONNES PHYSIQUES n'est pas correct pour la ligne ${index + 2}`;
            }

            if (
              row["PREMIER ENTRETIEN HEURE FIN"] &&
              row["PREMIER ENTRETIEN HEURE FIN"].length !== 5
            ) {
              throw `Erreur: le format de PREMIER ENTRETIEN HEURE FIN dans la feuille INFOS PERSONNES PHYSIQUES n'est pas correct pour la ligne ${index + 2}`;
            }

            return {
              company_id,
              batiment_id,
              civilite: row["CIVILITE"],
              surname,
              first_name,
              sex: row["SEXE"] || null,
              birth_name: row["NOM DE NAISSANCE"] || null,
              birth_date: row["DATE DE NAISSANCE"]
                ? ExcelDateToJSDate(row["DATE DE NAISSANCE"])
                : null,
              nationality: row["NATIONALITE"] || null,
              phone_fixed_number: row["TELEPHONE FIXE"] || null,
              phone_number: row["TELEPHONE PORTABLE"] || null,
              email,
              death_date: row["DATE DECES"]
                ? ExcelDateToJSDate(row["DATE DECES"])
                : null,
              image_authorisation: row["AUTORISATION DIFFUSION IMAGE"] || null,
              num_voie: row["N° VOIE"] || null,
              typ_voie: row["TYPE VOIE"] || null,
              int_voie: row["INTITULE VOIE"] || null,
              complement_voie: row["COMPLEMENT VOIE"] || null,
              code_postal: row["CODE POSTAL"] || null,
              commune: row["COMMUNE"] || null,
              cedex: row["CEDEX"] || null,
              pays: row["PAYS"] || null,
              qpv: row["QPV"] || null,
              zfu: row["ZFU"] || null,
              first_meeting_date: row["PREMIER ENTRETIEN DATE"]
                ? ExcelDateToJSDate(row["PREMIER ENTRETIEN DATE"])
                : null,
              first_meeting_hour_begin:
                row["PREMIER ENTRETIEN HEURE DEBUT"] || null,
              first_meeting_hour_end:
                row["PREMIER ENTRETIEN HEURE FIN"] || null,
              prescriber_id: row["PRESCRIPTEUR"]
                ? prescribers[row["PRESCRIPTEUR"].trim()]
                : null,
              first_meeting_feedback:
                row["PREMIER ENTRETIEN COMMENTAIRE"] || null,
              situation_socio_pro_id:
                row["SITUATION SOCIO PROFESSIONNELLE"] || null,
              study_level_id: row["NIVEAU ETUDE"]
                ? studyLevels[row["NIVEAU ETUDE"].trim()]
                : null,
              situation_before_prj_id: row["SITUATION AVANT PROJET"]
                ? situationBeforePrj[row["SITUATION AVANT PROJET"].trim()]
                : null,
              formule_id,
              date_debut_formule,
              date_fin_formule: row["DATE FIN FORMULE"]
                ? ExcelDateToJSDate(row["DATE FIN FORMULE"])
                : null,
              creation_user: user_id,
              update_user: user_id,
            };
          });

          const existingPersons = await trx("tiepp")
            .select("first_name", "surname")
            .whereIn(
              ["first_name", "surname"],
              tiers.map((person) => [person.first_name, person.surname])
            );

          if (existingPersons.length > 0) {
            const duplicateIndexes = tiers
              .map((person, index) => ({
                ...person,
                index: index + 2,
              }))
              .filter((person) =>
                existingPersons.some(
                  (existing) =>
                    existing.first_name === person.first_name &&
                    existing.surname === person.surname
                )
              )
              .map((person) => person.index);

            throw `Erreur: Une ou plusieurs personnes physiques sont déjà présentes aux lignes : ${duplicateIndexes.join(", ")}`;
          }

          const results = await Promise.all(
            tiers.map(async (tier) => {
              const {
                formule_id,
                date_debut_formule,
                date_fin_formule,
                ...tieppData
              } = tier;
              const [insertedId] = await trx("tiepp").insert(tieppData);
              await trx("tieformpp").insert({
                tiepp_id: insertedId,
                formule_id,
                date_debut_formule,
                date_fin_formule,
                creation_user: user_id,
                update_user: user_id,
              });
              return insertedId;
            })
          );

          if (tiersIds.length) {
            linkTiersPPAndTieppIds = tiersIds.reduce<Record<number, number>>(
              (acc, cur, index) => {
                if (cur === 0) {
                  return acc;
                }
                acc[cur] = results[index];
                return acc;
              },
              {}
            );
          }
        }
        else if (ws === "PROJETS PERSONNES PHYSIQUES") {
          const projets = data.map((row: any, index: number) => {
            const tiepp_id = row["IDENTIFIANT TIERS"]
              ? linkTiersPPAndTieppIds[row["IDENTIFIANT TIERS"]]
              : null;

            if (!tiepp_id) {
              throw `Erreur: IDENTIFIANT TIERS manquant dans la feuille PROJETS PERSONNES PHYSIQUES pour la ligne ${index + 2}`;
            }

            const activite_prj = row["ACTIVITE"]
              ? row["ACTIVITE"].trim()
              : null;

            if (!activite_prj) {
              throw `Erreur: ACTIVITE manquant pour la ligne ${index + 2}`;
            }

            return {
              tiepp_id,
              raison_social_prj: row["DENOMINATION PROJET"] || null,
              activite_prj,
              date_debut_prj: row["DATE CREATION"]
                ? ExcelDateToJSDate(row["DATE CREATION"])
                : null,
              nb_dirigeants_prj: row["NB DIRIGEANTS"] || null,
              effectif_prj: row["EFFECTIF PREVISIONNEL"] || null,
              legal_form_id: row["STATUT JURIDIQUE"]
                ? legalForms[row["STATUT JURIDIQUE"].trim()]
                : null,
              creation_user: user_id,
              update_user: user_id,
            };
          });

          await trx("tieppprj").insert(projets);
        } else if (ws === "INFOS PERSONNES MORALES") {
          let tiersPMIds: number[] = [];
          const tiersPM = data.map((row: any, index: number) => {
            if (row["IDENTIFIANT TIERS"]) {
              tiersPMIds.push(row["IDENTIFIANT TIERS"]);
            } else {
              tiersPMIds.push(0);
            }

            const batiment_id = row["BATIMENT"]
              ? batiments[row["BATIMENT"].trim()]
              : null;

            if (!batiment_id) {
              throw `Erreur: Batiment manquant pour la ligne ${index + 2}`;
            }

            const raison_sociale = row["RAISON SOCIALE"]
              ? row["RAISON SOCIALE"].trim()
              : null;

            if (!raison_sociale) {
              throw `Erreur: RAISON SOCIALE manquant pour la ligne ${index + 2}`;
            }

            const formule_id = row["FORMULE"]
              ? formules[row["FORMULE"].trim()]
              : null;

            if (!formule_id) {
              throw `Erreur: FORMULE manquant pour la ligne ${index + 2}`;
            }

            const date_debut_formule = row["DATE DEBUT FORMULE"]
              ? ExcelDateToJSDate(row["DATE DEBUT FORMULE"])
              : null;

            if (!date_debut_formule) {
              throw `Erreur: DATE DEBUT FORMULE manquant pour la ligne ${index + 2}`;
            }

            return {
              company_id,
              batiment_id,
              raison_sociale,
              sigle: row["SIGLE"] || null,
              date_creation_company: row["DATE CREATION"]
                ? ExcelDateToJSDate(row["DATE CREATION"])
                : null,
              activite: row["ACTIVITE"] || null,
              legal_form_id: row["STATUT JURIDIQUE"]
                ? legalForms[row["STATUT JURIDIQUE"].trim()]
                : null,
              secteur_activite_id: row["SECTEUR ACTIVITE"]
                ? secteursActivites[row["SECTEUR ACTIVITE"].trim()]
                : null,
              date_end_exercise: row["DATE FIN EXERCICE"] || null,
              tva: row["TVA INTRACOMMUNAUTAIRE"] || null,
              capital_amount: row["MONTANT CAPITAL"] || null,
              phone_fixed_number: row["TELEPHONE FIXE"] || null,
              phone_number: row["TELEPHONE PORTABLE"] || null,
              email: row["E-MAIL"] || null,
              num_voie: row["N° VOIE"] || null,
              typ_voie: row["TYPE VOIE"] || null,
              int_voie: row["INTITULE VOIE"] || null,
              complement_voie: row["COMPLEMENT VOIE"] || null,
              code_postal: row["CODE POSTAL"] || null,
              commune: row["COMMUNE"] || null,
              cedex: row["CEDEX"] || null,
              pays: row["PAYS"] || null,
              qpv: row["QPV"] || null,
              zfu: row["ZFU"] || null,
              formule_id,
              date_debut_formule,
              date_fin_formule: row["DATE FIN FORMULE"]
                ? ExcelDateToJSDate(row["DATE FIN FORMULE"])
                : null,
              creation_user: user_id,
              update_user: user_id,
            };
          });

          const existingPMs = await trx("tiepm")
            .select("raison_sociale")
            .whereIn(
              "raison_sociale",
              tiersPM.map((company) => company.raison_sociale)
            );

          if (existingPMs.length > 0) {
            const duplicateIndexes = tiersPM
              .map((company, index) => ({
                ...company,
                index: index + 2,
              }))
              .filter((person) =>
                existingPMs.some(
                  (existing) =>
                    existing.raison_sociale === person.raison_sociale
                )
              )
              .map((person) => person.index);

            throw `Erreur: Une ou plusieurs personnes morales sont déjà présentes aux lignes : ${duplicateIndexes.join(", ")}`;
          }

          const results = await Promise.all(
            tiersPM.map(async (tierPM) => {
              const {
                formule_id,
                date_debut_formule,
                date_fin_formule,
                ...tiepmData
              } = tierPM;
              const [insertedId] = await trx("tiepm").insert(tiepmData);
              await trx("tieformpm").insert({
                tiepm_id: insertedId,
                formule_id,
                date_debut_formule,
                date_fin_formule,
                creation_user: user_id,
                update_user: user_id,
              });
              return insertedId;
            })
          );

          if (tiersPMIds.length) {
            linkTiersPMAndTiepmIds = tiersPMIds.reduce<Record<number, number>>(
              (acc, cur, index) => {
                if (cur === 0) {
                  return acc;
                }
                acc[cur] = results[index];
                return acc;
              },
              {}
            );
          }
        } else if (ws === "RELATIONS PP PM") {
          const relations = data.map((row: any, index: number) => {
            const tiepp_id = row["IDENTIFIANT PP"]
              ? linkTiersPPAndTieppIds[row["IDENTIFIANT PP"]]
              : null;

            if (!tiepp_id) {
              throw `Erreur: IDENTIFIANT PP manquant dans la feuille RELATIONS PP PM pour la ligne ${index + 2}`;
            }

            const tiepm_id = row["IDENTIFIANT PM"]
              ? linkTiersPMAndTiepmIds[row["IDENTIFIANT PM"]]
              : null;

            if (!tiepm_id) {
              throw `Erreur: IDENTIFIANT PM manquant dans la feuille RELATIONS PP PM pour la ligne ${index + 2}`;
            }

            return {
              tiepp_id,
              tiepm_id,
              rel_typ_id: row["TYPE RELATION"]
                ? relationsPPPM[row["TYPE RELATION"].trim()]
                : null,
              relation_date_debut: row["DATE DEBUT RELATION"]
                ? ExcelDateToJSDate(row["DATE DEBUT RELATION"])
                : null,
              relation_date_fin: row["DATE FIN RELATION"]
                ? ExcelDateToJSDate(row["DATE FIN RELATION"])
                : null,
              creation_user: user_id,
              update_user: user_id,
            };
          });

          await trx("tierel").insert(relations);
        }
      }

      await trx.commit();
      res
        .status(200)
        .json({ message: "L'importation des données est un succès !" });
    } catch (e) {
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

export { router as createTiersRouter };
