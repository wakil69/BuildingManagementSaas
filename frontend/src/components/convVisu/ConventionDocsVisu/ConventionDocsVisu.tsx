import { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AnimatePresence, motion } from "framer-motion";
import { ConventionVersion } from "../../../types/convention/convention";
import customRequest from "../../../routes/api/api";

export default function ConventionDocsVisu({
  convId,
  versions,
  currentVersion,
  typeConvention,
}: {
  convId?: string;
  versions: ConventionVersion[];
  currentVersion?: string;
  typeConvention: "PEPINIERE" | "COWORKING";
}) {
  const [isOpen, setIsOpen] = useState(false);

  async function getRules(): Promise<string> {
    try {
      const link = `/docs/download-rules/${convId}/${currentVersion}`;
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

  async function getCharte() {
    const downloadUrl = `${
      import.meta.env.VITE_APP_API_URL
    }/docs/download-charte/${convId}/${currentVersion}`;

    window.open(downloadUrl, "_blank");
  }

  const handleDownloadPepiniere = (statut: string, version: number) => {
    let downloadUrl;
    const nameFile = statut.replace(/ /g, "_");
    if (statut.startsWith("AVENANT LOCAL")) {
      downloadUrl = `${
        import.meta.env.VITE_APP_API_URL
      }/docs/avenant-local/${convId}/${version}/${nameFile}`;
    } else if (statut.startsWith("AVENANT STATUT JURIDIQUE")) {
      downloadUrl = `${
        import.meta.env.VITE_APP_API_URL
      }/docs/avenant-statut-juridique/${convId}/${version}/${nameFile}`;
    } else if (statut.startsWith("AVENANT ENTITE")) {
      downloadUrl = `${
        import.meta.env.VITE_APP_API_URL
      }/docs/avenant-entite/${convId}/${version}/${nameFile}`;
    } else if (statut.startsWith("INITIAL")) {
      downloadUrl = `${
        import.meta.env.VITE_APP_API_URL
      }/docs/convention-initial/${convId}/${version}/${nameFile}`;
    } else {
      downloadUrl = `${
        import.meta.env.VITE_APP_API_URL
      }/docs/convention-initial/${convId}/${version}/${nameFile}`;
    }

    window.open(downloadUrl, "_blank");
  };

  const handleDownloadCoworking = (statut: string, version: number) => {
    let downloadUrl
    const nameFile = statut.replace(/ /g, "_");
    if (statut.startsWith("INITIAL")) {
      downloadUrl = `${
        import.meta.env.VITE_APP_API_URL
      }/docs/convention-coworking/${convId}/${version}/${nameFile}`;  
    } else {
      downloadUrl = `${
        import.meta.env.VITE_APP_API_URL
      }/docs/avenant-coworking/${convId}/${version}/${nameFile}`;  
    }

    window.open(downloadUrl, "_blank");
  };

  
  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          transition: "background-color 0.3s, transform 0.3s",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.05)",
            transform: "scale(1.02)",
          },
          padding: 2,
          cursor: "pointer",
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Typography variant="h6">Documents pré-remplis</Typography>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ExpandMoreIcon />
        </motion.div>
      </Box>
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{ overflow: "hidden", padding: 3 }}
          >
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 6,
                marginY: 3,
              }}
            >
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">
                        <Typography fontWeight="600">Version</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="600">Fichier</Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {versions.map((version, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          cursor: "pointer",
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                            transition: "background-color 0.3s, transform 0.3s",
                          },
                        }}
                        onClick={() => {
                          if (typeConvention === "PEPINIERE") {
                            handleDownloadPepiniere(
                              version.statut,
                              version.version
                            );
                          } else if (typeConvention === "COWORKING") {
                            handleDownloadCoworking(
                              version.statut,
                              version.version
                            )
                          }
                        }}
                      >
                        <TableCell align="center">
                          <Typography>{version.version}</Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography>
                            {version.statut.replace(/ /g, "_")}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow
                      key={"REGLEMENT"}
                      sx={{
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: "rgba(0, 0, 0, 0.04)",
                          transition: "background-color 0.3s, transform 0.3s",
                        },
                      }}
                      onClick={async () => {
                        const downloadUrl = await getRules();

                        window.open(downloadUrl, "_blank");
                      }}
                    >
                      <TableCell align="center">
                        <Typography>Réglement</Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Typography>Réglement intérieur.docx</Typography>
                      </TableCell>
                    </TableRow>
                    {typeConvention === "PEPINIERE" && <TableRow
                      key={"CHARTE"}
                      sx={{
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: "rgba(0, 0, 0, 0.04)",
                          transition: "background-color 0.3s, transform 0.3s",
                        },
                      }}
                      onClick={getCharte}
                    >
                      <TableCell align="center">
                        <Typography>Charte d'accompagnement</Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Typography>Charte_Accompagnement_Pepiniere.docx</Typography>
                      </TableCell>
                    </TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
