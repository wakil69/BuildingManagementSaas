import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { db } from "../data/db";
import { UsersTable } from "../data/typesTable";
import bcrypt from "bcrypt";
import { generateAccessToken } from "../utilities/jwtUtilities";
import { AdminRequest, verifyAdmin } from "../middlewares/checkAdmin";
import nodemailer from "nodemailer";
import {
  creationAccountEmailHTML,
  resetPwdEmailHTML,
} from "../utilities/email";
import { UserRequest, verifyUser } from "../middlewares/checkUser";
import { UserProfile } from "../types/userRouterTypes";
import password from "secure-random-password";

dotenv.config();

const router = express.Router();

const jwtSecret = process.env.JWT_SECRET!;
const saltRounds = 15;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PWD_EMAIL,
  },
});


router.get("/", verifyUser, async (req: UserRequest, res) => {
  /* 
     #swagger.tags = ['User']
     #swagger.description = "Get user infos"
     #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/userProfileResponse' }
     } 
     #swagger.responses[400] = {
          schema: { $ref: '#/components/schemas/BadRequest' }
     } 
     #swagger.responses[500] = {
          schema: { $ref: '#/components/schemas/ErrorResponse' }
     }        
 */
  try {
    const user_id = req.user_id;
    const company_id = req.company_id;
    const userInfos: UserProfile = await db("users")
      .select("first_name", "last_name", "email", "role")
      .where({ user_id })
      .first();

    const checkNotificationsQuery = await db("notifications")
      .select()
      .where({ company_id });

    res.status(200).json({
      userInfos,
      checkNotifications: !!checkNotificationsQuery.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer" });
  }
});

// router.get("/mdp", async (req, res) => {
//   const salt = await bcrypt.genSalt(saltRounds);
//   if (process.env.MDP_ADMIN) {
//     const password = await bcrypt.hash(process.env.MDP_ADMIN, salt);
//     res.status(200).send({ password });
//   }
//   return;
// });

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body; 

    const checkUser: UsersTable = await db("users")
      .select()
      .where({ email })
      .first();


    if (!checkUser) {
      res.status(403).json({ message: "Invalid login" });
      return;
    }

    const isMatch = await bcrypt.compare(password, checkUser.password);

    if (!isMatch) {
      res.status(403).send({
        message: "Votre email/mot de passe est incorrect.",
      });
      return;
    }

    const token = generateAccessToken(checkUser);

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({ message: "Logged in" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer" });
  }
});

router.post("/sign-up", verifyAdmin, async (req: AdminRequest, res) => {
  const { email, first_name, last_name, role } = req.body;
  const user_id = req.user_id;
  const company_id = req.company_id;
  const trx = await db.transaction();
  try {

    const checkEmailExisting = await trx("users")
    .select()
    .where({ email })
    .first()

    if (checkEmailExisting) {
      await trx.rollback();
      res.status(400).send({ message: "Un compte est déjà associé à cet email." });
      return
    }

    const randomPassword = password.randomPassword({
      length: 20,
      characters: [password.lower, password.upper, password.digits],
    });

    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(randomPassword, salt);

    await trx("users").insert({
      email,
      password: hashedPassword,
      first_name,
      last_name,
      role,
      company_id,
      update_user: user_id,
      creation_user: user_id,
    });

    const mailOptions = {
      from: "No reply <no-reply@noreply.com>",
      to: email,
      subject: "Création du compte",
      html: creationAccountEmailHTML(first_name, randomPassword),
    };

    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        await trx.rollback();
        res
          .status(500)
          .send({
            message:
              "Erreur serveur lors de l'envoi du mail, le compte n'a pas pu être créé.",
          });
        console.error("Error sending email:", error);
      }
    });

    await trx.commit();

    res.status(200).json({ message: "La création du compte est un succès." });
  } catch (err) {
    await trx.rollback();
    console.error(err);
    res.status(500).send({ message: "Erreur serveur, veuillez réessayer." });
  }
});

router.get("/accounts", verifyAdmin, async (req: AdminRequest, res) => {
  const company_id = req.company_id;
  const user_id = req.user_id;
  try {
    const allAccounts = await db("users")
      .select("user_id", "first_name", "last_name", "email", "role")
      .whereNot({ user_id })
      .where({ company_id, is_deleted: false });

    res.status(200).json(allAccounts);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Erreur serveur, veuillez réessayer." });
  }
});

router.put("/account", verifyAdmin, async (req: AdminRequest, res) => {
  const { user_id: userToUpdate, role } = req.body;
  const user_id = req.user_id;
  const trx = await db.transaction();
  try {
    await trx("users")
      .update({
        role,
        update_user: user_id,
      })
      .where({ user_id: userToUpdate });

    await trx.commit();

    res
      .status(200)
      .json({ message: "La modification du compte est un succès." });
  } catch (err) {
    await trx.rollback();
    console.error(err);
    res.status(500).send({ message: "Erreur serveur, veuillez réessayer." });
  }
});

router.delete("/account/:user_id", verifyAdmin, async (req, res) => {
  const { user_id } = req.params;
  const trx = await db.transaction();
  try {
    await trx("users")
      .update({
        is_deleted: true,
      })
      .where({ user_id });

    await trx.commit();

    res
      .status(200)
      .json({ message: "La suppression du compte est un succès." });
  } catch (err) {
    await trx.rollback();
    console.error(err);
    res.status(500).send({ message: "Erreur serveur, veuillez réessayer." });
  }
});

router.post("/forgotten-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user: UsersTable = await db("users").where({ email }).first();

    if (!user) {
      res.status(400).json({ message: "Ce compte n'existe pas." });
      return;
    }

    const token = jwt.sign({ user_id: user.user_id }, jwtSecret, {
      expiresIn: "15m",
    });

    const mailOptions = {
      from: "No reply <no-reply@noreply.com>",
      to: email,
      subject: "Mot de passe oublié",
      html: resetPwdEmailHTML(user.first_name, token),
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).send({ message: "Failed to send email" });
      return;
    }

    res.status(200).json({ message: "L'envoi du mail est un succès." });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Erreur serveur, veuillez réessayer." });
  }
});

router.post("/reset-password", async (req, res) => {
  const { token, new_password, confirmation_new_password } = req.body;

  if (new_password !== confirmation_new_password) {
    res.status(400).send({
      message: "Les mots de passe ne correspondent pas.",
    });
    return;
  }

  const trx = await db.transaction();

  try {
    const decoded = jwt.verify(token, jwtSecret);

    if (typeof decoded !== "object" || !("user_id" in decoded)) {
      await trx.rollback();
      res.status(400).json({ message: "Token invalide." });
      return;
    }

    const user: UsersTable | undefined = await db("users")
      .where({ user_id: decoded.user_id })
      .first();

    if (!user) {
      await trx.rollback();
      res.status(404).json({ message: "Ce compte n'existe pas." });
      return;
    }

    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    await trx("users")
      .update({ password: hashedPassword })
      .where({ user_id: decoded.user_id });

    await trx.commit();

    res
      .status(200)
      .json({ message: "Le mot de passe a été réinitialisé avec succès." });
  } catch (err) {
    await trx.rollback();
    console.error(err);
    res.status(500).send({ message: "Erreur serveur, veuillez réessayer." });
  }
});

router.get("/is-authenticated", async (req, res) => {
  const token = req.cookies.token;
  if (token) {
    res.status(200).json({ isAuthenticated: true });
    return;
  }
  res.status(200).json({ isAuthenticated: false });
});

router.post("/logout", (req, res) => {
  res
    .cookie("token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      expires: new Date(0),
    })
    .json({ message: "Vous vous êtes déconnecté avec succès." });
});

export { router as userRouter };
