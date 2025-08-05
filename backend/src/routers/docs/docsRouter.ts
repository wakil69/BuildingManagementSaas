import express from "express";
import { db } from "../../data/db";
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

import dotenv from "dotenv";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "../../r2Client";
import { verifyUser } from "../../middlewares/checkUser";

dotenv.config();

const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME as string;

const router = express.Router();

/**
 * Function to concatenate unique names from an array of signataires.
 * @param signataires - Array of signataires with tippCiv and tiLib properties.
 * @returns Concatenated unique names separated by " ET ".
 */

router.get(
  "/convention-coworking/:conv_id/:version/:nameFile",
  verifyUser,
  async (req, res) => {
    /* 
   #swagger.tags = ['Documents']
   #swagger.description = "Get the convention coworking"
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
    #swagger.parameters['nameFile'] = {
        in: 'path',
        description: 'Filename',
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

    let { conv_id, version, nameFile } = req.params;

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
          text: "CONVENTION D'OCCUPATION TEMPORAIRE",
        }),
      ],
    });

    const subtitle1 = new Paragraph({
      alignment: AlignmentType.CENTER,
      style: "mySubTitleStyle",
      children: [
        new TextRun({
          text: "DESIGNATION DES LOCAUX",
        }),
      ],
    });

    const subtitle2 = new Paragraph({
      alignment: AlignmentType.CENTER,
      style: "mySubTitleStyle",
      children: [
        new TextRun({
          text: "DUREE",
        }),
      ],
    });

    const subtitle3 = new Paragraph({
      alignment: AlignmentType.CENTER,
      style: "mySubTitleStyle",
      children: [
        new TextRun({
          text: "DESTINATION DES LIEUX OCCUPES",
        }),
      ],
    });

    const subtitle4 = new Paragraph({
      alignment: AlignmentType.CENTER,
      style: "mySubTitleStyle",
      children: [
        new TextRun({
          text: "INDEMNITE, CHARGES ET REDEVANCES",
        }),
      ],
    });

    const subtitle5 = new Paragraph({
      alignment: AlignmentType.CENTER,
      style: "mySubTitleStyle",
      children: [
        new TextRun({
          text: "CONDITIONS GENERALES",
        }),
      ],
    });

    const subtitle6 = new Paragraph({
      alignment: AlignmentType.CENTER,
      style: "mySubTitleStyle",
      children: [
        new TextRun({
          text: "CONDITIONS PARTICULIERES",
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

    const mySubTitleStyle = {
      id: "mySubTitleStyle",
      name: "mySubTitle Style",
      basedOn: "Normal",
      run: {
        bold: true,
        italic: false,
        color: "#000000",
        underline: true,
        size: 22,
        font: {
          name: "Times New Roman",
        },
      },
      paragraph: {
        spacing: {
          before: 240,
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
      .select(
        "convdesc.raison_sociale",
        "date_signature",
        "date_debut",
        "date_fin"
      )
      .where({ "convdesc.conv_id": conv_id, "convdesc.version": version })
      .first();

    const [convdesc, signataires] = await Promise.all([
      convdescQuery,
      signatairesQuery,
    ]);

    const prixCoworking = await db("surface_prix_ugs")
      .select("surface_prix_ugs.prix_coworking")
      .where("surface_prix_ugs.prix_date_debut", "<=", convdesc.date_debut)
      .andWhere((builder) =>
        builder
          .where("surface_prix_ugs.prix_date_fin", ">=", convdesc.date_debut)
          .orWhereNull("surface_prix_ugs.prix_date_fin")
      )
      .andWhere({ "surface_prix_ugs.prix_type": "coworking" })
      .first();

    const oneYearLater = new Date(
      new Date(
        new Date(convdesc.date_debut).setDate(
          new Date(convdesc.date_debut).getDate() - 1
        )
      ).setFullYear(new Date(convdesc.date_debut).getFullYear() + 1)
    )
      .toISOString()
      .split("T")[0];

    const p1 = new Paragraph({
      style: "paragraphStyle",
      children: [
        new TextRun({
          text: "Entre l’association XXXXXX -Pépinière d’entreprises, représentée par son Président, Pierre ROBIN, dûment habilité",
        }),
        new TextRun({
          text: "D’UNE PART, le président Pierre ROBIN",
          break: 2,
          bold: true,
        }),
        new TextRun({
          text: "ET",
          break: 2,
          underline: { type: UnderlineType.SINGLE },
        }),
        new TextRun({
          text: `${signataires.full_name}`,
          break: 2,
          bold: true,
          // underline:true
        }),
        new TextRun({
          text: " agissant au nom et pour le compte de la société ",
        }),
        new TextRun({
          text: `${convdesc.raison_sociale}.`,
          bold: true,
        }),
        new TextRun({
          text: "Ci-après désignée « l’occupant »,",
          break: 2,
        }),
        new TextRun({
          text: "D’AUTRE PART.",
          break: 2,
          bold: true,
        }),
        new TextRun({
          text: "ONT, préalablement à la convention d’occupation précaire objet des présentes, exposé ce qui suit : ",
          break: 2,
        }),
        new TextRun({
          text: "EXPOSE",
          break: 2,
          bold: true,
        }),
        new TextRun({
          text: "Afin de dynamiser le développement économique sur son territoire, l’association XXXXX - Pépinière d’entreprises assure la gestion d’une pépinière d’entreprises située au 24 rue Robert-Desnos à Vaulx-en-Velin (en Zone Franche Urbaine).",
          break: 2,
        }),
        new TextRun({
          text: "Cette pépinière a pour but d’aider à l’implantation d’entreprises en leur fournissant des locaux et un accompagnement adapté pendant la période de début d’activité. En conséquence, ces entreprises doivent quitter la Pépinière d’entreprises dès la fin de cette période afin de permettre à la Pépinière d’accueillir de nouvelles entreprises.",
          break: 2,
        }),
        new TextRun({
          text: "L’association XXXXXXX - Pépinière d’entreprises de Vaulx-en-Velin, ne peut, pour ces motifs, concéder à l’occupant un droit au renouvellement de la présente convention, ni l’assurer d’une durée déterminée d’occupation, celle-ci devant prendre fin en même temps que les raisons déterminantes qui ont conduit à la conclusion de la présente convention, c’est-à-dire dès la fin de la période nécessaire au démarrage de l’activité de l’occupant.",
          break: 2,
        }),
        new TextRun({
          text: "IL A ETE CONVENU",
          break: 2,
        }),
      ],
    });

    const p2 = new Paragraph({
      style: "paragraphStyle",
      children: [
        new TextRun({
          text: "L’association XXXXXXX - Pépinière d’entreprises de Vaulx-en-Velin, concède un droit d’occupation précaire pour les locaux désignés ci-après : ",
        }),
        new TextRun({
          text: "Un bureau en open-space ",
          break: 2,
          bold: true,
        }),
        new TextRun({
          text: "au sein de l’XXXXXX - Pépinière d’entreprises, 24 rue Robert-Desnos à Vaulx-en-Velin, ",
        }),
        new TextRun({
          text: ` à raison d’un forfait de 24h/mois.`,
          bold: true,
        }),
        new TextRun({
          text: "Ces locaux seront équipés de mobilier à usage de bureau.",
          break: 2,
        }),
        new TextRun({
          text: "A titre accessoire à ce droit d’occupation, l’occupant bénéficiera dans les conditions ci-après définies, des services communs, généraux ou spéciaux : accompagnement individuel en gestion et commercial, documentation, et tous autres services existants ou à créer. L’association XXXXXX -Pépinière d’entreprises se réserve expressément le droit, ce que l’occupant accepte, de modifier, d’augmenter ou supprimer, en totalité ou en partie, les dits services.",
          break: 2,
        }),
      ],
    });

    const p3 = new Paragraph({
      style: "paragraphStyle",
      children: [
        new TextRun({
          text: "La présente convention qui prend effet le ",
        }),
        new TextRun({
          text: `${convdesc.date_debut?.split("-").reverse().join("/")}`,
          bold: true,
        }),
        new TextRun({
          text: " est consentie ",
        }),
        new TextRun({
          text: `jusqu’au ${convdesc.date_fin
              ? convdesc.date_fin?.split("-").reverse().join("/")
              : oneYearLater?.split("-").reverse().join("/")
            }`,
          bold: true,
        }),
        new TextRun({
          text: ", et avec possibilité de deux renouvellements après passage du dossier en commission.",
        }),
        new TextRun({
          text: "L’occupant pourra mettre fin à la présente convention, avant cette échéance, à condition de notifier sa décision par lettre recommandée avec accusé de réception, quinze jours avant le terme choisi.",
          break: 2,
        }),
        new TextRun({
          text: "L’occupant, pour sa part, déclare être parfaitement informé qu’il ne pourra bénéficier d’un droit au renouvellement de la présente convention à son expiration, ni à aucune indemnité et qu’il ne pourra de même invoquer un droit au maintien dans les lieux en vertu de l’article 7.",
          break: 2,
        }),
      ],
    });

    const p4 = new Paragraph({
      style: "paragraphStyle",
      children: [
        new TextRun({
          text: "L’occupant devra occuper les lieux par lui-même, paisiblement, conformément aux articles 1728 et 1729 du code Civil.",
        }),
        new TextRun({
          text: "L’occupant tiendra les locaux occupés constamment garnis de meubles et objets mobiliers en quantité et valeur suffisantes pour garantir le paiement de son indemnité d’occupation.",
          break: 2,
        }),
        new TextRun({
          text: "L’occupant ne devra troubler en aucune façon les autres occupants de la pépinière d’entreprises, sous le rapport de la tranquillité, de la salubrité, ni des bonnes mœurs.",
          break: 2,
        }),
        new TextRun({
          text: "Les locaux devront être et demeurer affectés à l’usage défini par l’objet de l’entreprise à la signature du présent contrat et être utilisés directement par l’occupant pour l’activité correspondant à son objet, à l’exclusion de toute autre activité.",
          break: 2,
        }),
        new TextRun({
          text: "L’occupant ne pourra ni déposer, ni laisser séjourner quoi que ce soit, même temporairement, hors des locaux occupés, notamment dans les parties communes, sauf accord préalable du concédant.",
          break: 2,
        }),
      ],
    });

    const p5 = new Paragraph({
      style: "paragraphStyle",
      children: [
        new TextRun({
          text: "L’occupant supportera une indemnité d’occupation, en contrepartie de l’occupation des lieux et de l’accès aux services communs.",
        }),
        new TextRun({
          text: "INDEMNITE D’OCCUPATION",
          bold: true,
          break: 2,
        }),
        new TextRun({
          text: `L’indemnité d’occupation mensuelle durant la première année, toutes charges comprises (eau, électricité, chauffage, frais de gestion, entretien et consommation des parties communes), est fixée `,
          break: 2,
        }),
        new TextRun({
          text: `à ${prixCoworking.prix_coworking} € HT `,
          bold: true,
        }),
        new TextRun({
          text: `payable d’avance chaque mois dans les huit jours suivant la demande. Outre l’indemnité, l’occupant supportera la TVA sur le montant de l’indemnité. `,
        }),
        new TextRun({
          text: `\t\n`,
        }),
        new TextRun({
          text: "A défaut du paiement d’un seul terme, la présente convention sera résiliée de plein droit.",
        }),
        new TextRun({
          text: "REDEVANCE",
          bold: true,
          break: 2,
        }),
        new TextRun({
          text: "L’occupant aura accès aux services communs spécialisés : un photocopieur/imprimante avec compteur intégré (code personnalisé) relié au réseau local (microsoft). Chaque local sera équipé d’une connexion internet fibre dédiée, salle de réunion… Il acquittera une redevance déterminée pour chacun de ces services en fonction de sa consommation, selon le tarif fixé par l’association Espace XXXXXX-Pépinière d’entreprises.",
          break: 2,
        }),
      ],
    });

    const p6 = new Paragraph({
      style: "paragraphStyle",
      children: [
        new TextRun({
          text: "La présente convention est faite aux charges et conditions suivantes : ",
        }),
        new TextRun({
          text: "Etats des lieux",
          underline: { type: UnderlineType.SINGLE },
          break: 2,
        }),
        new TextRun({
          text: "L’occupant prendra les locaux en leur état actuel, déclarant avoir eu entière connaissance des avantages et défauts de l’immeuble Espace XXXXXX-Pépinière d’entreprises. L’occupant sera réputé les avoir reçus en bon état à défaut d’avoir fait établir contradictoirement un état des lieux dans la quinzaine des présentes.",
          break: 2,
        }),
        new TextRun({
          text: "Règlement intérieur et Charte d’accompagnement",
          underline: { type: UnderlineType.SINGLE },
          break: 2,
        }),
        new TextRun({
          text: "L’occupant déclare avoir pris entière connaissance du règlement intérieur et de la charte d’accompagnement de la pépinière d’entreprises.",
          break: 2,
        }),
        new TextRun({
          text: "Le non-respect d’un des articles du règlement et/ou de la charte d’accompagnement entraînera la résiliation de plein droit de la présente convention.",
          break: 2,
        }),
        new TextRun({
          text: "Travaux de réparation",
          underline: { type: UnderlineType.SINGLE },
          break: 2,
        }),
        new TextRun({
          text: "L’occupant s’engage : ",
          break: 2,
        }),
        new TextRun({
          text: "* à tenir les lieux occupés en bon état de réparation et d’entretien, quels qu’importants que soient cet entretien et ces réparations et quelle qu’en soit la cause : usure, vétusté, non-usage, cas fortuit ou de force majeure. Il préviendra immédiatement par lettre recommandée avec accusé de réception l’association de tout sinistre sous peine de dommages et intérêts.",
          break: 2,
        }),
        new TextRun({
          text: "* à supporter toutes les réparations à l’exception de celles prévues par l’article 605 du Code Civil. En cas de non-exécution par l’occupant des divers travaux de réparations ci dessus, l’association pourra, si bon lui semble, faire exécuter aussitôt et d’office ces réparations par ses entrepreneurs. L’occupant s’engage alors purement et simplement à rembourser immédiatement le montant à l’association qui ne sera soumise à aucune responsabilité pour ces réparations et travaux.",
          break: 2,
        }),
        new TextRun({
          text: "* à ne faire procéder à aucune transformation ou aménagement sans l’autorisation préalable de l’association.",
          break: 2,
        }),
        new TextRun({
          text: "A son départ, il devra remettre les lieux dans leur état initial si l’hôtelier le lui demande. A défaut, tous les aménagements et embellissements apportés aux locaux seront la propriété de l’hôtelier, sans aucune indemnité.",
          break: 2,
        }),
        new TextRun({
          text: "Interdiction de cession ou sous-location",
          underline: { type: UnderlineType.SINGLE },
          break: 2,
        }),
        new TextRun({
          text: "L’occupant s’interdit de céder la présente convention d’occupation temporaire, ou de consentir à l’occupation même gratuite d’un tiers sous peine de résiliation de plein droit des présentes.",
          break: 2,
        }),
        new TextRun({
          text: "Toutefois, l’occupant pourra céder la convention d’occupation temporaire à l’acquéreur de son fonds ou de son entreprise. En outre, en cas de fusion de sociétés ou d’apport d’une partir de l’actif à une société, réalisé dans les conditions prévues à l’article 387 de la loi n° 66537 du 24 juillet 1966, l’entreprise bénéficiaire de l’apport sera substituée à l’entreprise occupante dans les droits et obligations découlant des présentes.",
          break: 2,
        }),
        new TextRun({
          text: "Assurances et responsabilités",
          underline: { type: UnderlineType.SINGLE },
          break: 2,
        }),
        new TextRun({
          text: "L’occupant devra assurer et maintenir constamment assuré pendant tout le cours du présent bail, auprès d’une compagnie notoirement solvable, le mobilier et le matériel, ses risques locatifs, le recours auprès des voisins et des tiers, l’incendie, l’explosion, les dégâts des eaux, la foudre et les catastrophes naturelles ainsi que sa responsabilité civile pour les dommages corporels ou matériels liés aux locaux mis à sa disposition.",
          break: 2,
        }),
        new TextRun({
          text: "Il devra justifier de ces assurances préalablement à son entrée dans les lieux et à toutes réquisitions ultérieures du bailleur en fournissant une attestation de son assureur précisant la surface des locaux, l’activité, les risques garantis et la période de validité.",
          break: 2,
        }),
        new TextRun({
          text: "En outre, l’occupant s’interdit tout recours contre le bailleur et ses assureurs pour quelque sinistre que ce soit et devra faire mentionner cette renonciation à recours dans ses contrats d’assurances.",
          break: 2,
        }),
        new TextRun({
          text: "L’occupant renonce à tout recours contre l’association, même sous forme de réduction d’indemnité d’occupation, dans le cas où il y aurait une interruption dans les services collectifs, même partielle, ainsi que dans la fourniture de chauffage, d’eau froide, d’eau chaude, d’électricité, etc…",
          break: 2,
        }),
        new TextRun({
          text: "L’occupant devra laisser les locaux vides de tout objet et en état de propreté. A défaut, il devra rembourser l’association du montant des travaux de nettoyage des locaux.",
          break: 2,
        }),
        new TextRun({
          text: "En cas de décès de l’occupant, il y aura indivisibilité et solidarité entre les héritiers pour l’exécution du contrat et le paiement des charges.",
          break: 2,
        }),
        new TextRun({
          text: "Il est expressément convenu qu’en cas d’inexécution des conditions ci-dessus ou de l’une d’entre elles, quinze jours après sommation d’exécution, le contrat sera résilié de plein droit sans qu’il soit besoin de remplir les formalités judiciaires.",
          break: 2,
        }),
      ],
    });

    const p7 = new Paragraph({
      style: "paragraphStyle",
      children: [
        new TextRun({
          text: "L’occupant reconnaît expressément que la présente ne lui confère aucun droit à renouvellement, aucun droit à se maintenir dans les lieux et aucun droit à une indemnité d’éviction.",
        }),
        new TextRun({
          text: "L’accès aux locaux est autorisé du lundi au vendredi, aux heures d’ouverture de de l’association Espace XXXXXX-Pépinière d’entreprises.",
          break: 2,
        }),
        new TextRun({
          text: "Fait à Vaulx-en-Velin, le ",
          break: 2,
        }),
        new TextRun({
          text: `${convdesc.date_signature?.split("-").reverse().join("/")}`,
          bold: true,
          underline: { type: UnderlineType.SINGLE },
        }),
        new TextRun({
          text: "en deux originaux.",
          break: 2,
        }),
        new TextRun({
          text: "Pour l’association,						Pour l’entreprise,",
          break: 2,
        }),
      ],
    });

    const doc = new Document({
      creator: "ESPACE XXXXXX",
      description: "CONVENTION D'OCCUPATION TEMPORAIRE",
      title: "CONVENTION D'OCCUPATION TEMPORAIRE",
      styles: {
        paragraphStyles: [myTitleStyle, paragraphStyle, mySubTitleStyle],
      },
      sections: [
        {
          headers: {
            default: header,
          },
          children: [
            title,
            p1,
            subtitle1,
            p2,
            subtitle2,
            p3,
            subtitle3,
            p4,
            subtitle4,
            p5,
            subtitle5,
            p6,
            subtitle6,
            p7,
          ],
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
        // Set the appropriate headers for the document
        res.writeHead(200, {
          "Content-Disposition": `attachment; filename="${nameFile}.docx"`,
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });

        // Write the buffer to response
        res.end(buffer);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error generating document");
      });
  }
);

router.get(
  "/avenant-coworking/:conv_id/:version/:nameFile",
  verifyUser,
  async (req, res) => {
    /* 
#swagger.tags = ['Documents']
#swagger.description = "Get the avenant coworking"
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
#swagger.parameters['nameFile'] = {
    in: 'path',
    description: 'Filename',
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

    let { conv_id, version, nameFile } = req.params;

    const convdescQuery = db("convdesc")
      .select(
        "convdesc.raison_sociale",
        "date_signature",
        "date_debut",
        "date_fin",
        "conv_age"
      )
      .where({ "convdesc.conv_id": conv_id, "convdesc.version": version })
      .first();

    const signatairesQuery = db("sigconv")
      .select(
        db.raw(
          `GROUP_CONCAT(CONCAT(tiepp.civilite, ' ', tiepp.first_name, ' ', tiepp.surname) SEPARATOR ' ET ') AS full_name`
        )
      )
      .leftJoin("tiepp", "tiepp.tiepp_id", "sigconv.tiepp_id")
      .where({ "sigconv.conv_id": conv_id, "sigconv.version": version })
      .first();

    const [signataires, convdesc] = await Promise.all([
      signatairesQuery,
      convdescQuery,
    ]);

    const dateAnniv = new Date(
      new Date(
        new Date(convdesc.date_debut).setFullYear(
          new Date(convdesc.date_debut).getFullYear() + convdesc.conv_age
        )
      ).setDate(new Date(convdesc.date_debut).getDate() - 1)
    )
      .toISOString()
      .split("T")[0];

    const dateProlongation = new Date(
      new Date(
        new Date(convdesc.date_debut).setFullYear(
          new Date(convdesc.date_debut).getFullYear() + (convdesc.conv_age + 1)
        )
      ).setDate(new Date(convdesc.date_debut).getDate() - 1)
    )
      .toISOString()
      .split("T")[0];

    const debutAvenantDate = new Date(
      new Date(convdesc.date_debut).setFullYear(
        new Date(convdesc.date_debut).getFullYear() + convdesc.conv_age
      )
    )
      .toISOString()
      .split("T")[0];

    const prixCoworking = await db("surface_prix_ugs")
      .select("surface_prix_ugs.prix_coworking")
      .where("surface_prix_ugs.prix_date_debut", "<=", convdesc.date_debut)
      .andWhere((builder) =>
        builder
          .where("surface_prix_ugs.prix_date_fin", ">=", convdesc.date_debut)
          .orWhereNull("surface_prix_ugs.prix_date_fin")
      )
      .andWhere({ "surface_prix_ugs.prix_type": "coworking" })
      .first();

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
          text: `AVENANT n°${convdesc.conv_age} à la convention d'occupation temporaire signée le ${convdesc.date_signature
            ?.split("-")
            .reverse()
            .join("/")}`,
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

    const p1 = new Paragraph({
      style: "paragraphStyle",
      children: [
        new TextRun({
          text: "Entre l’association Espace XXXXXX-Pépinière d’entreprises, représentée par son Président, Pierre ROBIN, dûment habilité",
        }),
        new TextRun({
          text: "D’UNE PART, le président Pierre ROBIN",
          break: 2,
          bold: true,
        }),
        new TextRun({
          text: "ET",
          break: 2,
          underline: { type: UnderlineType.SINGLE },
        }),
        new TextRun({
          text: `${signataires.full_name}`,
          break: 2,
          bold: true,
          // underline:true
        }),
        new TextRun({
          text: " agissant au nom et pour le compte de la société ",
        }),
        new TextRun({
          text: `${convdesc.raison_sociale}`,
          bold: true,
        }),
        new TextRun({
          text: "Ci-après désignée « l’occupant »,",
          break: 2,
        }),
        new TextRun({
          text: "D’AUTRE PART.",
          break: 2,
          bold: true,
        }),
        new TextRun({
          text: "IL A ETE CONVENU CE QUI SUIT :",
          break: 3,
        }),
        new TextRun({
          text: "- Le droit d’occupation temporaire accordé à l’entreprise arrivant à son terme le ",
          break: 2,
        }),
        new TextRun({
          text: `${dateAnniv?.split("-").reverse().join("/")}`,
          bold: true,
        }),
        new TextRun({
          text: " est prolongé pour une durée d’un an, soit jusqu’au ",
        }),
        new TextRun({
          text: `${dateProlongation?.split("-").reverse().join("/")} `,
          bold: true,
        }),
        new TextRun({
          text: "aux mêmes termes et conditions que ceux mentionnés dans la convention initiale,",
        }),
        new TextRun({
          text: `- De fait, `,
          break: 2,
        }),
        new TextRun({
          text: `à compter du ${debutAvenantDate
            ?.split("-")
            .reverse()
            .join("/")} jusqu'au ${dateProlongation
              ?.split("-")
              .reverse()
              .join("/")}`,
          bold: true,
        }),
        new TextRun({
          text: `,l’indemnité d’occupation mensuelle (toutes charges comprises) reste inchangé, soit le tarif « coworking » de `,
        }),
        new TextRun({
          text: `${prixCoworking.prix_coworking} euros HT. `,
          bold: true,
        }),
        new TextRun({
          text: `Cette indemnité, soumise à la TVA, reste payable d’avance chaque mois dans les huit jours suivant la demande. Outre l’indemnité, l’occupant supportera la TVA sur le montant de l’indemnité.`,
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
          text: "(date de signature à remplir)",
          bold: true,
        }),
        new TextRun({
          text: "En deux originaux",
          break: 2,
        }),
        new TextRun({
          text: "Pour l’association,						Pour l’entreprise,	",
          break: 3,
        }),
      ],
    });

    const doc = new Document({
      creator: "ESPACE XXXXXX",
      description: "Avenant coworking",
      title: "Avenant coworking",
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
        // Set the appropriate headers for the document
        res.writeHead(200, {
          "Content-Disposition": `attachment; filename="${nameFile}.docx"`,
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });

        // Write the buffer to response
        res.end(buffer);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error generating document");
      });
  }
);

router.get(
  "/convention-initial/:conv_id/:version/:nameFile",
  verifyUser,
  async (req, res) => {
    /* 
#swagger.tags = ['Documents']
#swagger.description = "Get the pepiniere convention initial"
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
#swagger.parameters['nameFile'] = {
   in: 'path',
   description: 'Filename',
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
    let { conv_id, version, nameFile } = req.params;

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
          text: "CONVENTION D'OCCUPATION TEMPORAIRE",
        }),
      ],
    });

    const subtitle1 = new Paragraph({
      alignment: AlignmentType.CENTER,
      style: "mySubTitleStyle",
      children: [
        new TextRun({
          text: "DESIGNATION DES LOCAUX",
        }),
      ],
    });

    const subtitle2 = new Paragraph({
      alignment: AlignmentType.CENTER,
      style: "mySubTitleStyle",
      children: [
        new TextRun({
          text: "DUREE",
        }),
      ],
    });

    const subtitle3 = new Paragraph({
      alignment: AlignmentType.CENTER,
      style: "mySubTitleStyle",
      children: [
        new TextRun({
          text: "DESTINATION DES LIEUX OCCUPES",
        }),
      ],
    });

    const subtitle4 = new Paragraph({
      alignment: AlignmentType.CENTER,
      style: "mySubTitleStyle",
      children: [
        new TextRun({
          text: "INDEMNITE, CHARGES ET REDEVANCES",
        }),
      ],
    });

    const subtitle5 = new Paragraph({
      alignment: AlignmentType.CENTER,
      style: "mySubTitleStyle",
      children: [
        new TextRun({
          text: "CONDITIONS GENERALES",
        }),
      ],
    });

    const subtitle6 = new Paragraph({
      alignment: AlignmentType.CENTER,
      style: "mySubTitleStyle",
      children: [
        new TextRun({
          text: "CONDITIONS PARTICULIERES",
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

    const mySubTitleStyle = {
      id: "mySubTitleStyle",
      name: "mySubTitle Style",
      basedOn: "Normal",
      run: {
        bold: true,
        italic: false,
        color: "#000000",
        underline: true,
        size: 22,
        font: {
          name: "Times New Roman",
        },
      },
      paragraph: {
        spacing: {
          before: 240,
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
      .select(
        "convdesc.raison_sociale",
        "date_signature",
        "date_debut",
        "date_fin"
      )
      .where({ "convdesc.conv_id": conv_id, "convdesc.version": version })
      .first();

    const responseP2Query = db("ugconv")
      .where({ conv_id, version })
      .select("surface_rent");

    const responseP5Query = db("rubconv")
      .select("montant", "periodicity")
      .where({ conv_id, version, rubrique: "REDEVANCE" });

    const responseP7Query = db("eqconv")
      .select(
        "nature_equipements_params.name as nature",
        "ugequip.name",
        "ugequip.equipement_prix"
      )
      .leftJoin("ugequip", "ugequip.equipement_id", "eqconv.equipement_id")
      .leftJoin(
        "nature_equipements_params",
        "nature_equipements_params.nature_equipement_id",
        "ugequip.nature_equipement_id"
      )
      .where({ conv_id, version });

    const [signataires, convdesc, responseP2, responseP5, responseP7] =
      await Promise.all([
        signatairesQuery,
        convdescQuery,
        responseP2Query,
        responseP5Query,
        responseP7Query,
      ]);

    const totalAmount = responseP5.reduce(
      (acc, cur) => acc + cur["montant"],
      0
    );

    const amountDetail = responseP5
      .map(
        (cur: any, idx: any, arr: any) =>
          cur["montant"].toString() + (idx < arr.length - 1 ? " + " : "")
      )
      .join("");

    const oneYearLater = new Date(
      new Date(
        new Date(convdesc.date_debut).setDate(
          new Date(convdesc.date_debut).getDate() - 1
        )
      ).setFullYear(new Date(convdesc.date_debut).getFullYear() + 1)
    )
      .toISOString()
      .split("T")[0];

    const cle = responseP7
      .filter((data) => data.nature == "CLÉ")
      .reduce((acc, cur) => {
        acc += 1;
        return acc;
      }, 0);

    const badge = responseP7
      .filter((data) => data.nature == "BADGE")
      .reduce((acc, cur) => {
        acc += 1;
        return acc;
      }, 0);

    const table = responseP7
      .filter((data) => data.nature == "TABLE")
      .reduce((acc, cur) => {
        acc += 1;
        return acc;
      }, 0);

    const p1 = new Paragraph({
      style: "paragraphStyle",
      children: [
        new TextRun({
          text: "Entre l’association Espace XXXXXX-Pépinière d’entreprises, représentée par son Président, Pierre ROBIN, dûment habilité",
        }),
        new TextRun({
          text: "D’UNE PART, le président Pierre ROBIN",
          break: 2,
          bold: true,
        }),
        new TextRun({
          text: "ET",
          break: 2,
          underline: { type: UnderlineType.SINGLE },
        }),
        new TextRun({
          text: `${signataires}`,
          break: 2,
          bold: true,
          // underline:true
        }),
        new TextRun({
          text: " agissant au nom et pour le compte de la société ",
        }),
        new TextRun({
          text: `${convdesc.raison_sociale}.`,
          bold: true,
        }),
        new TextRun({
          text: "Ci-après désignée « l’occupant »,",
          break: 2,
        }),
        new TextRun({
          text: "D’AUTRE PART",
          break: 2,
          bold: true,
        }),
        new TextRun({
          text: "ONT, préalablement à la convention d’occupation précaire objet des présentes, exposé ce qui suit : ",
          break: 2,
        }),
        new TextRun({
          text: "EXPOSE",
          break: 2,
          bold: true,
        }),
        new TextRun({
          text: "Afin de dynamiser le développement économique sur son territoire, l’association Espace XXXXXX-Pépinière d’entreprises assure la gestion d’une pépinière d’entreprises située au 24 rue Robert-Desnos à Vaulx-en-Velin (en Zone Franche Urbaine).",
          break: 2,
        }),
        new TextRun({
          text: "Cette pépinière a pour but d’aider à l’implantation d’entreprises en leur fournissant des locaux et un accompagnement adapté pendant la période de début d’activité. En conséquence, ces entreprises doivent quitter la Pépinière d’entreprises dès la fin de cette période afin de permettre à la Pépinière d’accueillir de nouvelles entreprises.",
          break: 2,
        }),
        new TextRun({
          text: "L’association Espace XXXXXX-Pépinière d’entreprises de Vaulx-en-Velin, ne peut, pour ces motifs, concéder à l’occupant un droit au renouvellement de la présente convention, ni l’assurer d’une durée déterminée d’occupation, celle-ci devant prendre fin en même temps que les raisons déterminantes qui ont conduit à la conclusion de la présente convention, c’est-à-dire dès la fin de la période nécessaire au démarrage de l’activité de l’occupant.",
          break: 2,
        }),
        new TextRun({
          text: "IL A ETE CONVENU CE QUI SUIT :",
          break: 2,
        }),
      ],
    });

    const p2 = new Paragraph({
      style: "paragraphStyle",
      children: [
        new TextRun({
          text: "L’association Espace XXXXXX-Pépinière d’entreprises de Vaulx-en-Velin, concède un droit d’occupation précaire pour les locaux désignés ci-après : ",
        }),
        ...responseP2.flatMap((data) => [
          new TextRun({
            text: "Un local d’activités de ",
            break: 2,
          }),
          new TextRun({
            text: `${data.surface_rent}`,
            bold: true,
          }),
          new TextRun({
            text: " m² situé au sein de l’Espace XXXXXX-Pépinière d’entreprises, 24 rue Robert-Desnos à Vaulx-en-Velin.",
          }),
          new TextRun({
            text: "\t\n",
          }),
        ]),
        new TextRun({
          text: "Ces locaux seront équipés de mobilier à usage de bureau (table, armoire, chaise).",
          break: 2,
        }),
        new TextRun({
          text: "A titre accessoire à ce droit d’occupation, l’occupant bénéficiera dans les conditions ci-après définies, des services communs, généraux ou spéciaux : accompagnement individuel en gestion et commercial, documentation, et tous autres services existants ou à créer. L’association Espace XXXXXX-Pépinière d’entreprises se réserve expressément le droit, ce que l’occupant accepte, de modifier, d’augmenter ou supprimer, en totalité ou en partie, les dits services.",
          break: 2,
        }),
      ],
    });

    const p3 = new Paragraph({
      style: "paragraphStyle",
      children: [
        new TextRun({
          text: "La présente convention qui prend effet le ",
        }),
        new TextRun({
          text: `${convdesc.date_debut?.split("-").reverse().join("/")}`,
          bold: true,
        }),
        new TextRun({
          text: " est consentie ",
        }),
        new TextRun({
          text: `jusqu’au ${convdesc.date_fin
              ? convdesc.date_fin?.split("-").reverse().join("/")
              : oneYearLater?.split("-").reverse().join("/")
            }`,
          bold: true,
        }),
        new TextRun({
          text: ", et avec possibilité de deux renouvellements.",
        }),
        new TextRun({
          text: "L’occupant pourra mettre fin à la présente convention, avant cette échéance, à condition de notifier sa décision par lettre recommandée avec accusé de réception, deux mois avant le terme choisi.",
          break: 2,
        }),
        new TextRun({
          text: "L’occupant, pour sa part, déclare être parfaitement informé qu’il ne pourra bénéficier d’un droit au renouvellement de la présente convention à son expiration, ni à aucune indemnité et qu’il ne pourra de même invoquer un droit au maintien dans les lieux en vertu de l’article 7.",
          break: 2,
        }),
      ],
    });

    const p4 = new Paragraph({
      style: "paragraphStyle",
      children: [
        new TextRun({
          text: "L’occupant devra occuper les lieux par lui-même, paisiblement, conformément aux articles 1728 et 1729 du code Civil.",
        }),
        new TextRun({
          text: "L’occupant tiendra les locaux occupés constamment garnis de meubles et objets mobiliers en quantité et valeur suffisantes pour garantir le paiement de son indemnité d’occupation.",
          break: 2,
        }),
        new TextRun({
          text: "L’occupant ne devra troubler en aucune façon les autres occupants de la pépinière d’entreprises, sous le rapport de la tranquillité, de la salubrité, ni des bonnes mœurs.",
          break: 2,
        }),
        new TextRun({
          text: "Les locaux devront être et demeurer affectés à l’usage défini par l’objet de l’entreprise à la signature du présent contrat et être utilisés directement par l’occupant pour l’activité correspondant à son objet, à l’exclusion de toute autre activité.",
          break: 2,
        }),
        new TextRun({
          text: "L’occupant ne pourra ni déposer, ni laisser séjourner quoi que ce soit, même temporairement, hors des locaux occupés, notamment dans les parties communes, sauf accord préalable du concédant.",
          break: 2,
        }),
      ],
    });

    const p5 = new Paragraph({
      style: "paragraphStyle",
      children: [
        new TextRun({
          text: "L’occupant supportera une indemnité d’occupation, en contrepartie de l’occupation des lieux et de l’accès aux services communs.",
        }),
        new TextRun({
          text: "INDEMNITE D’OCCUPATION",
          bold: true,
          break: 2,
        }),
        new TextRun({
          text: `L’indemnité d’occupation mensuelle durant la première année, toutes charges comprises (eau, électricité, chauffage, frais de gestion, entretien et consommation des parties communes), est fixée `,
          break: 2,
        }),
        new TextRun({
          text: `à ${totalAmount} € HT ${"(" + amountDetail + ")"} `,
          bold: true,
        }),
        new TextRun({
          text: `payable d’avance chaque mois dans les huit jours suivant la demande. Outre l’indemnité, l’occupant supportera la TVA sur le montant de l’indemnité. `,
        }),
        new TextRun({
          text: `\t\n`,
        }),
        new TextRun({
          text: "A défaut du paiement d’un seul terme, la présente convention sera résiliée de plein droit.",
          break: 1,
        }),
        new TextRun({
          text: "RÉVISION DU LOYER",
          bold: true,
          break: 2,
        }),
        new TextRun({
          text: "Le(s) loyer(s) ci-dessus est révisé chaque année, à la date anniversaire de la prise d’effet de la présente convention. ",
          break: 2,
        }),
        new TextRun({
          text: "REDEVANCE",
          bold: true,
          break: 2,
        }),
        new TextRun({
          text: "L’occupant aura accès aux services communs spécialisés : un photocopieur/imprimante avec compteur intégré (code personnalisé) relié au réseau local. Chaque local sera équipé d’une connexion internet fibre dédiée, salle de réunion… Il acquittera une redevance déterminée pour chacun de ces services en fonction de sa consommation, selon le tarif fixé par l’association Espace XXXXXX-Pépinière d’entreprises.",
          break: 2,
        }),
      ],
    });

    const p6 = new Paragraph({
      style: "paragraphStyle",
      children: [
        new TextRun({
          text: "La présente convention est faite aux charges et conditions suivantes : ",
        }),
        new TextRun({
          text: "Etats des lieux",
          underline: { type: UnderlineType.SINGLE },
          break: 2,
        }),
        new TextRun({
          text: "L’occupant prendra les locaux en leur état actuel, déclarant avoir eu entière connaissance des avantages et défauts de l’immeuble Espace XXXXXX-Pépinière d’entreprises. L’occupant sera réputé les avoir reçus en bon état à défaut d’avoir fait établir contradictoirement un état des lieux dans la quinzaine des présentes.",
          break: 2,
        }),
        new TextRun({
          text: "Règlement intérieur et Charte d’accompagnement",
          underline: { type: UnderlineType.SINGLE },
          break: 2,
        }),
        new TextRun({
          text: "L’occupant déclare avoir pris entière connaissance du règlement intérieur et de la charte d’accompagnement de la pépinière d’entreprises.",
          break: 2,
        }),
        new TextRun({
          text: "Le non-respect d’un des articles du règlement et/ou de la charte d’accompagnement entraînera la résiliation de plein droit de la présente convention.",
          break: 2,
        }),
        new TextRun({
          text: "Travaux de réparation",
          underline: { type: UnderlineType.SINGLE },
          break: 2,
        }),
        new TextRun({
          text: "L’occupant s’engage : ",
          break: 2,
        }),
        new TextRun({
          text: "* à tenir les lieux occupés en bon état de réparation et d’entretien, quels qu’importants que soient cet entretien et ces réparations et quelle qu’en soit la cause : usure, vétusté, non-usage, cas fortuit ou de force majeure. Il préviendra immédiatement par lettre recommandée avec accusé de réception l’association de tout sinistre sous peine de dommages et intérêts.",
          break: 2,
        }),
        new TextRun({
          text: "* à supporter toutes les réparations à l’exception de celles prévues par l’article 605 du Code Civil. En cas de non-exécution par l’occupant des divers travaux de réparations ci dessus, l’association pourra, si bon lui semble, faire exécuter aussitôt et d’office ces réparations par ses entrepreneurs. L’occupant s’engage alors purement et simplement à rembourser immédiatement le montant à l’association qui ne sera soumise à aucune responsabilité pour ces réparations et travaux.",
          break: 2,
        }),
        new TextRun({
          text: "* à ne faire procéder à aucune transformation ou aménagement sans l’autorisation préalable de l’association.",
          break: 2,
        }),
        new TextRun({
          text: "A son départ, il devra remettre les lieux dans leur état initial si l’hôtelier le lui demande. A défaut, tous les aménagements et embellissements apportés aux locaux seront la propriété de l’hôtelier, sans aucune indemnité.",
          break: 2,
        }),
        new TextRun({
          text: "Interdiction de cession ou sous-location",
          underline: { type: UnderlineType.SINGLE },
          break: 2,
        }),
        new TextRun({
          text: "L’occupant s’interdit de céder la présente convention d’occupation temporaire, ou de consentir à l’occupation même gratuite d’un tiers sous peine de résiliation de plein droit des présentes.",
          break: 2,
        }),
        new TextRun({
          text: "Toutefois, l’occupant pourra céder la convention d’occupation temporaire à l’acquéreur de son fonds ou de son entreprise. En outre, en cas de fusion de sociétés ou d’apport d’une partir de l’actif à une société, réalisé dans les conditions prévues à l’article 387 de la loi n° 66537 du 24 juillet 1966, l’entreprise bénéficiaire de l’apport sera substituée à l’entreprise occupante dans les droits et obligations découlant des présentes.",
          break: 2,
        }),
        new TextRun({
          text: "Assurances et responsabilités",
          underline: { type: UnderlineType.SINGLE },
          break: 2,
        }),
        new TextRun({
          text: "L’occupant devra assurer et maintenir constamment assuré pendant tout le cours du présent bail, auprès d’une compagnie notoirement solvable, le mobilier et le matériel, ses risques locatifs, le recours auprès des voisins et des tiers, l’incendie, l’explosion, les dégâts des eaux, la foudre et les catastrophes naturelles ainsi que sa responsabilité civile pour les dommages corporels ou matériels liés aux locaux mis à sa disposition.",
          break: 2,
        }),
        new TextRun({
          text: "Il devra justifier de ces assurances préalablement à son entrée dans les lieux et à toutes réquisitions ultérieures du bailleur en fournissant une attestation de son assureur précisant la surface des locaux, l’activité, les risques garantis et la période de validité.",
          break: 2,
        }),
        new TextRun({
          text: "En outre, l’occupant s’interdit tout recours contre le bailleur et ses assureurs pour quelque sinistre que ce soit et devra faire mentionner cette renonciation à recours dans ses contrats d’assurances.",
          break: 2,
        }),
        new TextRun({
          text: "L’occupant renonce à tout recours contre l’association, même sous forme de réduction d’indemnité d’occupation, dans le cas où il y aurait une interruption dans les services collectifs, même partielle, ainsi que dans la fourniture de chauffage, d’eau froide, d’eau chaude, d’électricité, etc…",
          break: 2,
        }),
        new TextRun({
          text: "L’occupant devra laisser visiter les lieux à toute époque par les représentants de l’association, aux fins de vérifications de l’exécution des clauses du présent contrat.",
          break: 2,
        }),
        new TextRun({
          text: "Au moment de quitter les lieux, l’occupant devra rendre les clés au représentant de l’association, à l’exclusion de toute autre personne.",
          break: 2,
        }),
        new TextRun({
          text: "L’occupant devra laisser les locaux vides de tout objet et en état de propreté. A défaut, il devra rembourser l’association du montant des travaux de nettoyage des locaux.",
          break: 2,
        }),
        new TextRun({
          text: "En cas de décès de l’occupant, il y aura indivisibilité et solidarité entre les héritiers pour l’exécution du contrat et le paiement des charges.",
          break: 2,
        }),
        new TextRun({
          text: "Il est expressément convenu qu’en cas d’inexécution des conditions ci-dessus ou de l’une d’entre elles, quinze jours après sommation d’exécution, le contrat sera résilié de plein droit sans qu’il soit besoin de remplir les formalités judiciaires.",
          break: 2,
        }),
      ],
    });

    const p7 = new Paragraph({
      style: "paragraphStyle",
      children: [
        new TextRun({
          text: "L’occupant reconnaît expressément que la présente ne lui confère aucun droit à renouvellement, aucun droit à se maintenir dans les lieux et aucun droit à une indemnité d’éviction.",
        }),
        new TextRun({
          text: `${cle
              ? `Un jeu de ${cle} clé(s) pour le(s) local(aux) occupé(s) `
              : ""
            }${badge ? `et ${badge} badge(s) pour la porte d’entrée` : ""}${table ? ` et ${table} table(s) ` : ""
            }seront remis au preneur à la signature de la présente convention. . En cas de perte d’un badge, le montant à payer pour son remplacement sera de 25 € HT.`,
          break: 2,
        }),
        new TextRun({
          text: "L’ensemble devra être remis, lors du départ de l'occupant, à la personne réalisant l'état des lieux.",
          break: 2,
        }),
        new TextRun({
          text: "Fait à Vaulx-en-Velin, le ",
          break: 2,
        }),
        new TextRun({
          text: `${convdesc.date_signature?.split("-").reverse().join("/")}`,
          bold: true,
          underline: { type: UnderlineType.SINGLE },
        }),
        new TextRun({
          text: "en deux originaux.",
          break: 2,
        }),
        new TextRun({
          text: "Pour l’association,						Pour l’entreprise,",
          break: 2,
        }),
      ],
    });

    const doc = new Document({
      creator: "ESPACE XXXXXX",
      description: "CONVENTION D'OCCUPATION TEMPORAIRE",
      title: "CONVENTION D'OCCUPATION TEMPORAIRE",
      styles: {
        paragraphStyles: [myTitleStyle, paragraphStyle, mySubTitleStyle],
      },
      sections: [
        {
          headers: {
            default: header,
          },
          children: [
            title,
            p1,
            subtitle1,
            p2,
            subtitle2,
            p3,
            subtitle3,
            p4,
            subtitle4,
            p5,
            subtitle5,
            p6,
            subtitle6,
            p7,
          ],
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
        // Set the appropriate headers for the document
        res.writeHead(200, {
          "Content-Disposition": `attachment; filename="INITIAL.docx"`,
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });

        // Write the buffer to response
        res.end(buffer);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error generating document");
      });
  }
);

router.get(
  "/avenant-pepiniere/:conv_id/:version/:nameFile", verifyUser,
  async (req, res) => {
    /* 
#swagger.tags = ['Documents']
#swagger.description = "Get the pepiniere avenant birthday"
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
#swagger.parameters['nameFile'] = {
in: 'path',
description: 'Filename',
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

    let { conv_id, version, nameFile } = req.params;

    const convdescQuery = db("convdesc")
      .select(
        "convdesc.raison_sociale",
        "date_signature",
        "date_debut",
        "date_fin",
        "conv_age"
      )
      .where({ "convdesc.conv_id": conv_id, "convdesc.version": version })
      .first();

    const signatairesQuery = db("sigconv")
      .select(
        db.raw(
          `GROUP_CONCAT(CONCAT(tiepp.civilite, ' ', tiepp.first_name, ' ', tiepp.surname) SEPARATOR ' ET ') AS full_name`
        )
      )
      .leftJoin("tiepp", "tiepp.tiepp_id", "sigconv.tiepp_id")
      .where({ "sigconv.conv_id": conv_id, "sigconv.version": version })
      .first();

    const rubriquesQuery = db("rubconv")
      .select("montant", "periodicity")
      .where({ conv_id, version, rubrique: "REDEVANCE" });

    const rubriquesInitialQuery = db("rubconv")
      .select("montant", "periodicity")
      .where({ conv_id: 1, version: 1, rubrique: "REDEVANCE" });

    const [signataires, convdesc, rubriques, rubriquesInitial] =
      await Promise.all([
        signatairesQuery,
        convdescQuery,
        rubriquesQuery,
        rubriquesInitialQuery,
      ]);

    const dateAnniv = new Date(
      new Date(
        new Date(convdesc.date_debut).setFullYear(
          new Date(convdesc.date_debut).getFullYear() + convdesc.conv_age
        )
      ).setDate(new Date(convdesc.date_debut).getDate() - 1)
    )
      .toISOString()
      .split("T")[0];

    const dateProlongation = new Date(
      new Date(
        new Date(convdesc.date_debut).setFullYear(
          new Date(convdesc.date_debut).getFullYear() + (convdesc.conv_age + 1)
        )
      ).setDate(new Date(convdesc.date_debut).getDate() - 1)
    )
      .toISOString()
      .split("T")[0];

    const debutAvenantDate = new Date(
      new Date(convdesc.date_debut).setFullYear(
        new Date(convdesc.date_debut).getFullYear() + convdesc.conv_age
      )
    )
      .toISOString()
      .split("T")[0];

    const totalAmount = rubriques.reduce((acc, cur) => acc + cur["montant"], 0);

    const amountDetail = rubriques
      .map(
        (cur: any, idx: any, arr: any) =>
          cur["montant"].toString() + (idx < arr.length - 1 ? " + " : "")
      )
      .join("");

    const totalAmountInitial = rubriquesInitial.reduce(
      (acc, cur) => acc + cur["montant"],
      0
    );

    const amountDetailInitial = rubriquesInitial
      .map(
        (cur: any, idx: any, arr: any) =>
          cur["montant"].toString() + (idx < arr.length - 1 ? " + " : "")
      )
      .join("");

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
          text: `AVENANT n°${convdesc.conv_age} à la convention d'occupation temporaire signée le ${convdesc.date_signature
            ?.split("-")
            .reverse()
            .join("/")}`,
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

    const p1 = new Paragraph({
      style: "paragraphStyle",
      children: [
        new TextRun({
          text: "Entre l’association Espace XXXXXX-Pépinière d’entreprises, représentée par son Président, Pierre ROBIN, dûment habilité",
        }),
        new TextRun({
          text: "D’UNE PART, le président Pierre ROBIN",
          break: 2,
          bold: true,
        }),
        new TextRun({
          text: "ET",
          break: 2,
          underline: { type: UnderlineType.SINGLE },
        }),
        new TextRun({
          text: `${signataires}`,
          break: 2,
          bold: true,
          // underline:true
        }),
        new TextRun({
          text: " agissant au nom et pour le compte de la société ",
        }),
        new TextRun({
          text: `${convdesc.raison_sociale}`,
          bold: true,
        }),
        new TextRun({
          text: "Ci-après désignée « l’occupant »,",
          break: 2,
        }),
        new TextRun({
          text: "D’AUTRE PART.",
          break: 2,
          bold: true,
        }),
        new TextRun({
          text: "IL A ETE CONVENU CE QUI SUIT :",
          break: 3,
        }),
        new TextRun({
          text: "- Le droit d’occupation temporaire accordé à l’entreprise arrivant à son terme le ",
          break: 2,
        }),
        new TextRun({
          text: `${dateAnniv?.split("-").reverse().join("/")}`,
          bold: true,
        }),
        new TextRun({
          text: " est prolongé pour une durée d’un an, soit jusqu’au ",
        }),
        new TextRun({
          text: `${dateProlongation?.split("-").reverse().join("/")} `,
          bold: true,
        }),
        new TextRun({
          text: "aux mêmes termes et conditions que ceux mentionnés dans la convention initiale,",
        }),
        new TextRun({
          text: `- De fait, `,
          break: 2,
        }),
        new TextRun({
          text: `à compter du ${debutAvenantDate
            ?.split("-")
            .reverse()
            .join("/")} jusqu'au ${dateProlongation
              ?.split("-")
              .reverse()
              .join("/")}`,
          bold: true,
        }),
        new TextRun({
          text: `,l’indemnité d’occupation mensuelle (toutes charges comprises) ${convdesc.conv_age == 1
              ? "s’élèvera au tarif « 2ème année »"
              : convdesc.conv_age == 2
                ? "s’élèvera au tarif « 3ème année »"
                : convdesc.conv_age == 3
                  ? "s’élèvera au tarif « centre d’affaires »"
                  : "reste inchangé, soit le tarif « centre d’affaires »"
            } de `,
        }),
        new TextRun({
          text: `${totalAmount} € HT ${"(" + amountDetail + ")"} au lieu de ${totalAmountInitial} euros HT ${"(" + amountDetailInitial + ")"
            }`,
          bold: true,
        }),
        new TextRun({
          text: ` prévu dans le bail initial s’y rapportant. Cette indemnité, soumise à la TVA, reste payable d’avance chaque mois dans les huit jours suivant la demande. Outre l’indemnité, l’occupant supportera la TVA sur le montant de l’indemnité.`,
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
          text: "(date de signature à remplir)",
          bold: true,
        }),
        new TextRun({
          text: "En deux originaux",
          break: 2,
        }),
        new TextRun({
          text: "Pour l’association,						Pour l’entreprise,	",
          break: 3,
        }),
      ],
    });

    const doc = new Document({
      creator: "ESPACE XXXXXX",
      description: "Avenant n°1",
      title: "Avenant n°1",
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
        // Set the appropriate headers for the document
        res.writeHead(200, {
          "Content-Disposition": `attachment; filename="${nameFile}.docx"`,
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });

        // Write the buffer to response
        res.end(buffer);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error generating document");
      });
  }
);

router.get("/avenant-local/:conv_id/:version/:nameFile", verifyUser, async (req, res) => {
  /* 
#swagger.tags = ['Documents']
#swagger.description = "Get the pepiniere avenant local"
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
 #swagger.parameters['nameFile'] = {
     in: 'path',
     description: 'Filename',
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
  let { conv_id, version, nameFile } = req.params;

  const convdescQuery = db("convdesc")
    .select(
      "convdesc.raison_sociale",
      "date_signature",
      "date_debut",
      "date_fin",
      "conv_age"
    )
    .where({ "convdesc.conv_id": conv_id, "convdesc.version": version })
    .first();

  const signatairesQuery = db("sigconv")
    .select(
      db.raw(
        `GROUP_CONCAT(CONCAT(tiepp.civilite, ' ', tiepp.first_name, ' ', tiepp.surname) SEPARATOR ' ET ') AS full_name`
      )
    )
    .leftJoin("tiepp", "tiepp.tiepp_id", "sigconv.tiepp_id")
    .where({ "sigconv.conv_id": conv_id, "sigconv.version": version })
    .first();

  const numberAvenantsLocalQuery = db("convdesc")
    .where("statut", "like", "AVENANT LOCAL%")
    .where({ conv_id })
    .count("statut as count")
    .first();

  const ugsCurrentQuery = db("ugconv")
    .select(
      "ugdesc.ug_id",
      "ugdesc.name",
      "ugconv.surface_rent",
      "rubconv.montant",
      "rubconv.periodicity",
      "ugconv.update_date"
    )
    .join("rubconv", function () {
      this.on("ugconv.ug_id", "=", "rubconv.ug_id")
        .andOn("ugconv.conv_id", "=", "rubconv.conv_id")
        .andOn("ugconv.version", "=", "rubconv.version");
    })
    .leftJoin("ugdesc", "ugdesc.ug_id", "ugconv.ug_id")
    .where({
      "ugconv.version": version,
      "ugconv.conv_id": conv_id,
      "rubconv.rubrique": "REDEVANCE",
    });

  const ugsPreviousQuery = db("ugconv")
    .select(
      "ugdesc.ug_id",
      "ugdesc.name",
      "ugconv.surface_rent",
      "rubconv.montant",
      "rubconv.periodicity",
      "ugconv.update_date"
    )
    .join("rubconv", function () {
      this.on("ugconv.ug_id", "=", "rubconv.ug_id")
        .andOn("ugconv.conv_id", "=", "rubconv.conv_id")
        .andOn("ugconv.version", "=", "rubconv.version");
    })
    .leftJoin("ugdesc", "ugdesc.ug_id", "ugconv.ug_id")
    .where({
      "ugconv.version": Number(version) - 1,
      "ugconv.conv_id": conv_id,
      "rubconv.rubrique": "REDEVANCE",
    });

  const [signataires, convdesc, numberAvenantsLocal, ugsCurrent, ugsPrevious] =
    await Promise.all([
      signatairesQuery,
      convdescQuery,
      numberAvenantsLocalQuery,
      ugsCurrentQuery,
      ugsPreviousQuery,
    ]);

  const ugsSurfacesDifferences = ugsCurrent
    .filter((ug) => {
      return ugsPrevious.some((ugPrev) => ugPrev.ug_id === ug.ug_id);
    })
    .map((cur) => {
      const ugPrev = ugsPrevious.find((data) => data.ug_id === cur.ug_id);
      return {
        name: cur.name,
        surface_rent_prev: ugPrev.surface_rent,
        surface_rent: cur.surface_rent,
      };
    });

  const newUgs = ugsCurrent
    .filter((ug) => {
      return ugsPrevious.some((ugPrev) => ugPrev.ug_id !== ug.ug_id);
    })
    .map((cur) => {
      return {
        name: cur.name,
        surface_rent: cur.surface_rent,
        montant: cur.montant,
      };
    });

  const dateProlongation = new Date(
    new Date(
      new Date(convdesc.date_debut).setFullYear(
        new Date(convdesc.date_debut).getFullYear() + (convdesc.conv_age + 1)
      )
    ).setDate(new Date(convdesc.date_debut).getDate() - 1)
  )
    .toISOString()
    .split("T")[0];

  const dateFin =
    convdesc.convDtf && new Date(convdesc.convDtf) < new Date(dateProlongation)
      ? convdesc.convDtf
      : dateProlongation;

  const totalAmount = ugsCurrent.reduce((acc, cur) => acc + cur["montant"], 0);

  const amountDetail = ugsCurrent
    .map(
      (cur: any, idx: any, arr: any) =>
        cur["montant"].toString() + (idx < arr.length - 1 ? " + " : "")
    )
    .join("");

  const totalAmountPrevious = ugsPrevious.reduce(
    (acc, cur) => acc + cur["montant"],
    0
  );

  const amountDetailPrevious = ugsPrevious
    .map(
      (cur: any, idx: any, arr: any) =>
        cur["montant"].toString() + (idx < arr.length - 1 ? " + " : "")
    )
    .join("");

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
        text: `AVENANT de surface n°${numberAvenantsLocal && numberAvenantsLocal.count} à la convention d’occupation temporaire signée le ${convdesc.date_signature
          ?.split("-")
          .reverse()
          .join("/")}`,
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

  const p1 = new Paragraph({
    style: "paragraphStyle",
    children: [
      new TextRun({
        text: "Entre l’association Espace XXXXXX-Pépinière d’entreprises, représentée par son Président, Pierre ROBIN, dûment habilité",
      }),
      new TextRun({
        text: "D’UNE PART, le président Pierre ROBIN",
        break: 2,
        bold: true,
      }),
      new TextRun({
        text: "ET ",
        break: 2,
        underline: { type: UnderlineType.SINGLE },
      }),
      new TextRun({
        text: `${signataires.full_name}`,
        break: 2,
        bold: true,
        // underline:true
      }),
      new TextRun({
        text: " agissant au nom et pour le compte de la société ",
      }),
      new TextRun({
        text: `${convdesc.raison_sociale}`,
        bold: true,
      }),
      new TextRun({
        text: "Ci-après désignée « l’occupant »,",
        break: 2,
      }),
      new TextRun({
        text: "D’AUTRE PART.",
        break: 2,
        bold: true,
      }),
      new TextRun({
        text: "IL A ETE CONVENU CE QUI SUIT :",
        break: 3,
      }),
      ...ugsSurfacesDifferences.flatMap((data) => {
        return [
          new TextRun({
            text: `- La surface du local d’activités ${data.name}`,
            bold: true,
            break: 2,
          }),
          new TextRun({
            text: ", pour lequel un droit d’occupation précaire a été concédé à l’entreprise ",
          }),
          new TextRun({
            text: `${convdesc.raison_sociale}, est portée de ${data.surface_rent_prev} m² à ${data.surface_rent} m². `,
            bold: true,
          }),
        ];
      }),
      ...newUgs.flatMap((data) => {
        return [
          new TextRun({
            text: `- Un droit d’occupation précaire de surface `,
            break: 2,
          }),
          new TextRun({
            text: `${data.surface_rent} m²`,
            bold: true,
          }),
          new TextRun({
            text: ` a été concédé à l’occupant pour le local `,
          }),
          new TextRun({
            text: `${data.name}`,
            bold: true,
          }),
          new TextRun({
            text: ` pour un montant mensuel de `,
          }),
          new TextRun({
            text: `${data.montant} euros HT.`,
            bold: true,
          }),
        ];
      }),
      new TextRun({
        text: "- De fait, ",
        break: 2,
      }),
      new TextRun({
        text: `à compter du ${new Date(ugsCurrent[0].update_date)
          .toISOString()
          .split("T")[0]
          ?.split("-")
          .reverse()
          .join("/")}, jusqu'au ${dateFin?.split("-").reverse().join("/")},`,
        bold: true,
      }),
      new TextRun({
        text: " l’indemnité d’occupation mensuelle (toutes charges comprises) s’élèvera à ",
      }),
      new TextRun({
        text: `${totalAmount} € HT ${"(" + amountDetail + ")"
          } au lieu de ${totalAmountPrevious} € HT ${"(" + amountDetailPrevious + ")"
          }`,
        bold: true,
      }),
      new TextRun({
        text: " prévu dans le bail initial et avenants s’y rapportant. Cette indemnité, soumise à la TVA, reste payable d’avance chaque mois dans les huit jours suivant la demande.",
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
        text: "(date de signature)",
        bold: true,
      }),
      new TextRun({
        text: "En deux originaux",
        break: 2,
      }),
      new TextRun({
        text: "Pour l’association,						Pour l’entreprise,	",
        break: 3,
      }),
    ],
  });

  const doc = new Document({
    creator: "ESPACE XXXXXX",
    description: "Avenant Surface",
    title: "Avenant Surface",
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
      // Set the appropriate headers for the document
      res.writeHead(200, {
        "Content-Disposition": `attachment; filename="${nameFile}.docx"`,
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      // Write the buffer to response
      res.end(buffer);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error generating document");
    });
});

router.get("/avenant-entite/:conv_id/:version/:nameFile", verifyUser, async (req, res) => {
  /* 
#swagger.tags = ['Documents']
#swagger.description = "Get the pepiniere avenant entite"
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
#swagger.parameters['nameFile'] = {
   in: 'path',
   description: 'Filename',
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

  let { conv_id, version, nameFile } = req.params;

  const convdescQuery = db("convdesc")
    .select(
      "convdesc.raison_sociale",
      "date_signature",
      "date_debut",
      "date_fin",
      "conv_age"
    )
    .where({ "convdesc.conv_id": conv_id, "convdesc.version": version })
    .first();

  const raisonSocialPrevQuery = db("convdesc")
    .select("raison_sociale")
    .where({
      "convdesc.conv_id": conv_id,
      "convdesc.version": Number(version) - 1,
    })
    .first();

  const signatairesQuery = db("sigconv")
    .select(
      db.raw(
        `GROUP_CONCAT(CONCAT(tiepp.civilite, ' ', tiepp.first_name, ' ', tiepp.surname) SEPARATOR ' ET ') AS full_name`
      )
    )
    .leftJoin("tiepp", "tiepp.tiepp_id", "sigconv.tiepp_id")
    .where({ "sigconv.conv_id": conv_id, "sigconv.version": version })
    .first();

  const numberAvenantsEntiteQuery = db("convdesc")
    .where("statut", "like", "AVENANT ENTITE%")
    .where({ conv_id })
    .count("statut as count")
    .first();

  const [signataires, convdesc, numberAvenantsEntite, raisonSocialPrev] =
    await Promise.all([
      signatairesQuery,
      convdescQuery,
      numberAvenantsEntiteQuery,
      raisonSocialPrevQuery,
    ]);

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
        text: `AVENANT de changement d'entité n°${numberAvenantsEntite && numberAvenantsEntite.count} à la convention d’occupation temporaire signée le ${convdesc.date_signature
          ?.split("-")
          .reverse()
          .join("/")}`,
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

  const p1 = new Paragraph({
    style: "paragraphStyle",
    children: [
      new TextRun({
        text: "Entre l’association Espace XXXXXX-Pépinière d’entreprises, représentée par son Président, Pierre ROBIN, dûment habilité",
      }),
      new TextRun({
        text: "D’UNE PART, le président Pierre ROBIN",
        break: 2,
        bold: true,
      }),
      new TextRun({
        text: "ET ",
        break: 2,
        underline: { type: UnderlineType.SINGLE },
      }),
      new TextRun({
        text: `${signataires.full_name}`,
        break: 2,
        bold: true,
        // underline:true
      }),
      new TextRun({
        text: " agissant au nom et pour le compte de la société ",
      }),
      new TextRun({
        text: `${convdesc.raison_sociale}`,
        bold: true,
      }),
      new TextRun({
        text: "Ci-après désignée « l’occupant »,",
        break: 2,
      }),
      new TextRun({
        text: "D’AUTRE PART.",
        break: 2,
        bold: true,
      }),
      new TextRun({
        text: "IL A ETE CONVENU CE QUI SUIT :",
        break: 3,
      }),
      new TextRun({
        text: `- Le changement d'entité : ${raisonSocialPrev.raison_sociale} devient `,
        break: 2,
      }),
      new TextRun({
        text: `${convdesc.raison_sociale}.`,
        bold: true,
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
        text: "(date de signature)",
        bold: true,
      }),
      new TextRun({
        text: "En deux originaux",
        break: 2,
      }),
      new TextRun({
        text: "Pour l’association,						Pour l’entreprise,	",
        break: 3,
      }),
    ],
  });

  const doc = new Document({
    creator: "ESPACE XXXXXX",
    description: "Avenant Entité",
    title: "Avenant Entité",
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
      // Set the appropriate headers for the document
      res.writeHead(200, {
        "Content-Disposition": `attachment; filename="${nameFile}.docx"`,
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      // Write the buffer to response
      res.end(buffer);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error generating document");
    });
});

export { router as docsRouter };
