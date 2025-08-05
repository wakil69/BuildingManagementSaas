import express from "express";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { verifyUser } from "../../middlewares/checkUser";
import { r2 } from "../../r2Client";
import { checkHasConventionAccess } from "../../middlewares/checkHasConventionAccess";
import {
  Packer,
  TextRun,
  Paragraph,
  Document,
  Header,
  ImageRun,
  HeadingLevel,
  PageNumber,
  Footer,
  AlignmentType,
  BorderStyle,
  UnderlineType,
} from "docx";
import { db } from "../../data/db";

const router = express.Router();

const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME as string;

router.get(
  "/download-rules/:conv_id/:version",
  verifyUser,
  checkHasConventionAccess,
  async (req, res) => {
     /* 
     #swagger.tags = ['Documents']
     #swagger.description = "Get the rules"
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
            schema: { type: "string" }
     } 
     #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequestFiles' }
     } 
     #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }  
  */
    const fileKey = `Réglement intérieur.docx`;

    try {
      const command = new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: fileKey,
      });

      const url = await getSignedUrl(r2, command, { expiresIn: 60 * 5 });

      res.status(200).json(url);
    } catch (err) {
      console.error("Error generating signed URL", err);
      res.status(500).send("Error generating file link");
    }
  }
);

router.get(
  "/download-charte/:conv_id/:version",
  verifyUser,
  checkHasConventionAccess,
  async (req, res) => {
           /* 
     #swagger.tags = ['Documents']
     #swagger.description = "Get the charte pepiniere"
     #swagger.parameters['conv_id'] = {
          in: 'path',
          description: 'Convention ID',
          required: true,
          type: 'integer'
     }
     #swagger.parameters['version'] = {
          in: 'path',
          description: 'convention version',
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

    let { conv_id, version } = req.params;
    const key = `companyLogo.png`;
    const params = {
      Bucket: R2_BUCKET_NAME,
      Key: key,
    };

    const dataImage = await r2.send(new GetObjectCommand(params));

    const image = new ImageRun({
      data: dataImage.Body as any,
      transformation: {
        width: 100,
        height: 100,
      },
      type: "png",
    });

    const header = new Header({
      children: [
        new Paragraph({
          children: [image],
        }),
      ],
    });

    const title = new Paragraph({
      heading: HeadingLevel.TITLE,
      thematicBreak: true,
      alignment: AlignmentType.CENTER,
      style: "myTitleStyle",
      border: {
        top: {
          color: "#000000",
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6,
        },
        bottom: {
          color: "#000000",
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6,
        },
        left: {
          color: "#000000",
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6,
        },
        right: {
          color: "#000000",
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
      children: [
        new TextRun({
          text: "CHARTE D'ACCOMPAGNEMENT PEPINIERE",
        }),
      ],
    });

    const myTitleStyle = {
      id: "myTitleStyle",
      name: "myTitle Style",
      basedOn: "Normal",
      run: {
        bold: true,
        italic: false,
        color: "#000000",
        size: 32,
        font: {
          name: "Times New Roman",
        },
      },
      paragraph: {
        spacing: {
          after: 240,
        },
      },
    };

    const paragraphStyle = {
      id: "paragraphStyle",
      name: "paragraph Style",
      basedOn: "Normal",
      run: {
        bold: false,
        italic: false,
        color: "#000000",
        size: 22,
        font: {
          name: "Times New Roman",
        },
      },
    };

    const signatairesQuery = db("sigconv")
      .select(
        db.raw(
          `GROUP_CONCAT(CONCAT(tiepp.civilite, ' ', tiepp.first_name, ' ', tiepp.surname) SEPARATOR ' ET ') AS full_name`
        )
      )
      .leftJoin("tiepp", "tiepp.tiepp_id", "sigconv.tiepp_id")
      .where({ "sigconv.conv_id": conv_id, "sigconv.version": version })
      .first();

    const convdescQuery = db("convdesc")
      .select("convdesc.raison_sociale", "date_signature")
      .where({ "convdesc.conv_id": conv_id, "convdesc.version": version })
      .first();

    const responseP5Query = db("rubconv")
      .select(
        "rubconv.montant",
        "rubconv.periodicity",
        "ugconv.surface_rent",
        "ugconv.date_debut",
        "ugconv.date_fin"
      )
      .join("ugconv", function () {
        this.on("ugconv.ug_id", "=", "rubconv.ug_id")
          .andOn("ugconv.conv_id", "=", "rubconv.conv_id")
          .andOn("ugconv.version", "=", "rubconv.version");
      })
      .where({
        "rubconv.conv_id": conv_id,
        "rubconv.version": version,
        "rubconv.rubrique": "REDEVANCE",
      });

    const [signataires, convdesc, responseP5] = await Promise.all([
        signatairesQuery,
        convdescQuery,
        responseP5Query
    ])

    const p1 = new Paragraph({
      style: "paragraphStyle",
      children: [
        new TextRun({
          text: "ENTRE",
          bold: true,
        }),
        new TextRun({
          text: "XXXXX – Pépinière d’entreprises représentée par M. XXXX XXXX, son président",
          break: 2,
        }),
        new TextRun({
          text: "ET",
          break: 2,
          underline: { type: UnderlineType.SINGLE },
          bold: true,
        }),
        new TextRun({
          text: "l’entreprise ",
          break: 2,
        }),
        new TextRun({
          text: `${convdesc.raison_sociale}`,
          bold: true,
        }),
        new TextRun({
          text: " représentée par ",
        }),
        new TextRun({
          text: `${signataires.full_name}`,
        }),
        new TextRun({
          text: "Vocation de l’association",
          break: 2,
          bold: true,
          underline: { type: UnderlineType.SINGLE },
        }),
        new TextRun({
          text: "Située en Zone Franche Urbaine, l’association XXXXXXX – Pépinière d’entreprises permet à des micro-entrepreneurs, qui disposent de peu d’apports personnels, de monter leur entreprise.",
          break: 2,
        }),
        new TextRun({
          text: "Elle a pour vocation de servir de tremplin à ces entreprises émergentes en coupant celles-ci de leur isolement, en les aidants à franchir un premier cap de développement et à consolider cette première étape.",
          break: 2,
        }),
        new TextRun({
          text: "Engagement de l’association",
          bold: true,
          underline: { type: UnderlineType.SINGLE },
          break: 2,
        }),
        new TextRun({
          text: "L’association XXXXXX – Pépinière d’entreprises propose ainsi à l’entreprise : ",
          break: 2,
        }),
        new TextRun({
          text: "1) La mise à disposition d'espace(s):",
          break: 2,
        }),
        ...responseP5.flatMap((data) => [
          new TextRun({
            text: "un local",
            underline: { type: UnderlineType.SINGLE },
            break: 2,
          }),
          new TextRun({
            text: " de ",
          }),
          new TextRun({
            text: `${
              data.surface_rent
            } m² pour une durée comprise entre les dates du ${data.date_debut
              ?.split("-")
              .reverse()
              .join("/")} au ${
              data?.date_fin
                ? data.date_fin.split("-").reverse().join("/")
                : "N/A"
            }`,
            bold: true,
          }),
          new TextRun({
            text: ", dont l’indemnité d’occupation est de ",
          }),
          new TextRun({
            text: `${data.montant} € HT par mois`,
            bold: true,
          }),
          new TextRun({
            text: ", charges locatives comprises.",
          }),
          new TextRun({
            text: `\t\n`,
          }),
        ]),
        new TextRun({
          text: "2) la mise à disposition de matériels et de service communs : ",
          break: 2,
        }),
        new TextRun({
          text: "* un photocopieur : 	coût de la photocopie A4  	0.03 € HT jusqu’à 1000 pages",
          break: 2,
        }),
        new TextRun({
          text: "\t\t\t\t\t\t\t0.02 € HT de 1000 à 2500 pages",
          break: 1,
        }),
        new TextRun({
          text: "\t\t\t\t\t\t\t0.01 € HT au-delà de 2500 pages",
          break: 1,
        }),
        new TextRun({
          text: "\t\t\tcoût de la copie couleur\t\t0.30 € HT jusqu’à 100 pages",
          break: 2,
        }),
        new TextRun({
          text: "\t\t\t\t\t\t\t0.20 € HT de 100 à 250 pages",
          break: 1,
        }),
        new TextRun({
          text: "\t\t\t\t\t\t\t0.10 € HT au-delà de 250 pages",
          break: 1,
        }),
        new TextRun({
          text: "* un fax : 	réception gratuite		émission 0.16 € HT/page",
          break: 2,
        }),
        new TextRun({
          text: "* une imprimante : 	coût de l’impression		idem photocopieur",
          break: 2,
        }),
        new TextRun({
          text: "* Affranchissement courrier : coût de l’affranchissement + 3€ pour la location de la machine",
          break: 2,
        }),
        new TextRun({
          text: "3) ",
          break: 2,
        }),
        new TextRun({
          text: "un accompagnement individualisé gratuit",
          bold: true,
          underline: { type: UnderlineType.SINGLE },
        }),
        new TextRun({
          text: " sous forme de ",
        }),
        new TextRun({
          text: "rendez-vous trimestriels obligatoires",
          bold: true,
        }),
        new TextRun({
          text: ", journées de formation ou pilotage, rencontres à thème et soutien du chargé d’accompagnement de la Pépinière pour répondre aux questions des créateurs.",
        }),
        new TextRun({
          text: "4) Un accompagnement collectif sous forme d’ateliers ou de formation collective sur des thématiques choisies en fonction du besoin des pépins ",
          break: 2,
        }),
        new TextRun({
          text: "5) Animations de temps conviviaux ",
          break: 2,
        }),
        new TextRun({
          text: "Engagement de l’entreprise ",
          bold: true,
          underline: { type: UnderlineType.SINGLE },
          break: 2,
        }),
        new TextRun({
          text: "1) Fournir les documents requis pour l’accompagnement.",
          break: 2,
        }),
        new TextRun({
          text: "2) Honorer le rendez-vous obligatoire, d’environ 1h30, pour faire le point de son activité (trésorerie, marges, résultat, chiffre d’affaires), mettre en place un tableau de bord de gestion et de pilotage, assurer des prévisions à 3 mois et à 1 an, mais aussi répondre aux questions et appréhender des solutions face aux difficultés rencontrées.",
          break: 2,
        }),
        new TextRun({
          text: "3) Respecter le règlement intérieur de la Pépinière d’entreprises. ",
          break: 2,
        }),
        new TextRun({
          text: "4) Participer aux animations conviviales organisées par la pépinière dans la mesure de ses disponibilités.",
          break: 2,
        }),
        new TextRun({
          text: "Fait à Vaulx-en-Velin, ",
          break: 2,
        }),
        new TextRun({
          text: "Le ",
          break: 1,
        }),
        new TextRun({
          text: `${convdesc.date_signature
            ?.split("-")
            .reverse()
            .join("/")}`,
          bold: true,
        }),
        new TextRun({
          text: "En deux exemplaires",
          break: 2,
        }),
        new TextRun({
          text: "Pour l’association,						Pour l’entreprise,	",
          break: 3,
        }),
      ],
    });

    const doc = new Document({
      creator: "ESPACE XXXXXXX",
      description: "CHARTE D’ACCOMPAGNEMENT PÉPINIÈRE",
      title: "CHARTE D’ACCOMPAGNEMENT PÉPINIÈRE",
      styles: {
        paragraphStyles: [myTitleStyle, paragraphStyle],
      },
      sections: [
        {
          headers: {
            default: header,
          },
          children: [title, p1],
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      children: ["Page ", PageNumber.CURRENT],
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
            }),
          },
        },
      ],
    });

    Packer.toBuffer(doc)
      .then((buffer) => {
        res.writeHead(200, {
          "Content-Disposition": `attachment; filename="Charte_Accompagnement_Pepiniere.docx"`,
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });

        return res.end(buffer);
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).send("Error generating document");
      });
  }
);

export { router as charteAndRulesRouter };
