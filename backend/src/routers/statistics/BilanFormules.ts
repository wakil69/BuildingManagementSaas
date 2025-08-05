import express from "express";
import { UserRequest, verifyUser } from "../../middlewares/checkUser";
import XLSX from "xlsx-js-style";
import { db } from "../../data/db";

const router = express.Router();

router.get(
  "/download-bilan-formules",
  verifyUser,
  async (req: UserRequest, res) => {
    try {
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

      const boldAlignedStyle = {
        font: { bold: true },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "black" } },
          bottom: { style: "thin", color: { rgb: "black" } },
          left: { style: "thin", color: { rgb: "black" } },
          right: { style: "thin", color: { rgb: "black" } },
        },
      };

      const AlignedStyle = {
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "black" } },
          bottom: { style: "thin", color: { rgb: "black" } },
          left: { style: "thin", color: { rgb: "black" } },
          right: { style: "thin", color: { rgb: "black" } },
        },
      };

      const boldStyle = {
        font: { bold: true },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "medium", color: { rgb: "black" } },
          bottom: { style: "medium", color: { rgb: "black" } },
          left: { style: "medium", color: { rgb: "black" } },
          right: { style: "medium", color: { rgb: "black" } },
        },
      };

      const workbook = XLSX.utils.book_new();

      // BILAN FORMULES
      const worksheetFormules = {} as any;
      function setCellFormules(
        cellRef: any,
        value: any,
        type: any,
        style: any
      ) {
        worksheetFormules[cellRef] = { t: type, v: value, s: style };
      }

      // Define cells with content and styles #C4D79B
      setCellFormules(
        "A1",
        "Grille de synthèse des entreprises hébergées, toutes formules confondues",
        "s",
        {
          font: { bold: true },
          alignment: { horizontal: "center", vertical: "center" },
          fill: {
            fgColor: { rgb: "8cace0" },
            patternType: "solid",
          },
          border: {
            top: { style: "medium", color: { rgb: "black" } },
            bottom: { style: "medium", color: { rgb: "black" } },
            left: { style: "medium", color: { rgb: "black" } },
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
        setCellFormules(
          `${letter}1`,
          "Grille de synthèse des entreprises hébergées, toutes formules confondues",
          "s",
          {
            border: {
              top: { style: "medium", color: { rgb: "black" } },
              bottom: { style: "medium", color: { rgb: "black" } }, // Black color for bottom border
              right: { style: "medium", color: { rgb: "black" } },
            },
          }
        );
      }
      setCellFormules(
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
        setCellFormules(
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

      setCellFormules("A5", `Hébergement`, "s", boldStyle);
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
        setCellFormules(`${letter}5`, `Hébergement`, "s", boldStyle);
      }

      setCellFormules("A28", `Pérennité`, "s", boldStyle);
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
        setCellFormules(`${letter}28`, `Hébergement`, "s", boldStyle);
      }

      // Chiffre d'affaire

      setCellFormules("A32", `Chiffre d'affaires`, "s", boldStyle);
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
        setCellFormules(`${letter}32`, `Chiffre d'affaires`, "s", boldStyle);
      }

      setCellFormules("A40", `Emplois créés et dirigeants`, "s", boldStyle);
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
        setCellFormules(
          `${letter}40`,
          `Emplois créés et dirigeants`,
          "s",
          boldStyle
        );
      }

      setCellFormules("A61", `Origine géographique`, "s", boldStyle);
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
        setCellFormules(`${letter}61`, `Origine géographique`, "s", boldStyle);
      }

      // Total des entreprises hébergées en ${dateYear}
      let hostedCompaniesFormulesBilan = await db.raw(
        `
            SELECT
              SUM(CASE WHEN tieformpm.formule_id = 1 THEN 1 ELSE 0 END) AS "Nb Formule Pépinière",
              SUM(CASE WHEN tieformpm.formule_id = 3 THEN 1 ELSE 0 END) AS "Nb Formule Centre d'Affaires",
              SUM(CASE WHEN tieformpm.formule_id = 4 THEN 1 ELSE 0 END) AS " Nb Formule Coworking"
            FROM
              tieformpm
            LEFT JOIN
              tiepm ON tiepm.tiepm_id = tieformpm.tiepm_id
            WHERE 
              tieformpm.date_debut_formule <= ?
              AND
              (tieformpm.date_fin_formule >= ? OR tieformpm.date_fin_formule IS NULL)
              AND
              tieformpm.formule_id IN (1, 3, 4)
              AND
              tiepm.company_id = ?
              `,
        [dateFin, dateDeb, company_id]
      );

      let hostedCompaniesFormulesBilanFin = await db.raw(
        `
        SELECT
          SUM(CASE WHEN tieformpm.formule_id = 1 THEN 1 ELSE 0 END) AS "Nb Formule Pépinière",
          SUM(CASE WHEN tieformpm.formule_id = 3 THEN 1 ELSE 0 END) AS "Nb Formule Centre d'Affaires",
          SUM(CASE WHEN tieformpm.formule_id = 4 THEN 1 ELSE 0 END) AS " Nb Formule Coworking"
        FROM
          tieformpm
        LEFT JOIN
          tiepm ON tiepm.tiepm_id = tieformpm.tiepm_id
        WHERE 
          tieformpm.date_debut_formule <= ?
          AND
          (tieformpm.date_fin_formule > ? OR tieformpm.date_fin_formule IS NULL)
          AND
          tieformpm.formule_id = 1 OR tieformpm.formule_id = 3 OR tieformpm.formule_id = 4
          AND
          tiepm.company_id = ?
        `,
        [dateFin, `${dateYear}-12-31`, company_id]
      );

      let OutCompaniesFormulesBilan = await db.raw(
        `
        SELECT
          SUM(CASE WHEN tieformpm.formule_id = 1 THEN 1 ELSE 0 END) AS "Nb Formule Pépinière",
          SUM(CASE WHEN tieformpm.formule_id = 3 THEN 1 ELSE 0 END) AS "Nb Formule Centre d'Affaires",
          SUM(CASE WHEN tieformpm.formule_id = 4 THEN 1 ELSE 0 END) AS " Nb Formule Coworking"
        FROM
          tieformpm
        LEFT JOIN
          tiepm ON tiepm.tiepm_id = tieformpm.tiepm_id
        WHERE 
          tieformpm.date_fin_formule BETWEEN ? AND ?
          AND
          tieformpm.formule_id = 1 OR tieformpm.formule_id = 3 OR tieformpm.formule_id = 4
          AND
          tiepm.company_id = ?
        `,
        [dateDeb, dateFin, company_id]
      );

      let sorMotifCompanies = await db.raw(
        `
        SELECT
            CASE 
              WHEN motifs_sortie_pep_params.name = 'RADIATION' THEN 'Radiation'
              WHEN motifs_sortie_pep_params.name = 'LIQUIDATION' THEN 'Liquidation'
              WHEN motifs_sortie_pep_params.name = 'SOMMEIL' THEN 'Sommeil'
              ELSE 'Nouvelle implantation' 
            END AS Motif_Category,
            COUNT(*) AS "Motif de sortie" 
          FROM
            tiepmsortie
          LEFT JOIN
            motifs_sortie_pep_params ON motifs_sortie_pep_params.motif_id = tiepmsortie.motif_id
          LEFT JOIN
            tiepm ON tiepm.tiepm_id = tiepmsortie.tiepm_id
          LEFT JOIN
            tieformpm ON tieformpm.tiepm_id = tiepmsortie.tiepm_id
          WHERE 
            tiepmsortie.date_sortie BETWEEN ? AND ?
            AND
              tieformpm.formule_id IN (1, 3, 4)
            AND
            tiepm.company_id = ?
          GROUP BY
            Motif_Category`,
        [dateDeb, dateFin, company_id]
      );

      let detailSorMotifCompanies = await db.raw(
        `
        SELECT
          tiepmsortie.new_implantation AS "Nouvelle Implantation",
          COUNT(tiepmsortie.new_implantation) AS "Motif de sortie"
        FROM
          tiepmsortie
        LEFT JOIN
            motifs_sortie_pep_params ON motifs_sortie_pep_params.motif_id = tiepmsortie.motif_id
        LEFT JOIN
          tiepm ON tiepm.tiepm_id = tiepmsortie.tiepm_id
        LEFT JOIN
          tieformpm ON tieformpm.tiepm_id = tiepmsortie.tiepm_id
        WHERE 
            tiepmsortie.date_sortie BETWEEN ? AND ?
            AND
            motifs_sortie_pep_params.name = 'NOUVELLE IMPLANTATION'
            AND
            tieformpm.formule_id IN (1, 3, 4)
            AND
            tiepm.company_id = ?
        GROUP BY
          tiepmsortie.new_implantation
            `,
        [dateDeb, dateFin, company_id]
      );

      let TotalCompaniesHistory = await db.raw(
        `
        SELECT
          COUNT(tiepm.tiepm_id) AS "Total"
        FROM
          tiepm
        WHERE
          tiepm.company_id = ?
        `,
        [company_id]
      );

      let FormulesBilanByTiId = await db.raw(
        `
        SELECT
          tieformpm.tiepm_id,
          GROUP_CONCAT(tieformpm.form_pm_id ORDER BY tieformpm.form_pm_id DESC) AS formId,
          GROUP_CONCAT(formules_params.name ORDER BY tieformpm.form_pm_id DESC) AS formule
        FROM
          tieformpm
        LEFT JOIN
          formules_params ON formules_params.formule_id = tieformpm.formule_id
        LEFT JOIN
          tiepm ON tiepm.tiepm_id = tieformpm.tiepm_id
        WHERE 
          tieformpm.date_debut_formule <= ?
          AND
          (tieformpm.date_fin_formule > ? OR tieformpm.date_fin_formule IS NULL)
          AND
          tieformpm.formule_id IN (1, 3, 4)
          AND
           tiepm.company_id = ?
        GROUP BY
          tieformpm.tiepm_id
        ORDER BY
          tieformpm.tiepm_id ASC
        `,
        [dateFin, dateDeb, company_id]
      );

      let formulesBilan = FormulesBilanByTiId[0].reduce(
        (acc: any, cur: any) => {
          const formulesSplit = cur["formule"].split(",");
          if (formulesSplit.length > 1) {
            for (let i = 0; i < formulesSplit.length - 1; i++) {
              if (
                formulesSplit[i] == "CENTRE D'AFFAIRES" &&
                formulesSplit[i + 1] == "CENTRE D'AFFAIRES"
              ) {
                acc["PepToCA"] += 1;
              } else if (
                formulesSplit[i] == "CENTRE D'AFFAIRES" &&
                formulesSplit[i + 1] == "COWORKING"
              ) {
                acc["CowToPep"] += 1;
              } else if (
                formulesSplit[i] == "COWORKING" &&
                formulesSplit[i + 1] == "CENTRE D'AFFAIRES"
              ) {
                acc["PepToCow"] += 1;
              }
            }
          }
          return acc;
        },
        { PepToCow: 0, CowToPep: 0, PepToCA: 0 }
      );

      const numberTotalHostedCompaniesFormBilan =
        parseInt(hostedCompaniesFormulesBilan[0][0]["Nb Formule Pépinière"]) +
        parseInt(
          hostedCompaniesFormulesBilan[0][0]["Nb Formule Centre d'Affaires"]
        ) +
        parseInt(hostedCompaniesFormulesBilan[0][0]["Nb Formule Coworking"]);
      const numberTotalOutCompaniesFormBilan =
        parseInt(OutCompaniesFormulesBilan[0][0]["Nb Formule Pépinière"]) +
        parseInt(
          OutCompaniesFormulesBilan[0][0]["Nb Formule Centre d'Affaires"]
        ) +
        parseInt(OutCompaniesFormulesBilan[0][0]["Nb Formule Coworking"]);
      const numberTotalHostedCompaniesFormBilanFin =
        parseInt(
          hostedCompaniesFormulesBilanFin[0][0]["Nb Formule Pépinière"]
        ) +
        parseInt(
          hostedCompaniesFormulesBilanFin[0][0]["Nb Formule Centre d'Affaires"]
        ) +
        parseInt(hostedCompaniesFormulesBilanFin[0][0]["Nb Formule Coworking"]);
      const numberTotalCompaniesHistory = TotalCompaniesHistory[0][0]["Total"];

      //Total des entreprises hébergées
      setCellFormules(`D7`, "Nombre", "s", boldAlignedStyle);
      setCellFormules(`E7`, "%", "s", boldAlignedStyle);
      setCellFormules(
        `A8`,
        `Total des entreprises hébergées en`,
        "s",
        boldAlignedStyle
      );
      setCellFormules(
        `B8`,
        `Total des entreprises hébergées en`,
        "s",
        boldAlignedStyle
      );
      setCellFormules(`C8`, `${dateYear}`, "s", {
        font: { bold: true, color: { rgb: "FF0000" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "black" } }, // Black color for top border
          bottom: { style: "thin", color: { rgb: "black" } }, // Black color for bottom border
          left: { style: "thin", color: { rgb: "black" } }, // Black color for left border
        },
      });

      setCellFormules(
        "D8",
        numberTotalHostedCompaniesFormBilan,
        "n",
        boldAlignedStyle
      );
      setCellFormules("E8", "100%", "s", boldAlignedStyle);
      setCellFormules("A9", "Dont", "s", AlignedStyle);
      setCellFormules("A10", "Dont", "s", AlignedStyle);
      setCellFormules("A11", "Dont", "s", AlignedStyle);
      setCellFormules("B9", `Formules pépinières`, "s", AlignedStyle);
      setCellFormules("B10", `Formules co-working `, "s", AlignedStyle);
      setCellFormules("B11", `Formules centre d'affaires`, "s", AlignedStyle);
      setCellFormules("C9", `Formules pépinières`, "s", AlignedStyle);
      setCellFormules("C10", `Formules co-working `, "s", AlignedStyle);
      setCellFormules("C11", `Formules centre d'affaires`, "s", AlignedStyle);
      setCellFormules(
        "D9",
        hostedCompaniesFormulesBilan[0][0]["Nb Formule Pépinière"],
        "s",
        AlignedStyle
      );
      setCellFormules(
        "D10",
        hostedCompaniesFormulesBilan[0][0]["Nb Formule Centre d'Affaires"],
        "s",
        AlignedStyle
      );
      setCellFormules(
        "D11",
        hostedCompaniesFormulesBilan[0][0]["Nb Formule Coworking"],
        "s",
        AlignedStyle
      );
      setCellFormules(
        "E9",
        `${Math.round(
          (hostedCompaniesFormulesBilan[0][0]["Nb Formule Pépinière"] /
            numberTotalHostedCompaniesFormBilan) *
          100
        )}%`,
        "s",
        AlignedStyle
      );
      setCellFormules(
        "E10",
        `${Math.round(
          (hostedCompaniesFormulesBilan[0][0]["Nb Formule Centre d'Affaires"] /
            numberTotalHostedCompaniesFormBilan) *
          100
        )}%`,
        "s",
        AlignedStyle
      );
      setCellFormules(
        "E11",
        `${Math.round(
          (hostedCompaniesFormulesBilan[0][0]["Nb Formule Coworking"] /
            numberTotalHostedCompaniesFormBilan) *
          100
        )}%`,
        "s",
        AlignedStyle
      );

      //sorties par formules
      setCellFormules(`D13`, "Nombre", "s", boldAlignedStyle);
      setCellFormules(`E13`, "%", "s", boldAlignedStyle);
      setCellFormules(
        `A14`,
        `Total des entreprises sorties en`,
        "s",
        boldAlignedStyle
      );
      setCellFormules(
        `B14`,
        `Total des entreprises sorties en`,
        "s",
        boldAlignedStyle
      );
      setCellFormules(`C14`, `${dateYear}`, "s", {
        font: { bold: true, color: { rgb: "FF0000" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "black" } }, // Black color for top border
          bottom: { style: "thin", color: { rgb: "black" } }, // Black color for bottom border
          left: { style: "thin", color: { rgb: "black" } }, // Black color for left border
        },
      });
      setCellFormules(
        "D14",
        numberTotalOutCompaniesFormBilan,
        "n",
        boldAlignedStyle
      );
      setCellFormules("E14", "100%", "s", boldAlignedStyle);
      setCellFormules("A15", "Dont", "s", AlignedStyle);
      setCellFormules("A16", "Dont", "s", AlignedStyle);
      setCellFormules("A17", "Dont", "s", AlignedStyle);
      setCellFormules("B15", `Formules pépinières`, "s", AlignedStyle);
      setCellFormules("B16", `Formules co-working `, "s", AlignedStyle);
      setCellFormules("B17", `Formules centre d'affaires`, "s", AlignedStyle);
      setCellFormules("C15", `Formules pépinières`, "s", AlignedStyle);
      setCellFormules("C16", `Formules co-working `, "s", AlignedStyle);
      setCellFormules("C17", `Formules centre d'affaires`, "s", AlignedStyle);
      setCellFormules(
        "D15",
        OutCompaniesFormulesBilan[0][0]["Nb Formule Pépinière"],
        "s",
        AlignedStyle
      );
      setCellFormules(
        "D16",
        OutCompaniesFormulesBilan[0][0]["Nb Formule Centre d'Affaires"],
        "s",
        AlignedStyle
      );
      setCellFormules(
        "D17",
        OutCompaniesFormulesBilan[0][0]["Nb Formule Coworking"],
        "s",
        AlignedStyle
      );
      setCellFormules(
        "E15",
        `${Math.round(
          (OutCompaniesFormulesBilan[0][0]["Nb Formule Pépinière"] /
            numberTotalOutCompaniesFormBilan) *
          100
        )}%`,
        "s",
        AlignedStyle
      );
      setCellFormules(
        "E16",
        `${Math.round(
          (OutCompaniesFormulesBilan[0][0]["Nb Formule Centre d'Affaires"] /
            numberTotalOutCompaniesFormBilan) *
          100
        )}%`,
        "s",
        AlignedStyle
      );
      setCellFormules(
        "E17",
        `${Math.round(
          (OutCompaniesFormulesBilan[0][0]["Nb Formule Coworking"] /
            numberTotalOutCompaniesFormBilan) *
          100
        )}%`,
        "s",
        AlignedStyle
      );

      //hébergees à la fin de l'exercice
      setCellFormules(`J7`, "Nombre", "s", boldAlignedStyle);
      setCellFormules(`K7`, "%", "s", boldAlignedStyle);
      setCellFormules(
        `G8`,
        `Total des entreprises hébergées à la fin de l'exercice de`,
        "s",
        boldAlignedStyle
      );
      setCellFormules(
        `H8`,
        `Total des entreprises hébergées à la fin de l'exercice de`,
        "s",
        boldAlignedStyle
      );
      setCellFormules(`I8`, `${dateYear}`, "s", {
        font: { bold: true, color: { rgb: "FF0000" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "black" } }, // Black color for top border
          bottom: { style: "thin", color: { rgb: "black" } }, // Black color for bottom border
          left: { style: "thin", color: { rgb: "black" } }, // Black color for left border
        },
      });
      setCellFormules(
        "J8",
        numberTotalHostedCompaniesFormBilanFin,
        "n",
        boldAlignedStyle
      );
      setCellFormules("K8", "100%", "s", boldAlignedStyle);
      setCellFormules("G9", "Dont", "s", AlignedStyle);
      setCellFormules("G10", "Dont", "s", AlignedStyle);
      setCellFormules("G11", "Dont", "s", AlignedStyle);
      setCellFormules("H9", `Formules pépinières`, "s", AlignedStyle);
      setCellFormules("H10", `Formules co-working `, "s", AlignedStyle);
      setCellFormules("H11", `Formules centre d'affaires`, "s", AlignedStyle);
      setCellFormules("I9", `Formules pépinières`, "s", AlignedStyle);
      setCellFormules("I10", `Formules co-working `, "s", AlignedStyle);
      setCellFormules("I11", `Formules centre d'affaires`, "s", AlignedStyle);
      setCellFormules(
        "J9",
        hostedCompaniesFormulesBilanFin[0][0]["Nb Formule Pépinière"],
        "s",
        AlignedStyle
      );
      setCellFormules(
        "J10",
        hostedCompaniesFormulesBilanFin[0][0]["Nb Formule Centre d'Affaires"],
        "s",
        AlignedStyle
      );
      setCellFormules(
        "J11",
        hostedCompaniesFormulesBilanFin[0][0]["Nb Formule Coworking"],
        "s",
        AlignedStyle
      );
      setCellFormules(
        "K9",
        `${Math.round(
          (hostedCompaniesFormulesBilanFin[0][0]["Nb Formule Pépinière"] /
            numberTotalHostedCompaniesFormBilanFin) *
          100
        )}%`,
        "s",
        AlignedStyle
      );
      setCellFormules(
        "K10",
        `${Math.round(
          (hostedCompaniesFormulesBilanFin[0][0][
            "Nb Formule Centre d'Affaires"
          ] /
            numberTotalHostedCompaniesFormBilanFin) *
          100
        )}%`,
        "s",
        AlignedStyle
      );
      setCellFormules(
        "K11",
        `${Math.round(
          (hostedCompaniesFormulesBilanFin[0][0]["Nb Formule Coworking"] /
            numberTotalHostedCompaniesFormBilanFin) *
          100
        )}%`,
        "s",
        AlignedStyle
      );

      //detail sorties motifs

      const nbSorDetailsCompanies = sorMotifCompanies[0].reduce(
        (acc: any, cur: any) => {
          acc += cur["Motif de sortie"];
          return acc;
        },
        0
      );

      const newSorDetailsCompanies = sorMotifCompanies[0].reduce(
        (acc: any, cur: any) => {
          acc = { ...acc, [cur["Motif_Category"]]: cur["Motif de sortie"] };
          return acc;
        },
        {}
      );

      setCellFormules(`J13`, "Nombre", "s", boldAlignedStyle);
      setCellFormules(`K13`, "%", "s", boldAlignedStyle);
      setCellFormules(
        `G14`,
        `Détail des sorties des entreprises en`,
        "s",
        boldAlignedStyle
      );
      setCellFormules(
        `H14`,
        `Détail des sorties des entreprises en`,
        "s",
        boldAlignedStyle
      );
      setCellFormules(`I14`, `${dateYear}`, "s", {
        font: { bold: true, color: { rgb: "FF0000" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "black" } }, // Black color for top border
          bottom: { style: "thin", color: { rgb: "black" } }, // Black color for bottom border
          left: { style: "thin", color: { rgb: "black" } }, // Black color for left border
        },
      });
      setCellFormules("J14", nbSorDetailsCompanies, "n", boldAlignedStyle);
      setCellFormules("K14", "100%", "s", boldAlignedStyle);
      setCellFormules("G15", "Dont", "s", AlignedStyle);
      setCellFormules("G16", "Dont", "s", AlignedStyle);
      setCellFormules("G17", "Dont", "s", AlignedStyle);
      setCellFormules("G18", "Dont", "s", AlignedStyle);
      setCellFormules("H15", `Nouvelle Implantation`, "s", AlignedStyle);
      setCellFormules("H16", `Radiation`, "s", AlignedStyle);
      setCellFormules("H17", `Liquidation`, "s", AlignedStyle);
      setCellFormules("H18", `Sommeil`, "s", AlignedStyle);
      setCellFormules("I15", `Nouvelle Implantation`, "s", AlignedStyle);
      setCellFormules("I16", `Radiation`, "s", AlignedStyle);
      setCellFormules("I17", `Liquidation`, "s", AlignedStyle);
      setCellFormules("I18", `Sommeil`, "s", AlignedStyle);
      setCellFormules(
        "J15",
        newSorDetailsCompanies["Nouvelle Implantation"]
          ? newSorDetailsCompanies["Nouvelle Implantation"]
          : 0,
        "s",
        AlignedStyle
      );
      setCellFormules(
        "J16",
        newSorDetailsCompanies["Radiation"]
          ? newSorDetailsCompanies["Radiation"]
          : 0,
        "s",
        AlignedStyle
      );
      setCellFormules(
        "J17",
        newSorDetailsCompanies["Liquidation"]
          ? newSorDetailsCompanies["Liquidation"]
          : 0,
        "s",
        AlignedStyle
      );
      setCellFormules(
        "J18",
        newSorDetailsCompanies["Sommeil"]
          ? newSorDetailsCompanies["Sommeil"]
          : 0,
        "s",
        AlignedStyle
      );
      setCellFormules(
        "K15",
        `${newSorDetailsCompanies["Nouvelle Implantation"]
          ? Math.round(
            (newSorDetailsCompanies["Nouvelle Implantation"] /
              nbSorDetailsCompanies) *
            100
          )
          : 0
        }%`,
        "s",
        AlignedStyle
      );
      setCellFormules(
        "K16",
        `${newSorDetailsCompanies["Radiation"]
          ? Math.round(
            (newSorDetailsCompanies["Radiation"] / nbSorDetailsCompanies) *
            100
          )
          : 0
        }%`,
        "s",
        AlignedStyle
      );
      setCellFormules(
        "K17",
        `${newSorDetailsCompanies["Liquidation"]
          ? Math.round(
            (newSorDetailsCompanies["Liquidation"] /
              nbSorDetailsCompanies) *
            100
          )
          : 0
        }%`,
        "s",
        AlignedStyle
      );
      setCellFormules(
        "K18",
        `${newSorDetailsCompanies["Sommeil"]
          ? Math.round(
            (newSorDetailsCompanies["Sommeil"] / nbSorDetailsCompanies) *
            100
          )
          : 0
        }%`,
        "s",
        AlignedStyle
      );

      //detail des nouvelles implantations
      const nbSorMotifCompaniesNouvImp = detailSorMotifCompanies[0].reduce(
        (acc: any, cur: any) => {
          acc += cur["Motif de sortie"];
          return acc;
        },
        0
      );

      setCellFormules(
        `P14`,
        "Détail nouvelle implantation",
        "s",
        boldAlignedStyle
      );
      setCellFormules(`Q14`, "Nombre", "s", boldAlignedStyle);
      setCellFormules(`R14`, "%", "s", boldAlignedStyle);
      detailSorMotifCompanies[0].forEach((item: any, index: any) => {
        setCellFormules(
          `P${15 + index}`,
          `${item["Nouvelle Implantation"]}`,
          "s",
          AlignedStyle
        );
        setCellFormules(
          `Q${15 + index}`,
          `${item["Motif de sortie"]}`,
          "s",
          AlignedStyle
        );
        setCellFormules(
          `R${15 + index}`,
          `${Math.round(
            (item["Motif de sortie"] / nbSorMotifCompaniesNouvImp) * 100
          )}%`,
          "s",
          AlignedStyle
        );
      });

      //Total depuis le début des entreprises hébergées
      setCellFormules(
        `A20`,
        "Total des entreprises suivies depuis 2001",
        "s",
        boldAlignedStyle
      );
      setCellFormules(
        `B20`,
        "Total des entreprises suivies depuis 2001",
        "s",
        boldAlignedStyle
      );
      setCellFormules(
        `C20`,
        "Total des entreprises suivies depuis 2001",
        "s",
        boldAlignedStyle
      );
      setCellFormules(`D20`, "Nombre", "s", boldAlignedStyle);
      setCellFormules(
        `E20`,
        `${numberTotalCompaniesHistory}`,
        "s",
        boldAlignedStyle
      );

      //Total changement de formules
      const numberTotalChgtBilan = Object.entries(formulesBilan).reduce(
        (acc, [key, value]) => {
          acc += value as number;
          return acc;
        },
        0
      );
      setCellFormules(`D22`, "Nombre", "s", boldAlignedStyle);
      setCellFormules(`E22`, "%", "s", boldAlignedStyle);
      setCellFormules(
        `A23`,
        `Total des changement de formule en`,
        "s",
        boldAlignedStyle
      );
      setCellFormules(
        `B23`,
        `Total des changement de formule en`,
        "s",
        boldAlignedStyle
      );
      setCellFormules(`C23`, `${dateYear}`, "s", {
        font: { bold: true, color: { rgb: "FF0000" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "black" } }, // Black color for top border
          bottom: { style: "thin", color: { rgb: "black" } }, // Black color for bottom border
          left: { style: "thin", color: { rgb: "black" } }, // Black color for left border
        },
      });
      setCellFormules("D23", numberTotalChgtBilan, "n", boldAlignedStyle);
      setCellFormules("E23", "100%", "s", boldAlignedStyle);
      setCellFormules("A24", "Dont", "s", AlignedStyle);
      setCellFormules("A25", "Dont", "s", AlignedStyle);
      setCellFormules("A26", "Dont", "s", AlignedStyle);
      setCellFormules(
        "B24",
        `Formule Pépinière pour Formule Coworking`,
        "s",
        AlignedStyle
      );
      setCellFormules(
        "B25",
        `Formule Coworking pour Formule Pépinière`,
        "s",
        AlignedStyle
      );
      setCellFormules(
        "B26",
        `Formule Pépinière pour Formule Centre d'affaires`,
        "s",
        AlignedStyle
      );
      setCellFormules(
        "C24",
        `Formule Pépinière pour Formule Coworking`,
        "s",
        AlignedStyle
      );
      setCellFormules(
        "C25",
        `Formule Coworking pour Formule Pépinière`,
        "s",
        AlignedStyle
      );
      setCellFormules(
        "C26",
        `Formule Pépinière pour Formule Centre d'affaires`,
        "s",
        AlignedStyle
      );
      setCellFormules("D24", formulesBilan["PepToCow"], "s", AlignedStyle);
      setCellFormules("D25", formulesBilan["CowToPep"], "s", AlignedStyle);
      setCellFormules("D26", formulesBilan["PepToCA"], "s", AlignedStyle);
      setCellFormules(
        "E24",
        `${Math.round(
          (formulesBilan["PepToCow"] / numberTotalChgtBilan) * 100
        )}%`,
        "s",
        AlignedStyle
      );
      setCellFormules(
        "E25",
        `${Math.round(
          (formulesBilan["CowToPep"] / numberTotalChgtBilan) * 100
        )}%`,
        "s",
        AlignedStyle
      );
      setCellFormules(
        "E26",
        `${Math.round((formulesBilan["PepToCA"] / numberTotalChgtBilan) * 100)}%`,
        "s",
        AlignedStyle
      );

      //Pérennité à 3 ans des entreprises suivies à la pépinière
      let PerenneCompanies = await db.raw(
        `
        SELECT
          COUNT(tiepm.tiepm_id) AS "Nb perennes"
        FROM
          tieformpm
        LEFT JOIN
          tiepm ON tiepm.tiepm_id = tieformpm.tiepm_id
        LEFT JOIN
          tiepmpostpep ON tiepmpostpep.tiepm_id = tieformpm.tiepm_id
        LEFT JOIN
          tiepmsortie ON tiepmsortie.tiepm_id = tieformpm.tiepm_id
        LEFT JOIN
          motifs_sortie_pep_params ON motifs_sortie_pep_params.motif_id = tiepmsortie.motif_id
        LEFT JOIN
          statuts_post_pep_params ON statuts_post_pep_params.statut_id = tiepmpostpep.statut_id
        WHERE 
            tieformpm.date_debut_formule <= ?
            AND
            (tieformpm.date_fin_formule >= ? OR tieformpm.date_fin_formule IS NULL)
            AND
            tieformpm.formule_id IN (1, 3, 4)
            AND
            YEAR(tiepm.date_creation_company) <= ?
            AND
            (statuts_post_pep_params.name NOT IN ('RADIATION', 'LIQUIDATION'))
            AND
            (motifs_sortie_pep_params.name NOT IN ('RADIATION', 'LIQUIDATION'))
            AND 
            tiepm.company_id = ?
        `,
        [dateFin, dateDeb, Number(dateYear) - 3, company_id]
      );

      setCellFormules(
        `A30`,
        "Pérennité à 3 ans des entreprises suivies à la pépinière",
        "s",
        boldAlignedStyle
      );
      setCellFormules(
        `B30`,
        "Pérennité à 3 ans des entreprises suivies à la pépinière",
        "s",
        boldAlignedStyle
      );
      setCellFormules(
        `C30`,
        "Pérennité à 3 ans des entreprises suivies à la pépinière",
        "s",
        boldAlignedStyle
      );
      setCellFormules(
        `D30`,
        `${PerenneCompanies[0][0]["Nb perennes"]}`,
        "s",
        boldAlignedStyle
      );

      // Chiffre d'affaires

      let newCAAllFormules = await db.raw(
        `
      SELECT
        SUM(CASE WHEN formule_id = 1 THEN ca ELSE 0 END) AS "somme Pep",
        SUM(CASE WHEN formule_id = 3 THEN ca ELSE 0 END) AS "somme CA",
        SUM(CASE WHEN formule_id = 4 THEN ca ELSE 0 END) AS "somme Cow"
      FROM (
        SELECT
          a.tiepm_id,
          a.ca,
          b.formule_id,
          b.form_pm_id
        FROM
          (SELECT
            tiepmca.tiepm_id,
            MAX(tiepmca.ca) AS ca,
            MAX(tieformpm.form_pm_id) AS maxFormId
          FROM
            tiepmca
          LEFT JOIN
            tieformpm ON tiepmca.tiepm_id = tieformpm.tiepm_id
          LEFT JOIN
            tiepm ON tiepm.tiepm_id = tieformpm.tiepm_id
          WHERE
            tiepmca.year = ?
            AND tieformpm.date_debut_formule <= ?
            AND (tieformpm.date_fin_formule >= ? OR tieformpm.date_fin_formule IS NULL)
            AND tieformpm.formule_id IN (1, 3, 4)
            AND 
            tiepm.company_id = ?
          GROUP BY
            tiepmca.tiepm_id) AS a
        LEFT JOIN
          (SELECT
            tiepm_id,
            form_pm_id,
            formule_id
          FROM
            tieformpm) AS b ON a.tiepm_id = b.tiepm_id AND a.maxFormId = b.form_pm_id
      ) AS Subquery`,
        [dateYear, dateFin, dateDeb, company_id]
      );

      let prevCAAllFormules = await db.raw(
        `
        SELECT
        SUM(CASE WHEN formule_id = 1 THEN ca ELSE 0 END) AS "somme Pep",
        SUM(CASE WHEN formule_id = 3 THEN ca ELSE 0 END) AS "somme CA",
        SUM(CASE WHEN formule_id = 4 THEN ca ELSE 0 END) AS "somme Cow"
      FROM (
        SELECT
          a.tiepm_id,
          a.ca,
          b.formule_id,
          b.form_pm_id
        FROM
          (SELECT
            tiepmca.tiepm_id,
            MAX(tiepmca.ca) AS ca,
            MAX(tieformpm.form_pm_id) AS maxFormId
          FROM
            tiepmca
          LEFT JOIN
            tieformpm ON tiepmca.tiepm_id = tieformpm.tiepm_id
          LEFT JOIN
            tiepm ON tiepm.tiepm_id = tieformpm.tiepm_id
          WHERE
            tiepmca.year = ?
            AND tieformpm.date_debut_formule <= ?
            AND (tieformpm.date_fin_formule >= ? OR tieformpm.date_fin_formule IS NULL)
            AND tieformpm.formule_id IN (1, 3, 4)
            AND 
            tiepm.company_id = ?
          GROUP BY
            tiepmca.tiepm_id) AS a
        LEFT JOIN
          (SELECT
            tiepm_id,
            form_pm_id,
            formule_id
          FROM
            tieformpm) AS b ON a.tiepm_id = b.tiepm_id AND a.maxFormId = b.form_pm_id
      ) AS Subquery
        `,
        [
          Number(dateYear) - 1,
          `${Number(dateYear) - 1}-12-31`,
          `${Number(dateYear) - 1}-01-01`,
          company_id,
        ]
      );

      const comparePepFormules =
        parseFloat(newCAAllFormules[0][0]["somme Pep"]) -
        parseFloat(prevCAAllFormules[0][0]["somme Pep"]);
      const compareCowFormules =
        parseFloat(newCAAllFormules[0][0]["somme Cow"]) -
        parseFloat(prevCAAllFormules[0][0]["somme Cow"]);
      const compareCAFormules =
        parseFloat(newCAAllFormules[0][0]["somme CA"]) -
        parseFloat(prevCAAllFormules[0][0]["somme CA"]);
      const totalDiffFormulesCA =
        comparePepFormules + compareCowFormules + compareCAFormules;
      const TotalnewCAAllFormules =
        parseFloat(newCAAllFormules[0][0]["somme Pep"]) +
        parseFloat(newCAAllFormules[0][0]["somme Cow"]) +
        parseFloat(newCAAllFormules[0][0]["somme CA"]);

      setCellFormules(`D34`, "Nombre", "s", boldAlignedStyle);
      setCellFormules(`E34`, "%", "s", boldAlignedStyle);
      setCellFormules(
        `A35`,
        `Total du Chiffre d'affaire de`,
        "s",
        boldAlignedStyle
      );
      setCellFormules(
        `B35`,
        `Total du Chiffre d'affaire de`,
        "s",
        boldAlignedStyle
      );
      setCellFormules(`C35`, `${dateYear}`, "s", {
        font: { bold: true, color: { rgb: "FF0000" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "black" } }, // Black color for top border
          bottom: { style: "thin", color: { rgb: "black" } }, // Black color for bottom border
          left: { style: "thin", color: { rgb: "black" } }, // Black color for left border
        },
      });
      setCellFormules(
        "D35",
        `${TotalnewCAAllFormules} €`,
        "s",
        boldAlignedStyle
      );
      setCellFormules("E35", "100%", "s", boldAlignedStyle);
      setCellFormules("A36", "Dont", "s", AlignedStyle);
      setCellFormules("A37", "Dont", "s", AlignedStyle);
      setCellFormules("A38", "Dont", "s", AlignedStyle);
      setCellFormules("B36", `Formules pépinières`, "s", AlignedStyle);
      setCellFormules("B37", `Formules co-working `, "s", AlignedStyle);
      setCellFormules("B38", `Formules centre d'affaires`, "s", AlignedStyle);
      setCellFormules("C36", `Formules pépinières`, "s", AlignedStyle);
      setCellFormules("C37", `Formules co-working `, "s", AlignedStyle);
      setCellFormules("C38", `Formules centre d'affaires`, "s", AlignedStyle);
      setCellFormules(
        "D36",
        `${newCAAllFormules[0][0]["somme Pep"]} €`,
        "s",
        AlignedStyle
      );
      setCellFormules(
        "D37",
        `${newCAAllFormules[0][0]["somme Cow"]} €`,
        "s",
        AlignedStyle
      );
      setCellFormules(
        "D38",
        `${newCAAllFormules[0][0]["somme CA"]} €`,
        "s",
        AlignedStyle
      );
      setCellFormules(
        "E36",
        `${Math.round(
          (newCAAllFormules[0][0]["somme Pep"] / TotalnewCAAllFormules) * 100
        )}%`,
        "s",
        AlignedStyle
      );
      setCellFormules(
        "E37",
        `${Math.round(
          (newCAAllFormules[0][0]["somme Cow"] / TotalnewCAAllFormules) * 100
        )}%`,
        "s",
        AlignedStyle
      );
      setCellFormules(
        "E38",
        `${Math.round(
          (newCAAllFormules[0][0]["somme CA"] / TotalnewCAAllFormules) * 100
        )}%`,
        "s",
        AlignedStyle
      );

      setCellFormules(`J34`, "Nombre", "s", boldAlignedStyle);
      setCellFormules(`K34`, "%", "s", boldAlignedStyle);
      setCellFormules(
        `G35`,
        `Ecart du Chiffre d'affaire par rapport à l'exercice précédent`,
        "s",
        boldAlignedStyle
      );
      setCellFormules(
        `H35`,
        `Ecart du Chiffre d'affaire par rapport à l'exercice précédent`,
        "s",
        boldAlignedStyle
      );
      setCellFormules(
        `I35`,
        `Ecart du Chiffre d'affaire par rapport à l'exercice précédent`,
        "s",
        boldAlignedStyle
      );
      setCellFormules("J35", `${totalDiffFormulesCA} €`, "s", boldAlignedStyle);
      setCellFormules("K35", "100%", "s", boldAlignedStyle);
      setCellFormules("G36", "Dont", "s", AlignedStyle);
      setCellFormules("G37", "Dont", "s", AlignedStyle);
      setCellFormules("G38", "Dont", "s", AlignedStyle);
      setCellFormules("H36", `Formules pépinières`, "s", AlignedStyle);
      setCellFormules("H37", `Formules co-working `, "s", AlignedStyle);
      setCellFormules("H38", `Formules centre d'affaires`, "s", AlignedStyle);
      setCellFormules("I36", `Formules pépinières`, "s", AlignedStyle);
      setCellFormules("I37", `Formules co-working `, "s", AlignedStyle);
      setCellFormules("I38", `Formules centre d'affaires`, "s", AlignedStyle);
      setCellFormules("J36", `${comparePepFormules} €`, "s", AlignedStyle);
      setCellFormules("J37", `${compareCowFormules} €`, "s", AlignedStyle);
      setCellFormules("J38", `${compareCAFormules} €`, "s", AlignedStyle);
      setCellFormules(
        "K36",
        `${Math.round((comparePepFormules / totalDiffFormulesCA) * 100)}%`,
        "s",
        AlignedStyle
      );
      setCellFormules(
        "K37",
        `${Math.round((compareCowFormules / totalDiffFormulesCA) * 100)}%`,
        "s",
        AlignedStyle
      );
      setCellFormules(
        "K38",
        `${Math.round((compareCAFormules / totalDiffFormulesCA) * 100)}%`,
        "s",
        AlignedStyle
      );

      //Emplois créés et dirigeants

      let emploisHistory = await db.raw(
        `
        SELECT
          tiepmeff.tiepm_id,
          MAX(tiepmeff.nb_cdi) as nb_cdi,
          MAX(tiepmeff.nb_cdd) as nb_cdd,
          MAX(tiepmeff.nb_int) as nb_int,
          MAX(tiepmeff.nb_caid) as nb_caid,
          MAX(tiepmeff.nb_alt) as nb_alt,
          MAX(tiepmeff.nb_stg) as nb_stg
        FROM
          tiepmeff
        LEFT JOIN
          tiepm ON tiepm.tiepm_id = tiepmeff.tiepm_id
        WHERE
          tiepm.company_id = ?
        GROUP BY
          tiepmeff.tiepm_id
        `,
        [company_id]
      );

      let dirigeantsHistory = await db.raw(
        `
        SELECT
          relations_pm_pp_params.name,
          COUNT(tierel.rel_typ_id) as nbdirigeants
        FROM
          tierel
        LEFT JOIN
          relations_pm_pp_params ON relations_pm_pp_params.rel_typ_id = tierel.rel_typ_id
        LEFT JOIN
          tiepm ON tiepm.tiepm_id = tierel.tiepm_id
        WHERE
          tierel.rel_typ_id IS NOT NULL
          AND
          tiepm.company_id = ?
        GROUP BY
          tierel.rel_typ_id
        `,
        [company_id]
      );

      let emploisYear = await db.raw(
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
            tiepm ON tiepm.tiepm_id = tiepmeff.tiepm_id
          LEFT JOIN
            tieformpm ON tiepmeff.tiepm_id = tieformpm.tiepm_id
          WHERE
            tiepmeff.year = ?
            AND tieformpm.date_debut_formule <= ?
            AND (tieformpm.date_fin_formule >= ? OR tieformpm.date_fin_formule IS NULL)
            AND tieformpm.formule_id IN (1, 3, 4)
            AND
                tiepm.company_id = ?
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
          LEFT JOIN
            tiepm ON tiepm.tiepm_id = tiepmeff.tiepm_id
          WHERE
            tiepmeff.year = ?
            AND
            tiepm.company_id = ?
        ) AS yearPrec ON yearPrec.tiepm_id = a.tiepm_id
        `,
        [
          dateYear,
          dateFin,
          dateDeb,
          company_id,
          Number(dateYear) - 1,
          company_id,
        ]
      );

      let dirigeantsFormulesBilan = await db.raw(
        `
        SELECT
          COUNT(tieformpp.tiepp_id) AS Total,
          SUM(CASE WHEN tieformpp.formule_id = 1 THEN 1 ELSE 0 END) AS "Nb Formule Pépinière",
          SUM(CASE WHEN tieformpp.formule_id = 3 THEN 1 ELSE 0 END) AS "Nb Formule Centre d'Affaires",
          SUM(CASE WHEN tieformpp.formule_id = 4 THEN 1 ELSE 0 END) AS "Nb Formule Coworking"
        FROM
          tieformpp
        LEFT JOIN
          tierel ON tierel.tiepp_id = tieformpp.tiepp_id
        LEFT JOIN
          tiepp ON tiepp.tiepp_id = tierel.tiepp_id
        WHERE 
          tieformpp.date_debut_formule <= ?
          AND
          (tieformpp.date_fin_formule >= ? OR tieformpp.date_fin_formule IS NULL)
          AND
          tieformpp.formule_id = 1 OR tieformpp.formule_id = 3 OR tieformpp.formule_id = 4
          AND
          tierel.rel_typ_id IS NOT NULL
          AND
          tiepp.company_id = ?
        `,
        [dateFin, dateDeb, company_id]
      );

      const emploisCreatedByFormules = emploisYear[0].reduce(
        (acc: any, cur: any) => {
          if (cur["formule"] == "Formule Pépinière") {
            acc["pep"] +=
              cur["diffnbCdi"] +
              cur["diffnbInt"] +
              cur["diffnbCdd"] +
              cur["diffnbCaid"] +
              cur["diffnbAlter"] +
              cur["diffnbStag"];
          } else if (cur["formule"] == "Formule Coworking") {
            acc["cow"] +=
              cur["diffnbCdi"] +
              cur["diffnbInt"] +
              cur["diffnbCdd"] +
              cur["diffnbCaid"] +
              cur["diffnbAlter"] +
              cur["diffnbStag"];
          } else if (cur["formule"] == "Formule Centre d'Affaires") {
            acc["ca"] +=
              cur["diffnbCdi"] +
              cur["diffnbInt"] +
              cur["diffnbCdd"] +
              cur["diffnbCaid"] +
              cur["diffnbAlter"] +
              cur["diffnbStag"];
          }
          return acc;
        },
        { pep: 0, cow: 0, ca: 0 }
      );

      const totalEmploisCreatedByFormules =
        emploisCreatedByFormules["pep"] +
        emploisCreatedByFormules["cow"] +
        emploisCreatedByFormules["ca"];

      const emploisCreatedByTypes = emploisYear[0].reduce(
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

      const totalEmploisCreatedByTypes =
        emploisCreatedByTypes["cdi"] +
        emploisCreatedByTypes["cdd"] +
        emploisCreatedByTypes["int"] +
        emploisCreatedByTypes["aid"] +
        emploisCreatedByTypes["alter"] +
        emploisCreatedByTypes["stag"];

      const numberEmploisTotalHistory = emploisHistory[0].reduce(
        (acc: any, cur: any) => {
          acc +=
            cur["nb_cdi"] +
            cur["nb_int"] +
            cur["nb_cdd"] +
            cur["nb_caid"] +
            cur["nb_alt"] +
            cur["nb_stg"];
          return acc;
        },
        0
      );

      const numberDirigeantsTotalHistory = dirigeantsHistory[0].reduce(
        (acc: any, cur: any) => {
          acc += cur["nbdirigeants"];
          return acc;
        },
        0
      );

      setCellFormules(
        `A42`,
        "Emplois créés depuis 2001",
        "s",
        boldAlignedStyle
      );
      setCellFormules(
        `B42`,
        "Emplois créés depuis 2001",
        "s",
        boldAlignedStyle
      );
      setCellFormules(
        `C42`,
        "Emplois créés depuis 2001",
        "s",
        boldAlignedStyle
      );
      setCellFormules(
        `D42`,
        `${numberEmploisTotalHistory}`,
        "s",
        boldAlignedStyle
      );

      //emplois par formule
      setCellFormules(`D44`, "Nombre", "s", boldAlignedStyle);
      setCellFormules(`E44`, "%", "s", boldAlignedStyle);
      setCellFormules(`A45`, `Emplois créés en`, "s", boldAlignedStyle);
      setCellFormules(`B45`, `Emplois créés en`, "s", boldAlignedStyle);
      setCellFormules(`C45`, `${dateYear}`, "s", {
        font: { bold: true, color: { rgb: "FF0000" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "black" } }, // Black color for top border
          bottom: { style: "thin", color: { rgb: "black" } }, // Black color for bottom border
          left: { style: "thin", color: { rgb: "black" } }, // Black color for left border
        },
      });
      setCellFormules(
        "D45",
        totalEmploisCreatedByFormules,
        "n",
        boldAlignedStyle
      );
      setCellFormules("E45", "100%", "s", boldAlignedStyle);
      setCellFormules("A46", "Dont", "s", AlignedStyle);
      setCellFormules("A47", "Dont", "s", AlignedStyle);
      setCellFormules("A48", "Dont", "s", AlignedStyle);
      setCellFormules("B46", `Formule Pépinière`, "s", AlignedStyle);
      setCellFormules("B47", `Formule Coworking`, "s", AlignedStyle);
      setCellFormules("B48", `Formule Centre d'affaires`, "s", AlignedStyle);
      setCellFormules("C46", `Formule Pépinière`, "s", AlignedStyle);
      setCellFormules("C47", `Formule Coworking`, "s", AlignedStyle);
      setCellFormules("C48", `Formule Centre d'affaires`, "s", AlignedStyle);
      setCellFormules(
        "D46",
        emploisCreatedByFormules["pep"],
        "s",
        AlignedStyle
      );
      setCellFormules(
        "D47",
        emploisCreatedByFormules["cow"],
        "s",
        AlignedStyle
      );
      setCellFormules("D48", emploisCreatedByFormules["ca"], "s", AlignedStyle);
      setCellFormules(
        "E46",
        `${Math.round(
          (emploisCreatedByFormules["pep"] / totalEmploisCreatedByFormules) *
          100
        )}%`,
        "s",
        AlignedStyle
      );
      setCellFormules(
        "E47",
        `${Math.round(
          (emploisCreatedByFormules["cow"] / totalEmploisCreatedByFormules) *
          100
        )}%`,
        "s",
        AlignedStyle
      );
      setCellFormules(
        "E48",
        `${Math.round(
          (emploisCreatedByFormules["ca"] / totalEmploisCreatedByFormules) * 100
        )}%`,
        "s",
        AlignedStyle
      );

      //detail emplois
      setCellFormules(`J44`, "Nombre", "s", boldAlignedStyle);
      setCellFormules(`K44`, "%", "s", boldAlignedStyle);
      setCellFormules(
        `G45`,
        `Détail des emplois créés en`,
        "s",
        boldAlignedStyle
      );
      setCellFormules(
        `H45`,
        `Détail des emplois créés en`,
        "s",
        boldAlignedStyle
      );
      setCellFormules(`I45`, `${dateYear}`, "s", {
        font: { bold: true, color: { rgb: "FF0000" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "black" } }, // Black color for top border
          bottom: { style: "thin", color: { rgb: "black" } }, // Black color for bottom border
          left: { style: "thin", color: { rgb: "black" } }, // Black color for left border
        },
      });
      setCellFormules("J45", totalEmploisCreatedByTypes, "n", boldAlignedStyle);
      setCellFormules("K45", "100%", "s", boldAlignedStyle);
      setCellFormules("G46", "Dont", "s", AlignedStyle);
      setCellFormules("G47", "Dont", "s", AlignedStyle);
      setCellFormules("G48", "Dont", "s", AlignedStyle);
      setCellFormules("G49", "Dont", "s", AlignedStyle);
      setCellFormules("G50", "Dont", "s", AlignedStyle);
      setCellFormules("G51", "Dont", "s", AlignedStyle);
      setCellFormules("H46", `CDI`, "s", AlignedStyle);
      setCellFormules("H47", `CDD`, "s", AlignedStyle);
      setCellFormules("H48", `Contrat aidé`, "s", AlignedStyle);
      setCellFormules("H49", `Intérim`, "s", AlignedStyle);
      setCellFormules("H50", `Alternance`, "s", AlignedStyle);
      setCellFormules("H51", `Stagiaire`, "s", AlignedStyle);
      setCellFormules("I46", `CDI`, "s", AlignedStyle);
      setCellFormules("I47", `CDD`, "s", AlignedStyle);
      setCellFormules("I48", `Contrat aidé`, "s", AlignedStyle);
      setCellFormules("I49", `Intérim`, "s", AlignedStyle);
      setCellFormules("I50", `Alternance`, "s", AlignedStyle);
      setCellFormules("I51", `Stagiaire`, "s", AlignedStyle);
      setCellFormules("J46", emploisCreatedByTypes["cdi"], "s", AlignedStyle);
      setCellFormules("J47", emploisCreatedByTypes["cdd"], "s", AlignedStyle);
      setCellFormules("J48", emploisCreatedByTypes["aid"], "s", AlignedStyle);
      setCellFormules("J49", emploisCreatedByTypes["int"], "s", AlignedStyle);
      setCellFormules("J50", emploisCreatedByTypes["alter"], "s", AlignedStyle);
      setCellFormules("J51", emploisCreatedByTypes["stag"], "s", AlignedStyle);
      setCellFormules(
        "K46",
        `${Math.round(
          (emploisCreatedByTypes["cdi"] / totalEmploisCreatedByTypes) * 100
        )}%`,
        "s",
        AlignedStyle
      );
      setCellFormules(
        "K47",
        `${Math.round(
          (emploisCreatedByTypes["cdd"] / totalEmploisCreatedByTypes) * 100
        )}%`,
        "s",
        AlignedStyle
      );
      setCellFormules(
        "K48",
        `${Math.round(
          (emploisCreatedByTypes["aid"] / totalEmploisCreatedByTypes) * 100
        )}%`,
        "s",
        AlignedStyle
      );
      setCellFormules(
        "K49",
        `${Math.round(
          (emploisCreatedByTypes["int"] / totalEmploisCreatedByTypes) * 100
        )}%`,
        "s",
        AlignedStyle
      );
      setCellFormules(
        "K50",
        `${Math.round(
          (emploisCreatedByTypes["alter"] / totalEmploisCreatedByTypes) * 100
        )}%`,
        "s",
        AlignedStyle
      );
      setCellFormules(
        "K51",
        `${Math.round(
          (emploisCreatedByTypes["stag"] / totalEmploisCreatedByTypes) * 100
        )}%`,
        "s",
        AlignedStyle
      );

      //Nb dirigeants
      setCellFormules(
        `A53`,
        "Nombre de dirigeants depuis 2001",
        "s",
        boldAlignedStyle
      );
      setCellFormules(
        `B53`,
        "Nombre de dirigeants depuis 2001",
        "s",
        boldAlignedStyle
      );
      setCellFormules(
        `C53`,
        "Nombre de dirigeants depuis 2001",
        "s",
        boldAlignedStyle
      );
      setCellFormules(
        `D53`,
        `${numberDirigeantsTotalHistory}`,
        "s",
        boldAlignedStyle
      );

      //NB DIRIGEANTS
      setCellFormules(`D55`, "Nombre", "s", boldAlignedStyle);
      setCellFormules(`E55`, "%", "s", boldAlignedStyle);
      setCellFormules(`A56`, `Nombre de dirigeants en `, "s", boldAlignedStyle);
      setCellFormules(`B56`, `Nombre de dirigeants en `, "s", boldAlignedStyle);
      setCellFormules(`C56`, `${dateYear}`, "s", {
        font: { bold: true, color: { rgb: "FF0000" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "black" } }, // Black color for top border
          bottom: { style: "thin", color: { rgb: "black" } }, // Black color for bottom border
          left: { style: "thin", color: { rgb: "black" } }, // Black color for left border
        },
      });
      setCellFormules(
        "D56",
        dirigeantsFormulesBilan[0][0]["Total"],
        "n",
        boldAlignedStyle
      );
      setCellFormules("E56", "100%", "s", boldAlignedStyle);
      setCellFormules("A57", "Dont", "s", AlignedStyle);
      setCellFormules("A58", "Dont", "s", AlignedStyle);
      setCellFormules("A59", "Dont", "s", AlignedStyle);
      setCellFormules("B57", `Formule Pépinière`, "s", AlignedStyle);
      setCellFormules("B58", `Formule Coworking`, "s", AlignedStyle);
      setCellFormules("B59", `Formule Centre d'affaires`, "s", AlignedStyle);
      setCellFormules("C57", `Formule Pépinière`, "s", AlignedStyle);
      setCellFormules("C58", `Formule Coworking`, "s", AlignedStyle);
      setCellFormules("C59", `Formule Centre d'affaires`, "s", AlignedStyle);
      setCellFormules(
        "D57",
        parseInt(dirigeantsFormulesBilan[0][0]["Nb Formule Pépinière"]),
        "s",
        AlignedStyle
      );
      setCellFormules(
        "D58",
        parseInt(dirigeantsFormulesBilan[0][0]["Nb Formule Centre d'Affaires"]),
        "s",
        AlignedStyle
      );
      setCellFormules(
        "D59",
        parseInt(dirigeantsFormulesBilan[0][0]["Nb Formule Coworking"]),
        "s",
        AlignedStyle
      );
      setCellFormules(
        "E57",
        `${Math.round(
          (parseInt(dirigeantsFormulesBilan[0][0]["Nb Formule Pépinière"]) /
            parseInt(dirigeantsFormulesBilan[0][0]["Total"])) *
          100
        )}%`,
        "s",
        AlignedStyle
      );
      setCellFormules(
        "E58",
        `${Math.round(
          (parseInt(
            dirigeantsFormulesBilan[0][0]["Nb Formule Centre d'Affaires"]
          ) /
            parseInt(dirigeantsFormulesBilan[0][0]["Total"])) *
          100
        )}%`,
        "s",
        AlignedStyle
      );
      setCellFormules(
        "E59",
        `${Math.round(
          (parseInt(dirigeantsFormulesBilan[0][0]["Nb Formule Coworking"]) /
            parseInt(dirigeantsFormulesBilan[0][0]["Total"])) *
          100
        )}%`,
        "s",
        AlignedStyle
      );

      //origine geographique
      let comunPersonsAllFormules = await db.raw(
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
                tieformpp.formule_id = 1 OR tieformpp.formule_id = 3 OR tieformpp.formule_id = 4
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

      const dicoZFUQPV = comunPersonsAllFormules[0].reduce(
        (acc: any, cur: any) => {
          acc["qpv"] += parseInt(cur["Qpv"]);
          acc["zfu"] += parseInt(cur["Zfu"]);
          return acc;
        },
        { qpv: 0, zfu: 0 }
      );

      const sommeCommunes = comunPersonsAllFormules[0].reduce(
        (acc: any, cur: any) => {
          acc += cur["Nb commune"];
          return acc;
        },
        0
      );

      setCellFormules(
        `A63`,
        "Commune de Résidences des entrepreneurs",
        "s",
        boldAlignedStyle
      );
      setCellFormules(`B63`, "Nombre", "s", boldAlignedStyle);
      setCellFormules(`C63`, "%", "s", boldAlignedStyle);
      let rowBilan = 64;
      comunPersonsAllFormules[0].forEach((item: any) => {
        setCellFormules(
          `A${rowBilan}`,
          `${item["Commune"]}`,
          "s",
          AlignedStyle
        );
        setCellFormules(
          `B${rowBilan}`,
          `${item["Nb commune"]}`,
          "s",
          AlignedStyle
        );
        setCellFormules(
          `C${rowBilan}`,
          `${Math.round((item["Nb commune"] / sommeCommunes) * 100)}%`,
          "s",
          AlignedStyle
        );
        rowBilan += 1;
      });
      setCellFormules(`A${rowBilan}`, "dont QPV :", "s", boldAlignedStyle);
      setCellFormules(
        `B${rowBilan}`,
        `${dicoZFUQPV["qpv"]}`,
        "s",
        boldAlignedStyle
      );
      setCellFormules(`A${rowBilan + 1}`, "dont ZFU :", "s", boldAlignedStyle);
      setCellFormules(
        `B${rowBilan + 1}`,
        `${dicoZFUQPV["zfu"]}`,
        "s",
        boldAlignedStyle
      );

      worksheetFormules["!ref"] = "A1:Z100"; // worksheet range

      worksheetFormules["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 14 } }, // A1 to O1
        { s: { r: 2, c: 0 }, e: { r: 2, c: 14 } }, // A3 to O3
        { s: { r: 4, c: 0 }, e: { r: 4, c: 14 } }, // A5 to O5
        { s: { r: 27, c: 0 }, e: { r: 27, c: 14 } }, // A28 to O28
        { s: { r: 7, c: 0 }, e: { r: 7, c: 1 } }, // A8 to B8
        { s: { r: 31, c: 0 }, e: { r: 31, c: 14 } }, // A32 to O32
        { s: { r: 39, c: 0 }, e: { r: 39, c: 14 } }, // A32 to O32
        { s: { r: 60, c: 0 }, e: { r: 60, c: 14 } }, // A32 to O32

        { s: { r: 8, c: 0 }, e: { r: 10, c: 0 } }, // A9 to A11
        { s: { r: 8, c: 1 }, e: { r: 8, c: 2 } }, // B9 to C9
        { s: { r: 9, c: 1 }, e: { r: 9, c: 2 } }, // B10 to C10
        { s: { r: 10, c: 1 }, e: { r: 10, c: 2 } }, // B11 to C11

        { s: { r: 7, c: 6 }, e: { r: 7, c: 7 } }, // G8 to H8
        { s: { r: 8, c: 6 }, e: { r: 10, c: 6 } }, // G9 to G11
        { s: { r: 8, c: 7 }, e: { r: 8, c: 8 } }, // H9 to I9
        { s: { r: 9, c: 7 }, e: { r: 9, c: 8 } }, // H10 to I10
        { s: { r: 10, c: 7 }, e: { r: 10, c: 8 } }, // H11 to I11

        { s: { r: 14, c: 0 }, e: { r: 16, c: 0 } }, // A15 to A17
        { s: { r: 13, c: 0 }, e: { r: 13, c: 1 } }, // A14 to B14
        { s: { r: 14, c: 1 }, e: { r: 14, c: 2 } }, // A15 to B15
        { s: { r: 15, c: 1 }, e: { r: 15, c: 2 } }, // A16 to B16
        { s: { r: 16, c: 1 }, e: { r: 16, c: 2 } }, // A16 to B16

        { s: { r: 14, c: 6 }, e: { r: 17, c: 6 } }, // A15 to A17
        { s: { r: 13, c: 6 }, e: { r: 13, c: 7 } }, // A14 to B14
        { s: { r: 14, c: 7 }, e: { r: 14, c: 8 } }, // A15 to B15
        { s: { r: 15, c: 7 }, e: { r: 15, c: 8 } }, // A16 to B16
        { s: { r: 16, c: 7 }, e: { r: 16, c: 8 } }, // A16 to B16
        { s: { r: 17, c: 7 }, e: { r: 17, c: 8 } }, // A16 to B16

        { s: { r: 19, c: 0 }, e: { r: 19, c: 2 } }, //A20 to C20

        { s: { r: 22, c: 0 }, e: { r: 22, c: 1 } }, //A30 to C30
        { s: { r: 23, c: 0 }, e: { r: 25, c: 0 } }, //A30 to C30
        { s: { r: 23, c: 1 }, e: { r: 23, c: 2 } }, // A15 to B15
        { s: { r: 24, c: 1 }, e: { r: 24, c: 2 } }, // A16 to B16
        { s: { r: 25, c: 1 }, e: { r: 25, c: 2 } }, // A16 to B16

        { s: { r: 29, c: 0 }, e: { r: 29, c: 2 } }, //A30 to C30

        { s: { r: 34, c: 0 }, e: { r: 34, c: 1 } }, //A33 to B33
        { s: { r: 35, c: 0 }, e: { r: 37, c: 0 } }, // A34 to B34
        { s: { r: 35, c: 1 }, e: { r: 35, c: 2 } }, // A15 to B15
        { s: { r: 36, c: 1 }, e: { r: 36, c: 2 } }, // A16 to B16
        { s: { r: 37, c: 1 }, e: { r: 37, c: 2 } }, // A16 to B16

        { s: { r: 34, c: 6 }, e: { r: 34, c: 8 } }, // G8 to H8
        { s: { r: 35, c: 6 }, e: { r: 37, c: 6 } }, // G9 to G11
        { s: { r: 35, c: 7 }, e: { r: 35, c: 8 } }, // H9 to I9
        { s: { r: 36, c: 7 }, e: { r: 36, c: 8 } }, // H10 to I10
        { s: { r: 37, c: 7 }, e: { r: 37, c: 8 } }, // H11 to I11

        { s: { r: 41, c: 0 }, e: { r: 41, c: 2 } }, //A30 to C30

        { s: { r: 44, c: 0 }, e: { r: 44, c: 1 } }, //A33 to B33
        { s: { r: 45, c: 0 }, e: { r: 47, c: 0 } }, // A34 to B34
        { s: { r: 45, c: 1 }, e: { r: 45, c: 2 } }, // A15 to B15
        { s: { r: 46, c: 1 }, e: { r: 46, c: 2 } }, // A16 to B16
        { s: { r: 47, c: 1 }, e: { r: 47, c: 2 } }, // A16 to B16

        { s: { r: 44, c: 6 }, e: { r: 44, c: 7 } }, //A33 to B33
        { s: { r: 45, c: 6 }, e: { r: 50, c: 6 } }, // A34 to B34
        { s: { r: 45, c: 7 }, e: { r: 45, c: 8 } }, // A16 to B16
        { s: { r: 46, c: 7 }, e: { r: 46, c: 8 } }, // A16 to B16
        { s: { r: 47, c: 7 }, e: { r: 47, c: 8 } }, // A16 to B16
        { s: { r: 48, c: 7 }, e: { r: 48, c: 8 } }, // A15 to B15
        { s: { r: 49, c: 7 }, e: { r: 49, c: 8 } }, // A16 to B16
        { s: { r: 50, c: 7 }, e: { r: 50, c: 8 } }, // A16 to B16

        { s: { r: 52, c: 0 }, e: { r: 52, c: 2 } }, //A30 to C30

        { s: { r: 55, c: 0 }, e: { r: 55, c: 1 } }, //A33 to B33
        { s: { r: 56, c: 0 }, e: { r: 58, c: 0 } }, // A34 to B34
        { s: { r: 56, c: 1 }, e: { r: 56, c: 2 } }, // A15 to B15
        { s: { r: 57, c: 1 }, e: { r: 57, c: 2 } }, // A16 to B16
        { s: { r: 58, c: 1 }, e: { r: 58, c: 2 } }, // A16 to B16
      ]; // Merging cells

      // Append the worksheet to the workbook
      XLSX.utils.book_append_sheet(
        workbook,
        worksheetFormules,
        "BILAN Formules"
      );

      // BILAN PEPINIERE
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

      setCell("A4", `Type de convention : Formule Pépiniere`, "s", {
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
        setCell(`${letter}4`, `Type de convention : Formule Pépiniere`, "s", {
          alignment: { horizontal: "left", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "black" } }, // Black color for top border
            bottom: { style: "thin", color: { rgb: "black" } }, // Black color for bottom border
            left: { style: "thin", color: { rgb: "black" } }, // Black color for left border
            right: { style: "thin", color: { rgb: "black" } },
          },
        });
      }

      setCell("A5", `Intervenant :`, "s", {
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
        setCell(`${letter}5`, `Intervenant :`, "s", {
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
        .where({ company_id, 'is_deleted': false})
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
                AND tieformpp.formule_id = 1
                AND tiepp.company_id = ?
        ) AS unique_individuals
        `,
        [dateFin, dateDeb, company_id]
      );

      console.log(personsInfosPep)

      let ageMoyen = await db.raw(
        `
        SELECT
            TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) as age
        FROM (
            SELECT DISTINCT tiepp.tiepp_id, tiepp.birth_date, tiepp.civilite
            FROM tiepp
            LEFT JOIN tieformpp ON tieformpp.tiepp_id = tiepp.tiepp_id
            WHERE 
                tieformpp.date_debut_formule <= ?
                AND (tieformpp.date_fin_formule >= ? OR tieformpp.date_fin_formule IS NULL)
                AND tieformpp.formule_id = 1
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
      setCell("B15", `${Math.round(ageMoyenResult)}`, "s", AlignedStyle);
      setCell(
        "C10",
        `${Math.round(
          (Number(personsInfosPep[0][0]["< 25 ans"]) / totalPersonsPep) * 100
        )}%`,
        "s",
        AlignedStyle
      );
      setCell(
        "C11",
        `${Math.round(
          (Number(personsInfosPep[0][0]["26 / 35 ans"]) / totalPersonsPep) * 100
        )}%`,
        "s",
        AlignedStyle
      );
      setCell(
        "C12",
        `${Math.round(
          (Number(personsInfosPep[0][0]["36 / 45 ans"]) / totalPersonsPep) * 100
        )}%`,
        "s",
        AlignedStyle
      );
      setCell(
        "C13",
        `${Math.round(
          (Number(personsInfosPep[0][0]["46 / 55 ans"]) / totalPersonsPep) * 100
        )}%`,
        "s",
        AlignedStyle
      );
      setCell(
        "C14",
        `${Math.round(
          (Number(personsInfosPep[0][0]["> 55 ans"]) / totalPersonsPep) * 100
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
      setCell(
        "B18",
        `${personsInfosPep[0][0]["Nb Femmes"]}`,
        "s",
        AlignedStyle
      );
      setCell(
        "B19",
        `${personsInfosPep[0][0]["Nb Hommes"]}`,
        "s",
        AlignedStyle
      );
      setCell(
        "C19",
        `${Math.round(
          (Number(personsInfosPep[0][0]["Nb Hommes"]) / totalPersonsPep) * 100
        )}%`,
        "s",
        AlignedStyle
      );
      setCell(
        "C18",
        `${Math.round(
          (Number(personsInfosPep[0][0]["Nb Femmes"]) / totalPersonsPep) * 100
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
                tieformpp.formule_id = 1 AND
                tiepp.situation_before_prj_id IS NOT NULL AND
                tiepp.company_id = ?
        ) AS unique_individuals
        GROUP BY 
            unique_individuals.scpAvPrj;
        `,
        [dateFin, dateDeb, company_id]
      );

      row += 1; 

      setCell(`A${row}`, "Situation avant immatriculation", "s", boldAlignedStyle);
      setCell(`B${row}`, "Nombre", "s", boldAlignedStyle);
      setCell(`C${row}`, "%", "s", boldAlignedStyle);
      row++;

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
                tieformpp.formule_id = 1
                AND
                tiepp.commune IS NOT NULL 
                AND tiepp.company_id = ?
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

      //Total des ENTREPRISES HEBERGEES table
      let hostedCompaniesPep = await db.raw(
        `
          SELECT
            COUNT(tieformpm.tiepm_id) AS Total,
            SUM(CASE WHEN YEAR(tieformpm.date_debut_formule) = ? THEN 1 ELSE 0 END) AS "Année1",
            SUM(CASE WHEN YEAR(tieformpm.date_debut_formule) = ? THEN 1 ELSE 0 END) AS "Année2",
            SUM(CASE WHEN YEAR(tieformpm.date_debut_formule) = ? THEN 1 ELSE 0 END) AS "Année3"
          FROM
            tieformpm
          LEFT JOIN
            tiepm ON tiepm.tiepm_id = tieformpm.tiepm_id
          WHERE 
            tieformpm.date_debut_formule <= ?
            AND
            (tieformpm.date_fin_formule >= ? OR tieformpm.date_fin_formule IS NULL)
            AND
            tieformpm.formule_id = 1
            AND
            tiepm.company_id = ?
          `,
        [
          dateYear,
          Number(dateYear) - 1,
          Number(dateYear) - 2,
          dateFin,
          dateDeb,
          company_id,
        ]
      );

      const numberTotalHostedCompanies = hostedCompaniesPep[0][0]["Total"];

      setCell("H9", "Nombre", "s", boldAlignedStyle);
      setCell("I9", "%", "s", boldAlignedStyle);
      setCell(
        "E10",
        `Total des entreprises hébergées en Formule Pépinière en`,
        "s",
        boldAlignedStyle
      );
      setCell(
        "F10",
        `Total des entreprises hébergées en Formule Pépinière en`,
        "s",
        boldAlignedStyle
      );
      setCell(`G10`, `${dateYear}`, "s", {
        font: { bold: true, color: { rgb: "FF0000" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "black" } }, // Black color for top border
          bottom: { style: "thin", color: { rgb: "black" } }, // Black color for bottom border
          left: { style: "thin", color: { rgb: "black" } }, // Black color for left border
        },
      });
      setCell(
        "H10",
        hostedCompaniesFormulesBilan[0][0]["Nb Formule Pépinière"],
        "n",
        AlignedStyle
      );
      setCell("I10", "100%", "s", AlignedStyle);
      setCell("E11", "Dont", "s", AlignedStyle);
      setCell("E12", "Dont", "s", AlignedStyle);
      setCell("E13", "Dont", "s", AlignedStyle);
      setCell("F11", `1ère année - entrées en`, "s", AlignedStyle);
      setCell(`G11`, `${dateYear}`, "s", {
        font: { bold: true, color: { rgb: "FF0000" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "black" } }, // Black color for top border
          bottom: { style: "thin", color: { rgb: "black" } }, // Black color for bottom border
          left: { style: "thin", color: { rgb: "black" } }, // Black color for left border
        },
      });
      setCell("F12", `2ème année - suivies depuis`, "s", AlignedStyle);
      setCell(`G12`, `${Number(dateYear) - 1}`, "s", {
        font: { bold: true, color: { rgb: "FF0000" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "black" } }, // Black color for top border
          bottom: { style: "thin", color: { rgb: "black" } }, // Black color for bottom border
          left: { style: "thin", color: { rgb: "black" } }, // Black color for left border
        },
      });
      setCell("F13", `3ème année - suivies depuis`, "s", AlignedStyle);
      setCell(`G13`, `${Number(dateYear) - 2}`, "s", {
        font: { bold: true, color: { rgb: "FF0000" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "black" } }, // Black color for top border
          bottom: { style: "thin", color: { rgb: "black" } }, // Black color for bottom border
          left: { style: "thin", color: { rgb: "black" } }, // Black color for left border
        },
      });
      setCell("H11", hostedCompaniesPep[0][0]["Année1"], "s", AlignedStyle);
      setCell("H12", hostedCompaniesPep[0][0]["Année2"], "s", AlignedStyle);
      setCell("H13", hostedCompaniesPep[0][0]["Année3"], "s", AlignedStyle);
      setCell(
        "I11",
        `${Math.round(
          (hostedCompaniesPep[0][0]["Année1"] / numberTotalHostedCompanies) *
          100
        )}%`,
        "s",
        AlignedStyle
      );
      setCell(
        "I12",
        `${Math.round(
          (hostedCompaniesPep[0][0]["Année2"] / numberTotalHostedCompanies) *
          100
        )}%`,
        "s",
        AlignedStyle
      );
      setCell(
        "I13",
        `${Math.round(
          (hostedCompaniesPep[0][0]["Année3"] / numberTotalHostedCompanies) *
          100
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
                tieformpm.formule_id = 1 AND
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

      row = 15;

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
                tieformpm.formule_id = 1 AND
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

      //3 - Contenu et résultats du suivi engagé
      let emploisYearPep = await db.raw(
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
            AND tieformpm.formule_id = 1
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
        [dateYear, dateFin, dateDeb, Number(dateYear) - 1, company_id]
      );

      //sujets des entretiens
      let sujetsAccPep = await db.raw(
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
                (tieformpp.date_fin_formule >= ? OR tieformpp.date_fin_formule IS NULL) AND
                tieformpp.formule_id = 1 AND
                tieppaccsuivi.sujet_accompagnement_id IS NOT NULL AND
                tieppaccsuivi.typ_accompagnement_id = 1 AND
                tiepp.company_id = ?
        ) AS unique_individuals
        GROUP BY 
          unique_individuals.SujetAccSuivi;
        `,
        [dateFin, dateDeb, company_id]
      );

      const emploisCreatedByTypesPep = emploisYearPep[0].reduce(
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

      const totalEmploisCreatedByTypesPep =
        emploisCreatedByTypesPep["cdi"] +
        emploisCreatedByTypesPep["cdd"] +
        emploisCreatedByTypesPep["int"] +
        emploisCreatedByTypesPep["aid"] +
        emploisCreatedByTypesPep["alter"] +
        emploisCreatedByTypesPep["stag"];

      //detail emplois
      setCell(`N9`, "Nombre", "s", boldAlignedStyle);
      setCell(`O9`, "%", "s", boldAlignedStyle);
      setCell(`K10`, `Détail des emplois créés en`, "s", boldAlignedStyle);
      setCell(`L10`, `Détail des emplois créés en`, "s", boldAlignedStyle);
      setCell(`M10`, `${dateYear}`, "s", {
        font: { bold: true, color: { rgb: "FF0000" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "black" } }, // Black color for top border
          bottom: { style: "thin", color: { rgb: "black" } }, // Black color for bottom border
          left: { style: "thin", color: { rgb: "black" } }, // Black color for left border
        },
      });
      setCell("N10", totalEmploisCreatedByTypesPep, "n", boldAlignedStyle);
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
      setCell("N11", emploisCreatedByTypesPep["cdi"], "s", AlignedStyle);
      setCell("N12", emploisCreatedByTypesPep["cdd"], "s", AlignedStyle);
      setCell("N13", emploisCreatedByTypesPep["aid"], "s", AlignedStyle);
      setCell("N14", emploisCreatedByTypesPep["int"], "s", AlignedStyle);
      setCell("N15", emploisCreatedByTypesPep["alter"], "s", AlignedStyle);
      setCell("N16", emploisCreatedByTypesPep["stag"], "s", AlignedStyle);
      setCell(
        "O11",
        `${Math.round(
          (emploisCreatedByTypesPep["cdi"] / totalEmploisCreatedByTypesPep) *
          100
        )}%`,
        "s",
        AlignedStyle
      );
      setCell(
        "O12",
        `${Math.round(
          (emploisCreatedByTypesPep["cdd"] / totalEmploisCreatedByTypesPep) *
          100
        )}%`,
        "s",
        AlignedStyle
      );
      setCell(
        "O13",
        `${Math.round(
          (emploisCreatedByTypesPep["aid"] / totalEmploisCreatedByTypesPep) *
          100
        )}%`,
        "s",
        AlignedStyle
      );
      setCell(
        "O14",
        `${Math.round(
          (emploisCreatedByTypesPep["int"] / totalEmploisCreatedByTypesPep) *
          100
        )}%`,
        "s",
        AlignedStyle
      );
      setCell(
        "O15",
        `${Math.round(
          (emploisCreatedByTypesPep["alter"] / totalEmploisCreatedByTypesPep) *
          100
        )}%`,
        "s",
        AlignedStyle
      );
      setCell(
        "O16",
        `${Math.round(
          (emploisCreatedByTypesPep["stag"] / totalEmploisCreatedByTypesPep) *
          100
        )}%`,
        "s",
        AlignedStyle
      );

      row = 19;

      const resultsSujetsAccPep = sujetsAccPep[0];

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
          return (
            sum + parseTimeToMinutes(record["Total Interview Time (HHhMM)"])
          );
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

        const averageMinutes =
          totalSubjects > 0 ? Math.round(totalWeightedMinutes / totalSubjects) : 0;

        return formatTimeFromMinutes(averageMinutes);
      }

      const totalTimeEntretiensPep = sumInterviewTimes(resultsSujetsAccPep);
      const avgEntretiensPep = computeAverageTime(resultsSujetsAccPep);

      const nbTotalEntretiensPep = resultsSujetsAccPep.reduce(
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
      resultsSujetsAccPep.forEach((item: any) => {
        setCell(`K${row}`, `${item["Sujet"]}`, "s", AlignedStyle);
        setCell(`L${row}`, `${item["Nb Sujet"]}`, "s", AlignedStyle);
        setCell(
          `M${row}`,
          `${Math.round((item["Nb Sujet"] / nbTotalEntretiensPep) * 100)}%`,
          "s",
          AlignedStyle
        );
        row += 1;
      });
      setCell(`K${row}`, `Total des entretiens`, "s", boldAlignedStyle);
      setCell(`L${row}`, `${nbTotalEntretiensPep}`, "s", boldAlignedStyle);
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
      let sujetsActColPep = await db.raw(
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
              tiepp ON tiepp.tiepp_id = tieppaccsuivi.tiepp_id
            LEFT JOIN 
              sujets_accompagnements_params ON sujets_accompagnements_params.sujet_accompagnement_id = tieppaccsuivi.sujet_accompagnement_id
            LEFT JOIN 
              tieformpp ON tieformpp.tiepp_id = tieppaccsuivi.tiepp_id
            WHERE 
                tieformpp.date_debut_formule <= ? 
                AND
                (tieformpp.date_fin_formule >= ? OR tieformpp.date_fin_formule IS NULL) 
                AND
                tieformpp.formule_id = 1 
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

      let personsActColPep = await db.raw(
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
                tieformpp.formule_id = 1
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

      const resultsSujetsActColPep = sujetsActColPep[0];

      const nbTotalActColPep = resultsSujetsActColPep.reduce(
        (acc: any, cur: any) => {
          acc += cur["Nb Sujet"];
          return acc;
        },
        0
      );

      row += 3;
      setCell(
        `K${row}`,
        "Sujet des actions collectives",
        "s",
        boldAlignedStyle
      );
      setCell(`L${row}`, "Nombre", "s", boldAlignedStyle);
      setCell(`M${row}`, "%", "s", boldAlignedStyle);
      row += 1;
      resultsSujetsActColPep.forEach((item: any) => {
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
        `${personsActColPep[0][0]["Nb entrepreneurs"]}`,
        "s",
        boldAlignedStyle
      );
      setCell(`M${row}`, `100%`, "s", boldAlignedStyle);

      worksheet["!ref"] = "A1:Z100"; // worksheet range

      worksheet["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 14 } }, // A1 to L1

        { s: { r: 2, c: 0 }, e: { r: 2, c: 14 } }, // G3 to L3
        { s: { r: 3, c: 0 }, e: { r: 3, c: 14 } }, // A6 to E6
        { s: { r: 4, c: 0 }, e: { r: 4, c: 14 } }, // A6 to E6

        //Titles
        { s: { r: 6, c: 0 }, e: { r: 6, c: 2 } }, // A6 to E6
        { s: { r: 6, c: 4 }, e: { r: 6, c: 8 } }, // G6 to E6
        { s: { r: 6, c: 10 }, e: { r: 6, c: 14 } }, // G6 to E6

        { s: { r: 9, c: 4 }, e: { r: 9, c: 5 } }, // A6 to E6
        { s: { r: 10, c: 4 }, e: { r: 12, c: 4 } }, // G6 to E6

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
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "BILAN Formule Pépinière"
      );

      // BILAN COWORKING
      const worksheetCow = {} as any;
      function setCellCow(cellRef: any, value: any, type: any, style: any) {
        worksheetCow[cellRef] = { t: type, v: value, s: style };
      }

      setCellCow("A1", "Grille de synthèse", "s", {
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
        setCellCow(`${letter}1`, "Grille de synthèse", "s", {
          border: {
            top: { style: "medium", color: { rgb: "black" } },
            bottom: { style: "medium", color: { rgb: "black" } }, // Black color for bottom border
            right: { style: "medium", color: { rgb: "black" } },
          },
        });
      }
      setCellCow(
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
        setCellCow(
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

      setCellCow("A4", `Type de convention : Formule Coworking`, "s", {
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
        setCellCow(
          `${letter}4`,
          `Type de convention : Formule Coworking`,
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
        setCellCow(
          `${letter}7`,
          "1 - Profils des bénéficiaires",
          "s",
          boldStyle
        );
      }
      for (let letter of ["E", "F", "G", "H", "I"]) {
        setCellCow(`${letter}7`, "2 - Profils des entreprises", "s", boldStyle);
      }
      for (let letter of ["K", "L", "M", "N", "O"]) {
        setCellCow(
          `${letter}7`,
          "3 - Contenu et résultats du suivi engagé",
          "s",
          boldStyle
        );
      }

      //Profils des bénéficiaires

      let personsInfosCow = await db.raw(
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
                AND tieformpp.formule_id = 4
                AND tiepp.company_id = ?
        ) AS unique_individuals
        `,
        [dateFin, dateDeb, company_id]
      );

      let ageMoyenCow = await db.raw(
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
                AND tieformpp.formule_id = 4
                AND tiepp.company_id = ?
        ) AS unique_individuals
        `,
        [dateFin, dateDeb, company_id]
      );

      const totalPersonsCow =
        Number(personsInfosCow[0][0]["< 25 ans"]) +
        Number(personsInfosCow[0][0]["26 / 35 ans"]) +
        Number(personsInfosCow[0][0]["36 / 45 ans"]) +
        Number(personsInfosCow[0][0]["46 / 55 ans"]) +
        Number(personsInfosCow[0][0]["> 55 ans"]);

      const ageMoyenSommeCow = ageMoyenCow[0].reduce((acc: any, cur: any) => {
        acc += cur["age"];
        return acc;
      }, 0);
      const ageMoyenResultCow = ageMoyenSommeCow / totalPersonsCow;

      const nbTotalPersonsSexeCow =
        Number(personsInfosCow[0][0]["Nb Femmes"]) + Number(personsInfosCow[0][0]["Nb Hommes"]);

      // Age table
      setCellCow("A9", "Age", "s", boldAlignedStyle);
      setCellCow("B9", "Nombre", "s", boldAlignedStyle);
      setCellCow("C9", "%", "s", boldAlignedStyle);
      setCellCow("A10", "< 25 ans", "s", AlignedStyle);
      setCellCow("A11", "26 / 35 ans", "s", AlignedStyle);
      setCellCow("A12", "36 / 45 ans", "s", AlignedStyle);
      setCellCow("A13", "46 / 55 ans", "s", AlignedStyle);
      setCellCow("A14", "> 55 ans", "s", AlignedStyle);
      setCellCow("A15", `Age moyen :`, "s", AlignedStyle);
      setCellCow(
        "B10",
        `${personsInfosCow[0][0]["< 25 ans"]}`,
        "s",
        AlignedStyle
      );
      setCellCow(
        "B11",
        `${personsInfosCow[0][0]["26 / 35 ans"]}`,
        "s",
        AlignedStyle
      );
      setCellCow(
        "B12",
        `${personsInfosCow[0][0]["36 / 45 ans"]}`,
        "s",
        AlignedStyle
      );
      setCellCow(
        "B13",
        `${personsInfosCow[0][0]["46 / 55 ans"]}`,
        "s",
        AlignedStyle
      );
      setCellCow(
        "B14",
        `${personsInfosCow[0][0]["> 55 ans"]}`,
        "s",
        AlignedStyle
      );
      setCellCow("B15", `${Math.round(ageMoyenResultCow)}`, "s", AlignedStyle);
      setCellCow(
        "C10",
        `${Math.round(
          (Number(personsInfosCow[0][0]["< 25 ans"]) / totalPersonsCow) * 100
        )}%`,
        "s",
        AlignedStyle
      );
      setCellCow(
        "C11",
        `${Math.round(
          (Number(personsInfosCow[0][0]["26 / 35 ans"]) / totalPersonsCow) * 100
        )}%`,
        "s",
        AlignedStyle
      );
      setCellCow(
        "C12",
        `${Math.round(
          (Number(personsInfosCow[0][0]["36 / 45 ans"]) / totalPersonsCow) * 100
        )}%`,
        "s",
        AlignedStyle
      );
      setCellCow(
        "C13",
        `${Math.round(
          (Number(personsInfosCow[0][0]["46 / 55 ans"]) / totalPersonsCow) * 100
        )}%`,
        "s",
        AlignedStyle
      );
      setCellCow(
        "C14",
        `${Math.round(
          (Number(personsInfosCow[0][0]["> 55 ans"]) / totalPersonsCow) * 100
        )}%`,
        "s",
        AlignedStyle
      );

      //Répartition Femme/Homme
      setCellCow("A17", "Répartition Femme/Homme", "s", boldAlignedStyle);
      setCellCow("B17", `Nombre`, "s", boldAlignedStyle);
      setCellCow("C17", `%`, "s", boldAlignedStyle);
      setCellCow("A18", "Femme", "s", AlignedStyle);
      setCellCow("A19", "Homme", "s", AlignedStyle);
      setCellCow(
        "B18",
        `${personsInfosPep[0][0]["Nb Femmes"]}`,
        "s",
        AlignedStyle
      );
      setCellCow(
        "B19",
        `${personsInfosPep[0][0]["Nb Hommes"]}`,
        "s",
        AlignedStyle
      );
      setCellCow(
        "C19",
        `${Math.round(
          (personsInfosPep[0][0]["Nb Hommes"] / totalPersonsCow) * 100
        )}%`,
        "s",
        AlignedStyle
      );
      setCellCow(
        "C18",
        `${Math.round(
          (personsInfosPep[0][0]["Nb Hommes"] / totalPersonsCow) * 100
        )}%`,
        "s",
        AlignedStyle
      );

      // Niveau de formation table
      row = 21;

      setCell(`A${row}`, "Niveau de formation", "s", boldAlignedStyle);
      setCell(`B${row}`, "Nombre", "s", boldAlignedStyle);
      setCell(`C${row}`, "%", "s", boldAlignedStyle);
      row++;
      
      for (const level of studyLevels) {
        const count = personsInfosCow[0][0][level.name] || 0;
        const percentage = Math.round((Number(count) / totalPersonsCow) * 100);
        
        setCell(`A${row}`, level.name, "s", AlignedStyle);
        setCell(`B${row}`, count.toString(), "s", AlignedStyle);
        setCell(`C${row}`, `${percentage}%`, "s", AlignedStyle);
        
        row++;
      }


      // Situation avant immatriculation table

      let personsScpAvPrjCow = await db.raw(
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
                tieformpp.formule_id = 4 AND
                tiepp.situation_before_prj_id IS NOT NULL AND
                tiepp.company_id = ?
        ) AS unique_individuals
        GROUP BY 
            unique_individuals.scpAvPrj;
        `,
        [dateFin, dateDeb, company_id]
      );

      row += 1; 

      setCell(`A${row}`, "Situation avant immatriculation", "s", boldAlignedStyle);
      setCell(`B${row}`, "Nombre", "s", boldAlignedStyle);
      setCell(`C${row}`, "%", "s", boldAlignedStyle);
      row++;

      const resultsScpAvPrjCow = personsScpAvPrjCow[0];

      resultsScpAvPrjCow.forEach((item: any) => {
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
            (item["Nombre Situation Avant Projet"] / totalPersonsCow) * 100
          )}%`,
          "s",
          AlignedStyle
        );
        row++;
      });

      // Commune de Résidences des entrepreneurs
      let comunPersonsCow = await db.raw(
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
                tieformpp.formule_id = 4 
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

      const dicoZFUQPVCow = comunPersonsCow[0].reduce(
        (acc: any, cur: any) => {
          acc["qpv"] += parseInt(cur["Qpv"]);
          acc["zfu"] += parseInt(cur["Zfu"]);
          return acc;
        },
        { qpv: 0, zfu: 0 }
      );

      const resultsComunPersonsCow = comunPersonsCow[0];
      row += 1;
      setCellCow(`A${row}`, "Origine géographique", "s", boldAlignedStyle);
      setCellCow(`B${row}`, "Nombre", "s", boldAlignedStyle);
      setCellCow(`C${row}`, "%", "s", boldAlignedStyle);
      row += 1;

      resultsComunPersonsCow.forEach((item: any) => {
        setCellCow(`A${row}`, `${item["Commune"]}`, "s", AlignedStyle);
        setCellCow(`B${row}`, `${item["Nb commune"]}`, "s", AlignedStyle);
        setCellCow(
          `C${row}`,
          `${Math.round((Number(item["Nb commune"]) / totalPersonsCow) * 100)}%`,
          "s",
          AlignedStyle
        );
        row += 1;
      });

      setCellCow(`A${row}`, "dont QPV :", "s", boldAlignedStyle);
      setCellCow(`B${row}`, `${dicoZFUQPVCow["qpv"]}`, "s", boldAlignedStyle);
      setCellCow(`A${row + 1}`, "dont ZFU :", "s", boldAlignedStyle);
      setCellCow(
        `B${row + 1}`,
        `${dicoZFUQPVCow["zfu"]}`,
        "s",
        boldAlignedStyle
      );

      //Types de Status Juridiques
      let statutJurCompCow = await db.raw(
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
                tieformpm.formule_id = 4 AND
                tiepm.legal_form_id IS NOT NULL AND
                tiepm.company_id = ?
        ) AS unique_individuals
        GROUP BY 
            unique_individuals.name;
        `,
        [dateFin, dateDeb, company_id]
      );

      const resultsStatutJurCompCow = statutJurCompCow[0];

      const nbTotalEntreprisesCow = resultsStatutJurCompCow.reduce(
        (acc: any, cur: any) => {
          acc += cur["Nb Statut Juridique"];
          return acc;
        },
        0
      );

      row = 9;

      setCellCow(
        `E${row}`,
        "Types de Statuts juridiques",
        "s",
        boldAlignedStyle
      );
      setCellCow(`F${row}`, "Nombre", "s", boldAlignedStyle);
      setCellCow(`G${row}`, "%", "s", boldAlignedStyle);
      row += 1;
      resultsStatutJurCompCow.forEach((item: any) => {
        setCellCow(`E${row}`, `${item["Statut Juridique"]}`, "s", AlignedStyle);
        setCellCow(
          `F${row}`,
          `${item["Nb Statut Juridique"]}`,
          "s",
          AlignedStyle
        );
        setCellCow(
          `G${row}`,
          `${Math.round(
            (item["Nb Statut Juridique"] / nbTotalEntreprisesCow) * 100
          )}%`,
          "s",
          AlignedStyle
        );
        row += 1;
      });


      let secteurCompCow = await db.raw(
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
                tieformpm.formule_id = 4 AND
                tiepm.secteur_activite_id IS NOT NULL AND
                tiepm.company_id = ? AND
                secteurs_activites_params.is_deleted = FALSE
        ) AS unique_individuals
        GROUP BY 
            unique_individuals.name;
        `,
        [dateFin, dateDeb, company_id]
      );

      secteurCompCow = secteurCompCow[0]
      
      row += 1;
      setCellCow(`E${row}`, "Secteurs d'activité", "s", boldAlignedStyle);
      setCellCow(`F${row}`, "Nombre", "s", boldAlignedStyle);
      setCellCow(`G${row}`, "%", "s", boldAlignedStyle);
      row += 1;
      secteurCompCow.forEach((item: any) => {
        setCellCow(`E${row}`, `${item["Secteurs d'activité"]}`, "s", AlignedStyle);
        setCellCow(`F${row}`, `${item["Nombre"]}`, "s", AlignedStyle);
        setCellCow(
          `G${row}`,
          `${Math.round((item["Nombre"] / nbTotalEntreprisesCow) * 100)}%`,
          "s",
          AlignedStyle
        );
        row += 1;
      });

      //3 - Contenu et résultats du suivi engagé
      let emploisYearCow = await db.raw(
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
            tieformpm ON tiepmeff.tiepm_id = tieformpm.tiepm_id
          LEFT JOIN
            tiepm ON tiepm.tiepm_id = tiepmeff.tiepm_id
          WHERE
            tiepmeff.year = ?
            AND tieformpm.date_debut_formule <= ?
            AND (tieformpm.date_fin_formule >= ? OR tieformpm.date_fin_formule IS NULL)
            AND tieformpm.formule_id = 4
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
        [dateYear, dateFin, dateDeb, Number(dateYear) - 1, company_id]
      );

      const emploisCreatedByTypesCow = emploisYearCow[0].reduce(
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

      const totalEmploisCreatedByTypesCow =
        emploisCreatedByTypesCow["cdi"] +
        emploisCreatedByTypesCow["cdd"] +
        emploisCreatedByTypesCow["int"] +
        emploisCreatedByTypesCow["aid"] +
        emploisCreatedByTypesCow["alter"] +
        emploisCreatedByTypesCow["stag"];

      //detail emplois
      setCellCow(`N9`, "Nombre", "s", boldAlignedStyle);
      setCellCow(`O9`, "%", "s", boldAlignedStyle);
      setCellCow(`K10`, `Détail des emplois créés en`, "s", boldAlignedStyle);
      setCellCow(`L10`, `Détail des emplois créés en`, "s", boldAlignedStyle);
      setCellCow(`M10`, `${dateYear}`, "s", {
        font: { bold: true, color: { rgb: "FF0000" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "black" } }, // Black color for top border
          bottom: { style: "thin", color: { rgb: "black" } }, // Black color for bottom border
          left: { style: "thin", color: { rgb: "black" } }, // Black color for left border
        },
      });
      setCellCow("N10", totalEmploisCreatedByTypesCow, "n", boldAlignedStyle);
      setCellCow("O10", "100%", "s", boldAlignedStyle);
      setCellCow("K11", "Dont", "s", AlignedStyle);
      setCellCow("K12", "Dont", "s", AlignedStyle);
      setCellCow("K13", "Dont", "s", AlignedStyle);
      setCellCow("K14", "Dont", "s", AlignedStyle);
      setCellCow("K15", "Dont", "s", AlignedStyle);
      setCellCow("K16", "Dont", "s", AlignedStyle);
      setCellCow("L11", `CDI`, "s", AlignedStyle);
      setCellCow("L12", `CDD`, "s", AlignedStyle);
      setCellCow("L13", `Contrat aidé`, "s", AlignedStyle);
      setCellCow("L14", `Intérim`, "s", AlignedStyle);
      setCellCow("L15", `Alternance`, "s", AlignedStyle);
      setCellCow("L16", `Stagiaire`, "s", AlignedStyle);
      setCellCow("M11", `CDI`, "s", AlignedStyle);
      setCellCow("M12", `CDD`, "s", AlignedStyle);
      setCellCow("M13", `Contrat aidé`, "s", AlignedStyle);
      setCellCow("M14", `Intérim`, "s", AlignedStyle);
      setCellCow("M15", `Alternance`, "s", AlignedStyle);
      setCellCow("M16", `Stagiaire`, "s", AlignedStyle);
      setCellCow("N11", emploisCreatedByTypesCow["cdi"], "s", AlignedStyle);
      setCellCow("N12", emploisCreatedByTypesCow["cdd"], "s", AlignedStyle);
      setCellCow("N13", emploisCreatedByTypesCow["aid"], "s", AlignedStyle);
      setCellCow("N14", emploisCreatedByTypesCow["int"], "s", AlignedStyle);
      setCellCow("N15", emploisCreatedByTypesCow["alter"], "s", AlignedStyle);
      setCellCow("N16", emploisCreatedByTypesCow["stag"], "s", AlignedStyle);
      setCellCow(
        "O11",
        `${Math.round(
          (emploisCreatedByTypesCow["cdi"] / totalEmploisCreatedByTypesCow) *
          100
        )}%`,
        "s",
        AlignedStyle
      );
      setCellCow(
        "O12",
        `${Math.round(
          (emploisCreatedByTypesCow["cdd"] / totalEmploisCreatedByTypesCow) *
          100
        )}%`,
        "s",
        AlignedStyle
      );
      setCellCow(
        "O13",
        `${Math.round(
          (emploisCreatedByTypesCow["aid"] / totalEmploisCreatedByTypesCow) *
          100
        )}%`,
        "s",
        AlignedStyle
      );
      setCellCow(
        "O14",
        `${Math.round(
          (emploisCreatedByTypesCow["int"] / totalEmploisCreatedByTypesCow) *
          100
        )}%`,
        "s",
        AlignedStyle
      );
      setCellCow(
        "O15",
        `${Math.round(
          (emploisCreatedByTypesCow["alter"] / totalEmploisCreatedByTypesCow) *
          100
        )}%`,
        "s",
        AlignedStyle
      );
      setCellCow(
        "O16",
        `${Math.round(
          (emploisCreatedByTypesCow["stag"] / totalEmploisCreatedByTypesPep) *
          100
        )}%`,
        "s",
        AlignedStyle
      );

      worksheetCow["!ref"] = "A1:Z100"; // worksheetCow range

      worksheetCow["!merges"] = [
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

      // Append the worksheetCow to the workbook
      XLSX.utils.book_append_sheet(
        workbook,
        worksheetCow,
        "BILAN Formule Coworking"
      );

      // BILAN CENTRE D'AFFAIRES
      const worksheetCentreAff = {} as any;
      function setCellCentreAff(
        cellRef: any,
        value: any,
        type: any,
        style: any
      ) {
        worksheetCentreAff[cellRef] = { t: type, v: value, s: style };
      }

      setCellCentreAff("A1", "Grille de synthèse", "s", {
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
        setCellCentreAff(`${letter}1`, "Grille de synthèse", "s", {
          border: {
            top: { style: "medium", color: { rgb: "black" } },
            bottom: { style: "medium", color: { rgb: "black" } }, // Black color for bottom border
            right: { style: "medium", color: { rgb: "black" } },
          },
        });
      }
      setCellCentreAff(
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
        setCellCentreAff(
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

      setCellCentreAff(
        "A4",
        `Type de convention : Formule Centre d'Affaires`,
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
        setCellCentreAff(
          `${letter}4`,
          `Type de convention : Formule Centre d'Affaires`,
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
        setCellCentreAff(
          `${letter}7`,
          "1 - Profils des bénéficiaires",
          "s",
          boldStyle
        );
      }
      for (let letter of ["E", "F", "G", "H", "I"]) {
        setCellCentreAff(
          `${letter}7`,
          "2 - Profils des entreprises",
          "s",
          boldStyle
        );
      }
      for (let letter of ["K", "L", "M", "N", "O"]) {
        setCellCentreAff(
          `${letter}7`,
          "3 - Contenu et résultats du suivi engagé",
          "s",
          boldStyle
        );
      }

      //Profils des bénéficiaires

      let personsInfosCentreAff = await db.raw(
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
                AND tieformpp.formule_id = 3
                AND tiepp.company_id = ?
        ) AS unique_individuals
        `,
        [dateFin, dateDeb, company_id]
      );

      let ageMoyenCentreAff = await db.raw(
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
                AND tieformpp.formule_id = 3
                AND tiepp.company_id = ?
        ) AS unique_individuals
        `,
        [dateFin, dateDeb, company_id]
      );

      const totalPersonsCentreAff =
        Number(personsInfosCentreAff[0][0]["< 25 ans"]) +
        Number(personsInfosCentreAff[0][0]["26 / 35 ans"]) +
        Number(personsInfosCentreAff[0][0]["36 / 45 ans"]) +
        Number(personsInfosCentreAff[0][0]["46 / 55 ans"]) +
        Number(personsInfosCentreAff[0][0]["> 55 ans"]);

      const ageMoyenSommeCentreAff = ageMoyenCentreAff[0].reduce(
        (acc: any, cur: any) => {
          acc += cur["age"];
          return acc;
        },
        0
      );
      const ageMoyenResultCentreAff = Math.round(
        ageMoyenSommeCentreAff / totalPersonsCentreAff
      );

      const nbTotalPersonsSexeCentreAff =
        Number(personsInfosCentreAff[0][0]["Nb Femmes"]) +
        Number(personsInfosCentreAff[0][0]["Nb Hommes"]);

      // Age table
      setCellCentreAff("A9", "Age", "s", boldAlignedStyle);
      setCellCentreAff("B9", "Nombre", "s", boldAlignedStyle);
      setCellCentreAff("C9", "%", "s", boldAlignedStyle);
      setCellCentreAff("A10", "< 25 ans", "s", AlignedStyle);
      setCellCentreAff("A11", "26 / 35 ans", "s", AlignedStyle);
      setCellCentreAff("A12", "36 / 45 ans", "s", AlignedStyle);
      setCellCentreAff("A13", "46 / 55 ans", "s", AlignedStyle);
      setCellCentreAff("A14", "> 55 ans", "s", AlignedStyle);
      setCellCentreAff("A15", `Age moyen :`, "s", AlignedStyle);
      setCellCentreAff(
        "B10",
        `${personsInfosCentreAff[0][0]["< 25 ans"]}`,
        "s",
        AlignedStyle
      );
      setCellCentreAff(
        "B11",
        `${personsInfosCentreAff[0][0]["26 / 35 ans"]}`,
        "s",
        AlignedStyle
      );
      setCellCentreAff(
        "B12",
        `${personsInfosCentreAff[0][0]["36 / 45 ans"]}`,
        "s",
        AlignedStyle
      );
      setCellCentreAff(
        "B13",
        `${personsInfosCentreAff[0][0]["46 / 55 ans"]}`,
        "s",
        AlignedStyle
      );
      setCellCentreAff(
        "B14",
        `${personsInfosCentreAff[0][0]["> 55 ans"]}`,
        "s",
        AlignedStyle
      );
      setCellCentreAff("B15", `${Math.round(ageMoyenResultCentreAff)}`, "s", AlignedStyle);
      setCellCentreAff(
        "C10",
        `${Math.round(
          (Number(personsInfosCentreAff[0][0]["< 25 ans"]) / totalPersonsCentreAff) *
          100
        )}%`,
        "s",
        AlignedStyle
      );
      setCellCentreAff(
        "C11",
        `${Math.round(
          (Number(personsInfosCentreAff[0][0]["26 / 35 ans"]) / totalPersonsCentreAff) *
          100
        )}%`,
        "s",
        AlignedStyle
      );
      setCellCentreAff(
        "C12",
        `${Math.round(
          (Number(personsInfosCentreAff[0][0]["36 / 45 ans"]) / totalPersonsCentreAff) *
          100
        )}%`,
        "s",
        AlignedStyle
      );
      setCellCentreAff(
        "C13",
        `${Math.round(
          (Number(personsInfosCentreAff[0][0]["46 / 55 ans"]) / totalPersonsCentreAff) *
          100
        )}%`,
        "s",
        AlignedStyle
      );
      setCellCentreAff(
        "C14",
        `${Math.round(
          (Number(personsInfosCentreAff[0][0]["> 55 ans"]) / totalPersonsCentreAff) *
          100
        )}%`,
        "s",
        AlignedStyle
      );

      //Répartition Femme/Homme
      setCellCentreAff("A17", "Répartition Femme/Homme", "s", boldAlignedStyle);
      setCellCentreAff("B17", `Nombre`, "s", boldAlignedStyle);
      setCellCentreAff("C17", `%`, "s", boldAlignedStyle);
      setCellCentreAff("A18", "Femme", "s", AlignedStyle);
      setCellCentreAff("A19", "Homme", "s", AlignedStyle);
      setCellCentreAff(
        "B18",
        `${personsInfosCentreAff[0][0]["Nb Femmes"]}`,
        "s",
        AlignedStyle
      );
      setCellCentreAff(
        "B19",
        `${personsInfosCentreAff[0][0]["Nb Hommes"]}`,
        "s",
        AlignedStyle
      );
      setCellCentreAff(
        "C19",
        `${Math.round(
          (personsInfosCentreAff[0][0]["Nb Hommes"] / totalPersonsCentreAff) *
          100
        )}%`,
        "s",
        AlignedStyle
      );
      setCellCentreAff(
        "C18",
        `${Math.round(
          (personsInfosCentreAff[0][0]["Nb Femmes"] / totalPersonsCentreAff) *
          100
        )}%`,
        "s",
        AlignedStyle
      );

      // Niveau de formation table
      row = 21;

      setCell(`A${row}`, "Niveau de formation", "s", boldAlignedStyle);
      setCell(`B${row}`, "Nombre", "s", boldAlignedStyle);
      setCell(`C${row}`, "%", "s", boldAlignedStyle);
      row++;
      
      for (const level of studyLevels) {
        const count = personsInfosPep[0][0][level.name] || 0;
        const percentage = Math.round((Number(count) / totalPersonsCentreAff) * 100);
        
        setCell(`A${row}`, level.name, "s", AlignedStyle);
        setCell(`B${row}`, count.toString(), "s", AlignedStyle);
        setCell(`C${row}`, `${percentage}%`, "s", AlignedStyle);
        
        row++;
      }

      // Situation avant immatriculation table

      let personsScpAvPrjCentreAff = await db.raw(
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
                tieformpp.formule_id = 3 AND
                tiepp.situation_before_prj_id IS NOT NULL AND
                tiepp.company_id = ?
        ) AS unique_individuals
        GROUP BY 
            unique_individuals.scpAvPrj;
        `,
        [dateFin, dateDeb, company_id]
      );

      setCellCentreAff(
        "A36",
        "Situation avant immatriculation",
        "s",
        boldAlignedStyle
      );
      setCellCentreAff("B36", "Nombre", "s", boldAlignedStyle);
      setCellCentreAff("C36", "%", "s", boldAlignedStyle);

      const resultsScpAvPrjCentreAff = personsScpAvPrjCentreAff[0];

      resultsScpAvPrjCentreAff.forEach((item: any) => {
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
            (item["Nombre Situation Avant Projet"] / totalPersonsCentreAff) * 100
          )}%`,
          "s",
          AlignedStyle
        );
        row++;
      });

      // Commune de Résidences des entrepreneurs
      let comunPersonsCentreAff = await db.raw(
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
                tieformpp.formule_id = 3
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

      const dicoZFUQPVCentreAff = comunPersonsCentreAff[0].reduce(
        (acc: any, cur: any) => {
          acc["qpv"] += parseInt(cur["Qpv"]);
          acc["zfu"] += parseInt(cur["Zfu"]);
          return acc;
        },
        { qpv: 0, zfu: 0 }
      );

      const resultsComunPersonsCentreAff = comunPersonsCentreAff[0];
      row += 1;
      setCellCentreAff(
        `A${row}`,
        "Origine géographique",
        "s",
        boldAlignedStyle
      );
      setCellCentreAff(`B${row}`, "Nombre", "s", boldAlignedStyle);
      setCellCentreAff(`C${row}`, "%", "s", boldAlignedStyle);
      row += 1;

      resultsComunPersonsCentreAff.forEach((item: any) => {
        setCellCentreAff(`A${row}`, `${item["Commune"]}`, "s", AlignedStyle);
        setCellCentreAff(`B${row}`, `${item["Nb commune"]}`, "s", AlignedStyle);
        setCellCentreAff(
          `C${row}`,
          `${Math.round((item["Nb commune"] / totalPersonsCentreAff) * 100)}%`,
          "s",
          AlignedStyle
        );
        row += 1;
      });
      setCellCentreAff(`A${row}`, "dont QPV :", "s", boldAlignedStyle);
      setCellCentreAff(
        `B${row}`,
        `${dicoZFUQPVCentreAff["qpv"]}`,
        "s",
        boldAlignedStyle
      );
      setCellCentreAff(`A${row + 1}`, "dont ZFU :", "s", boldAlignedStyle);
      setCellCentreAff(
        `B${row + 1}`,
        `${dicoZFUQPVCentreAff["zfu"]}`,
        "s",
        boldAlignedStyle
      );

      //Types de Status Juridiques
      let statutJurCompCentreAff = await db.raw(
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
                tieformpm.formule_id = 3 AND
                tiepm.legal_form_id IS NOT NULL AND
                tiepm.company_id = ?
        ) AS unique_individuals
        GROUP BY 
            unique_individuals.name;
        `,
        [dateFin, dateDeb, company_id]
      );

      const resultsStatutJurCompCentreAff = statutJurCompCentreAff[0];

      const nbTotalEntreprisesCentreAff = resultsStatutJurCompCentreAff.reduce(
        (acc: any, cur: any) => {
          acc += cur["Nb Statut Juridique"];
          return acc;
        },
        0
      );

      row = 9;

      setCellCentreAff(
        `E${row}`,
        "Types de Statuts juridiques",
        "s",
        boldAlignedStyle
      );
      setCellCentreAff(`F${row}`, "Nombre", "s", boldAlignedStyle);
      setCellCentreAff(`G${row}`, "%", "s", boldAlignedStyle);
      row += 1;
      resultsStatutJurCompCentreAff.forEach((item: any) => {
        setCellCentreAff(
          `E${row}`,
          `${item["Statut Juridique"]}`,
          "s",
          AlignedStyle
        );
        setCellCentreAff(
          `F${row}`,
          `${item["Nb Statut Juridique"]}`,
          "s",
          AlignedStyle
        );
        setCellCentreAff(
          `G${row}`,
          `${Math.round(
            (item["Nb Statut Juridique"] / nbTotalEntreprisesCentreAff) * 100
          )}%`,
          "s",
          AlignedStyle
        );
        row += 1;
      });

      // Secteurs d'activités
      let secteurCompCentreAff = await db.raw(
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
                tieformpm.formule_id = 3 AND
                tiepm.secteur_activite_id IS NOT NULL AND
                tiepm.company_id = ? AND
                secteurs_activites_params.is_deleted = FALSE
        ) AS unique_individuals
        GROUP BY 
            unique_individuals.name;
        `,
        [dateFin, dateDeb, company_id]
      );


      secteurCompCentreAff = secteurCompCentreAff[0]

      row += 1;
      setCellCentreAff(`E${row}`, "Secteurs d'activité", "s", boldAlignedStyle);
      setCellCentreAff(`F${row}`, "Nombre", "s", boldAlignedStyle);
      setCellCentreAff(`G${row}`, "%", "s", boldAlignedStyle);
      row += 1;
      secteurCompCentreAff.forEach((item: any) => {
        setCellCentreAff(`E${row}`, `${item["Secteurs d'activité"]}`, "s", AlignedStyle);
        setCellCentreAff(`F${row}`, `${item["Nombre"]}`, "s", AlignedStyle);
        setCellCentreAff(
          `G${row}`,
          `${Math.round(
            (item["Nombre"] / nbTotalEntreprisesCentreAff) * 100
          )}%`,
          "s",
          AlignedStyle
        );
        row += 1;
      });

      //3 - Contenu et résultats du suivi engagé
      let emploisYearCentreAff = await db.raw(
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
            tiepm ON tiepm.tiepm_id = tiepmeff.tiepm_id
          LEFT JOIN
            tieformpm ON tiepmeff.tiepm_id = tieformpm.tiepm_id
          WHERE
            tiepmeff.year = ?
            AND tieformpm.date_debut_formule <= ?
            AND (tieformpm.date_fin_formule >= ? OR tieformpm.date_fin_formule IS NULL OR tieformpm.date_fin_formule = '')
            AND tieformpm.formule_id = 3
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
        [dateYear, dateFin, dateDeb, Number(dateYear) - 1, company_id]
      );

      const emploisCreatedByTypesCentreAff = emploisYearCentreAff[0].reduce(
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

      const totalEmploisCreatedByTypesCentreAff =
        emploisCreatedByTypesCentreAff["cdi"] +
        emploisCreatedByTypesCentreAff["cdd"] +
        emploisCreatedByTypesCentreAff["int"] +
        emploisCreatedByTypesCentreAff["aid"] +
        emploisCreatedByTypesCentreAff["alter"] +
        emploisCreatedByTypesCentreAff["stag"];

      //detail emplois
      setCellCentreAff(`N9`, "Nombre", "s", boldAlignedStyle);
      setCellCentreAff(`O9`, "%", "s", boldAlignedStyle);
      setCellCentreAff(
        `K10`,
        `Détail des emplois créés en`,
        "s",
        boldAlignedStyle
      );
      setCellCentreAff(
        `L10`,
        `Détail des emplois créés en`,
        "s",
        boldAlignedStyle
      );
      setCellCentreAff(`M10`, `${dateYear}`, "s", {
        font: { bold: true, color: { rgb: "FF0000" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "black" } }, // Black color for top border
          bottom: { style: "thin", color: { rgb: "black" } }, // Black color for bottom border
          left: { style: "thin", color: { rgb: "black" } }, // Black color for left border
        },
      });
      setCellCentreAff(
        "N10",
        totalEmploisCreatedByTypesCentreAff,
        "n",
        boldAlignedStyle
      );
      setCellCentreAff("O10", "100%", "s", boldAlignedStyle);
      setCellCentreAff("K11", "Dont", "s", AlignedStyle);
      setCellCentreAff("K12", "Dont", "s", AlignedStyle);
      setCellCentreAff("K13", "Dont", "s", AlignedStyle);
      setCellCentreAff("K14", "Dont", "s", AlignedStyle);
      setCellCentreAff("K15", "Dont", "s", AlignedStyle);
      setCellCentreAff("K16", "Dont", "s", AlignedStyle);
      setCellCentreAff("L11", `CDI`, "s", AlignedStyle);
      setCellCentreAff("L12", `CDD`, "s", AlignedStyle);
      setCellCentreAff("L13", `Contrat aidé`, "s", AlignedStyle);
      setCellCentreAff("L14", `Intérim`, "s", AlignedStyle);
      setCellCentreAff("L15", `Alternance`, "s", AlignedStyle);
      setCellCentreAff("L16", `Stagiaire`, "s", AlignedStyle);
      setCellCentreAff("M11", `CDI`, "s", AlignedStyle);
      setCellCentreAff("M12", `CDD`, "s", AlignedStyle);
      setCellCentreAff("M13", `Contrat aidé`, "s", AlignedStyle);
      setCellCentreAff("M14", `Intérim`, "s", AlignedStyle);
      setCellCentreAff("M15", `Alternance`, "s", AlignedStyle);
      setCellCentreAff("M16", `Stagiaire`, "s", AlignedStyle);
      setCellCentreAff(
        "N11",
        emploisCreatedByTypesCentreAff["cdi"],
        "s",
        AlignedStyle
      );
      setCellCentreAff(
        "N12",
        emploisCreatedByTypesCentreAff["cdd"],
        "s",
        AlignedStyle
      );
      setCellCentreAff(
        "N13",
        emploisCreatedByTypesCentreAff["aid"],
        "s",
        AlignedStyle
      );
      setCellCentreAff(
        "N14",
        emploisCreatedByTypesCentreAff["int"],
        "s",
        AlignedStyle
      );
      setCellCentreAff(
        "N15",
        emploisCreatedByTypesCentreAff["alter"],
        "s",
        AlignedStyle
      );
      setCellCentreAff(
        "N16",
        emploisCreatedByTypesCentreAff["stag"],
        "s",
        AlignedStyle
      );
      setCellCentreAff(
        "O11",
        `${Math.round(
          (emploisCreatedByTypesCentreAff["cdi"] /
            totalEmploisCreatedByTypesCentreAff) *
          100
        )}%`,
        "s",
        AlignedStyle
      );
      setCellCentreAff(
        "O12",
        `${Math.round(
          (emploisCreatedByTypesCentreAff["cdd"] /
            totalEmploisCreatedByTypesCentreAff) *
          100
        )}%`,
        "s",
        AlignedStyle
      );
      setCellCentreAff(
        "O13",
        `${Math.round(
          (emploisCreatedByTypesCentreAff["aid"] /
            totalEmploisCreatedByTypesCentreAff) *
          100
        )}%`,
        "s",
        AlignedStyle
      );
      setCellCentreAff(
        "O14",
        `${Math.round(
          (emploisCreatedByTypesCentreAff["int"] /
            totalEmploisCreatedByTypesCentreAff) *
          100
        )}%`,
        "s",
        AlignedStyle
      );
      setCellCentreAff(
        "O15",
        `${Math.round(
          (emploisCreatedByTypesCentreAff["alter"] /
            totalEmploisCreatedByTypesCentreAff) *
          100
        )}%`,
        "s",
        AlignedStyle
      );
      setCellCentreAff(
        "O16",
        `${Math.round(
          (emploisCreatedByTypesCentreAff["stag"] /
            totalEmploisCreatedByTypesCentreAff) *
          100
        )}%`,
        "s",
        AlignedStyle
      );

      worksheetCentreAff["!ref"] = "A1:Z100"; // worksheetCentreAff range

      worksheetCentreAff["!merges"] = [
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

      // Append the worksheetCentreAff to the workbook
      XLSX.utils.book_append_sheet(
        workbook,
        worksheetCentreAff,
        "BILAN Formule Centre d'affaires"
      );

      //Sheet CA Entreprises

      const worksheetCA = {} as any;

      function setCellCa(cellRef: any, value: any, type: any, style: any) {
        worksheetCA[cellRef] = { t: type, v: value, s: style };
      }

      let newCA = await db.raw(
        `
        SELECT
          tiepmca.tiepm_id,
          tiepm.raison_sociale,
          tiepmca.year,
          tiepmca.ca
        FROM
          tiepmca
        LEFT JOIN 
          tiepm ON tiepmca.tiepm_id = tiepm.tiepm_id
        WHERE 
          tiepmca.year = ?
          AND tiepm.company_id = ?
        `,
        [dateYear, company_id]
      );

      let prevCA = await db.raw(
        `
        SELECT
          tiepmca.tiepm_id,
          tiepm.raison_sociale,
          tiepmca.year,
          tiepmca.ca
        FROM
          tiepmca
        LEFT JOIN 
          tiepm ON tiepmca.tiepm_id = tiepm.tiepm_id
        WHERE 
          tiepmca.year = ?
          AND tiepm.company_id = ?
        `,
        [Number(dateYear) - 1, company_id]
      );

      let compareCA = await db.raw(
        `
        SELECT
          dateYearSummary.tiepm_id,
          dateYearSummary.raison_sociale,
          (dateYearSummary.ca - previousYearSummary.ca) AS DifferenceInCa
        FROM
          (
            SELECT
              tiepmca.tiepm_id,
              tiepm.raison_sociale,
              tiepmca.year,
              tiepmca.ca
            FROM
              tiepmca
            LEFT JOIN
              tiepm ON tiepmca.tiepm_id = tiepm.tiepm_id
            WHERE
              year = ?
              AND
              tiepm.company_id = ?
            GROUP BY 
              tiepmca.tiepm_id,
              tiepm.raison_sociale
          ) AS dateYearSummary
        INNER JOIN
          (
            SELECT
              tiepmca.tiepm_id,
              tiepm.raison_sociale,
              tiepmca.year,
              tiepmca.ca
            FROM
              tiepmca
            LEFT JOIN
              tiepm ON tiepmca.tiepm_id = tiepm.tiepm_id
            WHERE
              year = ?
            GROUP BY 
              tiepmca.tiepm_id,
              tiepm.raison_sociale
          ) AS previousYearSummary
          ON dateYearSummary.tiepm_id = previousYearSummary.tiepm_id AND dateYearSummary.raison_sociale = previousYearSummary.raison_sociale
        `,
        [dateYear, company_id, Number(dateYear) - 1]
      );

      setCellCa(
        "A1",
        "Grille de synthèse - Chiffre d'affaires des entreprises",
        "s",
        {
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
        "P",
      ]) {
        setCellCa(
          `${letter}1`,
          "Grille de synthèse - Chiffre d'affaires des entreprises",
          "s",
          {
            border: {
              top: { style: "medium", color: { rgb: "black" } },
              bottom: { style: "medium", color: { rgb: "black" } }, // Black color for bottom border
              right: { style: "medium", color: { rgb: "black" } },
            },
          }
        );
      }

      row = 4;

      const resultNewCA = newCA[0];
      const resultPrevCA = prevCA[0];
      const resultCompareCA = compareCA[0];

      setCellCa(`A${row - 1}`, `${dateYear}`, "s", boldAlignedStyle);
      setCellCa(`A${row}`, `ID`, "s", boldAlignedStyle);
      setCellCa(`B${row}`, `Raison Sociale`, "s", boldAlignedStyle);
      setCellCa(`C${row}`, `Année`, "s", boldAlignedStyle);
      setCellCa(`D${row}`, `Chiffre d'Affaire`, "s", boldAlignedStyle);

      setCellCa(
        `F${row - 1}`,
        `${Number(dateYear) - 1}`,
        "s",
        boldAlignedStyle
      );
      setCellCa(`F${row}`, `ID`, "s", boldAlignedStyle);
      setCellCa(`G${row}`, `Raison Sociale`, "s", boldAlignedStyle);
      setCellCa(`H${row}`, `Année`, "s", boldAlignedStyle);
      setCellCa(`I${row}`, `Chiffre d'Affaire`, "s", boldAlignedStyle);

      setCellCa(`K${row}`, `ID`, "s", boldAlignedStyle);
      setCellCa(`L${row}`, `Raison Sociale`, "s", boldAlignedStyle);
      setCellCa(
        `M${row}`,
        `Différence entre ${dateYear} et ${Number(dateYear) - 1}`,
        "s",
        boldAlignedStyle
      );

      row += 1;

      const totalCa = resultNewCA.reduce((acc: any, cur: any) => {
        acc += cur["ca"];
        return acc;
      }, 0);

      const cellTotal = row + resultNewCA.length;

      const totalCaPrev = resultPrevCA.reduce((acc: any, cur: any) => {
        acc += cur["ca"];
        return acc;
      }, 0);

      const cellTotalPrev = row + resultPrevCA.length;

      resultNewCA.forEach((item: any, index: any) => {
        setCellCa(`A${row + index}`, `${item["tiepm_id"]}`, "s", AlignedStyle);
        setCellCa(
          `B${row + index}`,
          `${item["raison_sociale"]}`,
          "s",
          AlignedStyle
        );
        setCellCa(`C${row + index}`, `${item["year"]}`, "s", AlignedStyle);
        setCellCa(`D${row + index}`, `${item["ca"]}`, "s", AlignedStyle);
      });

      resultPrevCA.forEach((item: any, index: any) => {
        setCellCa(`F${row + index}`, `${item["tiepm_id"]}`, "s", AlignedStyle);
        setCellCa(
          `G${row + index}`,
          `${item["raison_sociale"]}`,
          "s",
          AlignedStyle
        );
        setCellCa(`H${row + index}`, `${item["year"]}`, "s", AlignedStyle);
        setCellCa(`I${row + index}`, `${item["ca"]}`, "s", AlignedStyle);
      });

      resultCompareCA.forEach((item: any, index: any) => {
        setCellCa(`K${row + index}`, `${item["tiepm_id"]}`, "s", AlignedStyle);
        setCellCa(
          `L${row + index}`,
          `${item["raison_sociale"]}`,
          "s",
          AlignedStyle
        );
        setCellCa(
          `M${row + index}`,
          `${item["DifferenceInCa"]}`,
          "s",
          AlignedStyle
        );
      });

      setCellCa(`A${cellTotal}`, `Total`, "s", AlignedStyle);
      setCellCa(`B${cellTotal}`, `Total`, "s", AlignedStyle);
      setCellCa(`C${cellTotal}`, `Total`, "s", AlignedStyle);
      setCellCa(`D${cellTotal}`, `${totalCa}`, "s", AlignedStyle);

      setCellCa(`F${cellTotalPrev}`, `Total`, "s", AlignedStyle);
      setCellCa(`G${cellTotalPrev}`, `Total`, "s", AlignedStyle);
      setCellCa(`H${cellTotalPrev}`, `Total`, "s", AlignedStyle);
      setCellCa(`I${cellTotalPrev}`, `${totalCaPrev}`, "s", AlignedStyle);

      worksheetCA["!ref"] = "A1:Z500"; // worksheet range

      worksheetCA["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 15 } }, // A1 to D1
        { s: { r: cellTotal - 1, c: 0 }, e: { r: cellTotal - 1, c: 2 } },
        {
          s: { r: cellTotalPrev - 1, c: 5 },
          e: { r: cellTotalPrev - 1, c: 7 },
        },
      ]; // Merging cells

      XLSX.utils.book_append_sheet(workbook, worksheetCA, "Données CA");

      //Sheet emplois crées
      const worksheetEmplois = {} as any;

      function setCellEmplois(cellRef: any, value: any, type: any, style: any) {
        worksheetEmplois[cellRef] = { t: type, v: value, s: style };
      }

      let emplois = await db.raw(
        `
        SELECT
          tiepmeff.tiepm_id,
          tiepm.raison_sociale,
          tiepmeff.year,
          tiepmeff.nb_cdi,
          tiepmeff.nb_cdd,
          tiepmeff.nb_int,
          tiepmeff.nb_caid,
          tiepmeff.nb_alt,
          tiepmeff.nb_stg
        FROM
          tiepmeff
        LEFT JOIN 
          tiepm ON tiepmeff.tiepm_id = tiepm.tiepm_id
        WHERE 
          tiepmeff.year = ?
          AND tiepm.company_id = ?
        `,
        [dateYear, company_id]
      );

      let emploisPrev = await db.raw(
        `
        SELECT
          tiepmeff.tiepm_id,
          tiepm.raison_sociale,
          tiepmeff.year,
          tiepmeff.nb_cdi,
          tiepmeff.nb_cdd,
          tiepmeff.nb_int,
          tiepmeff.nb_caid,
          tiepmeff.nb_alt,
          tiepmeff.nb_stg
        FROM
          tiepmeff
        LEFT JOIN 
          tiepm ON tiepmeff.tiepm_id = tiepm.tiepm_id
        WHERE 
          tiepmeff.year = ?
          AND tiepm.company_id = ?
        `,
        [Number(dateYear) - 1, company_id]
      );

      let emploisCompare = await db.raw(
        `
        SELECT
          dateYearSummary.tiepm_id,
          dateYearSummary.raison_sociale,
          (dateYearSummary.TotalWorkforce - previousYearSummary.TotalWorkforce) AS DifferenceInWorkforce
        FROM
          (
            SELECT
              tiepmeff.tiepm_id,
              tiepm.raison_sociale,
              tiepmeff.year,
              SUM(tiepmeff.nb_cdi + tiepmeff.nb_cdd + tiepmeff.nb_int + tiepmeff.nb_caid + tiepmeff.nb_alt + tiepmeff.nb_stg) AS TotalWorkforce
            FROM
              tiepmeff
            LEFT JOIN
              tiepm ON tiepmeff.tiepm_id = tiepm.tiepm_id
            WHERE
              year = ?
            GROUP BY 
              tiepmeff.tiepm_id,
              tiepm.raison_sociale
          ) AS dateYearSummary
        INNER JOIN
          (
            SELECT
              tiepmeff.tiepm_id,
              tiepm.raison_sociale,
              tiepmeff.year,
              SUM(tiepmeff.nb_cdi + tiepmeff.nb_cdd + tiepmeff.nb_int + tiepmeff.nb_caid + tiepmeff.nb_alt + tiepmeff.nb_stg) AS TotalWorkforce
            FROM
              tiepmeff
            LEFT JOIN
              tiepm ON tiepmeff.tiepm_id = tiepm.tiepm_id
            WHERE
              year = ?
            GROUP BY 
              tiepmeff.tiepm_id,
              tiepm.raison_sociale
          ) AS previousYearSummary
          ON dateYearSummary.tiepm_id = previousYearSummary.tiepm_id AND dateYearSummary.raison_sociale = previousYearSummary.raison_sociale
        `,
        [dateYear, Number(dateYear) - 1]
      );

      setCellEmplois(
        "A1",
        "Grille de synthèse - Emplois crées des entreprises",
        "s",
        {
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
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
        "W",
      ]) {
        setCellEmplois(
          `${letter}1`,
          "Grille de synthèse - Emplois crées des entreprises",
          "s",
          {
            border: {
              top: { style: "medium", color: { rgb: "black" } },
              bottom: { style: "medium", color: { rgb: "black" } }, // Black color for bottom border
              right: { style: "medium", color: { rgb: "black" } },
            },
          }
        );
      }

      row = 4;

      const resultEmplois = emplois[0];
      const resultEmploisPrev = emploisPrev[0];
      const resultEmploisCompare = emploisCompare[0];

      setCellEmplois(`A${row - 1}`, `${dateYear}`, "s", boldAlignedStyle);
      setCellEmplois(`B${row - 1}`, `${dateYear}`, "s", boldAlignedStyle);
      setCellEmplois(`C${row - 1}`, `${dateYear}`, "s", boldAlignedStyle);
      setCellEmplois(`D${row - 1}`, `${dateYear}`, "s", boldAlignedStyle);
      setCellEmplois(`E${row - 1}`, `${dateYear}`, "s", boldAlignedStyle);
      setCellEmplois(`F${row - 1}`, `${dateYear}`, "s", boldAlignedStyle);
      setCellEmplois(`G${row - 1}`, `${dateYear}`, "s", boldAlignedStyle);
      setCellEmplois(`H${row - 1}`, `${dateYear}`, "s", boldAlignedStyle);
      setCellEmplois(`I${row - 1}`, `${dateYear}`, "s", boldAlignedStyle);
      setCellEmplois(`A${row}`, `ID`, "s", boldAlignedStyle);
      setCellEmplois(`B${row}`, `Raison Sociale`, "s", boldAlignedStyle);
      setCellEmplois(`C${row}`, `CDI(s)`, "s", boldAlignedStyle);
      setCellEmplois(`D${row}`, `CDD(s)`, "s", boldAlignedStyle);
      setCellEmplois(`E${row}`, `Intérimaire(s)`, "s", boldAlignedStyle);
      setCellEmplois(`F${row}`, `Contrat(s) aidé(s)`, "s", boldAlignedStyle);
      setCellEmplois(`G${row}`, `Alternant(s)`, "s", boldAlignedStyle);
      setCellEmplois(`H${row}`, `Stagiaire(s)`, "s", boldAlignedStyle);
      setCellEmplois(`I${row}`, `Total`, "s", boldAlignedStyle);

      setCellEmplois(
        `K${row - 1}`,
        `${Number(dateYear) - 1}`,
        "s",
        boldAlignedStyle
      );
      setCellEmplois(
        `L${row - 1}`,
        `${Number(dateYear) - 1}`,
        "s",
        boldAlignedStyle
      );
      setCellEmplois(
        `M${row - 1}`,
        `${Number(dateYear) - 1}`,
        "s",
        boldAlignedStyle
      );
      setCellEmplois(
        `N${row - 1}`,
        `${Number(dateYear) - 1}`,
        "s",
        boldAlignedStyle
      );
      setCellEmplois(
        `O${row - 1}`,
        `${Number(dateYear) - 1}`,
        "s",
        boldAlignedStyle
      );
      setCellEmplois(
        `P${row - 1}`,
        `${Number(dateYear) - 1}`,
        "s",
        boldAlignedStyle
      );
      setCellEmplois(
        `Q${row - 1}`,
        `${Number(dateYear) - 1}`,
        "s",
        boldAlignedStyle
      );
      setCellEmplois(
        `R${row - 1}`,
        `${Number(dateYear) - 1}`,
        "s",
        boldAlignedStyle
      );
      setCellEmplois(
        `S${row - 1}`,
        `${Number(dateYear) - 1}`,
        "s",
        boldAlignedStyle
      );
      setCellEmplois(`K${row}`, `ID`, "s", boldAlignedStyle);
      setCellEmplois(`L${row}`, `Raison Sociale`, "s", boldAlignedStyle);
      setCellEmplois(`M${row}`, `CDI(s)`, "s", boldAlignedStyle);
      setCellEmplois(`N${row}`, `CDD(s)`, "s", boldAlignedStyle);
      setCellEmplois(`O${row}`, `Intérimaire(s)`, "s", boldAlignedStyle);
      setCellEmplois(`P${row}`, `Contrat(s) aidé(s)`, "s", boldAlignedStyle);
      setCellEmplois(`Q${row}`, `Alternant(s)`, "s", boldAlignedStyle);
      setCellEmplois(`R${row}`, `Stagiaire(s)`, "s", boldAlignedStyle);
      setCellEmplois(`S${row}`, `Total`, "s", boldAlignedStyle);

      setCellEmplois(`U${row}`, `ID`, "s", boldAlignedStyle);
      setCellEmplois(`V${row}`, `Raison sociale`, "s", boldAlignedStyle);
      setCellEmplois(
        `W${row}`,
        `Différence entre ${dateYear} et ${Number(dateYear) - 1}`,
        "s",
        boldAlignedStyle
      );

      row += 1;
      resultEmplois.forEach((item: any, index: any) => {
        setCellEmplois(
          `A${row + index}`,
          `${item["tiepm_id"]}`,
          "s",
          AlignedStyle
        );
        setCellEmplois(
          `B${row + index}`,
          `${item["raison_sociale"]}`,
          "s",
          AlignedStyle
        );
        setCellEmplois(
          `C${row + index}`,
          `${item["nb_cdi"]}`,
          "s",
          AlignedStyle
        );
        setCellEmplois(
          `D${row + index}`,
          `${item["nb_cdd"]}`,
          "s",
          AlignedStyle
        );
        setCellEmplois(
          `E${row + index}`,
          `${item["nb_int"]}`,
          "s",
          AlignedStyle
        );
        setCellEmplois(
          `F${row + index}`,
          `${item["nb_caid"]}`,
          "s",
          AlignedStyle
        );
        setCellEmplois(
          `G${row + index}`,
          `${item["nb_alt"]}`,
          "s",
          AlignedStyle
        );
        setCellEmplois(
          `H${row + index}`,
          `${item["nb_stg"]}`,
          "s",
          AlignedStyle
        );
        setCellEmplois(
          `I${row + index}`,
          `${item["nb_cdi"] +
          item["nb_cdd"] +
          item["nb_stg"] +
          item["nb_int"] +
          item["nb_caid"] +
          item["nb_alt"] +
          item["nb_stg"]
          }`,
          "s",
          AlignedStyle
        );
      });

      resultEmploisPrev.forEach((item: any, index: any) => {
        setCellEmplois(
          `K${row + index}`,
          `${item["tiepm_id"]}`,
          "s",
          AlignedStyle
        );
        setCellEmplois(
          `L${row + index}`,
          `${item["raison_sociale"]}`,
          "s",
          AlignedStyle
        );
        setCellEmplois(
          `M${row + index}`,
          `${item["nb_cdi"]}`,
          "s",
          AlignedStyle
        );
        setCellEmplois(
          `N${row + index}`,
          `${item["nb_cdd"]}`,
          "s",
          AlignedStyle
        );
        setCellEmplois(
          `O${row + index}`,
          `${item["nb_int"]}`,
          "s",
          AlignedStyle
        );
        setCellEmplois(
          `P${row + index}`,
          `${item["nb_caid"]}`,
          "s",
          AlignedStyle
        );
        setCellEmplois(
          `Q${row + index}`,
          `${item["nb_alt"]}`,
          "s",
          AlignedStyle
        );
        setCellEmplois(
          `R${row + index}`,
          `${item["nb_stg"]}`,
          "s",
          AlignedStyle
        );
        setCellEmplois(
          `S${row + index}`,
          `${item["nb_cdi"] +
          item["nb_cdd"] +
          item["nb_stg"] +
          item["nb_int"] +
          item["nb_caid"] +
          item["nb_alt"] +
          item["nb_stg"]
          }`,
          "s",
          AlignedStyle
        );
      });

      resultEmploisCompare.forEach((item: any, index: any) => {
        setCellEmplois(
          `U${row + index}`,
          `${item["tiepm_id"]}`,
          "s",
          AlignedStyle
        );
        setCellEmplois(
          `V${row + index}`,
          `${item["raison_sociale"]}`,
          "s",
          AlignedStyle
        );
        setCellEmplois(
          `W${row + index}`,
          `${item["DifferenceInWorkforce"]}`,
          "s",
          AlignedStyle
        );
      });

      // setCellEmplois(`A${cellTotal}`, `Total`, 's', AlignedStyle)
      // setCellEmplois(`D${cellTotal}`, `${totalCa}`, 's', AlignedStyle)

      worksheetEmplois["!ref"] = "A1:Z500"; // worksheet range

      worksheetEmplois["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 22 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 8 } },
        { s: { r: 2, c: 10 }, e: { r: 2, c: 18 } },
        // { s: { r: cellTotal - 1, c: 0 }, e: { r: cellTotal - 1, c: 2} },
      ]; // Merging cells

      XLSX.utils.book_append_sheet(workbook, worksheetEmplois, "Emplois créés");

      //Etat de présence
      const worksheetPresence = {} as any;

      function setCellPresence(
        cellRef: any,
        value: any,
        type: any,
        style: any
      ) {
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
          tierel ON tierel.tiepp_id = tiepp.tiepp_id
        LEFT JOIN 
          tiepm ON tiepm.tiepm_id = tierel.tiepm_id
        LEFT JOIN 
          tieppprj ON tieppprj.tiepp_id = tiepp.tiepp_id
        LEFT JOIN 
          tieppaccsuivi ON tieppaccsuivi.tiepp_id = tiepp.tiepp_id
        WHERE 
          tieformpp.formule_id = 1
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
          tieformpp.date_fin_formule
        `,
        [dateFin, dateDeb, company_id]
      );

      setCellPresence("A1", "Accompagnement Pépins", "s", {
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
        setCellPresence(`${letter}1`, "Accompagnement Pépins", "s", {
          border: {
            top: { style: "medium", color: { rgb: "black" } },
            bottom: { style: "medium", color: { rgb: "black" } }, // Black color for bottom border
            right: { style: "medium", color: { rgb: "black" } },
          },
        });
      }

      row = 4;

      let resultsPresence = presence[0];

      setCellPresence(`A${row - 1}`, `Pépins`, "s", boldAlignedStyle);
      setCellPresence(`B${row - 1}`, `Pépins`, "s", boldAlignedStyle);
      setCellPresence(`C${row - 1}`, `Pépins`, "s", boldAlignedStyle);
      setCellPresence(`D${row - 1}`, `Pépins`, "s", boldAlignedStyle);
      setCellPresence(`E${row - 1}`, `Pépins`, "s", boldAlignedStyle);

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
        setCellPresence(
          `A${row + index}`,
          `${item["tiepp_id"]}`,
          "s",
          AlignedStyle
        );
        setCellPresence(
          `B${row + index}`,
          `${item["libelle"]}`,
          "s",
          AlignedStyle
        );
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
        setCellPresence(
          `H${row + index}`,
          `${item["Mars"]}`,
          "s",
          AlignedStyle
        );
        setCellPresence(
          `I${row + index}`,
          `${item["Avril"]}`,
          "s",
          AlignedStyle
        );
        setCellPresence(`J${row + index}`, `${item["Mai"]}`, "s", AlignedStyle);
        setCellPresence(
          `K${row + index}`,
          `${item["Juin"]}`,
          "s",
          AlignedStyle
        );
        setCellPresence(
          `L${row + index}`,
          `${item["Juillet"]}`,
          "s",
          AlignedStyle
        );
        setCellPresence(
          `M${row + index}`,
          `${item["Août"]}`,
          "s",
          AlignedStyle
        );
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
          tieformpp ON tieppaccsuivi.tiepp_id = tieformpp.tiepp_id
        LEFT JOIN 
          sujets_accompagnements_params ON sujets_accompagnements_params.sujet_accompagnement_id = tieppaccsuivi.sujet_accompagnement_id
        WHERE 
          tieformpp.formule_id = 1
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
          tieformpp.formule_id = 1
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
        GROUP BY
        tiepp.tiepp_id
        `,
        [dateFin, dateDeb]
      );

      const idCompanies = formPepCompanies[0].reduce((acc: any, cur: any) => {
        acc[cur["tiepp_id"]] = cur["Entreprise(s)"];
        return acc;
      }, {});

      setCellFormPep("A1", "Accompagnement Pépins", "s", {
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
        setCellFormPep(`${letter}1`, "Accompagnement Pépins", "s", {
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
            output = {
              [row.tiepp_id]: [[letterTotal, subjects.length]],
              ...output,
            };
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

      setCellFormPep(`A${row - 1}`, `Pépins`, "s", boldAlignedStyle);
      setCellFormPep(`B${row - 1}`, `Pépins`, "s", boldAlignedStyle);
      setCellFormPep(`C${row - 1}`, `Pépins`, "s", boldAlignedStyle);
      setCellFormPep(`D${row - 1}`, `Pépins`, "s", boldAlignedStyle);
      setCellFormPep(`E${row - 1}`, `Pépins`, "s", boldAlignedStyle);
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
      setCellFormPep(
        `D${row}`,
        `Date d'entrée pépinière`,
        "s",
        boldAlignedStyle
      );
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
        setCellFormPep(
          `A${row + index}`,
          `${item["tiepp_id"]}`,
          "s",
          AlignedStyle
        );
        setCellFormPep(
          `B${row + index}`,
          `${item["libelle"]}`,
          "s",
          AlignedStyle
        );
        setCellFormPep(
          `C${row + index}`,
          `${idCompanies[item["tiepp_id"]]}`,
          "s",
          AlignedStyle
        );
        setCellFormPep(
          `D${row + index}`,
          `${item["date_debut_formule"]}`,
          "s",
          AlignedStyle
        );
        setCellFormPep(
          `E${row + index}`,
          `${item["date_fin_formule"]}`,
          "s",
          AlignedStyle
        );
        subjects.forEach((subject: any) => {
          setCellFormPep(
            `${subject[0]}${row + index}`,
            `${subject[1]}`,
            "s",
            AlignedStyle
          );
        });
      });

      worksheetFormPep["!ref"] = "A1:Z500";

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
        "attachment; filename=" + "BilanFormules.xlsx"
      );
      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
      res.end(buffer);
    } catch (e) {
      console.error(e);
      res.status(500).json(e);
    }
  }
);

export { router as bilanFormulesRouter };
