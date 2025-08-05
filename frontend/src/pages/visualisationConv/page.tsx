import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import wordLogo from "../../assets/word.png";
import excelLogo from "../../assets/excel.png";
import pdfLogo from "../../assets/pdf.png";
import docLambda from "../../assets/documentLambda.png";
import customRequest from "../../routes/api/api";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  Fade,
  IconButton,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import { FileGlobal } from "../../types/types";
import { useMemo, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FichiersVisuConv from "../../components/convVisu/FichierVisu/fichiersVisuConv/fichiersVisuConv";
import { ConventionResponse } from "../../types/convention/convention";
import ConventionInfosVisu from "../../components/convVisu/ConventionInfosVisu/ConventionInfosVisu";
import ConventionSignatairesVisu from "../../components/convVisu/SignatairesVisu/SignatairesVisu";
import ConventionUgsVisu from "../../components/convVisu/ConventionUgsVisu/ConventionUgsVisu";
import ConventionEquipementsVisu from "../../components/convVisu/ConventionEquipementsVisu/ConventionEquipementsVisu";
import ConventionHistoriqueVisu from "../../components/convVisu/ConventionHistoriqueVisu/ConventionHistoriqueVisu";
import ConventionRubriquesVisu from "../../components/convVisu/ConventionRubriquesVisu/ConventionRubriquesVisu";
import ConventionDocsVisu from "../../components/convVisu/ConventionDocsVisu/ConventionDocsVisu";
import OverlayResiliation from "../../components/convVisu/OverlayResiliation/OverlayResiliation";

export default function VisualisationConventionPage() {
  const { convId, version } = useParams<{ version: string; convId: string }>();
  const location = useLocation();
  const [showMessage, setShowMessage] = useState(false);
  const [isResiliationOpen, setResiliationOpen] = useState(false);
  const navigate = useNavigate();
  const path =
    import.meta.env.VITE_APP_API_URL == "production"
      ? "https://carcoapp.mbe-consult.fr" + location.pathname
      : "http://localhost:3000" + location.pathname;

  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");

  async function getFiles(): Promise<FileGlobal[]> {
    const link = `/convention/files/${convId}/${version}`;

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
    queryKey: ["convention", "files", convId],
    queryFn: getFiles,
    refetchOnWindowFocus: false,
  });

  async function getConventionInfos(): Promise<ConventionResponse> {
    try {
      const link = `/convention/infos/${convId}/${version}`;
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

  const { data: convention, isLoading: isLoadingConventionInfos } = useQuery({
    queryKey: ["convention", convId, version],
    queryFn: getConventionInfos,
    refetchOnWindowFocus: false,
  });

  async function getChecks(): Promise<{
    checkAnniversaire: boolean;
    checkFiles: { statut: string; verified: boolean }[];
  }> {
    try {
      const link = `/convention/checks/${convId}/${version}`;
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

  const { data: checks, isLoading: isLoadingChecks } = useQuery({
    queryKey: ["checks", "convention", convId],
    queryFn: getChecks,
    refetchOnWindowFocus: false,
  });

  const actualiserConvention = async () => {
    try {
      setMessage("");
      const response = await customRequest.post(
        `/convention/anniversaire/${convId}/${version}`
      );

      if (response.status !== 200) {
        throw new Error("File upload failed.");
      }
      return response.data;
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        throw new Error(err.response.data.message);
      } else {
        throw new Error("An unexpected error occurred. Please try again.");
      }
    }
  };

  const actualiserConventionMutation = useMutation({
    mutationFn: actualiserConvention,
    onSuccess: async (data) => {
      setMessage(data.message);
      await queryClient.invalidateQueries({
        queryKey: ["convention", convId, version],
      });
      await queryClient.invalidateQueries({
        queryKey: ["checks", "convention", convId],
      });
      if (data.newVersion) {
        navigate(
          `/pageConnecte/convention/recherche/visualisation/${convId}/${data.newVersion}`
        );
      }
      setTimeout(() => {
        setMessage("");
      }, 3000);
    },
    onError: (err) => {
      setMessage(err.message);
      console.error(err);
    },
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

  const latestVersion = useMemo(() => {
    return (
      convention && Number(version) === convention.conventionVersions.length
    );
  }, [convention]);

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
        {latestVersion && <Box
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
        </Box>}

        <IconButton aria-label="share" onClick={handleCopy}>
          <ShareIcon fontSize="large" />
        </IconButton>
        <Fade in={showMessage}>
          <Typography variant="body2" color="success.main">
            Copié dans le presse-papiers!
          </Typography>
        </Fade>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {isLoadingChecks ? (
          <Box sx={{ display: "flex", justifyContent: "center", padding: 3 }}>
            <CircularProgress />
          </Box>
        ) : convention && checks?.checkAnniversaire ? (
          <Alert severity="success">La convention est à jour.</Alert>
        ) : convention ? (
          <Alert severity="error">
            La convention n'est pas à jour. Veuillez l'actualiser
            {!latestVersion
              ? " en allant dans la dernière version de la convention"
              : "."}
            .
            {latestVersion && (
              <Box
                sx={{ display: "flex", flexDirection: "column", marginY: 2 }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  disabled={actualiserConventionMutation.isPending}
                  onClick={() => actualiserConventionMutation.mutate()}
                >
                  Actualiser la convention
                </Button>
                <Box
                  sx={{
                    marginY: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  {actualiserConventionMutation.isSuccess && message && (
                    <Typography sx={{ color: "success.main" }}>
                      {message}
                    </Typography>
                  )}
                  {actualiserConventionMutation.isError && message && (
                    <Typography sx={{ color: "error.main" }}>
                      {message}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </Alert>
        ) : null}
        {isLoadingChecks ? (
          <Box sx={{ display: "flex", justifyContent: "center", padding: 3 }}>
            <CircularProgress />
          </Box>
        ) : convention && checks?.checkFiles.length ? (
          <Alert severity="error">
            Vous devez insérer les documents liés aux statuts suivants :
            <List>
              {checks?.checkFiles.map((checkFile, index) => (
                <ListItem key={index}>
                  <Typography component="span">{checkFile.statut}</Typography>
                </ListItem>
              ))}
            </List>
          </Alert>
        ) : convention ? (
          <Alert severity="success">
            Cette convention est à jour en ce qui concerne les documents.
          </Alert>
        ) : null}
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {isLoadingConventionInfos ? (
          <Box sx={{ display: "flex", justifyContent: "center", padding: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          convention &&
          "conventionInfos" in convention && (
            <ConventionInfosVisu
              conventionInfos={convention.conventionInfos}
              version={version}
              nbVersion={convention.conventionVersions.length}
              convId={convId}
              latestVersion={latestVersion}
            />
          )
        )}

        {isLoadingConventionInfos ? (
          <Box sx={{ display: "flex", justifyContent: "center", padding: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          convention &&
          "signataires" in convention && (
            <ConventionSignatairesVisu signataires={convention.signataires} />
          )
        )}

        {isLoadingConventionInfos ? (
          <Box sx={{ display: "flex", justifyContent: "center", padding: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          convention &&
          convention.conventionInfos.typ_conv === "PEPINIERE" &&
          "ugs" in convention && (
            <ConventionUgsVisu
              ugs={convention.ugs}
              latestVersion={latestVersion}
              convId={convId}
              version={version}
              batimentId={convention.conventionInfos.batiment_id}
              statut={convention.conventionInfos.statut}
            />
          )
        )}

        {isLoadingConventionInfos ? (
          <Box sx={{ display: "flex", justifyContent: "center", padding: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          convention &&
          convention.conventionInfos.typ_conv === "PEPINIERE" &&
          "equipements" in convention && (
            <ConventionEquipementsVisu
              convId={convId}
              version={version}
              latestVersion={latestVersion}
              ugs={convention.ugs}
              equipements={convention.equipements}
              statut={convention.conventionInfos.statut}
            />
          )
        )}

        {isLoadingConventionInfos ? (
          <Box sx={{ display: "flex", justifyContent: "center", padding: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          convention &&
          convention.conventionInfos.typ_conv === "PEPINIERE" &&
          "rubriques" in convention && (
            <ConventionRubriquesVisu rubriques={convention.rubriques} />
          )
        )}

        {isLoadingConventionInfos ? (
          <Box sx={{ display: "flex", justifyContent: "center", padding: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          convention &&
          "conventionVersions" in convention && (
            <ConventionDocsVisu
              convId={convId}
              versions={convention.conventionVersions}
              currentVersion={version}
              typeConvention={convention.conventionInfos.typ_conv}
            />
          )
        )}

        {isLoadingConventionInfos ? (
          <Box sx={{ display: "flex", justifyContent: "center", padding: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          convention &&
          "conventionVersions" in convention && (
            <ConventionHistoriqueVisu
              convId={convId}
              versions={convention.conventionVersions}
            />
          )
        )}

        {isLoadingFiles ? (
          <Box sx={{ display: "flex", justifyContent: "center", padding: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          convention && (
            <FichiersVisuConv
              latestVersion={latestVersion}
              version={version}
              files={files}
              id={convId}
            />
          )
        )}

        {convention && convention.conventionInfos.statut !== "RÉSILIATION" && latestVersion && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "start",
              gap: 3,
              marginTop: 3,
            }}
          >
            <Dialog
              open={isResiliationOpen}
              aria-labelledby="dialog-create-videos"
              maxWidth="xl"
              fullWidth
            >
              <DialogContent>
                <OverlayResiliation
                  setIsOpen={setResiliationOpen}
                  convId={convId}
                  version={version}
                />
              </DialogContent>
            </Dialog>

            <Typography color="warning">
              Attention, cette action est irréversible.
            </Typography>
            <Button
              variant="contained"
              color="error"
              onClick={() => setResiliationOpen(true)}
            >
              Résilier la convention
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
