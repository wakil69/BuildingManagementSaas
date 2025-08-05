import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import wordLogo from "../../assets/word.png";
import excelLogo from "../../assets/excel.png";
import pdfLogo from "../../assets/pdf.png";
import docLambda from "../../assets/documentLambda.png";
import customRequest from "../../routes/api/api";
import {
  Box,
  CircularProgress,
  Fade,
  IconButton,
  Typography,
} from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import UgInfosVisu from "../../components/VisuUG/ugVisu/ugVisu";
import { UgInfosResponse } from "../../types/ugs/ugs";
import PrixUgVisu from "../../components/VisuUG/tarification/tarificationLocal";
import UgEquipementsVisu from "../../components/VisuUG/ugEqVisu/ugEqVisu";
import { FileGlobal } from "../../types/types";
import { useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FichiersVisuUG from "../../components/VisuUG/fichiersVisuUG/fichiersVisuUG";
import UgLocatairesVisu from "../../components/VisuUG/ugLocatairesVisu/ugLocatairesVisu";

export default function VisualisationUGPage() {
  const { ugId } = useParams();
  const location = useLocation();
  const [showMessage, setShowMessage] = useState(false);
  const navigate = useNavigate();
  const path =
    import.meta.env.VITE_APP_API_URL == "production"
      ? "https://carcoapp.mbe-consult.fr" + location.pathname
      : "http://localhost:3000" + location.pathname;

  async function getFiles(): Promise<FileGlobal[]> {
    const link = `${import.meta.env.VITE_APP_API_URL}/ug/files/${ugId}`;

    const response = await customRequest.get(link);

    if (response.status !== 200) {
      throw new Error(`Error: ${response.status} ${response.data.message}`);
    }

    const data = response.data;

    const listFiles = [];

    const formatsWord = [
      ".doc",
      ".docx",
      ".dotx",
      ".dotm",
      ".docm",
      ".rtf",
      ".txt",
      ".xml",
    ];
    const excelFormats = [
      ".xls",
      ".xlsx",
      ".xlsm",
      ".xlsb",
      ".xlt",
      ".xltx",
      ".xltm",
      ".csv",
      ".xml",
    ];

    const pdfFormat = [".pdf"];

    for (let obj of data) {
      const link = obj["url"];
      const filename = obj["filename"];
      if (formatsWord.some((format) => filename.includes(format))) {
        listFiles.push({ logo: wordLogo, url: link, filename });
      } else if (excelFormats.some((format) => filename.includes(format))) {
        listFiles.push({ logo: excelLogo, url: link, filename });
      } else if (pdfFormat.some((format) => filename.includes(format))) {
        listFiles.push({ logo: pdfLogo, url: link, filename });
      } else {
        listFiles.push({ logo: docLambda, url: link, filename });
      }
    }

    return listFiles;
  }

  const { data: files = [], isLoading: isLoadingFiles } = useQuery({
    queryKey: ["ug", "files", ugId],
    queryFn: getFiles,
    refetchOnWindowFocus: false,
  });

  async function getUGInfos(): Promise<UgInfosResponse> {
    try {
      const link = `${import.meta.env.VITE_APP_API_URL}/ug/ug-infos/${ugId}`;
      const response = await customRequest.get(link);

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.data.message}`);
      }

      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  const { data: ugInfos, isLoading: isLoadingUgInfos } = useQuery({
    queryKey: ["ug", ugId],
    queryFn: getUGInfos,
    refetchOnWindowFocus: false,
  });

  const handleCopy = () => {
    navigator.clipboard
      .writeText(path)
      .then(() => {
        console.log("Text copied to clipboard successfully!");
        setShowMessage(true);
        setTimeout(() => {
          setShowMessage(false);
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text to clipboard", err);
      });
  };

  return (
    <Box
      sx={{
        padding: 3,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 3, padding: 2 }}>
        <Box
          aria-label="back"
          onClick={() => navigate(-1)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            border: "2px solid #ccc",
            borderRadius: "8px",
            paddingY: 1,
            paddingX: 2,
            backgroundColor: "#f5f5f5",
            cursor: "pointer",
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: "#e0e0e0",
              borderColor: "#999",
              transform: "scale(1.05)",
            },
          }}
        >
          <Typography variant="button">Retour</Typography>
          <ArrowBackIcon fontSize="large" />
        </Box>
        <IconButton aria-label="share" onClick={handleCopy}>
          <ShareIcon fontSize="large" />
        </IconButton>
        <Fade in={showMessage}>
          <Typography variant="body2" color="success.main">
            Copié dans le presse-papiers!
          </Typography>
        </Fade>
      </Box>

      {isLoadingUgInfos ? (
        <Box sx={{ display: "flex", justifyContent: "center", padding: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        ugInfos && <UgInfosVisu ugInfos={ugInfos.ugInfos} ugId={ugId} />
      )}

      {isLoadingUgInfos ? (
        <Box sx={{ display: "flex", justifyContent: "center", padding: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        ugInfos && <PrixUgVisu prix={ugInfos.prix} />
      )}

      {isLoadingUgInfos ? (
        <Box sx={{ display: "flex", justifyContent: "center", padding: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        ugInfos && (
          <UgEquipementsVisu equipements={ugInfos.equipements} ugId={ugId} />
        )
      )}

      {isLoadingFiles ? (
        <Box sx={{ display: "flex", justifyContent: "center", padding: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <FichiersVisuUG files={files} ugId={ugId} />
      )}

      {isLoadingUgInfos ? (
        <Box sx={{ display: "flex", justifyContent: "center", padding: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        ugInfos && (
          <UgLocatairesVisu locataires={ugInfos.locataires} />
        )
      )}

      {/* <Button
        onClick={() => navigate("../creerConvention/pepiniere")}
        variant="contained"
        startIcon={<AddIcon />}
        sx={{ marginTop: 2, marginBottom: 2 }}
      >
        Ajouter un locataire
      </Button> */}
    </Box>
  );
}
