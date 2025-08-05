import { Box, Typography, Button } from "@mui/material";
import ImportButton from "../../components/ImportButton/ImportButton";
import customRequest from "../../routes/api/api";

export default function CreationTiersImportExcel() {
  const downloadTemplate = async () => {
    const link = `${import.meta.env.VITE_APP_API_URL}/tiers/download-template`;
    const response = await customRequest.get(link);
    if (response.status !== 200) {
      throw new Error(`Error: ${response.status} ${response.data.message}`);
    }

    window.open(response.data.downloadLink, "_blank");
  };

  // const downloadAPE = async () => {
  //   const link = `${import.meta.env.VITE_APP_API_URL}/tiers/download-ape`;
  //   const response = await customRequest.get(link);
  //   if (response.status !== 200) {
  //     throw new Error(`Error: ${response.status} ${response.data.message}`);
  //   }

  //   window.open(response.data.downloadLink, "_blank");
  // };

  const downloadSocioPro = async () => {
    const link = `${import.meta.env.VITE_APP_API_URL}/tiers/download-socio-pro`;
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
          ajouter de nouveaux tiers.
        </Typography>

        <Typography variant="body1" sx={{ marginBottom: 3 }}>
          Les <b>champs obligatoires</b> pour INFOS PERSONNES PHYSIQUES sont :
        </Typography>
        <Box component="ul" sx={{ marginBottom: 3, paddingLeft: 4 }}>
          <Typography component="li" variant="body2">
            <b>BATIMENT</b>
          </Typography>
          <Typography component="li" variant="body2">
            <b>NOM (MAJUSCULE)</b>
          </Typography>
          <Typography component="li" variant="body2">
            <b>PRENOM (MAJUSCULE)</b>
          </Typography>
          <Typography component="li" variant="body2">
            <b>EMAIL</b>
          </Typography>
          <Typography component="li" variant="body2">
            <b>FORMULE</b>
          </Typography>
          <Typography component="li" variant="body2">
            <b>DATE DEBUT FORMULE</b>
          </Typography>
        </Box>

        <Typography variant="body1" sx={{ marginBottom: 3 }}>
          Les <b>champs obligatoires</b> pour PROJETS PERSONNES PHYSIQUES sont :
        </Typography>
        <Box component="ul" sx={{ marginBottom: 3, paddingLeft: 4 }}>
          <Typography component="li" variant="body2">
            <b>IDENTIFIANT TIERS</b>
          </Typography>
          <Typography component="li" variant="body2">
            <b>ACTIVITE (MAJUSCULE)</b>
          </Typography>
        </Box>

        <Typography variant="body1">
          Les <b>champs obligatoires</b> pour INFOS PERSONNES MORALES sont :
        </Typography>
        <Box component="ul" sx={{ marginBottom: 3, paddingLeft: 4 }}>
          <Typography component="li" variant="body2">
            <b>BATIMENT</b>
          </Typography>
          <Typography component="li" variant="body2">
            <b>RAISON SOCIALE (MAJUSCULE)</b>
          </Typography>
          <Typography component="li" variant="body2">
            <b>FORMULE</b>
          </Typography>
          <Typography component="li" variant="body2">
            <b>DATE DEBUT FORMULE</b>
          </Typography>
        </Box>

        <Typography variant="body1">
          Les <b>champs obligatoires</b> pour RELATIONS PP PM sont :
        </Typography>
        <Box component="ul" sx={{ marginBottom: 3, paddingLeft: 4 }}>
          <Typography component="li" variant="body2">
            <b>IDENTIFIANT PP</b>
          </Typography>
          <Typography component="li" variant="body2">
            <b>IDENTIFIANT PM</b>
          </Typography>
        </Box>

        <Typography variant="body1" sx={{ marginBottom: 3 }}>
          <b>Note importante :</b> <br />
          Pour ajouter des relations entre les PERSONNES PHYSIQUES et MORALES, il est nécessaire de les lier grâce à l’
          <b>IDENTIFIANT TIERS</b>, qui doit être un nombre strictement positif.
          Par la suite, dans la feuille RELATIONS PP PM, vous pourrez les lier à l'aide de ces identifiants.
        </Typography>

        <Typography variant="body1" paragraph>
          Avant d’ajouter des éléments, nous vous invitons à vérifier que les{" "}
          <b>paramètres</b> dans la page d’administration ont bien été
          configurés et sont correctement intégrés dans l’application.
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={downloadTemplate}
          sx={{ width: "auto" }}
        >
          Télécharger le template
        </Button>
        {/* <Button
          variant="contained"
          color="primary"
          onClick={downloadAPE}
          sx={{ width: "auto" }}
        >
          Télécharger les codes APE
        </Button> */}
        <Button
          variant="contained"
          color="primary"
          onClick={downloadSocioPro}
          sx={{ width: "auto" }}
        >
          Télécharger les catégories socio-professionnelles
        </Button>
      </Box>

      <ImportButton text="Importer" from="Tiers" />
    </Box>
  );
}
