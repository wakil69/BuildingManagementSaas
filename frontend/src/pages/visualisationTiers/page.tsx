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
import { FileGlobal } from "../../types/types";
import { useState } from "react";
import { PMResponse, PPResponse, Suivi } from "../../types/tiers/tiers";
import InfosPPVisu from "../../components/tiersVisu/InfosPPVisu/InfosPPVisu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InfosPMVisu from "../../components/tiersVisu/InfosPMVisu/InfosPMVisu";
import FormuleVisu from "../../components/tiersVisu/FormuleVisu/Formule/Formule";
import FichiersVisuTiers from "../../components/tiersVisu/FichierVisu/fichiersVisuTiers/fichiersVisuTiers";
import RelationVisu from "../../components/tiersVisu/RelationVisu/Relation/Relation";
import InfosAccSouhait from "../../components/tiersVisu/InfosAccSouhait/InfosAccSouhait";
import ProjetsVisu from "../../components/tiersVisu/ProjetsVisu/Projets/Projets";
import FirstMeetingInfos from "../../components/tiersVisu/FirstMeetingInfos/FirstMeetingInfos";
import SortiePepiniereInfo from "../../components/tiersVisu/SortiePepVisu/SortiePepVisu";
import StatutPostPepiniere from "../../components/tiersVisu/StatutPostPepVisu/StatutPostPep";
import EffectifVisu from "../../components/tiersVisu/EffectifVisu/Effectif/Effectif";
import CAVisu from "../../components/tiersVisu/CaVisu/Ca/Ca";
import SuivisVisu from "../../components/tiersVisu/SujetsAccVisu/Suivi/Suivi";

export default function VisualisationTiersPage() {
  const { qualite, id } = useParams<{ qualite: "PM" | "PP"; id: string }>();
  console.log(qualite, id)
  const location = useLocation();
  const [showMessage, setShowMessage] = useState(false);
  const navigate = useNavigate();
  const path =
    import.meta.env.VITE_APP_API_URL == "production"
      ? "https://carcoapp.mbe-consult.fr" + location.pathname
      : "http://localhost:3000" + location.pathname;

  async function getFiles(): Promise<FileGlobal[]> {
    const link = `${
      import.meta.env.VITE_APP_API_URL
    }/tiers/files/${qualite}/${id}`;

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
    queryKey: ["tiers", "files", qualite, id],
    queryFn: getFiles,
    refetchOnWindowFocus: false,
  });

  async function getTiersInfos<T extends "PM" | "PP">(
    qualite: T,
    id: string
  ): Promise<T extends "PP" ? PPResponse : PMResponse> {
    try {
      const link = `${
        import.meta.env.VITE_APP_API_URL
      }/tiers/infos/${qualite}/${id}`;
      const response = await customRequest.get(link);

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.data.message}`);
      }

      let data = response.data;

      if (qualite === "PP") {
        data.accompagnementSouhait.formule_wishes = JSON.parse(
          data.accompagnementSouhait.formule_wishes
        );
        data.accompagnementSouhait.surface_wishes = JSON.parse(
          data.accompagnementSouhait.surface_wishes
        );
      }

      return data as T extends "PP" ? PPResponse : PMResponse;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  const { data: tiersInfos, isLoading: isLoadingTiersInfos } = useQuery({
    queryKey: ["tiers", qualite, id],
    queryFn: () => {
      if (qualite && id) {
        return getTiersInfos(qualite, id);
      }
      throw new Error("La qualite est indéfini.");
    },
    refetchOnWindowFocus: false,
  });

  async function getSuiviInfos(): Promise<Suivi[]> {
    try {
      const link = `${import.meta.env.VITE_APP_API_URL}/tiers/suivi/PP/${id}`;
      const response = await customRequest.get(link);

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.data.message}`);
      }

      const suivis = response.data.map((item: Suivi) => {
        const files = item.files

        if (files?.length) {
          return item
        }

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

        for (let obj of files) {
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

        return { ...item, files: listFiles };
      });

      return suivis;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  const { data: tiersSuivi, isLoading: isLoadingSuivi } = useQuery({
    queryKey: ["tiers", "suivi", id],
    queryFn: getSuiviInfos,
    refetchOnWindowFocus: false,
    enabled: qualite === "PP"
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

      {qualite === "PP" && (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {isLoadingTiersInfos ? (
            <Box sx={{ display: "flex", justifyContent: "center", padding: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            tiersInfos &&
            "infosPP" in tiersInfos && (
              <InfosPPVisu tiersInfos={tiersInfos.infosPP} id={id} />
            )
          )}

          {isLoadingTiersInfos ? (
            <Box sx={{ display: "flex", justifyContent: "center", padding: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            tiersInfos &&
            "formulesPP" in tiersInfos && (
              <FormuleVisu
                qualite="PP"
                formules={tiersInfos.formulesPP}
                id={id}
              />
            )
          )}

          {isLoadingTiersInfos ? (
            <Box sx={{ display: "flex", justifyContent: "center", padding: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            tiersInfos &&
            "companies" in tiersInfos && (
              <RelationVisu
                qualite="PP"
                relations={tiersInfos.companies}
                id={id}
              />
            )
          )}

          {isLoadingTiersInfos ? (
            <Box sx={{ display: "flex", justifyContent: "center", padding: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            tiersInfos &&
            "projets" in tiersInfos && (
              <ProjetsVisu qualite="PP" projets={tiersInfos.projets} id={id} />
            )
          )}

          {isLoadingTiersInfos ? (
            <Box sx={{ display: "flex", justifyContent: "center", padding: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            tiersInfos &&
            "accompagnementSouhait" in tiersInfos && (
              <InfosAccSouhait
                accompagnementSouhait={tiersInfos.accompagnementSouhait}
                id={id}
              />
            )
          )}

          {isLoadingTiersInfos ? (
            <Box sx={{ display: "flex", justifyContent: "center", padding: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            tiersInfos &&
            "firstMeeting" in tiersInfos && (
              <FirstMeetingInfos
                firstMeeting={tiersInfos.firstMeeting}
                id={id}
              />
            )
          )}

          {isLoadingFiles ? (
            <Box sx={{ display: "flex", justifyContent: "center", padding: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <FichiersVisuTiers qualite="PP" files={files} id={id} />
          )}

          {isLoadingSuivi ? (
            <Box sx={{ display: "flex", justifyContent: "center", padding: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            tiersSuivi && <SuivisVisu suivis={tiersSuivi} id={id} />
          )}
        </Box>
      )}

      {qualite === "PM" && (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {isLoadingTiersInfos ? (
            <Box sx={{ display: "flex", justifyContent: "center", padding: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            tiersInfos &&
            "infosPM" in tiersInfos && (
              <InfosPMVisu tiersInfos={tiersInfos.infosPM} id={id} />
            )
          )}

          {isLoadingTiersInfos ? (
            <Box sx={{ display: "flex", justifyContent: "center", padding: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            tiersInfos &&
            "dirigeants" in tiersInfos && (
              <RelationVisu
                qualite="PM"
                relations={tiersInfos.dirigeants}
                id={id}
              />
            )
          )}

          {isLoadingTiersInfos ? (
            <Box sx={{ display: "flex", justifyContent: "center", padding: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            tiersInfos &&
            "formulesPM" in tiersInfos && (
              <FormuleVisu
                qualite="PM"
                formules={tiersInfos.formulesPM}
                id={id}
              />
            )
          )}

          {isLoadingTiersInfos ? (
            <Box sx={{ display: "flex", justifyContent: "center", padding: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            tiersInfos &&
            "effectifs" in tiersInfos && (
              <EffectifVisu effectifs={tiersInfos.effectifs} id={id} />
            )
          )}

          {isLoadingTiersInfos ? (
            <Box sx={{ display: "flex", justifyContent: "center", padding: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            tiersInfos &&
            "cas" in tiersInfos && <CAVisu cas={tiersInfos.cas} id={id} />
          )}

          {isLoadingTiersInfos ? (
            <Box sx={{ display: "flex", justifyContent: "center", padding: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            tiersInfos &&
            "sortiePep" in tiersInfos && (
              <SortiePepiniereInfo sortiePep={tiersInfos.sortiePep} id={id} />
            )
          )}

          {isLoadingTiersInfos ? (
            <Box sx={{ display: "flex", justifyContent: "center", padding: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            tiersInfos &&
            "postPep" in tiersInfos && (
              <StatutPostPepiniere statutPostPep={tiersInfos.postPep} id={id} />
            )
          )}

          {isLoadingFiles ? (
            <Box sx={{ display: "flex", justifyContent: "center", padding: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <FichiersVisuTiers qualite="PM" files={files} id={id} />
          )}
        </Box>
      )}
    </Box>
  );
}
