import { Link } from "react-router-dom";
import styles from "./footer.module.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className={styles.footer}>
      <p className={styles.text}>
        {import.meta.env.VITE_APP_ENV == "production"
          ? `XXXXXXX © ${currentYear} - Un produit conçu par MBE & CONNECT`
          : "Il est interdit d'enregistrer, de reproduire ou de partager cette présentation sans autorisation écrite de MBE & CONNECT. Merci de votre compréhension."}
      </p>
      <Link className={styles.notactive} to={"/pageConnecte/administration"}>
        Administration
      </Link>
    </div>
  );
}
