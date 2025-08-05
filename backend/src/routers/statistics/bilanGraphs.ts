import express from "express";
import dotenv from "dotenv";
import { db } from "../../data/db";
import { UserRequest, verifyUser } from "../../middlewares/checkUser";

dotenv.config();

const router = express.Router();

router.get("/bilan-graphs", verifyUser, async (req: UserRequest, res) => {
  const company_id = req.company_id;
  const { dateYearRef: dateYear } = req.query;

  const today = new Date();
  const annee = today.getFullYear();
  let dateDeb;
  let dateFin;
  if (annee == Number(dateYear)) {
    dateDeb = today.getFullYear() + "-" + "01-01";
    dateFin =
      today.getFullYear() +
      "-" +
      ("0" + (today.getMonth() + 1)).slice(-2) +
      "-" +
      ("0" + today.getDate()).slice(-2);
  } else {
    dateDeb = Number(dateYear).toString() + "-" + "01-01";
    dateFin = Number(dateYear).toString() + "-" + "12-31";
  }

  const hostedPPSexPepQuery = db("tiepp")
    .select(
      db.raw(`
          CASE
              WHEN tiepp.sex = 'M' THEN 'Homme'
              WHEN tiepp.sex = 'F' THEN 'Femme'
              ELSE 'N/A'
          END as label
      `)
    )
    .countDistinct("tiepp.tiepp_id as value")
    .leftJoin("tieformpp", "tieformpp.tiepp_id", "tiepp.tiepp_id")
    .leftJoin(
      "formules_params",
      "formules_params.formule_id",
      "tieformpp.formule_id"
    )
    .where({ "tiepp.company_id": company_id })
    .where(function () {
      this.where(
        "tieformpp.date_debut_formule",
        "<=",
        dateFin || new Date().toISOString()
      ).andWhere(function () {
        this.where(
          "tieformpp.date_fin_formule",
          ">=",
          db.raw("?", [dateDeb])
        ).orWhereNull("tieformpp.date_fin_formule");
      });
    })
    .whereIn("formules_params.name", ["PEPINIERE"])
    .groupBy("tiepp.sex");

  const hostedPPSexPrjQuery = db("tiepp")
    .select(
      db.raw(`
          CASE
              WHEN tiepp.sex = 'M' THEN 'Homme'
              WHEN tiepp.sex = 'F' THEN 'Femme'
              ELSE 'N/A'
          END as label
      `)
    )
    .countDistinct("tiepp.tiepp_id as value")
    .leftJoin("tieformpp", "tieformpp.tiepp_id", "tiepp.tiepp_id")
    .leftJoin(
      "formules_params",
      "formules_params.formule_id",
      "tieformpp.formule_id"
    )
    .where({ "tiepp.company_id": company_id })
    .where(function () {
      this.where(
        "tieformpp.date_debut_formule",
        "<=",
        dateFin || new Date().toISOString()
      ).andWhere(function () {
        this.where(
          "tieformpp.date_fin_formule",
          ">=",
          db.raw("?", [dateDeb])
        ).orWhereNull("tieformpp.date_fin_formule");
      });
    })
    .whereIn("formules_params.name", ["PORTEUR PROJET"])
    .groupBy("tiepp.sex");

  const hostedPPSexMurQuery = db("tiepp")
    .select(
      db.raw(`
            CASE
                WHEN tiepp.sex = 'M' THEN 'Homme'
                WHEN tiepp.sex = 'F' THEN 'Femme'
                ELSE 'N/A'
            END as label
        `)
    )
    .countDistinct("tiepp.tiepp_id as value")
    .leftJoin("tieformpp", "tieformpp.tiepp_id", "tiepp.tiepp_id")
    .leftJoin(
      "formules_params",
      "formules_params.formule_id",
      "tieformpp.formule_id"
    )
    .where({ "tiepp.company_id": company_id })
    .where(function () {
      this.where(
        "tieformpp.date_debut_formule",
        "<=",
        dateFin || new Date().toISOString()
      ).andWhere(function () {
        this.where(
          "tieformpp.date_fin_formule",
          ">=",
          db.raw("?", [dateDeb])
        ).orWhereNull("tieformpp.date_fin_formule");
      });
    })
    .whereIn("formules_params.name", ["EXTRA-MUROS"])
    .groupBy("tiepp.sex");

  const studyLevels = await db('study_level_params')
    .select('study_level_id', 'name')
    .where('company_id', company_id)
    .andWhere('is_deleted', false)
    .orderBy('study_level_id');

  // Build the base query
  const subqueryPep = db
    .select(
      "tiepp.tiepp_id",
      "tiepp.birth_date",
      "tiepp.civilite",
      "tiepp.study_level_id"
    )
    .distinct()
    .from("tiepp")
    .leftJoin("tieformpp", "tieformpp.tiepp_id", "tiepp.tiepp_id")
    .where("tieformpp.date_debut_formule", "<=", dateFin)
    .andWhere(function () {
      this.where("tieformpp.date_fin_formule", ">=", dateDeb)
        .orWhereNull("tieformpp.date_fin_formule");
    })
    .andWhere("tieformpp.formule_id", 1)
    .andWhere("tiepp.company_id", company_id)
    .as("unique_individuals");

  const eduPepQuery = db.from(subqueryPep).first();

  studyLevels.forEach(level => {
    eduPepQuery.select(
      db.raw(`SUM(CASE WHEN study_level_id = ? THEN 1 ELSE 0 END) AS ??`,
        [level.study_level_id, level.name])
    );
  });

  const subqueryPrj = db
    .select(
      "tiepp.tiepp_id",
      "tiepp.birth_date",
      "tiepp.civilite",
      "tiepp.study_level_id"
    )
    .distinct()
    .from("tiepp")
    .leftJoin("tieformpp", "tieformpp.tiepp_id", "tiepp.tiepp_id")
    .where("tieformpp.date_debut_formule", "<=", dateFin)
    .andWhere(function () {
      this.where("tieformpp.date_fin_formule", ">=", dateDeb).orWhereNull(
        "tieformpp.date_fin_formule"
      );
    })
    .andWhere("tieformpp.formule_id", 2)
    .andWhere("tiepp.company_id", company_id)
    .as("unique_individuals")

  const eduPrjQuery = db.from(subqueryPrj).first()

  studyLevels.forEach(level => {
    eduPrjQuery.select(
      db.raw(`SUM(CASE WHEN study_level_id = ? THEN 1 ELSE 0 END) AS ??`,
        [level.study_level_id, level.name])
    );
  });

  const subqueryMur = db
    .select(
      "tiepp.tiepp_id",
      "tiepp.birth_date",
      "tiepp.civilite",
      "tiepp.study_level_id"
    )
    .distinct()
    .from("tiepp")
    .leftJoin("tieformpp", "tieformpp.tiepp_id", "tiepp.tiepp_id")
    .where("tieformpp.date_debut_formule", "<=", dateFin)
    .andWhere(function () {
      this.where("tieformpp.date_fin_formule", ">=", dateDeb).orWhereNull(
        "tieformpp.date_fin_formule"
      );
    })
    .andWhere("tieformpp.formule_id", 5)
    .andWhere("tiepp.company_id", company_id)
    .as("unique_individuals")

  const eduMurQuery = db.from(subqueryMur).first()

  studyLevels.forEach(level => {
    eduMurQuery.select(
      db.raw(`SUM(CASE WHEN study_level_id = ? THEN 1 ELSE 0 END) AS ??`,
        [level.study_level_id, level.name])
    );
  });

  const agesPepQuery = db
    .select(
      db.raw(`
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 26 THEN 1 ELSE 0 END) AS "< 25 ans",
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) BETWEEN 26 AND 35 THEN 1 ELSE 0 END) AS "26 / 35 ans",
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) BETWEEN 36 AND 45 THEN 1 ELSE 0 END) AS "36 / 45 ans",
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) BETWEEN 46 AND 55 THEN 1 ELSE 0 END) AS "46 / 55 ans",
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) > 55 THEN 1 ELSE 0 END) AS "> 55 ans"
      `)
    )
    .from(
      db
        .select(
          "tiepp.tiepp_id",
          "tiepp.birth_date",
          "tiepp.civilite",
          "tiepp.study_level_id"
        )
        .distinct()
        .from("tiepp")
        .leftJoin("tieformpp", "tieformpp.tiepp_id", "tiepp.tiepp_id")
        .where("tieformpp.date_debut_formule", "<=", dateFin)
        .andWhere(function () {
          this.where("tieformpp.date_fin_formule", ">=", dateDeb).orWhereNull(
            "tieformpp.date_fin_formule"
          );
        })
        .andWhere("tieformpp.formule_id", 1)
        .andWhere("tiepp.company_id", company_id)
        .as("unique_individuals")
    )
    .first();

  const agesPrjQuery = db
    .select(
      db.raw(`
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 26 THEN 1 ELSE 0 END) AS "< 25 ans",
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) BETWEEN 26 AND 35 THEN 1 ELSE 0 END) AS "26 / 35 ans",
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) BETWEEN 36 AND 45 THEN 1 ELSE 0 END) AS "36 / 45 ans",
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) BETWEEN 46 AND 55 THEN 1 ELSE 0 END) AS "46 / 55 ans",
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) > 55 THEN 1 ELSE 0 END) AS "> 55 ans"
      `)
    )
    .from(
      db
        .select(
          "tiepp.tiepp_id",
          "tiepp.birth_date",
          "tiepp.civilite",
          "tiepp.study_level_id"
        )
        .distinct()
        .from("tiepp")
        .leftJoin("tieformpp", "tieformpp.tiepp_id", "tiepp.tiepp_id")
        .where("tieformpp.date_debut_formule", "<=", dateFin)
        .andWhere(function () {
          this.where("tieformpp.date_fin_formule", ">=", dateDeb).orWhereNull(
            "tieformpp.date_fin_formule"
          );
        })
        .andWhere("tieformpp.formule_id", 2)
        .andWhere("tiepp.company_id", company_id)
        .as("unique_individuals")
    )
    .first();

  const agesMurQuery = db
    .select(
      db.raw(`
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 26 THEN 1 ELSE 0 END) AS "< 25 ans",
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) BETWEEN 26 AND 35 THEN 1 ELSE 0 END) AS "26 / 35 ans",
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) BETWEEN 36 AND 45 THEN 1 ELSE 0 END) AS "36 / 45 ans",
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) BETWEEN 46 AND 55 THEN 1 ELSE 0 END) AS "46 / 55 ans",
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) > 55 THEN 1 ELSE 0 END) AS "> 55 ans"
      `)
    )
    .from(
      db
        .select(
          "tiepp.tiepp_id",
          "tiepp.birth_date",
          "tiepp.civilite",
          "tiepp.study_level_id"
        )
        .distinct()
        .from("tiepp")
        .leftJoin("tieformpp", "tieformpp.tiepp_id", "tiepp.tiepp_id")
        .where("tieformpp.date_debut_formule", "<=", dateFin)
        .andWhere(function () {
          this.where("tieformpp.date_fin_formule", ">=", dateDeb).orWhereNull(
            "tieformpp.date_fin_formule"
          );
        })
        .andWhere("tieformpp.formule_id", 5)
        .andWhere("tiepp.company_id", company_id)
        .as("unique_individuals")
    )
    .first();

  const scpAvPrjPepQuery = db
    .select(
      "unique_individuals.scpAvPrj AS Situation Avant Projet",
      db.raw(
        'COUNT(unique_individuals.scpAvPrj) AS "Nombre Situation Avant Projet"'
      )
    )
    .from(
      db
        .select(
          "tiepp.tiepp_id",
          "tiepp.birth_date",
          "tiepp.civilite",
          "tiepp.study_level_id",
          "situation_before_prj_params.name as scpAvPrj"
        )
        .distinct()
        .from("tiepp")
        .leftJoin(
          "situation_before_prj_params",
          "situation_before_prj_params.situation_before_prj_id",
          "tiepp.situation_before_prj_id"
        )
        .leftJoin("tieformpp", "tieformpp.tiepp_id", "tiepp.tiepp_id")
        .where("tieformpp.date_debut_formule", "<=", dateFin)
        .andWhere(function () {
          this.where("tieformpp.date_fin_formule", ">=", dateDeb).orWhereNull(
            "tieformpp.date_fin_formule"
          );
        })
        .andWhere("tieformpp.formule_id", 1)
        .andWhere("tiepp.situation_before_prj_id", "IS NOT", null)
        .andWhere("tiepp.company_id", company_id)
        .as("unique_individuals")
    )
    .groupBy("unique_individuals.scpAvPrj");

  const scpAvPrjPrjQuery = db
    .select(
      "unique_individuals.scpAvPrj AS Situation Avant Projet",
      db.raw(
        'COUNT(unique_individuals.scpAvPrj) AS "Nombre Situation Avant Projet"'
      )
    )
    .from(
      db
        .select(
          "tiepp.tiepp_id",
          "tiepp.birth_date",
          "tiepp.civilite",
          "tiepp.study_level_id",
          "situation_before_prj_params.name as scpAvPrj"
        )
        .distinct()
        .from("tiepp")
        .leftJoin(
          "situation_before_prj_params",
          "situation_before_prj_params.situation_before_prj_id",
          "tiepp.situation_before_prj_id"
        )
        .leftJoin("tieformpp", "tieformpp.tiepp_id", "tiepp.tiepp_id")
        .where("tieformpp.date_debut_formule", "<=", dateFin)
        .andWhere(function () {
          this.where("tieformpp.date_fin_formule", ">=", dateDeb).orWhereNull(
            "tieformpp.date_fin_formule"
          );
        })
        .andWhere("tieformpp.formule_id", 2)
        .andWhere("tiepp.situation_before_prj_id", "IS NOT", null)
        .andWhere("tiepp.company_id", company_id)
        .as("unique_individuals")
    )
    .groupBy("unique_individuals.scpAvPrj");

  const scpAvPrjMurQuery = db
    .select(
      "unique_individuals.scpAvPrj AS Situation Avant Projet",
      db.raw(
        'COUNT(unique_individuals.scpAvPrj) AS "Nombre Situation Avant Projet"'
      )
    )
    .from(
      db
        .select(
          "tiepp.tiepp_id",
          "tiepp.birth_date",
          "tiepp.civilite",
          "tiepp.study_level_id",
          "situation_before_prj_params.name as scpAvPrj"
        )
        .distinct()
        .from("tiepp")
        .leftJoin(
          "situation_before_prj_params",
          "situation_before_prj_params.situation_before_prj_id",
          "tiepp.situation_before_prj_id"
        )
        .leftJoin("tieformpp", "tieformpp.tiepp_id", "tiepp.tiepp_id")
        .where("tieformpp.date_debut_formule", "<=", dateFin)
        .andWhere(function () {
          this.where("tieformpp.date_fin_formule", ">=", dateDeb).orWhereNull(
            "tieformpp.date_fin_formule"
          );
        })
        .andWhere("tieformpp.formule_id", 5)
        .andWhere("tiepp.situation_before_prj_id", "IS NOT", null)
        .andWhere("tiepp.company_id", company_id)
        .as("unique_individuals")
    )
    .groupBy("unique_individuals.scpAvPrj");

  const comunPersonsPepQuery = db
    .select(
      "unique_individuals.commune AS Commune",
      db.raw('COUNT(unique_individuals.commune) AS "Nb commune"')
    )
    .from(
      db
        .select("tiepp.tiepp_id", "tiepp.commune", "tiepp.qpv", "tiepp.zfu")
        .distinct()
        .from("tiepp")
        .leftJoin("tieformpp", "tieformpp.tiepp_id", "tiepp.tiepp_id")
        .where("tieformpp.date_debut_formule", "<=", dateFin)
        .andWhere(function () {
          this.where("tieformpp.date_fin_formule", ">=", dateDeb).orWhereNull(
            "tieformpp.date_fin_formule"
          );
        })
        .andWhere("tieformpp.formule_id", 1)
        .andWhere("tiepp.commune", "IS NOT", null)
        .andWhere("tiepp.company_id", company_id)
        .as("unique_individuals")
    )
    .groupBy("unique_individuals.commune");

  const comunPersonsPrjQuery = db
    .select(
      "unique_individuals.commune AS Commune",
      db.raw('COUNT(unique_individuals.commune) AS "Nb commune"')
    )
    .from(
      db
        .select("tiepp.tiepp_id", "tiepp.commune", "tiepp.qpv", "tiepp.zfu")
        .distinct()
        .from("tiepp")
        .leftJoin("tieformpp", "tieformpp.tiepp_id", "tiepp.tiepp_id")
        .where("tieformpp.date_debut_formule", "<=", dateFin)
        .andWhere(function () {
          this.where("tieformpp.date_fin_formule", ">=", dateDeb).orWhereNull(
            "tieformpp.date_fin_formule"
          );
        })
        .andWhere("tieformpp.formule_id", 2)
        .andWhere("tiepp.commune", "IS NOT", null)
        .andWhere("tiepp.company_id", company_id)
        .as("unique_individuals")
    )
    .groupBy("unique_individuals.commune");

  const comunPersonsMurQuery = db
    .select(
      "unique_individuals.commune AS Commune",
      db.raw('COUNT(unique_individuals.commune) AS "Nb commune"')
    )
    .from(
      db
        .select("tiepp.tiepp_id", "tiepp.commune", "tiepp.qpv", "tiepp.zfu")
        .distinct()
        .from("tiepp")
        .leftJoin("tieformpp", "tieformpp.tiepp_id", "tiepp.tiepp_id")
        .where("tieformpp.date_debut_formule", "<=", dateFin)
        .andWhere(function () {
          this.where("tieformpp.date_fin_formule", ">=", dateDeb).orWhereNull(
            "tieformpp.date_fin_formule"
          );
        })
        .andWhere("tieformpp.formule_id", 5)
        .andWhere("tiepp.commune", "IS NOT", null)
        .andWhere("tiepp.company_id", company_id)
        .as("unique_individuals")
    )
    .groupBy("unique_individuals.commune");

  const statutJurPepQuery = db
    .select(
      "unique_individuals.name AS Statut Juridique",
      db.raw('COUNT(unique_individuals.name) AS "Nb Statut Juridique"')
    )
    .from(
      db
        .select("tiepm.tiepm_id", "legal_forms_params.name")
        .distinct()
        .from("tiepm")
        .leftJoin(
          "legal_forms_params",
          "legal_forms_params.legal_form_id",
          "tiepm.legal_form_id"
        )
        .leftJoin("tieformpm", "tieformpm.tiepm_id", "tiepm.tiepm_id")
        .where("tieformpm.date_debut_formule", "<=", dateFin)
        .andWhere(function () {
          this.where("tieformpm.date_fin_formule", ">=", dateDeb).orWhereNull(
            "tieformpm.date_fin_formule"
          );
        })
        .andWhere("tieformpm.formule_id", 1)
        .andWhere("tiepm.legal_form_id", "IS NOT", null)
        .andWhere("tiepm.company_id", company_id)
        .as("unique_individuals")
    )
    .groupBy("unique_individuals.name");

  const statutJurPrjQuery = db
    .select(
      "unique_individuals.name AS Statut Juridique",
      db.raw('COUNT(unique_individuals.name) AS "Nb Statut Juridique"')
    )
    .from(
      db
        .select("tiepm.tiepm_id", "legal_forms_params.name")
        .distinct()
        .from("tiepm")
        .leftJoin(
          "legal_forms_params",
          "legal_forms_params.legal_form_id",
          "tiepm.legal_form_id"
        )
        .leftJoin("tieformpm", "tieformpm.tiepm_id", "tiepm.tiepm_id")
        .where("tieformpm.date_debut_formule", "<=", dateFin)
        .andWhere(function () {
          this.where("tieformpm.date_fin_formule", ">=", dateDeb).orWhereNull(
            "tieformpm.date_fin_formule"
          );
        })
        .andWhere("tieformpm.formule_id", 2)
        .andWhere("tiepm.legal_form_id", "IS NOT", null)
        .andWhere("tiepm.company_id", company_id)
        .as("unique_individuals")
    )
    .groupBy("unique_individuals.name");

  const statutJurMurQuery = db
    .select(
      "unique_individuals.name AS Statut Juridique",
      db.raw('COUNT(unique_individuals.name) AS "Nb Statut Juridique"')
    )
    .from(
      db
        .select("tiepm.tiepm_id", "legal_forms_params.name")
        .distinct()
        .from("tiepm")
        .leftJoin(
          "legal_forms_params",
          "legal_forms_params.legal_form_id",
          "tiepm.legal_form_id"
        )
        .leftJoin("tieformpm", "tieformpm.tiepm_id", "tiepm.tiepm_id")
        .where("tieformpm.date_debut_formule", "<=", dateFin)
        .andWhere(function () {
          this.where("tieformpm.date_fin_formule", ">=", dateDeb).orWhereNull(
            "tieformpm.date_fin_formule"
          );
        })
        .andWhere("tieformpm.formule_id", 5)
        .andWhere("tiepm.legal_form_id", "IS NOT", null)
        .andWhere("tiepm.company_id", company_id)
        .as("unique_individuals")
    )
    .groupBy("unique_individuals.name");

  const [
    scpAvPrjPepRes,
    scpAvPrjPrjRes,
    scpAvPrjMurRes,
    comunPersonsPepRes,
    comunPersonsPrjRes,
    comunPersonsMurRes,
    statutJurPepRes,
    statutJurPrjRes,
    statutJurMurRes,
    agesPepRes,
    agesPrjRes,
    agesMurRes,
    eduPepRes,
    eduPrjRes,
    eduMurRes,
    hostedPPSexPep,
    hostedPPSexPrj,
    hostedPPSexMur
  ] = await Promise.all([
    scpAvPrjPepQuery,
    scpAvPrjPrjQuery,
    scpAvPrjMurQuery,
    comunPersonsPepQuery,
    comunPersonsPrjQuery,
    comunPersonsMurQuery,
    statutJurPepQuery,
    statutJurPrjQuery,
    statutJurMurQuery,
    agesPepQuery,
    agesPrjQuery,
    agesMurQuery,
    eduPepQuery,
    eduPrjQuery,
    eduMurQuery,
    hostedPPSexPepQuery,
    hostedPPSexPrjQuery,
    hostedPPSexMurQuery
  ]);

  const eduPep = Object.entries(eduPepRes).map(([label, value]) => ({
    label,
    value: Number(value),
  }));

  const eduPrj = Object.entries(eduPrjRes).map(([label, value]) => ({
    label,
    value: Number(value),
  }));

  const eduMur = Object.entries(eduMurRes).map(([label, value]) => ({
    label,
    value: Number(value),
  }));

  const agesPep = Object.entries(agesPepRes).map(([name, value]) => ({
    name,
    value: Number(value),
  }));

  const agesPrj = Object.entries(agesPrjRes).map(([name, value]) => ({
    name,
    value: Number(value),
  }));

  const agesMur = Object.entries(agesMurRes).map(([name, value]) => ({
    name,
    value: Number(value),
  }));

  const scpAvPrjPep = scpAvPrjPepRes.map((row) => ({
    name: row["Situation Avant Projet"],
    value: row["Nombre Situation Avant Projet"],
  }));

  const scpAvPrjPrj = scpAvPrjPrjRes.map((row) => ({
    name: row["Situation Avant Projet"],
    value: row["Nombre Situation Avant Projet"],
  }));

  const scpAvPrjMur = scpAvPrjMurRes.map((row) => ({
    name: row["Situation Avant Projet"],
    value: row["Nombre Situation Avant Projet"],
  }));

  const comunPersonsPep = comunPersonsPepRes.map((row) => ({
    label: row["Commune"],
    value: row["Nb commune"],
  }));

  const comunPersonsPrj = comunPersonsPrjRes.map((row) => ({
    label: row["Commune"],
    value: row["Nb commune"],
  }));

  const comunPersonsMur = comunPersonsMurRes.map((row) => ({
    label: row["Commune"],
    value: row["Nb commune"],
  }));

  const statutJurPep = statutJurPepRes.map((row) => ({
    label: row["Statut Juridique"],
    value: row["Nb Statut Juridique"],
  }));

  const statutJurPrj = statutJurPrjRes.map((row) => ({
    label: row["Statut Juridique"],
    value: row["Nb Statut Juridique"],
  }));

  const statutJurMur = statutJurMurRes.map((row) => ({
    label: row["Statut Juridique"],
    value: row["Nb Statut Juridique"],
  }));

  res.json({
    hostedPPSexPep,
    hostedPPSexPrj,
    hostedPPSexMur,
    eduPrj,
    eduPep,
    eduMur,
    agesPep,
    agesPrj,
    agesMur,
    scpAvPrjPep,
    scpAvPrjPrj,
    scpAvPrjMur,
    comunPersonsPep,
    comunPersonsPrj,
    comunPersonsMur,
    statutJurPep,
    statutJurPrj,
    statutJurMur,
  });
});

export { router as BilanGraphsRouter };
