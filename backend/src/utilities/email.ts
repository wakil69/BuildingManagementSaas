export const resetPwdEmailHTML = (first_name: string, token: string) => {
  const baseUrl =
    process.env.NODE_ENVIRONNEMENT === "production"
      ? "https://test.com"
      : "http://localhost:3000";

  return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #194056;
            margin: 0;
            padding: 0;
            color: #333;
          }
          .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #fff;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: hidden;
          }
          .header {
            background-color: #194056;
            color: white;
            padding: 20px;
            text-align: center;
          }
          .content {
            padding: 30px 20px;
          }
          .button {
            background-color: #194056;
            color: #fff;
            padding: 15px 30px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            margin: 30px 0;
            border-radius: 5px;
            font-size: 16px;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #777;
          }
        </style>
      </head>
      <body>
        <div class="container">
  <div class="header">
    <h1>Demande de Réinitialisation de Mot de Passe</h1>
      </div>
      <div class="content">
        <p>Bonjour ${first_name},</p>
        <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte Pep's. Veuillez cliquer sur le bouton ci-dessous pour réinitialiser votre mot de passe :</p>
        <a href="${baseUrl}/reset-pwd/${token}" class="button" style="color:white;">Réinitialiser votre mot de passe</a>
        <p>Si le bouton ne fonctionne pas, vous pouvez copier et coller le lien suivant dans votre navigateur :</p>
        <p><a href="${baseUrl}/reset-pwd/${token}">${baseUrl}/reset-pwd/${token}</a></p>
        <p>Si vous n'avez pas demandé de réinitialisation de mot de passe, veuillez ignorer cet email. Votre mot de passe restera inchangé.</p>
      </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Pep's - <a href="https://mbe-consult.fr/fr" style="text-decoration: underline; color: inherit;">MBE ET CONNECT</a>. Tous droits réservés.</p>
        </div>
      </div>
      </body>
      </html>
    `;
};

export const creationAccountEmailHTML = (
  first_name: string,
  password: string
) => {
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? "https://test.mbe-consult.com"
      : "http://localhost:3000";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #194056;
          margin: 0;
          padding: 0;
          color: #333;
        }
        .container {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          background-color: #fff;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        .header {
          background-color: #194056;
          color: white;
          padding: 20px;
          text-align: center;
        }
        .content {
          padding: 30px 20px;
        }
        .button {
          background-color: #194056;
          color: #fff;
          padding: 15px 30px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          margin: 30px 0;
          border-radius: 5px;
          font-size: 16px;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          padding: 20px;
          font-size: 12px;
          color: #777;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Bienvenue sur Pep's!</h1>
        </div>
        <div class="content">
          <p>Bonjour ${first_name},</p>
          <p>Un administrateur a créé un compte pour vous sur Pep's. Voici vos identifiants temporaires :</p>
          <p><strong>Mot de passe : ${password}</strong></p>
          <p>Vous pouvez vous connecter à votre compte dès maintenant en cliquant sur le bouton ci-dessous :</p>
          <a href="${baseUrl}" class="button" style="color:white;">Accéder à mon compte</a>
          <p>Si vous souhaitez changer votre mot de passe, vous pouvez le faire en utilisant l'option "Mot de passe oublié" sur la page de connexion.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Pep's - <a href="https://mbe-consult.fr/fr" style="text-decoration: underline; color: inherit;">MBE ET CONNECT</a>. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
