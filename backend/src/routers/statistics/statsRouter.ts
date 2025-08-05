import express from "express";
import XLSX from "xlsx-js-style"; // Importing XLSX for handling Excel files
import dotenv from "dotenv";
import { db } from "../../data/db";
import { UserRequest, verifyUser } from "../../middlewares/checkUser";

dotenv.config();

const router = express.Router();

router.get(
  "/download-bilan-ante",
  verifyUser,
  async (req: UserRequest, res) => {
    try {
      const { dateYearRef: dateYear } = req.query;
      const company_id = req.company_id;

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

      const boldAlignedStyle = {
        font: { bold: true },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "black" } }, // Black color for top border
          bottom: { style: "thin", color: { rgb: "black" } }, // Black color for bottom border
          left: { style: "thin", color: { rgb: "black" } }, // Black color for left border
          right: { style: "thin", color: { rgb: "black" } },
        },
      };

      const AlignedStyle = {
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "black" } }, // Black color for top border
          bottom: { style: "thin", color: { rgb: "black" } }, // Black color for bottom border
          left: { style: "thin", color: { rgb: "black" } }, // Black color for left border
          right: { style: "thin", color: { rgb: "black" } },
        },
      };

      const boldStyle = {
        font: { bold: true },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "medium", color: { rgb: "black" } }, // Black color for top border
          bottom: { style: "medium", color: { rgb: "black" } }, // Black color for bottom border
          left: { style: "medium", color: { rgb: "black" } }, // Black color for left border
          right: { style: "medium", color: { rgb: "black" } },
        },
      };

      const workbook = XLSX.utils.book_new();

      // BILAN ANTE
      const worksheet = {} as any;
      function setCell(cellRef: any, value: any, type: any, style: any) {
        worksheet[cellRef] = { t: type, v: value, s: style };
      }

      setCell("A1", "Grille de synthèse", "s", {
        font: { bold: true },
        alignment: { horizontal: "center", vertical: "center" },
        fill: {
          fgColor: { rgb: "8cace0" },
          patternType: "solid",
        },
        border: {
          top: { style: "medium", color: { rgb: "black" } }, // Black color for top border
          bottom: { style: "medium", color: { rgb: "black" } }, // Black color for bottom border
          left: { style: "medium", color: { rgb: "black" } }, // Black color for left border
        },
      });
      for (let letter of ["B", "C", "D", "E", "F", "G"]) {
        setCell(`${letter}1`, "Grille de synthèse", "s", {
          border: {
            top: { style: "medium", color: { rgb: "black" } },
            bottom: { style: "medium", color: { rgb: "black" } }, // Black color for bottom border
            right: { style: "medium", color: { rgb: "black" } },
          },
        });
      }
      setCell(
        "A3",
        `Bilan final de la mission référent du ${dateDeb} au ${dateFin}`,
        "s",
        {
          alignment: { horizontal: "left", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "black" } }, // Black color for top border
            bottom: { style: "thin", color: { rgb: "black" } }, // Black color for bottom border
            left: { style: "thin", color: { rgb: "black" } }, // Black color for left border
            right: { style: "thin", color: { rgb: "black" } },
          },
        }
      );
      for (let letter of ["B", "C", "D", "E", "F", "G"]) {
        setCell(
          `${letter}3`,
          `Bilan final de la mission référent du ${dateDeb} au ${dateFin}`,
          "s",
          {
            alignment: { horizontal: "left", vertical: "center" },
            border: {
              top: { style: "thin", color: { rgb: "black" } }, // Black color for top border
              bottom: { style: "thin", color: { rgb: "black" } }, // Black color for bottom border
              left: { style: "thin", color: { rgb: "black" } }, // Black color for left border
              right: { style: "thin", color: { rgb: "black" } },
            },
          }
        );
      }

      for (let letter of ["A", "B", "C"]) {
        setCell(`${letter}7`, "1 - Profils des bénéficiaires", "s", boldStyle);
      }
      for (let letter of ["E", "F", "G"]) {
        setCell(
          `${letter}7`,
          "2 - Contenu et résultats du suivi engagé",
          "s",
          boldStyle
        );
      }

      //Profils des bénéficiaires
      const studyLevels = await db('study_level_params')
        .select('study_level_id', 'name')
        .where({ company_id, 'is_deleted': false })
        .orderBy('study_level_id');

      const studyLevelCases = studyLevels.map(level =>
        `SUM(CASE WHEN study_level_id = ${level.study_level_id} THEN 1 ELSE 0 END) AS "${level.name.replace(/"/g, '""')}"`
      ).join(',\n            ');

      let personsInfosPp = await db.raw(
        `
      SELECT
          SUM(CASE WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 26 THEN 1 ELSE 0 END) AS "< 25 ans",
          SUM(CASE WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) BETWEEN 26 AND 35 THEN 1 ELSE 0 END) AS "26 / 35 ans",
          SUM(CASE WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) BETWEEN 36 AND 45 THEN 1 ELSE 0 END) AS "36 / 45 ans",
          SUM(CASE WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) BETWEEN 46 AND 55 THEN 1 ELSE 0 END) AS "46 / 55 ans",
          SUM(CASE WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) > 55 THEN 1 ELSE 0 END) AS "> 55 ans",
          SUM(CASE WHEN civilite = 'Mr' THEN 1 ELSE 0 END) AS "Nb Hommes",
          SUM(CASE WHEN civilite = 'Mme' THEN 1 ELSE 0 END) AS "Nb Femmes",
          ${studyLevelCases} 
      FROM (
          SELECT DISTINCT tiepp.tiepp_id, tiepp.birth_date, tiepp.civilite, tiepp.study_level_id
          FROM tiepp
          LEFT JOIN tieformpp ON tieformpp.tiepp_id = tiepp.tiepp_id
          WHERE 
              tieformpp.date_debut_formule <= ?
              AND (tieformpp.date_fin_formule >= ? OR tieformpp.date_fin_formule IS NULL)
              AND tieformpp.formule_id = 2
              AND tiepp.company_id = ?
      ) AS unique_individuals
      `,
        [dateFin, dateDeb, company_id]
      );

      let ageMoyen = await db.raw(
        `
      SELECT
          TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) as age
      FROM (
          SELECT DISTINCT tiepp.tiepp_id, tiepp.birth_date, tiepp.civilite, tiepp.study_level_id
          FROM tiepp
          LEFT JOIN tieformpp ON tieformpp.tiepp_id = tiepp.tiepp_id
          WHERE 
              tieformpp.date_debut_formule <= ?
              AND (tieformpp.date_fin_formule >= ? OR tieformpp.date_fin_formule IS NULL)
              AND tieformpp.formule_id = 2
              AND tiepp.company_id = ?
      ) AS unique_individuals
      `,
        [dateFin, dateDeb, company_id]
      );

      const totalPersonsPp =
        Number(personsInfosPp[0][0]["< 25 ans"]) +
        Number(personsInfosPp[0][0]["26 / 35 ans"]) +
        Number(personsInfosPp[0][0]["36 / 45 ans"]) +
        Number(personsInfosPp[0][0]["46 / 55 ans"]) +
        Number(personsInfosPp[0][0]["> 55 ans"]);

      const ageMoyenSomme = ageMoyen[0].reduce((acc: any, cur: any) => {
        acc += cur["age"];
        return acc;
      }, 0);
      const ageMoyenResult = Math.round(ageMoyenSomme / totalPersonsPp);

      const nbTotalPersonsSexe =
        Number(personsInfosPp[0][0]["Nb Femmes"]) + Number(personsInfosPp[0][0]["Nb Hommes"]);

      // Age table
      setCell("A9", "Age", "s", boldAlignedStyle);
      setCell("B9", "Nombre", "s", boldAlignedStyle);
      setCell("C9", "%", "s", boldAlignedStyle);
      setCell("A10", "< 25 ans", "s", AlignedStyle);
      setCell("A11", "26 / 35 ans", "s", AlignedStyle);
      setCell("A12", "36 / 45 ans", "s", AlignedStyle);
      setCell("A13", "46 / 55 ans", "s", AlignedStyle);
      setCell("A14", "> 55 ans", "s", AlignedStyle);
      setCell("A15", `Age moyen :`, "s", AlignedStyle);
      setCell("B10", `${personsInfosPp[0][0]["< 25 ans"]}`, "s", AlignedStyle);
      setCell(
        "B11",
        `${personsInfosPp[0][0]["26 / 35 ans"]}`,
        "s",
        AlignedStyle
      );
      setCell(
        "B12",
        `${personsInfosPp[0][0]["36 / 45 ans"]}`,
        "s",
        AlignedStyle
      );
      setCell(
        "B13",
        `${personsInfosPp[0][0]["46 / 55 ans"]}`,
        "s",
        AlignedStyle
      );
      setCell("B14", `${personsInfosPp[0][0]["> 55 ans"]}`, "s", AlignedStyle);
      setCell("B15", `${ageMoyenResult}`, "s", AlignedStyle);
      setCell(
        "C10",
        `${Math.round(
          (Number(personsInfosPp[0][0]["< 25 ans"]) / totalPersonsPp) * 100
        )}%`,
        "s",
        AlignedStyle
      );
      setCell(
        "C11",
        `${Math.round(
          (Number(personsInfosPp[0][0]["26 / 35 ans"]) / totalPersonsPp) * 100
        )}%`,
        "s",
        AlignedStyle
      );
      setCell(
        "C12",
        `${Math.round(
          (Number(personsInfosPp[0][0]["36 / 45 ans"]) / totalPersonsPp) * 100
        )}%`,
        "s",
        AlignedStyle
      );
      setCell(
        "C13",
        `${Math.round(
          (Number(personsInfosPp[0][0]["46 / 55 ans"]) / totalPersonsPp) * 100
        )}%`,
        "s",
        AlignedStyle
      );
      setCell(
        "C14",
        `${Math.round(
          (Number(personsInfosPp[0][0]["> 55 ans"]) / totalPersonsPp) * 100
        )}%`,
        "s",
        AlignedStyle
      );

      //Répartition Femme/Homme
      setCell("A17", "Répartition Femme/Homme", "s", boldAlignedStyle);
      setCell("B17", `Nombre`, "s", boldAlignedStyle);
      setCell("C17", `%`, "s", boldAlignedStyle);
      setCell("A18", "Femme", "s", AlignedStyle);
      setCell("A19", "Homme", "s", AlignedStyle);
      setCell("B18", `${personsInfosPp[0][0]["Nb Femmes"]}`, "s", AlignedStyle);
      setCell("B19", `${personsInfosPp[0][0]["Nb Hommes"]}`, "s", AlignedStyle);
      setCell(
        "C19",
        `${Math.round(
          (personsInfosPp[0][0]["Nb Hommes"] / nbTotalPersonsSexe) * 100
        )}%`,
        "s",
        AlignedStyle
      );
      setCell(
        "C18",
        `${Math.round(
          (personsInfosPp[0][0]["Nb Femmes"] / nbTotalPersonsSexe) * 100
        )}%`,
        "s",
        AlignedStyle
      );

      // Niveau de formation table
      let row = 21;

      setCell(`A${row}`, "Niveau de formation", "s", boldAlignedStyle);
      setCell(`B${row}`, "Nombre", "s", boldAlignedStyle);
      setCell(`C${row}`, "%", "s", boldAlignedStyle);
      row++;

      for (const level of studyLevels) {
        const count = personsInfosPp[0][0][level.name] || 0;
        const percentage = Math.round((Number(count) / totalPersonsPp) * 100);

        setCell(`A${row}`, level.name, "s", AlignedStyle);
        setCell(`B${row}`, count.toString(), "s", AlignedStyle);
        setCell(`C${row}`, `${percentage}%`, "s", AlignedStyle);

        row++;
      }

      // Situation avant immatriculation table

      let personsScpAvPrjPp = await db.raw(
        `
      SELECT
          unique_individuals.scpAvPrj AS "Situation Avant Projet",
          COUNT(unique_individuals.scpAvPrj) AS "Nombre Situation Avant Projet"
      FROM (
          SELECT DISTINCT 
              tiepp.tiepp_id, 
              tiepp.birth_date, 
              tiepp.civilite, 
              tiepp.study_level_id,
              situation_before_prj_params.name as scpAvPrj
          FROM 
              tiepp
          LEFT JOIN 
                situation_before_prj_params ON situation_before_prj_params.situation_before_prj_id = tiepp.situation_before_prj_id
          LEFT JOIN 
              tieformpp ON tieformpp.tiepp_id = tiepp.tiepp_id
          WHERE 
              tieformpp.date_debut_formule <= ? AND
              (tieformpp.date_fin_formule >= ? OR tieformpp.date_fin_formule IS NULL) AND
              tieformpp.formule_id = 2 AND
              tiepp.situation_before_prj_id IS NOT NULL AND
                tiepp.company_id = ?
      ) AS unique_individuals
      GROUP BY 
          unique_individuals.scpAvPrj;
      `,
        [dateFin, dateDeb, company_id]
      );

      setCell("A36", "Situation avant immatriculation", "s", boldAlignedStyle);
      setCell("B36", "Nombre", "s", boldAlignedStyle);
      setCell("C36", "%", "s", boldAlignedStyle);

      const resultsScpAvPrjPp = personsScpAvPrjPp[0];

      resultsScpAvPrjPp.forEach((item: any) => {
        setCell(
          `A${row}`,
          `${item["Situation Avant Projet"]}`,
          "s",
          AlignedStyle
        );
        setCell(
          `B${row}`,
          `${item["Nombre Situation Avant Projet"]}`,
          "s",
          AlignedStyle
        );
        setCell(
          `C${row}`,
          `${Math.round(
            (item["Nombre Situation Avant Projet"] / totalPersonsPp) * 100
          )}%`,
          "s",
          AlignedStyle
        );
        row++;
      });

      // Commune de Résidences des entrepreneurs
      let comunPersonsPp = await db.raw(
        `
      SELECT
          unique_individuals.commune AS "Commune",
          COUNT(unique_individuals.commune) AS "Nb commune",
          SUM(CASE WHEN unique_individuals.qpv = "Oui" THEN 1 ELSE 0 END) as Qpv,
          SUM(CASE WHEN unique_individuals.zfu = "Oui" THEN 1 ELSE 0 END) as Zfu
      FROM (
          SELECT DISTINCT 
              tiepp.tiepp_id, 
              tiepp.commune,
              tiepp.qpv,
              tiepp.zfu
          FROM 
              tiepp
          LEFT JOIN 
              tieformpp ON tieformpp.tiepp_id = tiepp.tiepp_id
          WHERE 
              tieformpp.date_debut_formule <= ? 
              AND
              (tieformpp.date_fin_formule >= ? OR tieformpp.date_fin_formule IS NULL) 
              AND
              tieformpp.formule_id = 2
              AND
              tiepp.commune IS NOT NULL 
              AND
              tiepp.company_id = ?
      ) AS unique_individuals
      GROUP BY 
          unique_individuals.commune;
      `,
        [dateFin, dateDeb, company_id]
      );

      const dicoZFUQPVPp = comunPersonsPp[0].reduce(
        (acc: any, cur: any) => {
          acc["qpv"] += parseInt(cur["Qpv"]);
          acc["zfu"] += parseInt(cur["Zfu"]);
          return acc;
        },
        { qpv: 0, zfu: 0 }
      );

      const resultsComunPersonsPp = comunPersonsPp[0];
      row += 1;
      setCell(`A${row}`, "Origine géographique", "s", boldAlignedStyle);
      setCell(`B${row}`, "Nombre", "s", boldAlignedStyle);
      setCell(`C${row}`, "%", "s", boldAlignedStyle);
      row += 1;

      resultsComunPersonsPp.forEach((item: any) => {
        setCell(`A${row}`, `${item["Commune"]}`, "s", AlignedStyle);
        setCell(`B${row}`, `${item["Nb commune"]}`, "s", AlignedStyle);
        setCell(
          `C${row}`,
          `${Math.round((Number(item["Nb commune"]) / totalPersonsPp) * 100)}%`,
          "s",
          AlignedStyle
        );
        row += 1;
      });
      setCell(`A${row}`, "dont QPV :", "s", boldAlignedStyle);
      setCell(`B${row}`, `${dicoZFUQPVPp["qpv"]}`, "s", boldAlignedStyle);
      setCell(`A${row + 1}`, "dont ZFU :", "s", boldAlignedStyle);
      setCell(`B${row + 1}`, `${dicoZFUQPVPp["zfu"]}`, "s", boldAlignedStyle);

      //Total des ENTREPRISES HEBERGEES table
      let createdComp = await db.raw(
        `
        SELECT
          SUM(CASE WHEN tieppprj.date_debut_prj IS NOT NULL THEN 1 ELSE 0 END) AS "CompaniesAlready",
          SUM(CASE WHEN tieppprj.date_debut_prj IS NULL THEN 1 ELSE 0 END) AS "CompaniesOngoing"
        FROM
          tieppprj
        LEFT JOIN
          tieformpp ON tieformpp.tiepp_id = tieppprj.tiepp_id
        LEFT JOIN
          tiepp ON tiepp.tiepp_id = tieppprj.tiepp_id
        WHERE 
          tieformpp.date_debut_formule <= ?
          AND
          (tieformpp.date_fin_formule >= ? OR tieformpp.date_fin_formule IS NULL)
          AND
          tieformpp.formule_id = 2
          AND
          tiepp.company_id = ?
        `,
        [dateFin, dateDeb, company_id]
      );

      const totalCreatedComps =
        Number(createdComp[0][0]["CompaniesAlready"]) +
        Number(createdComp[0][0]["CompaniesOngoing"]);

      setCell(`F9`, "Nombre", "s", boldAlignedStyle);
      setCell(`G9`, "%", "s", boldAlignedStyle);
      setCell(`E10`, `Entreprise déjà créées`, "s", AlignedStyle);
      setCell(
        `F10`,
        `${createdComp[0][0]["CompaniesAlready"]}`,
        "s",
        AlignedStyle
      );
      setCell(
        `G10`,
        `${Math.round(
          (Number(createdComp[0][0]["CompaniesAlready"]) / totalCreatedComps) * 100
        )}%`,
        "s",
        AlignedStyle
      );
      setCell(`E11`, `Entreprise en cours de création`, "s", AlignedStyle);
      setCell(
        `F11`,
        `${createdComp[0][0]["CompaniesOngoing"]}`,
        "s",
        AlignedStyle
      );
      setCell(
        `G11`,
        `${Math.round(
          (Number(createdComp[0][0]["CompaniesOngoing"]) / totalCreatedComps) * 100
        )}%`,
        "s",
        AlignedStyle
      );

      //Types de Status Juridiques
      let statutJurComp = await db.raw(
        `
      SELECT
          unique_individuals.name AS "Statut Juridique",
          COUNT(unique_individuals.name) AS "Nb Statut Juridique"
      FROM (
          SELECT DISTINCT 
              tiepm.tiepm_id, 
              legal_forms_params.name
          FROM 
            tiepm
          LEFT JOIN 
              legal_forms_params ON legal_forms_params.legal_form_id = tiepm.legal_form_id
          LEFT JOIN 
            tieformpm ON tieformpm.tiepm_id = tiepm.tiepm_id
          WHERE 
              tieformpm.date_debut_formule <= ? AND
              (tieformpm.date_fin_formule >= ? OR tieformpm.date_fin_formule IS NULL) AND
              tieformpm.formule_id = 2 AND
              tiepm.legal_form_id IS NOT NULL AND
                tiepm.company_id = ?
      ) AS unique_individuals
      GROUP BY 
          unique_individuals.name;
      `,
        [dateFin, dateDeb, company_id]
      );

      const resultsStatutJurComp = statutJurComp[0];

      const nbTotalEntreprises = resultsStatutJurComp.reduce(
        (acc: any, cur: any) => {
          acc += cur["Nb Statut Juridique"];
          return acc;
        },
        0
      );

      row = 13;

      setCell(`E${row}`, "Types de Statuts juridiques", "s", boldAlignedStyle);
      setCell(`F${row}`, "Nombre", "s", boldAlignedStyle);
      setCell(`G${row}`, "%", "s", boldAlignedStyle);
      row += 1;
      resultsStatutJurComp.forEach((item: any) => {
        setCell(`E${row}`, `${item["Statut Juridique"]}`, "s", AlignedStyle);
        setCell(`F${row}`, `${item["Nb Statut Juridique"]}`, "s", AlignedStyle);
        setCell(
          `G${row}`,
          `${Math.round(
            (item["Nb Statut Juridique"] / nbTotalEntreprises) * 100
          )}%`,
          "s",
          AlignedStyle
        );
        row += 1;
      });

      // Secteurs d'activités

      let secteurComp = await db.raw(
        `
        SELECT
            unique_individuals.name AS "Secteurs d'activité",
            COUNT(unique_individuals.name) AS "Nombre"
        FROM (
            SELECT DISTINCT 
                tiepm.tiepm_id, 
                secteurs_activites_params.name 
            FROM 
              tiepm
            LEFT JOIN 
              secteurs_activites_params ON secteurs_activites_params.secteur_activite_id = tiepm.secteur_activite_id
            LEFT JOIN 
              tieformpm ON tieformpm.tiepm_id = tiepm.tiepm_id
            WHERE 
                tieformpm.date_debut_formule <= ? AND
                (tieformpm.date_fin_formule >= ? OR tieformpm.date_fin_formule IS NULL) AND
                tieformpm.formule_id = 2 AND
                tiepm.secteur_activite_id IS NOT NULL AND
                tiepm.company_id = ? AND
                secteurs_activites_params.is_deleted = FALSE
        ) AS unique_individuals
        GROUP BY 
            unique_individuals.name;
        `,
        [dateFin, dateDeb, company_id]
      );


      secteurComp = secteurComp[0]

      row += 1;
      setCell(`E${row}`, "Secteurs d'activité", "s", boldAlignedStyle);
      setCell(`F${row}`, "Nombre", "s", boldAlignedStyle);
      setCell(`G${row}`, "%", "s", boldAlignedStyle);
      row += 1;
      secteurComp.forEach((item: any) => {
        setCell(`E${row}`, `${item["Secteurs d'activité"]}`, "s", AlignedStyle);
        setCell(`F${row}`, `${item["Nombre"]}`, "s", AlignedStyle);
        setCell(
          `G${row}`,
          `${Math.round((item["Nombre"] / nbTotalEntreprises) * 100)}%`,
          "s",
          AlignedStyle
        );
        row += 1;
      });

      worksheet["!ref"] = "A1:Z100"; // worksheet range

      worksheet["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }, // A1 to L1

        { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } }, // G3 to L3

        //Titles
        { s: { r: 6, c: 0 }, e: { r: 6, c: 2 } }, // A6 to E6
        { s: { r: 6, c: 4 }, e: { r: 6, c: 6 } }, // G6 to E6
      ]; // Merging cells

      // Append the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "BILAN ANTE");

      // Set headers and return the workbook as a buffer (e.g., in an Express.js response)
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + "BilanAnte.xlsx"
      );
      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
      res.end(buffer);
    } catch (e) {
      console.error(e);
      res.json(e);
    }
  }
);

router.get("/download-bilan-extra-muros", verifyUser, async (req: UserRequest, res) => {
  try {
    const { dateYearRef: dateYear } = req.query;
    const company_id = req.company_id
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

    const boldAlignedStyle = {
      font: { bold: true },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "black" } }, // Black color for top border
        bottom: { style: "thin", color: { rgb: "black" } }, // Black color for bottom border
        left: { style: "thin", color: { rgb: "black" } }, // Black color for left border
        right: { style: "thin", color: { rgb: "black" } },
      },
    };

    const AlignedStyle = {
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "black" } }, // Black color for top border
        bottom: { style: "thin", color: { rgb: "black" } }, // Black color for bottom border
        left: { style: "thin", color: { rgb: "black" } }, // Black color for left border
        right: { style: "thin", color: { rgb: "black" } },
      },
    };

    const boldStyle = {
      font: { bold: true },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "medium", color: { rgb: "black" } }, // Black color for top border
        bottom: { style: "medium", color: { rgb: "black" } }, // Black color for bottom border
        left: { style: "medium", color: { rgb: "black" } }, // Black color for left border
        right: { style: "medium", color: { rgb: "black" } },
      },
    };

    const workbook = XLSX.utils.book_new();
    // BILAN EXTRA MUROS
    const worksheet = {} as any;
    function setCell(cellRef: any, value: any, type: any, style: any) {
      worksheet[cellRef] = { t: type, v: value, s: style };
    }

    setCell("A1", "Grille de synthèse", "s", {
      font: { bold: true },
      alignment: { horizontal: "center", vertical: "center" },
      fill: {
        fgColor: { rgb: "8cace0" },
        patternType: "solid",
      },
      border: {
        top: { style: "medium", color: { rgb: "black" } }, // Black color for top border
        bottom: { style: "medium", color: { rgb: "black" } }, // Black color for bottom border
        left: { style: "medium", color: { rgb: "black" } }, // Black color for left border
      },
    });
    for (let letter of [
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
    ]) {
      setCell(`${letter}1`, "Grille de synthèse", "s", {
        border: {
          top: { style: "medium", color: { rgb: "black" } },
          bottom: { style: "medium", color: { rgb: "black" } }, // Black color for bottom border
          right: { style: "medium", color: { rgb: "black" } },
        },
      });
    }
    setCell(
      "A3",
      `Bilan final de la mission référent du ${dateDeb} au ${dateFin}`,
      "s",
      {
        alignment: { horizontal: "left", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "black" } }, // Black color for top border
          bottom: { style: "thin", color: { rgb: "black" } }, // Black color for bottom border
          left: { style: "thin", color: { rgb: "black" } }, // Black color for left border
          right: { style: "thin", color: { rgb: "black" } },
        },
      }
    );
    for (let letter of [
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
    ]) {
      setCell(
        `${letter}3`,
        `Bilan final de la mission référent du ${dateDeb} au ${dateFin}`,
        "s",
        {
          alignment: { horizontal: "left", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "black" } }, // Black color for top border
            bottom: { style: "thin", color: { rgb: "black" } }, // Black color for bottom border
            left: { style: "thin", color: { rgb: "black" } }, // Black color for left border
            right: { style: "thin", color: { rgb: "black" } },
          },
        }
      );
    }

    setCell("A4", `Intervenant :`, "s", {
      alignment: { horizontal: "left", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "black" } }, // Black color for top border
        bottom: { style: "thin", color: { rgb: "black" } }, // Black color for bottom border
        left: { style: "thin", color: { rgb: "black" } }, // Black color for left border
        right: { style: "thin", color: { rgb: "black" } },
      },
    });
    for (let letter of [
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
    ]) {
      setCell(`${letter}4`, `Intervenant :`, "s", {
        alignment: { horizontal: "left", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "black" } }, // Black color for top border
          bottom: { style: "thin", color: { rgb: "black" } }, // Black color for bottom border
          left: { style: "thin", color: { rgb: "black" } }, // Black color for left border
          right: { style: "thin", color: { rgb: "black" } },
        },
      });
    }

    for (let letter of ["A", "B", "C"]) {
      setCell(`${letter}7`, "1 - Profils des bénéficiaires", "s", boldStyle);
    }
    for (let letter of ["E", "F", "G", "H", "I"]) {
      setCell(`${letter}7`, "2 - Profils des entreprises", "s", boldStyle);
    }
    for (let letter of ["K", "L", "M", "N", "O"]) {
      setCell(
        `${letter}7`,
        "3 - Contenu et résultats du suivi engagé",
        "s",
        boldStyle
      );
    }

    //Profils des bénéficiaires
    const studyLevels = await db('study_level_params')
      .select('study_level_id', 'name')
      .where({ company_id, 'is_deleted': false })
      .orderBy('study_level_id');

    const studyLevelCases = studyLevels.map(level =>
      `SUM(CASE WHEN study_level_id = ${level.study_level_id} THEN 1 ELSE 0 END) AS "${level.name.replace(/"/g, '""')}"`
    ).join(',\n            ');

    let personsInfosPep = await db.raw(
      `
      SELECT
          SUM(CASE WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 26 THEN 1 ELSE 0 END) AS "< 25 ans",
          SUM(CASE WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) BETWEEN 26 AND 35 THEN 1 ELSE 0 END) AS "26 / 35 ans",
          SUM(CASE WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) BETWEEN 36 AND 45 THEN 1 ELSE 0 END) AS "36 / 45 ans",
          SUM(CASE WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) BETWEEN 46 AND 55 THEN 1 ELSE 0 END) AS "46 / 55 ans",
          SUM(CASE WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) > 55 THEN 1 ELSE 0 END) AS "> 55 ans",
          SUM(CASE WHEN civilite = 'Mr' THEN 1 ELSE 0 END) AS "Nb Hommes",
          SUM(CASE WHEN civilite = 'Mme' THEN 1 ELSE 0 END) AS "Nb Femmes",
          ${studyLevelCases} 
      FROM (
          SELECT DISTINCT tiepp.tiepp_id, tiepp.birth_date, tiepp.civilite, tiepp.study_level_id
          FROM tiepp
          LEFT JOIN tieformpp ON tieformpp.tiepp_id = tiepp.tiepp_id
          WHERE 
              tieformpp.date_debut_formule <= ?
              AND (tieformpp.date_fin_formule >= ? OR tieformpp.date_fin_formule IS NULL)
              AND tieformpp.formule_id = 5
              AND tiepp.company_id = ?
      ) AS unique_individuals
      `,
      [dateFin, dateDeb, company_id]
    );

    let ageMoyen = await db.raw(
      `
      SELECT
          TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) as age
      FROM (
          SELECT DISTINCT tiepp.tiepp_id, tiepp.birth_date, tiepp.civilite, tiepp.study_level_id
          FROM tiepp
          LEFT JOIN tieformpp ON tieformpp.tiepp_id = tiepp.tiepp_id
          WHERE 
              tieformpp.date_debut_formule <= ?
              AND (tieformpp.date_fin_formule >= ? OR tieformpp.date_fin_formule IS NULL)
              AND tieformpp.formule_id = 5
              AND tiepp.company_id = ?
      ) AS unique_individuals
      `,
      [dateFin, dateDeb, company_id]
    );

    const totalPersonsPep =
      Number(personsInfosPep[0][0]["< 25 ans"]) +
      Number(personsInfosPep[0][0]["26 / 35 ans"]) +
      Number(personsInfosPep[0][0]["36 / 45 ans"]) +
      Number(personsInfosPep[0][0]["46 / 55 ans"]) +
      Number(personsInfosPep[0][0]["> 55 ans"]);

    const ageMoyenSomme = ageMoyen[0].reduce((acc: any, cur: any) => {
      acc += cur["age"];
      return acc;
    }, 0);

    const ageMoyenResult = Math.round(ageMoyenSomme / totalPersonsPep);

    const nbTotalPersonsSexe =
      Number(personsInfosPep[0][0]["Nb Femmes"]) + Number(personsInfosPep[0][0]["Nb Hommes"]);

    // Age table
    setCell("A9", "Age", "s", boldAlignedStyle);
    setCell("B9", "Nombre", "s", boldAlignedStyle);
    setCell("C9", "%", "s", boldAlignedStyle);
    setCell("A10", "< 25 ans", "s", AlignedStyle);
    setCell("A11", "26 / 35 ans", "s", AlignedStyle);
    setCell("A12", "36 / 45 ans", "s", AlignedStyle);
    setCell("A13", "46 / 55 ans", "s", AlignedStyle);
    setCell("A14", "> 55 ans", "s", AlignedStyle);
    setCell("A15", `Age moyen :`, "s", AlignedStyle);
    setCell("B10", `${personsInfosPep[0][0]["< 25 ans"]}`, "s", AlignedStyle);
    setCell(
      "B11",
      `${personsInfosPep[0][0]["26 / 35 ans"]}`,
      "s",
      AlignedStyle
    );
    setCell(
      "B12",
      `${personsInfosPep[0][0]["36 / 45 ans"]}`,
      "s",
      AlignedStyle
    );
    setCell(
      "B13",
      `${personsInfosPep[0][0]["46 / 55 ans"]}`,
      "s",
      AlignedStyle
    );
    setCell("B14", `${personsInfosPep[0][0]["> 55 ans"]}`, "s", AlignedStyle);
    setCell("B15", `${ageMoyenResult}`, "s", AlignedStyle);
    setCell(
      "C10",
      `${Math.round(
        (personsInfosPep[0][0]["< 25 ans"] / totalPersonsPep) * 100
      )}%`,
      "s",
      AlignedStyle
    );
    setCell(
      "C11",
      `${Math.round(
        (personsInfosPep[0][0]["26 / 35 ans"] / totalPersonsPep) * 100
      )}%`,
      "s",
      AlignedStyle
    );
    setCell(
      "C12",
      `${Math.round(
        (personsInfosPep[0][0]["36 / 45 ans"] / totalPersonsPep) * 100
      )}%`,
      "s",
      AlignedStyle
    );
    setCell(
      "C13",
      `${Math.round(
        (personsInfosPep[0][0]["46 / 55 ans"] / totalPersonsPep) * 100
      )}%`,
      "s",
      AlignedStyle
    );
    setCell(
      "C14",
      `${Math.round(
        (personsInfosPep[0][0]["> 55 ans"] / totalPersonsPep) * 100
      )}%`,
      "s",
      AlignedStyle
    );

    setCell("A17", "Répartition Femme/Homme", "s", boldAlignedStyle);
    setCell("B17", `Nombre`, "s", boldAlignedStyle);
    setCell("C17", `%`, "s", boldAlignedStyle);
    setCell("A18", "Femme", "s", AlignedStyle);
    setCell("A19", "Homme", "s", AlignedStyle);
    setCell("B18", `${personsInfosPep[0][0]["Nb Femmes"]}`, "s", AlignedStyle);
    setCell("B19", `${personsInfosPep[0][0]["Nb Hommes"]}`, "s", AlignedStyle);
    setCell(
      "C19",
      `${Math.round(
        (Number(personsInfosPep[0][0]["Nb Hommes"]) / nbTotalPersonsSexe) * 100
      )}%`,
      "s",
      AlignedStyle
    );
    setCell(
      "C18",
      `${Math.round(
        (Number(personsInfosPep[0][0]["Nb Femmes"]) / nbTotalPersonsSexe) * 100
      )}%`,
      "s",
      AlignedStyle
    );

    // Niveau de formation table
    let row = 21;

    setCell(`A${row}`, "Niveau de formation", "s", boldAlignedStyle);
    setCell(`B${row}`, "Nombre", "s", boldAlignedStyle);
    setCell(`C${row}`, "%", "s", boldAlignedStyle);
    row++;

    for (const level of studyLevels) {
      const count = personsInfosPep[0][0][level.name] || 0;
      const percentage = Math.round((Number(count) / totalPersonsPep) * 100);

      setCell(`A${row}`, level.name, "s", AlignedStyle);
      setCell(`B${row}`, count.toString(), "s", AlignedStyle);
      setCell(`C${row}`, `${percentage}%`, "s", AlignedStyle);

      row++;
    }

    // Situation avant immatriculation table

    let personsScpAvPrjPep = await db.raw(
      `
      SELECT
          unique_individuals.scpAvPrj AS "Situation Avant Projet",
          COUNT(unique_individuals.scpAvPrj) AS "Nombre Situation Avant Projet"
      FROM (
          SELECT DISTINCT 
              tiepp.tiepp_id, 
              tiepp.birth_date, 
              tiepp.civilite, 
              tiepp.study_level_id,
                situation_before_prj_params.name as scpAvPrj

          FROM 
              tiepp
          LEFT JOIN 
            situation_before_prj_params ON situation_before_prj_params.situation_before_prj_id = tiepp.situation_before_prj_id
          LEFT JOIN 
              tieformpp ON tieformpp.tiepp_id = tiepp.tiepp_id
          WHERE 
              tieformpp.date_debut_formule <= ? AND
              (tieformpp.date_fin_formule >= ? OR tieformpp.date_fin_formule IS NULL) AND
              tieformpp.formule_id = 5 AND
              tiepp.situation_before_prj_id IS NOT NULL AND
              tiepp.company_id = ?
      ) AS unique_individuals
      GROUP BY 
          unique_individuals.scpAvPrj;
      `,
      [dateFin, dateDeb, company_id]
    );

    setCell("A36", "Situation avant immatriculation", "s", boldAlignedStyle);
    setCell("B36", "Nombre", "s", boldAlignedStyle);
    setCell("C36", "%", "s", boldAlignedStyle);

    const resultsScpAvPrjPep = personsScpAvPrjPep[0];

    resultsScpAvPrjPep.forEach((item: any) => {
      setCell(
        `A${row}`,
        `${item["Situation Avant Projet"]}`,
        "s",
        AlignedStyle
      );
      setCell(
        `B${row}`,
        `${item["Nombre Situation Avant Projet"]}`,
        "s",
        AlignedStyle
      );
      setCell(
        `C${row}`,
        `${Math.round(
          (item["Nombre Situation Avant Projet"] / totalPersonsPep) * 100
        )}%`,
        "s",
        AlignedStyle
      );
      row++;
    });

    // Commune de Résidences des entrepreneurs
    let comunPersonsPep = await db.raw(
      `
      SELECT
          unique_individuals.commune AS "Commune",
          COUNT(unique_individuals.commune) AS "Nb commune",
          SUM(CASE WHEN unique_individuals.qpv = "Oui" THEN 1 ELSE 0 END) as Qpv,
          SUM(CASE WHEN unique_individuals.zfu = "Oui" THEN 1 ELSE 0 END) as Zfu
      FROM (
          SELECT DISTINCT 
              tiepp.tiepp_id, 
              tiepp.commune,
              tiepp.qpv,
              tiepp.zfu
          FROM 
              tiepp
          LEFT JOIN 
              tieformpp ON tieformpp.tiepp_id = tiepp.tiepp_id
          WHERE 
              tieformpp.date_debut_formule <= ? 
              AND
              (tieformpp.date_fin_formule >= ? OR tieformpp.date_fin_formule IS NULL) 
              AND
              tieformpp.formule_id = 5
              AND
              tiepp.commune IS NOT NULL 
              AND
              tiepp.company_id = ?
      ) AS unique_individuals
      GROUP BY 
          unique_individuals.commune;
      `,
      [dateFin, dateDeb, company_id]
    );

    const dicoZFUQPVPep = comunPersonsPep[0].reduce(
      (acc: any, cur: any) => {
        acc["qpv"] += parseInt(cur["Qpv"]);
        acc["zfu"] += parseInt(cur["Zfu"]);
        return acc;
      },
      { qpv: 0, zfu: 0 }
    );

    const resultsComunPersonsPep = comunPersonsPep[0];
    row += 1;
    setCell(`A${row}`, "Origine géographique", "s", boldAlignedStyle);
    setCell(`B${row}`, "Nombre", "s", boldAlignedStyle);
    setCell(`C${row}`, "%", "s", boldAlignedStyle);
    row += 1;

    resultsComunPersonsPep.forEach((item: any) => {
      setCell(`A${row}`, `${item["Commune"]}`, "s", AlignedStyle);
      setCell(`B${row}`, `${item["Nb commune"]}`, "s", AlignedStyle);
      setCell(
        `C${row}`,
        `${Math.round((item["Nb commune"] / totalPersonsPep) * 100)}%`,
        "s",
        AlignedStyle
      );
      row += 1;
    });
    setCell(`A${row}`, "dont QPV :", "s", boldAlignedStyle);
    setCell(`B${row}`, `${dicoZFUQPVPep["qpv"]}`, "s", boldAlignedStyle);
    setCell(`A${row + 1}`, "dont ZFU :", "s", boldAlignedStyle);
    setCell(`B${row + 1}`, `${dicoZFUQPVPep["zfu"]}`, "s", boldAlignedStyle);

    //Types de Status Juridiques
    let statutJurComp = await db.raw(
      `
      SELECT
          unique_individuals.name AS "Statut Juridique",
          COUNT(unique_individuals.name) AS "Nb Statut Juridique"
      FROM (
          SELECT DISTINCT 
              tiepm.tiepm_id, 
              legal_forms_params.name
          FROM 
            tiepm
          LEFT JOIN 
              legal_forms_params ON legal_forms_params.legal_form_id = tiepm.legal_form_id
          LEFT JOIN 
            tieformpm ON tieformpm.tiepm_id = tiepm.tiepm_id
          WHERE 
              tieformpm.date_debut_formule <= ? AND
              (tieformpm.date_fin_formule >= ? OR tieformpm.date_fin_formule IS NULL) AND
              tieformpm.formule_id = 5 AND
              tiepm.legal_form_id IS NOT NULL AND
                tiepm.company_id = ?
      ) AS unique_individuals
      GROUP BY 
          unique_individuals.name;

      `,
      [dateFin, dateDeb, company_id]
    );

    const resultsStatutJurComp = statutJurComp[0];

    const nbTotalEntreprises = resultsStatutJurComp.reduce(
      (acc: any, cur: any) => {
        acc += cur["Nb Statut Juridique"];
        return acc;
      },
      0
    );

    row = 9;

    setCell(`E${row}`, "Types de Statuts juridiques", "s", boldAlignedStyle);
    setCell(`F${row}`, "Nombre", "s", boldAlignedStyle);
    setCell(`G${row}`, "%", "s", boldAlignedStyle);
    row += 1;
    resultsStatutJurComp.forEach((item: any) => {
      setCell(`E${row}`, `${item["Statut Juridique"]}`, "s", AlignedStyle);
      setCell(`F${row}`, `${item["Nb Statut Juridique"]}`, "s", AlignedStyle);
      setCell(
        `G${row}`,
        `${Math.round(
          (item["Nb Statut Juridique"] / nbTotalEntreprises) * 100
        )}%`,
        "s",
        AlignedStyle
      );
      row += 1;
    });

    // Secteurs d'activités
    let secteurComp = await db.raw(
      `
      SELECT
          unique_individuals.name AS "Secteurs d'activité",
          COUNT(unique_individuals.name) AS "Nombre"
      FROM (
          SELECT DISTINCT 
              tiepm.tiepm_id, 
              secteurs_activites_params.name 
          FROM 
            tiepm
          LEFT JOIN 
            secteurs_activites_params ON secteurs_activites_params.secteur_activite_id = tiepm.secteur_activite_id
          LEFT JOIN 
            tieformpm ON tieformpm.tiepm_id = tiepm.tiepm_id
          WHERE 
              tieformpm.date_debut_formule <= ? AND
              (tieformpm.date_fin_formule >= ? OR tieformpm.date_fin_formule IS NULL) AND
              tieformpm.formule_id = 5 AND
              tiepm.secteur_activite_id IS NOT NULL AND
              tiepm.company_id = ? AND
              secteurs_activites_params.is_deleted = FALSE
      ) AS unique_individuals
      GROUP BY 
          unique_individuals.name;
      `,
      [dateFin, dateDeb, company_id]
    );

    secteurComp = secteurComp[0]

    row += 1;
    setCell(`E${row}`, "Secteurs d'activité", "s", boldAlignedStyle);
    setCell(`F${row}`, "Nombre", "s", boldAlignedStyle);
    setCell(`G${row}`, "%", "s", boldAlignedStyle);
    row += 1;
    secteurComp.forEach((item: any) => {
      setCell(`E${row}`, `${item["Secteurs d'activité"]}`, "s", AlignedStyle);
      setCell(`F${row}`, `${item["Nombre"]}`, "s", AlignedStyle);
      setCell(
        `G${row}`,
        `${Math.round((item["Nombre"] / nbTotalEntreprises) * 100)}%`,
        "s",
        AlignedStyle
      );
      row += 1;
    });

    let comunPersonsEM = await db.raw(
      `
      SELECT
          unique_individuals.commune AS "Commune",
          COUNT(unique_individuals.commune) AS "Nb commune",
          SUM(CASE WHEN unique_individuals.qpv = "Oui" THEN 1 ELSE 0 END) as Qpv,
          SUM(CASE WHEN unique_individuals.zfu = "Oui" THEN 1 ELSE 0 END) as Zfu
      FROM (
          SELECT DISTINCT 
              tiepm.tiepm_id, 
              tiepm.commune,
              tiepm.qpv,
              tiepm.zfu
          FROM 
              tiepm
          LEFT JOIN 
              tieformpm ON tieformpm.tiepm_id = tiepm.tiepm_id
          WHERE 
              tieformpm.date_debut_formule <= ? 
              AND
              (tieformpm.date_fin_formule >= ? OR tieformpm.date_fin_formule IS NULL) 
              AND
              tieformpm.formule_id = 5
              AND
              tiepm.commune IS NOT NULL 
              AND
              tiepm.company_id = ?
      ) AS unique_individuals
      GROUP BY 
          unique_individuals.commune;
      `,
      [dateFin, dateDeb, company_id]
    );

    const dicoZFUQPVEM = comunPersonsEM[0].reduce(
      (acc: any, cur: any) => {
        acc["qpv"] += parseInt(cur["Qpv"]);
        acc["zfu"] += parseInt(cur["Zfu"]);
        return acc;
      },
      { qpv: 0, zfu: 0 }
    );

    const resultsComunPersonsEM = comunPersonsEM[0];
    row += 1;
    setCell(
      `E${row}`,
      "Implantation géographique de l'entreprise",
      "s",
      boldAlignedStyle
    );
    setCell(`F${row}`, "Nombre", "s", boldAlignedStyle);
    setCell(`G${row}`, "%", "s", boldAlignedStyle);
    row += 1;

    resultsComunPersonsEM.forEach((item: any) => {
      setCell(`E${row}`, `${item["Commune"]}`, "s", AlignedStyle);
      setCell(`F${row}`, `${item["Nb commune"]}`, "s", AlignedStyle);
      setCell(
        `G${row}`,
        `${Math.round((item["Nb commune"] / totalPersonsPep) * 100)}%`,
        "s",
        AlignedStyle
      );
      row += 1;
    });
    setCell(`E${row}`, "dont QPV :", "s", boldAlignedStyle);
    setCell(`F${row}`, `${dicoZFUQPVEM["qpv"]}`, "s", boldAlignedStyle);
    setCell(`E${row + 1}`, "dont ZFU :", "s", boldAlignedStyle);
    setCell(`F${row + 1}`, `${dicoZFUQPVEM["zfu"]}`, "s", boldAlignedStyle);

    //3 - Contenu et résultats du suivi engagé
    let emploisYearEM = await db.raw(
      `
      SELECT
        a.tiepm_id,
        b.formule_id,
        CASE when a.nb_cdi - yearPrec.nbCdiPrec >= 0 then a.nb_cdi - yearPrec.nbCdiPrec else 0 END as diffnbCdi,
        CASE when a.nb_cdd - yearPrec.nbCddPrec >= 0 then a.nb_cdd - yearPrec.nbCddPrec else 0 END as diffnbCdd,
        CASE when a.nb_int - yearPrec.nbIntPrec >= 0 then a.nb_int - yearPrec.nbIntPrec else 0 END as diffnbInt,
        CASE when a.nb_caid - yearPrec.nbCaidPrec >= 0 then a.nb_caid - yearPrec.nbCaidPrec else 0 END as diffnbCaid,
        CASE when a.nb_alt - yearPrec.nbAlterPrec >= 0 then a.nb_alt - yearPrec.nbAlterPrec else 0 END as diffnbAlter,
        CASE when a.nb_stg - yearPrec.nbStagPrec >= 0 then a.nb_stg - yearPrec.nbStagPrec else 0 END as diffnbStag
      FROM
      (
        SELECT
          tiepmeff.tiepm_id,
          tiepmeff.nb_cdi,
          tiepmeff.nb_cdd,
          tiepmeff.nb_int,
          tiepmeff.nb_caid,
          tiepmeff.nb_alt,
          tiepmeff.nb_stg,
          MAX(tieformpm.form_pm_id) AS maxFormId
        FROM
          tiepmeff
        LEFT JOIN
            tiepm ON tiepmeff.tiepm_id = tiepm.tiepm_id
        LEFT JOIN
          tieformpm ON tiepmeff.tiepm_id = tieformpm.tiepm_id
        WHERE
          tiepmeff.year = ?
          AND tieformpm.date_debut_formule <= ?
          AND (tieformpm.date_fin_formule >= ? OR tieformpm.date_fin_formule IS NULL)
          AND tieformpm.formule_id = 5
          AND tiepm.company_id = ?
        GROUP BY
          tiepmeff.tiepm_id,
          tiepmeff.nb_cdi,
          tiepmeff.nb_cdd,
          tiepmeff.nb_int,
          tiepmeff.nb_caid,
          tiepmeff.nb_alt,
          tiepmeff.nb_stg
      ) AS a
      LEFT JOIN
      (
        SELECT
          tiepm_id,
          form_pm_id,
          formule_id
        FROM
          tieformpm
      ) AS b ON a.tiepm_id = b.tiepm_id AND a.maxFormId = b.form_pm_id
      LEFT JOIN
      (
        SELECT
          tiepmeff.tiepm_id,
          tiepmeff.nb_cdi AS nbCdiPrec,
          tiepmeff.nb_cdd AS nbCddPrec,
          tiepmeff.nb_int AS nbIntPrec,
          tiepmeff.nb_caid AS nbCaidPrec,
          tiepmeff.nb_alt AS nbAlterPrec,
          tiepmeff.nb_stg AS nbStagPrec
        FROM
          tiepmeff
        WHERE
          tiepmeff.year = ?
      ) AS yearPrec ON yearPrec.tiepm_id = a.tiepm_id
      `,
      [dateYear, dateFin, dateDeb, company_id, Number(dateYear) - 1]
    );

    let sujetsAccEM = await db.raw(
      `
      SELECT
          unique_individuals.SujetAccSuivi AS "Sujet",
          COUNT(unique_individuals.SujetAccSuivi) AS "Nb Sujet",
          CONCAT(
            FLOOR(SUM(TIME_TO_SEC(unique_individuals.hour_end) - TIME_TO_SEC(unique_individuals.hour_begin)) / 3600), 'h', 
            LPAD(FLOOR((SUM(TIME_TO_SEC(unique_individuals.hour_end) - TIME_TO_SEC(unique_individuals.hour_begin)) % 3600) / 60), 2, '0'), 'm'
        ) AS "Total Interview Time (HHhMM)"
      FROM (
          SELECT DISTINCT
              tieppaccsuivi.tiepp_id, 
              sujets_accompagnements_params.name as SujetAccSuivi,
              tieppaccsuivi.hour_end,
              tieppaccsuivi.hour_begin
          FROM 
            tieppaccsuivi
          LEFT JOIN 
            sujets_accompagnements_params ON sujets_accompagnements_params.sujet_accompagnement_id = tieppaccsuivi.sujet_accompagnement_id
          LEFT JOIN 
            tieformpp ON tieformpp.tiepp_id = tieppaccsuivi.tiepp_id
          LEFT JOIN
            tiepp ON tiepp.tiepp_id = tieppaccsuivi.tiepp_id
          WHERE 
              tieformpp.date_debut_formule <= ? AND
              (tieformpp.date_fin_formule >= ? OR tieformpp.date_fin_formule IS NULL OR tieformpp.date_fin_formule = '') AND
              tieformpp.formule_id = 5 AND
              tieppaccsuivi.sujet_accompagnement_id IS NOT NULL AND
              tiepp.company_id = ? AND
              tieppaccsuivi.typ_accompagnement_id = 1
      ) AS unique_individuals
      GROUP BY 
        unique_individuals.SujetAccSuivi;
      `,
      [dateFin, dateDeb, company_id]
    );

    const emploisCreatedByTypesEM = emploisYearEM[0].reduce(
      (acc: any, cur: any) => {
        acc["cdi"] += cur["diffnbCdi"];
        acc["cdd"] += cur["diffnbCdd"];
        acc["int"] += cur["diffnbInt"];
        acc["aid"] += cur["diffnbCaid"];
        acc["alter"] += cur["diffnbAlter"];
        acc["stag"] += cur["diffnbStag"];
        return acc;
      },
      { cdi: 0, cdd: 0, int: 0, aid: 0, alter: 0, stag: 0 }
    );

    const totalEmploisCreatedByTypesEM =
      emploisCreatedByTypesEM["cdi"] +
      emploisCreatedByTypesEM["cdd"] +
      emploisCreatedByTypesEM["int"] +
      emploisCreatedByTypesEM["aid"] +
      emploisCreatedByTypesEM["alter"] +
      emploisCreatedByTypesEM["stag"];

    setCell(`N9`, "Nombre", "s", boldAlignedStyle);
    setCell(`O9`, "%", "s", boldAlignedStyle);
    setCell(`K10`, `Détail des emplois créés en`, "s", boldAlignedStyle);
    setCell(`L10`, `Détail des emplois créés en`, "s", boldAlignedStyle);
    setCell(`M10`, `${dateYear}`, "s", {
      font: { bold: true, color: { rgb: "FF0000" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "black" } },
        bottom: { style: "thin", color: { rgb: "black" } },
        left: { style: "thin", color: { rgb: "black" } },
      },
    });
    setCell("N10", totalEmploisCreatedByTypesEM, "n", boldAlignedStyle);
    setCell("O10", "100%", "s", boldAlignedStyle);
    setCell("K11", "Dont", "s", AlignedStyle);
    setCell("K12", "Dont", "s", AlignedStyle);
    setCell("K13", "Dont", "s", AlignedStyle);
    setCell("K14", "Dont", "s", AlignedStyle);
    setCell("K15", "Dont", "s", AlignedStyle);
    setCell("K16", "Dont", "s", AlignedStyle);
    setCell("L11", `CDI`, "s", AlignedStyle);
    setCell("L12", `CDD`, "s", AlignedStyle);
    setCell("L13", `Contrat aidé`, "s", AlignedStyle);
    setCell("L14", `Intérim`, "s", AlignedStyle);
    setCell("L15", `Alternance`, "s", AlignedStyle);
    setCell("L16", `Stagiaire`, "s", AlignedStyle);
    setCell("M11", `CDI`, "s", AlignedStyle);
    setCell("M12", `CDD`, "s", AlignedStyle);
    setCell("M13", `Contrat aidé`, "s", AlignedStyle);
    setCell("M14", `Intérim`, "s", AlignedStyle);
    setCell("M15", `Alternance`, "s", AlignedStyle);
    setCell("M16", `Stagiaire`, "s", AlignedStyle);
    setCell("N11", emploisCreatedByTypesEM["cdi"], "s", AlignedStyle);
    setCell("N12", emploisCreatedByTypesEM["cdd"], "s", AlignedStyle);
    setCell("N13", emploisCreatedByTypesEM["aid"], "s", AlignedStyle);
    setCell("N14", emploisCreatedByTypesEM["int"], "s", AlignedStyle);
    setCell("N15", emploisCreatedByTypesEM["alter"], "s", AlignedStyle);
    setCell("N16", emploisCreatedByTypesEM["stag"], "s", AlignedStyle);
    setCell(
      "O11",
      `${Math.round(
        (emploisCreatedByTypesEM["cdi"] / totalEmploisCreatedByTypesEM) * 100
      )}%`,
      "s",
      AlignedStyle
    );
    setCell(
      "O12",
      `${Math.round(
        (emploisCreatedByTypesEM["cdd"] / totalEmploisCreatedByTypesEM) * 100
      )}%`,
      "s",
      AlignedStyle
    );
    setCell(
      "O13",
      `${Math.round(
        (emploisCreatedByTypesEM["aid"] / totalEmploisCreatedByTypesEM) * 100
      )}%`,
      "s",
      AlignedStyle
    );
    setCell(
      "O14",
      `${Math.round(
        (emploisCreatedByTypesEM["int"] / totalEmploisCreatedByTypesEM) * 100
      )}%`,
      "s",
      AlignedStyle
    );
    setCell(
      "O15",
      `${Math.round(
        (emploisCreatedByTypesEM["alter"] / totalEmploisCreatedByTypesEM) * 100
      )}%`,
      "s",
      AlignedStyle
    );
    setCell(
      "O16",
      `${Math.round(
        (emploisCreatedByTypesEM["stag"] / totalEmploisCreatedByTypesEM) * 100
      )}%`,
      "s",
      AlignedStyle
    );

    row = 19;

    const resultsSujetsAccEM = sujetsAccEM[0];

    function parseTimeToMinutes(timeStr: any) {
      const pattern = /(-?\d+)h\s*(-?\d+)m/;
      const matches = timeStr.match(pattern);
      if (!matches) return 0;

      const hours = parseInt(matches[1], 10);
      const minutes = parseInt(matches[2], 10);
      return hours * 60 + minutes;
    }

    function formatTimeFromMinutes(totalMinutes: any) {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = Math.abs(totalMinutes % 60);
      return `${hours}h${minutes.toString().padStart(2, "0")}m`;
    }

    function sumInterviewTimes(data: any) {
      const totalMinutes = data.reduce((sum: any, record: any) => {
        return sum + parseTimeToMinutes(record["Total Interview Time (HHhMM)"]);
      }, 0);

      return formatTimeFromMinutes(totalMinutes);
    }

    function computeAverageTime(data: any) {
      let totalWeightedMinutes = 0;
      let totalSubjects = 0;

      data.forEach((record: any) => {
        const timeInMinutes = parseTimeToMinutes(
          record["Total Interview Time (HHhMM)"]
        );
        const numSubjects = record["Nb Sujet"];

        totalWeightedMinutes += timeInMinutes * numSubjects;
        totalSubjects += numSubjects;
      });

      // Calculate average in minutes
      const averageMinutes =
        totalSubjects > 0 ? Math.round(totalWeightedMinutes / totalSubjects) : 0;

      return formatTimeFromMinutes(averageMinutes);
    }

    const totalTimeEntretiensPep = sumInterviewTimes(resultsSujetsAccEM);
    const avgEntretiensPep = computeAverageTime(resultsSujetsAccEM);

    const nbTotalEntretiensEM = resultsSujetsAccEM.reduce(
      (acc: any, cur: any) => {
        acc += cur["Nb Sujet"];
        return acc;
      },
      0
    );

    row += 1;
    setCell(`K${row}`, "Sujet des entretiens", "s", boldAlignedStyle);
    setCell(`L${row}`, "Nombre", "s", boldAlignedStyle);
    setCell(`M${row}`, "%", "s", boldAlignedStyle);
    row += 1;
    resultsSujetsAccEM.forEach((item: any) => {
      setCell(`K${row}`, `${item["Sujet"]}`, "s", AlignedStyle);
      setCell(`L${row}`, `${item["Nb Sujet"]}`, "s", AlignedStyle);
      setCell(
        `M${row}`,
        `${Math.round((item["Nb Sujet"] / nbTotalEntretiensEM) * 100)}%`,
        "s",
        AlignedStyle
      );
      row += 1;
    });
    setCell(`K${row}`, `Total des entretiens`, "s", boldAlignedStyle);
    setCell(`L${row}`, `${nbTotalEntretiensEM}`, "s", boldAlignedStyle);
    setCell(`M${row}`, "%", "s", boldAlignedStyle);
    row += 1;
    setCell(`K${row}`, `Total horaire`, "s", boldAlignedStyle);
    setCell(`L${row}`, `${totalTimeEntretiensPep}`, "s", boldAlignedStyle);
    row += 1;
    setCell(
      `K${row}`,
      `Moyenne horaire par bénéficiare`,
      "s",
      boldAlignedStyle
    );
    setCell(`L${row}`, `${avgEntretiensPep}`, "s", boldAlignedStyle);

    //sujets des actions collectives
    let sujetsActColEM = await db.raw(
      `
      SELECT
          unique_individuals.SujetAccSuivi AS "Sujet",
          COUNT(unique_individuals.SujetAccSuivi) AS "Nb Sujet"
      FROM (
          SELECT DISTINCT 
              tieppaccsuivi.tiepp_id, 
              sujets_accompagnements_params.name AS SujetAccSuivi
          FROM 
            tieppaccsuivi
          LEFT JOIN 
            tieformpp ON tieformpp.tiepp_id = tieppaccsuivi.tiepp_id
          LEFT JOIN 
              sujets_accompagnements_params ON sujets_accompagnements_params.sujet_accompagnement_id = tieppaccsuivi.sujet_accompagnement_id
          LEFT JOIN
            tiepp ON tiepp.tiepp_id = tieppaccsuivi.tiepp_id
          WHERE 
              tieformpp.date_debut_formule <= ? 
              AND
              (tieformpp.date_fin_formule >= ? OR tieformpp.date_fin_formule IS NULL) 
              AND
              tieformpp.formule_id = 5
              AND
              tieppaccsuivi.sujet_accompagnement_id IS NOT NULL 
              AND
              tieppaccsuivi.typ_accompagnement_id = 2 
              AND
                tiepp.company_id = ?
      ) AS unique_individuals
      GROUP BY 
          unique_individuals.SujetAccSuivi;
      `,
      [dateFin, dateDeb, company_id]
    );

    let personsActColEM = await db.raw(
      `
      SELECT
          COUNT(unique_individuals.tiepp_id) AS "Nb entrepreneurs"
      FROM (
          SELECT DISTINCT 
              tieppaccsuivi.tiepp_id
          FROM 
            tieppaccsuivi
          LEFT JOIN
            tiepp ON tiepp.tiepp_id = tieppaccsuivi.tiepp_id
          LEFT JOIN 
            tieformpp ON tieformpp.tiepp_id = tieppaccsuivi.tiepp_id
          WHERE 
              tieformpp.date_debut_formule <= ? 
              AND
              (tieformpp.date_fin_formule >= ? OR tieformpp.date_fin_formule IS NULL) 
              AND
              tieformpp.formule_id = 5
              AND
              tieppaccsuivi.sujet_accompagnement_id IS NOT NULL 
              AND
              tieppaccsuivi.typ_accompagnement_id = 2 
              AND
                tiepp.company_id = ?
      ) AS unique_individuals
      `,
      [dateFin, dateDeb, company_id]
    );

    const resultsSujetsActColEM = sujetsActColEM[0];

    const nbTotalActColPep = resultsSujetsActColEM.reduce(
      (acc: any, cur: any) => {
        acc += cur["Nb Sujet"];
        return acc;
      },
      0
    );

    row += 3;
    setCell(`K${row}`, "Sujet des actions collectives", "s", boldAlignedStyle);
    setCell(`L${row}`, "Nombre", "s", boldAlignedStyle);
    setCell(`M${row}`, "%", "s", boldAlignedStyle);
    row += 1;
    resultsSujetsActColEM.forEach((item: any) => {
      setCell(`K${row}`, `${item["Sujet"]}`, "s", AlignedStyle);
      setCell(`L${row}`, `${item["Nb Sujet"]}`, "s", AlignedStyle);
      setCell(
        `M${row}`,
        `${Math.round((item["Nb Sujet"] / nbTotalActColPep) * 100)}%`,
        "s",
        AlignedStyle
      );
      row += 1;
    });
    setCell(
      `K${row}`,
      `Total des entrepreneurs ayant accédé à une action collective`,
      "s",
      boldAlignedStyle
    );
    setCell(
      `L${row}`,
      `${personsActColEM[0][0]["Nb entrepreneurs"]}`,
      "s",
      boldAlignedStyle
    );
    setCell(`M${row}`, `100%`, "s", boldAlignedStyle);

    worksheet["!ref"] = "A1:Z100"; // worksheet range

    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 14 } }, // A1 to L1

      { s: { r: 2, c: 0 }, e: { r: 2, c: 14 } }, // G3 to L3
      { s: { r: 3, c: 0 }, e: { r: 3, c: 14 } }, // A6 to E6

      //Titles
      { s: { r: 6, c: 0 }, e: { r: 6, c: 2 } }, // A6 to E6
      { s: { r: 6, c: 4 }, e: { r: 6, c: 8 } }, // G6 to E6
      { s: { r: 6, c: 10 }, e: { r: 6, c: 14 } }, // G6 to E6

      { s: { r: 9, c: 10 }, e: { r: 9, c: 11 } }, // A6 to E6
      { s: { r: 10, c: 10 }, e: { r: 15, c: 10 } }, // G6 to E6
      { s: { r: 10, c: 11 }, e: { r: 10, c: 12 } }, // A6 to E6
      { s: { r: 11, c: 11 }, e: { r: 11, c: 12 } }, // A6 to E6
      { s: { r: 12, c: 11 }, e: { r: 12, c: 12 } }, // A6 to E6
      { s: { r: 13, c: 11 }, e: { r: 13, c: 12 } }, // A6 to E6
      { s: { r: 14, c: 11 }, e: { r: 14, c: 12 } }, // A6 to E6
      { s: { r: 15, c: 11 }, e: { r: 15, c: 12 } }, // A6 to E6
    ]; // Merging cells

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "BILAN Extra-Muros");

    //Etat de présence
    const worksheetPresence = {} as any;

    function setCellPresence(cellRef: any, value: any, type: any, style: any) {
      worksheetPresence[cellRef] = { t: type, v: value, s: style };
    }

    let presence = await db.raw(
      `
      SELECT
        tiepp.tiepp_id,
        CONCAT(COALESCE(tiepp.first_name, ''), ' ', COALESCE(tiepp.surname, '')) AS libelle,
        GROUP_CONCAT(DISTINCT tiepm.raison_sociale SEPARATOR ' - ') AS "Entreprise(s)",
        tieformpp.date_debut_formule,
        tieformpp.date_fin_formule,        
        COUNT(DISTINCT CASE WHEN MONTH(tieppaccsuivi.date_acc_suivi) = 1 THEN tieppaccsuivi.date_acc_suivi ELSE NULL END) AS "Janvier",
        COUNT(DISTINCT CASE WHEN MONTH(tieppaccsuivi.date_acc_suivi) = 2 THEN tieppaccsuivi.date_acc_suivi ELSE NULL END) AS "Février",
        COUNT(DISTINCT CASE WHEN MONTH(tieppaccsuivi.date_acc_suivi) = 3 THEN tieppaccsuivi.date_acc_suivi ELSE NULL END) AS "Mars",
        COUNT(DISTINCT CASE WHEN MONTH(tieppaccsuivi.date_acc_suivi) = 4 THEN tieppaccsuivi.date_acc_suivi ELSE NULL END) AS "Avril",
        SUM(CASE WHEN MONTH(tieppaccsuivi.date_acc_suivi) = 5 THEN 1 ELSE 0 END) AS "Mai",
        SUM(CASE WHEN MONTH(tieppaccsuivi.date_acc_suivi) = 6 THEN 1 ELSE 0 END) AS "Juin",
        SUM(CASE WHEN MONTH(tieppaccsuivi.date_acc_suivi) = 7 THEN 1 ELSE 0 END) AS "Juillet",
        SUM(CASE WHEN MONTH(tieppaccsuivi.date_acc_suivi) = 8 THEN 1 ELSE 0 END) AS "Août",
        SUM(CASE WHEN MONTH(tieppaccsuivi.date_acc_suivi) = 9 THEN 1 ELSE 0 END) AS "Septembre",
        SUM(CASE WHEN MONTH(tieppaccsuivi.date_acc_suivi) = 10 THEN 1 ELSE 0 END) AS "Octobre",
        SUM(CASE WHEN MONTH(tieppaccsuivi.date_acc_suivi) = 11 THEN 1 ELSE 0 END) AS "Novembre",
        SUM(CASE WHEN MONTH(tieppaccsuivi.date_acc_suivi) = 12 THEN 1 ELSE 0 END) AS "Décembre",
        COUNT(DISTINCT tieppaccsuivi.date_acc_suivi) AS "Nb entretiens",
        CONCAT(
          FLOOR(SUM(TIME_TO_SEC(tieppaccsuivi.hour_end) - TIME_TO_SEC(tieppaccsuivi.hour_begin)) / 3600), 'h', 
          LPAD(FLOOR((SUM(TIME_TO_SEC(tieppaccsuivi.hour_end) - TIME_TO_SEC(tieppaccsuivi.hour_begin)) % 3600) / 60), 2, '0'), 'm'
        ) AS "Total Interview Time (HHhMM)"      
      FROM
        tiepp
      LEFT JOIN
        tieformpp ON tiepp.tiepp_id = tieformpp.tiepp_id
      LEFT JOIN 
        tierel ON tiepp.tiepp_id = tierel.tiepp_id
      LEFT JOIN 
        tiepm ON tiepm.tiepm_id = tierel.tiepm_id
      LEFT JOIN 
        tieppprj ON tieppprj.tiepp_id = tiepp.tiepp_id
      LEFT JOIN 
        tieppaccsuivi ON tieppaccsuivi.tiepp_id = tiepp.tiepp_id
      WHERE 
        tieformpp.formule_id = 5
        AND tieformpp.date_debut_formule <= ? 
        AND (tieformpp.date_fin_formule >= ? OR tieformpp.date_fin_formule IS NULL) 
        AND tieppaccsuivi.typ_accompagnement_id = 1
        AND tieppaccsuivi.date_acc_suivi >= tieformpp.date_debut_formule
        AND (tieppaccsuivi.date_acc_suivi <= tieformpp.date_fin_formule OR tieformpp.date_fin_formule IS NULL)
        AND tiepp.company_id = ?
      GROUP BY
        tiepp.tiepp_id,
        tiepp.first_name,
        tiepp.surname,
        tieformpp.date_debut_formule,
        tieformpp.date_fin_formule;
      `,
      [dateFin, dateDeb, company_id]
    );

    setCellPresence("A1", "Accompagnement Extra-Muros", "s", {
      font: { bold: true },
      alignment: { horizontal: "center", vertical: "center" },
      fill: {
        fgColor: { rgb: "8cace0" }, // Yellow color, specified as RGB hex
        patternType: "solid", // This is the pattern type for the fill
      },
      border: {
        top: { style: "medium", color: { rgb: "black" } }, // Black color for top border
        bottom: { style: "medium", color: { rgb: "black" } }, // Black color for bottom border
        left: { style: "medium", color: { rgb: "black" } }, // Black color for left border
      },
    });
    for (let letter of [
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
    ]) {
      setCellPresence(`${letter}1`, "Accompagnement Extra-Muros", "s", {
        border: {
          top: { style: "medium", color: { rgb: "black" } },
          bottom: { style: "medium", color: { rgb: "black" } }, // Black color for bottom border
          right: { style: "medium", color: { rgb: "black" } },
        },
      });
    }

    row = 4;

    let resultsPresence = presence[0];

    setCellPresence(`A${row - 1}`, `Extra-Muros`, "s", boldAlignedStyle);
    setCellPresence(`B${row - 1}`, `Extra-Muros`, "s", boldAlignedStyle);
    setCellPresence(`C${row - 1}`, `Extra-Muros`, "s", boldAlignedStyle);
    setCellPresence(`D${row - 1}`, `Extra-Muros`, "s", boldAlignedStyle);
    setCellPresence(`E${row - 1}`, `Extra-Muros`, "s", boldAlignedStyle);

    setCellPresence(
      `F${row - 1}`,
      `Nombre d'entretiens`,
      "s",
      boldAlignedStyle
    );
    setCellPresence(
      `G${row - 1}`,
      `Nombre d'entretiens`,
      "s",
      boldAlignedStyle
    );
    setCellPresence(
      `H${row - 1}`,
      `Nombre d'entretiens`,
      "s",
      boldAlignedStyle
    );
    setCellPresence(
      `I${row - 1}`,
      `Nombre d'entretiens`,
      "s",
      boldAlignedStyle
    );
    setCellPresence(
      `J${row - 1}`,
      `Nombre d'entretiens`,
      "s",
      boldAlignedStyle
    );
    setCellPresence(
      `K${row - 1}`,
      `Nombre d'entretiens`,
      "s",
      boldAlignedStyle
    );
    setCellPresence(
      `L${row - 1}`,
      `Nombre d'entretiens`,
      "s",
      boldAlignedStyle
    );
    setCellPresence(
      `M${row - 1}`,
      `Nombre d'entretiens`,
      "s",
      boldAlignedStyle
    );
    setCellPresence(
      `N${row - 1}`,
      `Nombre d'entretiens`,
      "s",
      boldAlignedStyle
    );
    setCellPresence(
      `O${row - 1}`,
      `Nombre d'entretiens`,
      "s",
      boldAlignedStyle
    );
    setCellPresence(
      `P${row - 1}`,
      `Nombre d'entretiens`,
      "s",
      boldAlignedStyle
    );
    setCellPresence(
      `Q${row - 1}`,
      `Nombre d'entretiens`,
      "s",
      boldAlignedStyle
    );
    setCellPresence(
      `R${row - 1}`,
      `Nombre d'entretiens`,
      "s",
      boldAlignedStyle
    );
    setCellPresence(`S${row - 1}`, `Total horaire`, "s", boldAlignedStyle);

    setCellPresence(`A${row}`, `ID`, "s", boldAlignedStyle);
    setCellPresence(`B${row}`, `Libellé`, "s", boldAlignedStyle);
    setCellPresence(`C${row}`, `Enteprise(s)`, "s", boldAlignedStyle);
    setCellPresence(
      `D${row}`,
      `Date d'entrée pépinière`,
      "s",
      boldAlignedStyle
    );
    setCellPresence(
      `E${row}`,
      `Date de sortie pépinière`,
      "s",
      boldAlignedStyle
    );
    setCellPresence(`F${row}`, `Janvier`, "s", boldAlignedStyle);
    setCellPresence(`G${row}`, `Février`, "s", boldAlignedStyle);
    setCellPresence(`H${row}`, `Mars`, "s", boldAlignedStyle);
    setCellPresence(`I${row}`, `Avril`, "s", boldAlignedStyle);
    setCellPresence(`J${row}`, `Mai`, "s", boldAlignedStyle);
    setCellPresence(`K${row}`, `Juin`, "s", boldAlignedStyle);
    setCellPresence(`L${row}`, `Juillet`, "s", boldAlignedStyle);
    setCellPresence(`M${row}`, `Août`, "s", boldAlignedStyle);
    setCellPresence(`N${row}`, `Septembre`, "s", boldAlignedStyle);
    setCellPresence(`O${row}`, `Octobre`, "s", boldAlignedStyle);
    setCellPresence(`P${row}`, `Novembre`, "s", boldAlignedStyle);
    setCellPresence(`Q${row}`, `Décembre`, "s", boldAlignedStyle);
    setCellPresence(`R${row}`, `Total`, "s", boldAlignedStyle);
    setCellPresence(
      `S${row}`,
      `Durée en heures et minutes`,
      "s",
      boldAlignedStyle
    );

    row += 1;
    resultsPresence.forEach((item: any, index: any) => {
      setCellPresence(`A${row + index}`, `${item["tiepp_id"]}`, "s", AlignedStyle);
      setCellPresence(`B${row + index}`, `${item["libelle"]}`, "s", AlignedStyle);
      setCellPresence(
        `C${row + index}`,
        `${item["Entreprise(s)"]}`,
        "s",
        AlignedStyle
      );
      setCellPresence(
        `D${row + index}`,
        `${item["date_debut_formule"]}`,
        "s",
        AlignedStyle
      );
      setCellPresence(
        `E${row + index}`,
        `${item["date_fin_formule"]}`,
        "s",
        AlignedStyle
      );
      setCellPresence(
        `F${row + index}`,
        `${item["Janvier"]}`,
        "s",
        AlignedStyle
      );
      setCellPresence(
        `G${row + index}`,
        `${item["Février"]}`,
        "s",
        AlignedStyle
      );
      setCellPresence(`H${row + index}`, `${item["Mars"]}`, "s", AlignedStyle);
      setCellPresence(`I${row + index}`, `${item["Avril"]}`, "s", AlignedStyle);
      setCellPresence(`J${row + index}`, `${item["Mai"]}`, "s", AlignedStyle);
      setCellPresence(`K${row + index}`, `${item["Juin"]}`, "s", AlignedStyle);
      setCellPresence(
        `L${row + index}`,
        `${item["Juillet"]}`,
        "s",
        AlignedStyle
      );
      setCellPresence(`M${row + index}`, `${item["Août"]}`, "s", AlignedStyle);
      setCellPresence(
        `N${row + index}`,
        `${item["Septembre"]}`,
        "s",
        AlignedStyle
      );
      setCellPresence(
        `O${row + index}`,
        `${item["Octobre"]}`,
        "s",
        AlignedStyle
      );
      setCellPresence(
        `P${row + index}`,
        `${item["Novembre"]}`,
        "s",
        AlignedStyle
      );
      setCellPresence(
        `Q${row + index}`,
        `${item["Décembre"]}`,
        "s",
        AlignedStyle
      );
      setCellPresence(
        `R${row + index}`,
        `${item["Nb entretiens"]}`,
        "s",
        AlignedStyle
      );
      setCellPresence(
        `S${row + index}`,
        `${item["Total Interview Time (HHhMM)"]}`,
        "s",
        AlignedStyle
      );
    });

    // setCellEmplois(`A${cellTotal}`, `Total`, 's', AlignedStyle)
    // setCellEmplois(`D${cellTotal}`, `${totalCa}`, 's', AlignedStyle)

    worksheetPresence["!ref"] = "A1:Z500"; // worksheet range

    worksheetPresence["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 18 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 4 } },
      { s: { r: 2, c: 5 }, e: { r: 2, c: 17 } },
      // { s: { r: cellTotal - 1, c: 0 }, e: { r: cellTotal - 1, c: 2} },
    ]; // Merging cells

    XLSX.utils.book_append_sheet(
      workbook,
      worksheetPresence,
      "Etat de présence"
    );

    //Sujet Entretiens table
    const worksheetFormPep = {} as any;

    function setCellFormPep(cellRef: any, value: any, type: any, style: any) {
      worksheetFormPep[cellRef] = { t: type, v: value, s: style };
    }

    let formPep = await db.raw(
      `
      SELECT
        tieppaccsuivi.tiepp_id,
        CONCAT(COALESCE(tiepp.first_name, ''), ' ', COALESCE(tiepp.surname, '')) AS libelle,
        tieformpp.date_debut_formule,
        tieformpp.date_fin_formule,        
        GROUP_CONCAT(sujets_accompagnements_params.name SEPARATOR '-') AS "Sujet(s)"
      FROM
        tieppaccsuivi
      LEFT JOIN
        tiepp ON tiepp.tiepp_id = tieppaccsuivi.tiepp_id
      LEFT JOIN
        tieformpp ON tieformpp.tiepp_id = tiepp.tiepp_id
      LEFT JOIN 
          sujets_accompagnements_params ON sujets_accompagnements_params.sujet_accompagnement_id = tieppaccsuivi.sujet_accompagnement_id
      WHERE 
        tieformpp.formule_id = 5
        AND
        tieformpp.date_debut_formule <= ? 
        AND
        (tieformpp.date_fin_formule >= ? OR tieformpp.date_fin_formule IS NULL) 
        AND
        tieppaccsuivi.typ_accompagnement_id = 1
        AND
        tieppaccsuivi.date_acc_suivi >= tieformpp.date_debut_formule
        AND 
        (tieppaccsuivi.date_acc_suivi <= tieformpp.date_fin_formule OR tieformpp.date_fin_formule IS NULL)
        AND
        tiepp.company_id = ?
      GROUP BY
      tieppaccsuivi.tiepp_id,
          tiepp.first_name,
          tiepp.surname,
          tieformpp.date_debut_formule,
          tieformpp.date_fin_formule
      `,
      [dateFin, dateDeb, company_id]
    );

    let formPepCompanies = await db.raw(
      `
      SELECT
        tiepp.tiepp_id,
        GROUP_CONCAT(DISTINCT tiepm.raison_sociale SEPARATOR '-') AS "Entreprise(s)"
      FROM
        tiepp
      LEFT JOIN
        tieformpp ON tiepp.tiepp_id = tieformpp.tiepp_id
      LEFT JOIN 
        tierel ON tiepp.tiepp_id = tierel.tiepp_id
      LEFT JOIN 
        tiepm ON tiepm.tiepm_id = tierel.tiepm_id
      LEFT JOIN 
        tieppaccsuivi ON tieppaccsuivi.tiepp_id = tiepp.tiepp_id
      WHERE 
        tieformpp.formule_id = 5
        AND
        tieformpp.date_debut_formule <= ? 
        AND
        (tieformpp.date_fin_formule >= ? OR tieformpp.date_fin_formule IS NULL) 
        AND
        tieppaccsuivi.typ_accompagnement_id = 1
        AND
        tieppaccsuivi.date_acc_suivi >= tieformpp.date_debut_formule
        AND 
        (tieppaccsuivi.date_acc_suivi <= tieformpp.date_fin_formule OR tieformpp.date_fin_formule IS NULL)
        AND
        tiepp.company_id = ?
      GROUP BY
        tiepp.tiepp_id
      `,
      [dateFin, dateDeb, company_id]
    );

    const idCompanies = formPepCompanies[0].reduce((acc: any, cur: any) => {
      acc[cur["tiepp_id"]] = cur["Entreprise(s)"];
      return acc;
    }, {});

    setCellFormPep("A1", "Accompagnement Extra-Muros", "s", {
      font: { bold: true },
      alignment: { horizontal: "center", vertical: "center" },
      fill: {
        fgColor: { rgb: "8cace0" }, // Yellow color, specified as RGB hex
        patternType: "solid", // This is the pattern type for the fill
      },
      border: {
        top: { style: "medium", color: { rgb: "black" } }, // Black color for top border
        bottom: { style: "medium", color: { rgb: "black" } }, // Black color for bottom border
        left: { style: "medium", color: { rgb: "black" } }, // Black color for left border
      },
    });
    for (let letter of [
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
    ]) {
      setCellFormPep(`${letter}1`, "Accompagnement Extra-Muros", "s", {
        border: {
          top: { style: "medium", color: { rgb: "black" } },
          bottom: { style: "medium", color: { rgb: "black" } }, // Black color for bottom border
          right: { style: "medium", color: { rgb: "black" } },
        },
      });
    }

    row = 4;

    let resultsFormPep = formPep[0];

    let indexColSubj = 5;
    let allSubjects = resultsFormPep.reduce((acc: any, cur: any) => {
      const splitSubj = new Set(cur["Sujet(s)"].split("-"));
      for (let subject of splitSubj) {
        if (!Object.values(acc).includes(subject)) {
          acc[indexColSubj] = subject;
          indexColSubj += 1;
        }
      }
      return acc;
    }, {});

    function indexToColumn(index: any) {
      let column = "";
      let remainder = index;
      while (remainder >= 0) {
        let mod = remainder % 26;
        column = String.fromCharCode(65 + mod) + column;
        remainder = Math.floor(remainder / 26) - 1;
      }
      return column;
    }

    function reverseDictionary(dict: any) {
      const reversed = {} as any;
      for (const key in dict) {
        const value = dict[key];
        if (reversed[value]) {
          console.error("Duplicate value found: ", value);
        } else {
          reversed[value] = key;
        }
      }
      return reversed;
    }

    function processData(data: any) {
      let output = {} as any;
      const reverseAllSubjects = reverseDictionary(allSubjects);
      const letterTotal = indexToColumn(
        Object.keys(reverseAllSubjects).length + 5
      );
      data.forEach((row: any) => {
        const subjects = row["Sujet(s)"].split("-").map((s: any) => s.trim());
        const subjectsNotAvailable = Object.keys(reverseAllSubjects).filter(
          (key) => !subjects.includes(key)
        );
        let subjectCounts = {} as any;
        if (!output[row.tiepp_id]) {
          output = { [row.tiepp_id]: [[letterTotal, subjects.length]], ...output };
        }

        subjects.forEach((subject: any) => {
          subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
        });

        subjectsNotAvailable.forEach((subject) => {
          subjectCounts[subject] = 0;
        });

        Object.keys(subjectCounts).forEach((subject, index) => {
          output[row.tiepp_id].push([
            indexToColumn(reverseAllSubjects[subject]),
            subjectCounts[subject],
          ]);
        });
      });
      return output;
    }

    const allSubjectsByIds = processData(resultsFormPep);
    const TotalIndex = JSON.stringify(Object.keys(allSubjects).length + 5);
    allSubjects = { ...allSubjects, [TotalIndex]: "Total" };

    setCellFormPep(`A${row - 1}`, `Extra-Muros`, "s", boldAlignedStyle);
    setCellFormPep(`B${row - 1}`, `Extra-Muros`, "s", boldAlignedStyle);
    setCellFormPep(`C${row - 1}`, `Extra-Muros`, "s", boldAlignedStyle);
    setCellFormPep(`D${row - 1}`, `Extra-Muros`, "s", boldAlignedStyle);
    setCellFormPep(`E${row - 1}`, `Extra-Muros`, "s", boldAlignedStyle);
    Object.entries(allSubjects).forEach(([key, value], index) => {
      const letter = indexToColumn(key);
      setCellFormPep(
        `${letter}${row - 1}`,
        `Sujets d'entretiens`,
        "s",
        boldAlignedStyle
      );
    });

    setCellFormPep(`A${row}`, `ID`, "s", boldAlignedStyle);
    setCellFormPep(`B${row}`, `Libellé`, "s", boldAlignedStyle);
    setCellFormPep(`C${row}`, `Entreprise(s)`, "s", boldAlignedStyle);
    setCellFormPep(`D${row}`, `Date d'entrée pépinière`, "s", boldAlignedStyle);
    setCellFormPep(
      `E${row}`,
      `Date de sortie pépinière`,
      "s",
      boldAlignedStyle
    );
    Object.entries(allSubjects).forEach(([key, value], index) => {
      const letter = indexToColumn(key);
      setCellFormPep(`${letter}${row}`, `${value}`, "s", boldAlignedStyle);
    });

    row += 1;
    resultsFormPep.forEach((item: any, index: any) => {
      const subjects = allSubjectsByIds[item["tiepp_id"]];
      setCellFormPep(`A${row + index}`, `${item["tiepp_id"]}`, "s", AlignedStyle);
      setCellFormPep(`B${row + index}`, `${item["libelle"]}`, "s", AlignedStyle);
      setCellFormPep(
        `C${row + index}`,
        `${idCompanies[item["tiepp_id"]]}`,
        "s",
        AlignedStyle
      );
      setCellFormPep(`D${row + index}`, `${item["date_debut_formule"]}`, "s", AlignedStyle);
      setCellFormPep(`E${row + index}`, `${item["date_fin_formule"]}`, "s", AlignedStyle);
      subjects.forEach((subject: any) => {
        setCellFormPep(
          `${subject[0]}${row + index}`,
          `${subject[1]}`,
          "s",
          AlignedStyle
        );
      });
    });

    worksheetFormPep["!ref"] = "A1:Z500"; // worksheet range

    const lengthSubjects = Object.keys(allSubjects).length + 4;
    worksheetFormPep["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 4 } },
      { s: { r: 2, c: 5 }, e: { r: 2, c: lengthSubjects } },
    ]; // Merging cells

    XLSX.utils.book_append_sheet(
      workbook,
      worksheetFormPep,
      "Sujet entretiens"
    );

    // Set headers and return the workbook as a buffer (e.g., in an Express.js response)
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "BilanExtraMuros.xlsx"
    );
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    res.end(buffer);
  } catch (e) {
    console.error(e);
    res.json(e);
  }
});

export { router as statsRouter };
