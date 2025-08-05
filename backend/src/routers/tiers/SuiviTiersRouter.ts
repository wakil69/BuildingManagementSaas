import express, { Request, Response } from "express";
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
import { AdminRequest, verifyAdmin } from "../../middlewares/checkAdmin";
import { r2 } from "../../r2Client";

dotenv.config();

const router = express.Router();

// Configure multer for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME as string;

const storageFiles = multer.memoryStorage();

//new
router.get(
  "/suivi/:qualite/:id",
  verifyUser,
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
     #swagger.description = "get all suivi for an tier"
    #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/Suivi' }
     } 
     #swagger.responses[400] = {
            schema: { $ref: '#/components/schemas/BadRequest' }
     } 
     #swagger.responses[500] = {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
    }  
  */
    try {
      const { id: tiepp_id } = req.params;

      let suivi = await db("tieppaccsuivi")
        .select(
          "suivi_id",
          "date_acc_suivi",
          "typ_accompagnement_id",
          "hour_begin",
          "hour_end",
          "sujet_accompagnement_id",
          "feedback"
        )
        .where({
          tiepp_id,
        })
        .orderBy("date_acc_suivi", "desc");

      suivi = await Promise.all(
        suivi.map(async (suiviItem) => {
          const { suivi_id } = suiviItem;
          const prefix = `Pepiniere Tiers/PP/${tiepp_id}/Accompagnement_${suivi_id}/imported/`;

          const listParams = {
            Bucket: R2_BUCKET_NAME,
            Prefix: prefix,
          };

          try {
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

                const url = await getSignedUrl(r2, command, {
                  expiresIn: 60 * 5,
                });
                const filename = file.Key!.split("/").pop();

                return { url, filename };
              })
            );

            return { ...suiviItem, files: filesWithUrls };
          } catch (error) {
            console.error(
              `Error listing files for suivi_id ${suivi_id}:`,
              error
            );
            return { ...suiviItem, files: [] };
          }
        })
      );

      res.status(200).json(suivi);
    } catch (err) {
      console.error(err);
      res.status(500).send("Erreur serveur, veuillez réessayer.");
    }
  }
);

//new
router.put(
  "/suivi/:qualite/:id",
  verifyAdmin,
  checkHasTiersAccess,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Tiers']
     #swagger.parameters['id'] = {
          in: 'path',
          description: 'id of the PP or PM',
          required: true,
          schema: { type: 'integer' }
     }
     #swagger.description = "update a suivi"
       #swagger.requestBody = {
      schema: { type: "object", properties: { 
      suivi_id: { type: "number" },
      date_acc_suivi: { type: "string" }, 
      typ_accompagnement_id: { type: "number" },
      hour_begin: { type: "string" },
      hour_end: { type: "string" },
      sujet_accompagnement_id: { type: "number" },
      feedback: { type: "string", nullable: true },
        }}
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
      const {
        suivi_id,
        date_acc_suivi,
        typ_accompagnement_id,
        hour_begin,
        hour_end,
        sujet_accompagnement_id,
        feedback,
      } = req.body;
      const user_id = req.user_id;
      await trx("tieppaccsuivi")
        .update({
          date_acc_suivi,
          typ_accompagnement_id,
          hour_begin,
          hour_end,
          sujet_accompagnement_id,
          feedback,
          update_user: user_id,
        })
        .where({ suivi_id });
      await trx.commit();
      res
        .status(200)
        .json({ message: "La modification du suivi est un succès." });
    } catch (e) {
      await trx.rollback();
      console.error(e);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

//new
router.delete(
  "/suivi/:qualite/:id/:suivi_id",
  async (req: Request, res: Response) => {
    /* 
     #swagger.tags = ['Tiers']
     #swagger.parameters['id'] = {
          in: 'path',
          description: 'id of the PP or PM',
          required: true,
          schema: { type: 'integer' }
     }
    #swagger.parameters['qualite'] = {
          in: 'path',
          description: 'id of the PP or PM',
          required: true,
          schema: { type: 'integer' }
     }
    #swagger.parameters['suivi_id'] = {
          in: 'path',
          description: 'suivi id',
          required: true,
          schema: { type: 'integer' }
     }
     #swagger.description = "delete a suivi"
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
      const { id, suivi_id } = req.params;

      await trx("tieppaccsuivi").delete().where({ suivi_id });


      try {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: `Pepiniere Tiers/PP/${id}/Accompagnement_${suivi_id}/imported`,
        });

        await r2.send(deleteCommand);

        await trx.commit();

        res
          .status(200)
          .json({ message: "La suppression du suivi est un succès." });
      } catch (error) {
        await trx.rollback();

        console.error("Error moving folder: ", error);
        res.status(500).json("Error moving folder");
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
  "/suivi/:qualite/:id",
  verifyAdmin,
  checkHasTiersAccess,
  async (req: AdminRequest, res) => {
    /* 
     #swagger.tags = ['Tiers']
     #swagger.parameters['id'] = {
          in: 'path',
          description: 'id of the PP or PM',
          required: true,
          schema: { type: 'integer' }
     }
    #swagger.parameters['qualite'] = {
          in: 'path',
          description: 'id of the PP or PM',
          required: true,
          schema: { type: 'integer' }
     }
     #swagger.description = "create a suivi"
       #swagger.requestBody = {
      schema: { type: "object", properties: { 
      date_acc_suivi: { type: "string" }, 
      typ_accompagnement_id: { type: "number" },
      hour_begin: { type: "string" },
      hour_end: { type: "string" },
      sujet_accompagnement_id: { type: "number" },
      feedback: { type: "string", nullable: true },
        }}
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
    const {
      date_acc_suivi,
      typ_accompagnement_id,
      hour_begin,
      hour_end,
      sujet_accompagnement_id,
      feedback,
    } = req.body;

    try {
      const { id: tiepp_id } = req.params;

      const user_id = req.user_id;

      await trx("tieppaccsuivi").insert({
        tiepp_id,
        date_acc_suivi,
        typ_accompagnement_id,
        hour_begin,
        hour_end,
        sujet_accompagnement_id,
        feedback: feedback || null,
        creation_user: user_id,
        update_user: user_id,
      });

      await trx.commit();

      res.status(200).json({ message: "La création du suivi est un succès." });
    } catch (e) {
      await trx.rollback();
      console.error(e);
      res.status(500).json({ message: "Erreur serveur, veuillez réessayer." });
    }
  }
);

//new
router.put(
  "/suivi/files/:qualite/:id/:suivi_id",
  async (req: Request, res: Response) => {
    /* 
     #swagger.tags = ['Tiers']
     #swagger.parameters['id'] = {
          in: 'path',
          description: 'id of the PP or PM',
          required: true,
          schema: { type: 'integer' }
     }
    #swagger.parameters['qualite'] = {
          in: 'path',
          description: 'id of the PP or PM',
          required: true,
          schema: { type: 'integer' }
     }
    #swagger.parameters['suivi_id'] = {
          in: 'path',
          description: 'suivi id',
          required: true,
          schema: { type: 'integer' }
     }
     #swagger.description = "move a file for a suivi to archive"
       #swagger.requestBody = {
      filename: { type: "string" },
        }}
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

    const { id, suivi_id } = req.params;
    const { filename } = req.body;

    if (!id) {
      res.status(400).json({ message: "L'identifiant est requis." });
      return;
    }

    if (!filename) {
      res.status(400).json({ message: "Le nom du fichier sont requis." });
      return;
    }

    const prefix = `Pepiniere Tiers/PP/${id}/Accompagnement_${suivi_id}`;

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
      res
        .status(500)
        .json({ message: "Erreur lors du déplacement du fichier." });
    }
  }
);

//new
router.post(
  "/suivi/files/:qualite/:id/:suivi_id",
  verifyAdmin,
  checkHasTiersAccess,
  upload.array("files"),
  async (req, res) => {
    /* 
     #swagger.tags = ['Tiers']
     #swagger.parameters['id'] = {
          in: 'path',
          description: 'id of the PP or PM',
          required: true,
          schema: { type: 'integer' }
     }
    #swagger.parameters['qualite'] = {
          in: 'path',
          description: 'id of the PP or PM',
          required: true,
          schema: { type: 'integer' }
     }
    #swagger.parameters['suivi_id'] = {
          in: 'path',
          description: 'suivi id',
          required: true,
          schema: { type: 'integer' }
     }
     #swagger.description = "move a file for a suivi to archive"
       #swagger.requestBody = {
      filename: { type: "string" },
        }}
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

    const { id, suivi_id } = req.params;

    if (!id) {
      res.status(400).json({ message: "L'identifiant est requis." });
      return;
    }

    if (!req.files || !Array.isArray(req.files)) {
      res
        .status(400)
        .json({ message: "Des fichiers sont requis pour l'importation." });
      return;
    }

    try {
      const prefix = `Pepiniere Tiers/PP/${id}/Accompagnement_${suivi_id}/imported`;

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

export { router as suiviTiersRouter };
