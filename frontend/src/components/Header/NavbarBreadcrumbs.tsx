import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Breadcrumbs, { breadcrumbsClasses } from "@mui/material/Breadcrumbs";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { Box } from "@mui/material";

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  [`& .${breadcrumbsClasses.separator}`]: {
    color: theme.palette.action.disabled,
    margin: 1,
  },
  [`& .${breadcrumbsClasses.ol}`]: {
    alignItems: "center",
  },
}));

const pathNameMap: Record<string, string> = {
  reglages: "Réglages",
  historique: "Historique",
  recherche: "Recherche",
  visualisation: "Visualisation",
  creer: "Créer",
  importExcel: "Import avec Excel",
  bilans: "Bilans"
};

const topLevelMap: Record<string, string> = {
  accueil: "Accueil",
  statistiques: "Statistiques",
  conventions: "Conventions",
  patrimoine: "Patrimoine",
  tiers: "Tiers",
  bénéficiaires: "Bénéficiaires",
  notifications: "Notifications",
  administration: "Administration",
};

export default function NavbarBreadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname
    .split("/")
    .filter((x: string, index: number) => x && index > 1 && !/^\d+$/.test(x));

  const topLevelBreadcrumb = topLevelMap[pathnames[0]] || "Accueil";

  return (
    <StyledBreadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextRoundedIcon fontSize="small" />}
    >
      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
        {topLevelBreadcrumb}
      </Typography>
      {pathnames.length > 1 &&
        pathnames.map((value, index) => {
          if (index === 0) {
            return null;
          }
          let to = `/pageConnecte/${pathnames
            .slice(0, index + 1)
            .filter((pathname) => pathname !== "visualisation")
            .join("/")}`;

          if (to === "/pageConnecte/tiers/recherche") {
            to += "?Formule=1&PM=true&PP=true";
          }

          if (to === "/pageConnecte/patrimoine/recherche") {
            to += "?loue=false&disponible=false";
          }

          const isLast = index === pathnames.length - 1;

          return isLast ? (
            <Typography
              key={to}
              variant="body1"
              sx={{ color: "text.primary", fontWeight: "bold" }}
            >
              {pathNameMap[value] || value}
            </Typography>
          ) : (
            <Box
              component={Link}
              key={to}
              to={to}
              sx={{ textDecoration: "none", color: "inherit" }}
            >
              <Typography variant="body1">
                {pathNameMap[value] || value}
              </Typography>
            </Box>
          );
        })}
    </StyledBreadcrumbs>
  );
}
