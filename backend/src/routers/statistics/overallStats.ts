import express from "express";
import dotenv from "dotenv";
import { db } from "../../data/db";
import { UserRequest, verifyUser } from "../../middlewares/checkUser";
import { Knex } from "knex";
import { calculateDuration, formatDuration } from "../../utilities/functions";

dotenv.config();

const router = express.Router();


router.get(
  "/overall/:dateDebut/:dateFin",
  verifyUser,
  async (req: UserRequest, res) => {
    /* 
 #swagger.tags = ['Stats']
 #swagger.description = "Get the overall stats for a given date range."
 #swagger.parameters['dateDebut'] = {
      in: 'path',
      description: 'begin date',
      required: true,
      type: 'string'
 }
#swagger.parameters['dateFin'] = {
      in: 'path',
      description: 'end date',
      required: true,
      type: 'string'
 }
*/
    
    const company_id = req.company_id;
    const { dateFin, dateDebut } = req.params;

    const hostedCompanies = await db("tieformpm")
      .select("formules_params.name as label")
      .count("tieformpm.formule_id as value")
      .leftJoin("tiepm", "tiepm.tiepm_id", "tieformpm.tiepm_id")
      .leftJoin(
        "formules_params",
        "formules_params.formule_id",
        "tieformpm.formule_id"
      )
      .where(function () {
        this.where(
          "tieformpm.date_debut_formule",
          "<=",
          dateFin || new Date().toISOString()
        ).andWhere(function () {
          this.where(
            "tieformpm.date_fin_formule",
            ">=",
            db.raw("?", [dateDebut])
          ).orWhereNull("tieformpm.date_fin_formule");
        });
      })
      .whereIn("formules_params.name", [
        "PEPINIERE",
        "CENTRE D'AFFAIRES",
        "COWORKING",
        "PORTEUR PROJET",
        "EXTRA-MUROS",
      ])
      .where({ "tiepm.company_id": company_id })
      .groupBy("formules_params.name");

    const hostedPPSex = await db("tiepp")
      .select("tiepp.sex as label")
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
            db.raw("?", [dateDebut])
          ).orWhereNull("tieformpp.date_fin_formule");
        });
      })
      .whereIn("formules_params.name", [
        "PEPINIERE",
        "CENTRE D'AFFAIRES",
        "COWORKING",
      ])
      .groupBy("tiepp.sex");

    let hostedPorteurProjetQuery = await db("tiepp")
      .select("tiepp.first_meeting_date")
      .count("* as nbMeetings")
      .where({ "tiepp.company_id": company_id })
      .whereBetween("tiepp.first_meeting_date", [
        dateDebut,
        dateFin || "9999-12-31",
      ])
      .groupBy("tiepp.first_meeting_date")
      .orderBy("tiepp.first_meeting_date", "asc");

    const xAxishostedPorteurProjet = hostedPorteurProjetQuery.map(
      (item) => item.first_meeting_date
    );
    const yAxishostedPorteurProjet = hostedPorteurProjetQuery.map(
      (item) => item.nbMeetings
    );

    const hostedPorteurProjet = {
      xAxis: xAxishostedPorteurProjet,
      yAxis: yAxishostedPorteurProjet,
    };

    const accExtraMurosQuery = await db("tieformpm")
      .count({ value: "tieformpm.formule_id" })
      .leftJoin("tiepm", "tiepm.tiepm_id", "tieformpm.tiepm_id")
      .where({ "tiepm.company_id": company_id })
      .where("tieformpm.date_debut_formule", "<=", dateFin)
      .andWhere((builder) => {
        builder
          .where("tieformpm.date_fin_formule", ">=", dateDebut)
          .orWhereNull("tieformpm.date_fin_formule");
      })
      .andWhere("tieformpm.formule_id", 5)
      .groupBy("tieformpm.formule_id")
      .first();

    const accExtraMuros = {
      objectif: 20,
      value: accExtraMurosQuery ? accExtraMurosQuery.value : 0,
    };

    const entCompanies = await db("tieformpm")
      .select("formules_params.name")
      .count({ value: "tieformpm.formule_id" })
      .leftJoin("tiepm", "tiepm.tiepm_id", "tieformpm.tiepm_id")
      .leftJoin(
        "formules_params",
        "formules_params.formule_id",
        "tieformpm.formule_id"
      )
      .where({ "tiepm.company_id": company_id })
      .whereBetween("tieformpm.date_debut_formule", [
        dateDebut,
        dateFin || "9999-12-31",
      ])
      .whereIn("tieformpm.formule_id", [1, 3, 4])
      .groupBy("formules_params.name");

    const sorCompanies = await db("tieformpm")
      .select("formules_params.name")
      .count({ value: "tieformpm.formule_id" })
      .leftJoin(
        "formules_params",
        "formules_params.formule_id",
        "tieformpm.formule_id"
      )
      .leftJoin("tiepm", "tiepm.tiepm_id", "tieformpm.tiepm_id")
      .where({ "tiepm.company_id": company_id })
      .whereBetween("tieformpm.date_fin_formule", [
        dateDebut,
        dateFin || "9999-12-31",
      ])
      .whereIn("tieformpm.formule_id", [1, 3, 4])
      .groupBy("formules_params.name");


    const formuleMap: Record<number, string> = {
      1: "PEPINIERE",
      2: "PORTEUR PROJET",
      3: "CENTRE D'AFFAIRES",
      4: "COWORKING",
      5: "EXTRA-MUROS"
    };

    const sectorsCompaniesByFormule = await Promise.all(
      Object.keys(formuleMap).map(async (formuleId) => {
        let sectorsCompanies = await db
          .select('unique_individuals.name AS name')
          .count('* as value')
          .from(function (qb: Knex.QueryBuilder) {
            qb.distinct('tiepm.tiepm_id', 'secteurs_activites_params.name')
              .from('tiepm')
              .leftJoin('secteurs_activites_params', 'secteurs_activites_params.secteur_activite_id', 'tiepm.secteur_activite_id')
              .leftJoin('tieformpm', 'tieformpm.tiepm_id', 'tiepm.tiepm_id')
              .where('tieformpm.date_debut_formule', '<=', dateFin)
              .andWhere((builder) => {
                builder.where('tieformpm.date_fin_formule', '>=', dateDebut)
                  .orWhereNull('tieformpm.date_fin_formule');
              })
              .where('tieformpm.formule_id', Number(formuleId))
              .whereNotNull('tiepm.secteur_activite_id')
              .where("secteurs_activites_params.is_deleted", false)
              .where('tiepm.company_id', company_id)
              .as('unique_individuals');
          })
          .groupBy('unique_individuals.name');

        return { formuleName: formuleMap[Number(formuleId)], data: sectorsCompanies };
      })
    );

    const sectorsCompanies: Record<string, { name: string; value: number }[]> = {};

    sectorsCompaniesByFormule.forEach(({ formuleName, data }) => {
      sectorsCompanies[formuleName] = data;
    });

    const accEntretiensQuery = await db("tieppaccsuivi")
      .select("unique_individuals.name")
      .count({ value: "unique_individuals.sujet_accompagnement_id" })
      .from(function (this: Knex.QueryBuilder) {
        this.select({
          name: "sujets_accompagnements_params.name",
          sujet_accompagnement_id: "tieppaccsuivi.sujet_accompagnement_id",
        })
          .from("tieppaccsuivi")
          .leftJoin("tieformpp", "tieformpp.tiepp_id", "tieppaccsuivi.tiepp_id")
          .leftJoin("tiepp", "tiepp.tiepp_id", "tieppaccsuivi.tiepp_id")
          .leftJoin(
            "sujets_accompagnements_params",
            "sujets_accompagnements_params.sujet_accompagnement_id",
            "tieppaccsuivi.sujet_accompagnement_id"
          )
          .where({ "tiepp.company_id": company_id })
          .where("tieformpp.date_debut_formule", "<=", dateFin)
          .andWhere((builder: Knex.QueryBuilder) => {
            builder
              .where("tieformpp.date_fin_formule", ">=", dateDebut)
              .orWhereNull("tieformpp.date_fin_formule");
          })
          .andWhere("tieformpp.formule_id", 1)
          .andWhereBetween("tieppaccsuivi.date_acc_suivi", [
            dateDebut,
            dateFin || "9999-12-31",
          ])
          .andWhere("tieppaccsuivi.typ_accompagnement_id", 1)
          .as("unique_individuals");
      })
      .groupBy("unique_individuals.name");

    const accInfosEntretiensQuery = await db("tieppaccsuivi")
      .select(
        "sujets_accompagnements_params.name",
        "tieppaccsuivi.hour_end",
        "tieppaccsuivi.hour_begin"
      )
      .leftJoin("tieformpp", "tieformpp.tiepp_id", "tieppaccsuivi.tiepp_id")
      .leftJoin(
        "sujets_accompagnements_params",
        "sujets_accompagnements_params.sujet_accompagnement_id",
        "tieppaccsuivi.sujet_accompagnement_id"
      )
      .leftJoin("tiepp", "tiepp.tiepp_id", "tieppaccsuivi.tiepp_id")
      .where({ "tiepp.company_id": company_id })
      .where("tieformpp.date_debut_formule", "<=", dateFin)
      .andWhere((builder) => {
        builder
          .where("tieformpp.date_fin_formule", ">=", dateDebut)
          .orWhereNull("tieformpp.date_fin_formule");
      })
      .andWhere("tieformpp.formule_id", 1)
      .andWhereBetween("tieppaccsuivi.date_acc_suivi", [
        dateDebut,
        dateFin || "9999-12-31",
      ])
      .andWhere("tieppaccsuivi.typ_accompagnement_id", 1);

    const infos = accInfosEntretiensQuery.reduce(
      (
        acc: { name: string; totalMinutes: number; value: string }[],
        {
          name,
          hour_begin,
          hour_end,
        }: { name: string; hour_begin: string; hour_end: string }
      ) => {
        const duration = calculateDuration(hour_begin, hour_end);

        const existing = acc.find((item) => item.name === name);
        if (existing) {
          existing.totalMinutes += duration;
          existing.value = formatDuration(existing.totalMinutes);
        } else {
          acc.push({
            name,
            totalMinutes: duration,
            value: formatDuration(duration),
          });
        }

        return acc;
      },
      [] as { name: string; totalMinutes: number; value: string }[]
    );
    
    const accEntretiens = {
      entretiens: accEntretiensQuery,
      infos,
      totalTime: formatDuration(
        infos.reduce(
          (
            acc: number,
            cur: { name: string; totalMinutes: number; value: string }
          ) => {
            return (acc += cur.totalMinutes);
          },
          0
        )
      ),
      nbEntretiens: accEntretiensQuery.reduce((acc, cur) => {
        return (acc += cur.value);
      }, 0),
    };

    const formuleMapHeader: Record<number, string> = {
      1: "PEPINIERE",
      2: "PORTEUR PROJET",
      5: "EXTRA-MUROS"
    };
    
    const sujetsByFormule = await Promise.all(
      Object.keys(formuleMapHeader).map(async (formuleId) => {
        const data = await db('tieppaccsuivi')
          .select(
            'sujets_accompagnements_params.name as Sujet',
            db.raw('COUNT(sujets_accompagnements_params.name) as "Nb Sujet"'),
            db.raw(`
              CONCAT(
                FLOOR(SUM(TIME_TO_SEC(tieppaccsuivi.hour_end) - TIME_TO_SEC(tieppaccsuivi.hour_begin)) / 3600), 'h', 
                LPAD(FLOOR((SUM(TIME_TO_SEC(tieppaccsuivi.hour_end) - TIME_TO_SEC(tieppaccsuivi.hour_begin)) % 3600) / 60), 2, '0'), 'm'
              ) as "Total Interview Time (HHhMM)"
            `)
          )
          .distinct('tieppaccsuivi.tiepp_id')
          .leftJoin(
            'sujets_accompagnements_params',
            'sujets_accompagnements_params.sujet_accompagnement_id',
            'tieppaccsuivi.sujet_accompagnement_id'
          )
          .leftJoin('tieformpp', 'tieformpp.tiepp_id', 'tieppaccsuivi.tiepp_id')
          .leftJoin('tiepp', 'tiepp.tiepp_id', 'tieppaccsuivi.tiepp_id')
          .where('tieformpp.date_debut_formule', '<=', dateFin)
          .andWhere((qb) => {
            qb.where('tieformpp.date_fin_formule', '>=', dateDebut)
              .orWhereNull('tieformpp.date_fin_formule');
          })
          .andWhereBetween("tieppaccsuivi.date_acc_suivi", [
            dateDebut,
            dateFin || "9999-12-31",
          ])    
          .where('tieformpp.formule_id', Number(formuleId))
          .whereNotNull('tieppaccsuivi.sujet_accompagnement_id')
          .where('tieppaccsuivi.typ_accompagnement_id', 1)
          .where('tiepp.company_id', company_id)
          .groupBy('sujets_accompagnements_params.name');
    
        return { formuleName: formuleMapHeader[Number(formuleId)], data };
      })
    );
    
    interface InterviewTimeResult {
      "Nb people": number;
      "Total Interview Time (HHhMM)": string;
    }
    
    interface FormuleResult {
      formuleName: string;
      data: InterviewTimeResult;
    }

    const totalInterviewTimesFirstMeeting : FormuleResult[] = await Promise.all(
      Object.keys(formuleMapHeader).map(async (formuleId) => {
        const data = await db('tiepp')
          .select(
            db.raw('COUNT(DISTINCT tiepp.tiepp_id) as "Nb people"'),
            db.raw(`
              CONCAT(
                FLOOR(SUM(TIME_TO_SEC(tiepp.first_meeting_hour_end) - TIME_TO_SEC(tiepp.first_meeting_hour_begin)) / 3600), 'h', 
                LPAD(FLOOR((SUM(TIME_TO_SEC(tiepp.first_meeting_hour_end) - TIME_TO_SEC(tiepp.first_meeting_hour_begin)) % 3600) / 60), 2, '0'), 'm'
              ) as "Total Interview Time (HHhMM)"
            `)
          )
          .leftJoin('tieformpp', 'tieformpp.tiepp_id', 'tiepp.tiepp_id')
          .where('tieformpp.formule_id', Number(formuleId))
          .where('tieformpp.date_debut_formule', '<=', dateFin)
          .andWhere((qb) => {
            qb.where('tieformpp.date_fin_formule', '>=', dateDebut)
              .orWhereNull('tieformpp.date_fin_formule');
          })
          .where('tiepp.company_id', company_id)
          .whereNotNull('tiepp.first_meeting_hour_begin')
          .whereNotNull('tiepp.first_meeting_hour_end')
          .whereBetween('tiepp.first_meeting_date', [dateDebut, dateFin || '9999-12-31']);
    
        return { 
          formuleName: formuleMapHeader[Number(formuleId)], 
          data: data[0] 
        };
      })
    );
    
    const totalNbSujetByFormule: { name: string; value: number }[] = [];
    let nbEntretiens = 0;
    let totalTimeArray: string[] = []; 

    // console.log(sujetsByFormule)
    // console.log(totalInterviewTimesFirstMeeting)

    sujetsByFormule.forEach(({ formuleName, data }) => {
      const totalNbSujet = data.reduce((sum, item) => sum + Number(item["Nb Sujet"]), 0);
      
      totalNbSujetByFormule.push({
        name: formuleName,
        value: totalNbSujet,
      });
    
      nbEntretiens += totalNbSujet;
    
      data.forEach(item => {
        if (item["Total Interview Time (HHhMM)"]) {
          totalTimeArray.push(item["Total Interview Time (HHhMM)"]);
        }
      });
    });

    totalInterviewTimesFirstMeeting.forEach(({ formuleName, data }) => {
      nbEntretiens += data["Nb people"]

      const foundFormule = totalNbSujetByFormule.find((item) => item.name === formuleName);
      if (foundFormule) {
        foundFormule.value += data["Nb people"];
      }

      if (data["Total Interview Time (HHhMM)"]) {
        totalTimeArray.push(data["Total Interview Time (HHhMM)"])
      }
    });
    
    const sumTimes = (timeArray: string[]) => {
      let totalMinutes = 0;
    
      timeArray.forEach(time => {
        const match = time.match(/(\d+)h(\d+)m/);
        if (match) {
          totalMinutes += parseInt(match[1]) * 60 + parseInt(match[2]);
        }
      });
    
      
      return formatDuration(totalMinutes);
    };
    
    const totalTime = sumTimes(totalTimeArray);
    
    const headerStatsEnt = {
      totalNbSujetByFormule, 
      totalTime,
      nbEntretiens,
    };

    const allUgsQuery = await db("ugdesc")
      .select(
        "ugdesc.ug_id",
        "ugdesc.name",
        db.raw(`CONCAT('ETAGE ', ugetages.num_etage) AS parentName`),
        "ugdesc.surface AS size"
      )
      .leftJoin(
        "nature_ug_params",
        "nature_ug_params.nature_ug_id",
        "ugdesc.nature_ug_id"
      )
      .leftJoin("ugetages", "ugetages.etage_id", "ugdesc.etage_id")
      .where({ "ugdesc.company_id": company_id })
      .where("nature_ug_params.name", "BUREAU");

    const surfaceOccupiedUgsQuery = await db("ugconv")
      .select("ugconv.ug_id")
      .sum("ugconv.surface_rent AS surfaceOcc")
      .innerJoin(
        db("ugconv")
          .select("ugconv.conv_id")
          .max("ugconv.version AS max_version")
          .innerJoin("convdesc", "convdesc.conv_id", "ugconv.conv_id")
          .where({ "convdesc.company_id": company_id })
          .groupBy("ugconv.conv_id")
          .as("maxVrs"),
        function () {
          this.on("maxVrs.conv_id", "=", "ugconv.conv_id").andOn(
            "maxVrs.max_version",
            "=",
            "ugconv.version"
          );
        }
      )
      .andWhere("ugconv.date_debut", "<=", dateFin)
      .andWhere((builder) => {
        builder
          .where("ugconv.date_fin", ">=", dateDebut)
          .orWhereNull("ugconv.date_fin");
      })
      .groupBy("ugconv.ug_id");


    const ugIdsOccupied = surfaceOccupiedUgsQuery.map((surfaceOccupied) =>
      surfaceOccupied.ug_id
    )

    const tenantsQuery = await db("ugconv")
      .select(
        "convdesc.conv_id",
        "convdesc.version",
        "convdesc.raison_sociale",
        "ugconv.date_debut",
        "ugconv.date_fin",
        "ugconv.surface_rent",
        "ugconv.ug_id"
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
      .whereIn("ugconv.ug_id", ugIdsOccupied)
      .andWhere("ugconv.date_debut", "<=", dateFin)
      .andWhere((builder) => {
        builder
          .where("ugconv.date_fin", ">=", dateDebut)
          .orWhereNull("ugconv.date_fin");
      });


    const results = allUgsQuery.map((ug) => {
      const findUg = surfaceOccupiedUgsQuery.find(
        (ugOccupied) => ugOccupied.ug_id === ug.ug_id
      );
      const tenantsForUg = tenantsQuery
        .filter((tenant) => tenant.ug_id === ug.ug_id)
        .map((tenant) => tenant.raison_sociale);

      const tenantNames = tenantsForUg.join(" - ");

      ug["surfaceOcc"] = findUg ? findUg.surfaceOcc : 0;
      ug["tenants"] = tenantNames || null;

      return ug;
    });


    // TO REMOVE conv_id, raison_sociale : 18 (LA REVERIE), 29 (SW SOLUTIONS,VALSOCIETY), 21 (SOUIRI HIND), 3(MY DINE SHOP MY D.S), 51(TALEB YOUCEF), 41 (SENEPRODUITS), 10(REDAOUIA AFID), 28(SW SOLUTIONS), 12(WR AUTOS TRUCKS)
    // 30(ZEINEB EL BOUGHANEMI EI), 49(MK COMPANY), 32 (R&I ENERGIES), 35 (GROUPE S.N), 22(H CONSTRUCTION BATIMENT), 36(ICOSIUM), 43(CABINET IMS CONSEIL), 59(HWS HW SERVICES),
    // 11 (CHERMAT EL-SHAYMA), 60 (JAYET-LAVIOLETTE AMEL), 15 (WAIDEV), 50 (KALISA JEAN D'AMOUR), 9 (CIRE SOLUTIONS), 46 (SMAC WEB), 66 (TEST), 3 (MY DINE SHOP MY D.S), 26 (PAM SÉCURITÉ),
    // 1 (MAHFOUDI AHMED), 45 (DEGHIMA TIBHERE), 54 (ORIUM CONSEIL), 31 (PROTECT ENGINEERING)

    const floorsData = results.reduce(
      (acc, { parentName, size, surfaceOcc }) => {
        if (!acc[parentName]) {
          acc[parentName] = { totalSize: 0, totalSurfaceOcc: 0 };
        }

        acc[parentName].totalSize += size;
        acc[parentName].totalSurfaceOcc += surfaceOcc;
        return acc;
      },
      {}
    );

    // console.log(floorsData);

    const occupiedSurfacePercentagePerFloor = Object.keys(floorsData).map(
      (floor) => {
        const { totalSize, totalSurfaceOcc } = floorsData[floor];
        const occupiedPercentage = (totalSurfaceOcc / totalSize) * 100;
        return { [floor]: occupiedPercentage.toFixed(2) + "%" };
      }
    );

    // console.log(occupiedSurfacePercentagePerFloor); // TO KEEP TO CHECK WHICH CONVENTIONS WE NEED TO REMOVE

    const allFloors = Object.keys(floorsData);

    const occLocaux = allFloors.reduce(
      (acc: any[], floor: string, index: number) => {
        acc.push({
          name: [
            {
              etage: floor,
              pourcentage: occupiedSurfacePercentagePerFloor[index][floor],
            },
          ],
          children: results.filter((data) => data.parentName === floor),
        });
        return acc;
      },
      []
    );

    const averageOcc =
      Object.values(occupiedSurfacePercentagePerFloor).reduce((acc, cur) => {
        const value = Object.values(cur)[0].replace("%", "");
        acc += parseFloat(value);
        return acc;
      }, 0) / 500;

    const locDispo = {
      value: Math.round(averageOcc * 100),
      objectif: 100,
    };

    res.json({
      hostedCompanies,
      hostedPPSex,
      hostedPorteurProjet,
      accExtraMuros,
      entCompanies,
      sorCompanies,
      occLocaux,
      locDispo,
      accEntretiens,
      sectorsCompanies,
      headerStatsEnt
    });
  }
);

export { router as overallStatsRouter };
