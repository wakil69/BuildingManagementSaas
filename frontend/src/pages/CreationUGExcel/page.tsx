import { Box, Typography, Button, Link } from "@mui/material";
import ImportButton from "../../components/ImportButton/ImportButton";
import customRequest from "../../routes/api/api";

export default function CreationUGImportExcel() {
  const downloadTemplate = async () => {
    const link = `${import.meta.env.VITE_APP_API_URL}/ug/download-template`;
    const response = await customRequest.get(link);
    if (response.status !== 200) {
      throw new Error(`Error: ${response.status} ${response.data.message}`);
    }

    window.open(response.data.downloadLink, "_blank");
  };

  return (
    <Box sx={{ padding: 3, display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ padding: 2 }}>
        <Typography variant="body1" paragraph>
          Veuillez suivre attentivement le format du <b>template</b> pour
          ajouter de nouvelles unités de gestion (UGs).
        </Typography>

        <Typography variant="body1" paragraph>
          Si vous souhaitez ajouter des <b>bâtiments</b> et les <b>étages</b>{" "}
          associés, merci de nous contacter à l’adresse e-mail suivante : <br />
          <Link href="mailto:info@mbe-connect.com">
          info@mbe-connect.com
          </Link>
          .
        </Typography>

        <Typography variant="body1" sx={{ marginBottom: 3 }}>
          Les <b>champs obligatoires</b> pour les unités de gestion sont :
        </Typography>
        <Box component="ul" sx={{ marginBottom: 3, paddingLeft: 4 }}>
          <Typography component="li" variant="body2">
            <b>NATURE</b>
          </Typography>
          <Typography component="li" variant="body2">
            <b>BATIMENT</b>
          </Typography>
          <Typography component="li" variant="body2">
            <b>ETAGE</b>
          </Typography>
          <Typography component="li" variant="body2">
            <b>ADRESSE INTITULÉE</b>
          </Typography>
          <Typography component="li" variant="body2">
            <b>CODE POSTAL</b>
          </Typography>
          <Typography component="li" variant="body2">
            <b>COMMUNE</b>
          </Typography>
          <Typography component="li" variant="body2">
            <b>PAYS</b>
          </Typography>
        </Box>

        <Typography variant="body1" sx={{ marginBottom: 3 }}>
          <b>Note importante :</b> <br />
          Pour ajouter des <b>équipements</b>, il est nécessaire de lier chaque
          équipement à une unité de gestion (UG) à l’aide de l’
          <b>IDENTIFIANT UG</b>, qui doit être un nombre strictement positif.
          L’essentiel est que l’UG et ses équipements associés partagent le même
          identifiant.
        </Typography>

        <Typography variant="body1">
          Les <b>champs obligatoires</b> pour les équipements sont :
        </Typography>
        <Box component="ul" sx={{ marginBottom: 3, paddingLeft: 4 }}>
          <Typography component="li" variant="body2">
            <b>IDENTIFIANT UG</b>
          </Typography>
          <Typography component="li" variant="body2">
            <b>NOM ÉQUIPEMENT</b>
          </Typography>
          <Typography component="li" variant="body2">
            <b>NATURE ÉQUIPEMENT</b>
          </Typography>
        </Box>

        <Typography variant="body1" paragraph>
          Avant d’ajouter des éléments, nous vous invitons à vérifier que les{" "}
          <b>paramètres</b> dans la page d’administration ont bien été
          configurés et sont correctement intégrés dans l’application.
        </Typography>
      </Box>
      <Box>
        <Button
          variant="contained"
          color="primary"
          onClick={downloadTemplate}
          sx={{ width: "auto" }}
        >
          Télécharger le template
        </Button>
      </Box>

      <ImportButton text="Importer" from="Patrimoine" />
    </Box>
  );
}
