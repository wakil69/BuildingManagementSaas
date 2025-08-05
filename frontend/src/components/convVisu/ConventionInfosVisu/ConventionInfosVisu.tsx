import { useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AnimatePresence, motion } from "framer-motion";
import { useBatiments } from "../../../hooks/tiers/useBatiments";
import { convertDateFormat } from "../../../utils/functions";
import { ConventionInfos } from "../../../types/convention/convention";
import { useLegalForms } from "../../../hooks/tiers/useLegalForms";
import AddAvenantStatutJuridique from "./AvenantStatutJuridique/AvenantStatutJuridique";
import AddAvenantEntite from "./AvenantEntite/AvenantEntite";

export default function ConventionInfosVisu({
  conventionInfos,
  version,
  convId,
  nbVersion,
  latestVersion
}: {
  conventionInfos: ConventionInfos;
  version?: string;
  convId?: string;
  nbVersion: number;
  latestVersion?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { batiments, isLoadingBatiments } = useBatiments();
  const { legalForms, isLoadingLegalForms } = useLegalForms();

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
        <Typography variant="h6">
          Informations sur la convention - {conventionInfos.raison_sociale} - {conventionInfos.typ_conv} - Version{" "}
          {version} / {nbVersion} - {conventionInfos.statut}
        </Typography>
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
            {latestVersion && conventionInfos.statut !== "RÉSILIATION" &&
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                marginTop: 3,
              }}
            >
              <Typography color="warning">
                Attention, ces actions modifient la fiche Synthèse Tiers de la
                PM concernée.
              </Typography>
              <AddAvenantStatutJuridique
                convId={convId}
                version={version}
                legalFormId={conventionInfos.legal_form_id}
              />
              <AddAvenantEntite
                convId={convId}
                version={version}
                raisonSociale={conventionInfos.raison_sociale}
              />
            </Box>}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 6,
                marginY: 3
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Typography sx={{ fontWeight: "bold" }}>Bâtiment</Typography>
                {!isLoadingBatiments && (
                  <Typography>
                    {
                      batiments.find(
                        (batiment) =>
                          batiment.batiment_id === conventionInfos.batiment_id
                      )?.name
                    }
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Typography sx={{ fontWeight: "bold" }}>
                  Raison sociale
                </Typography>
                <Typography>{conventionInfos.raison_sociale}</Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Typography sx={{ fontWeight: "bold" }}>
                  Date de signature
                </Typography>
                <Typography>
                  {convertDateFormat(conventionInfos.date_signature)}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Typography sx={{ fontWeight: "bold" }}>
                  Date de début
                </Typography>
                <Typography>
                  {convertDateFormat(conventionInfos.date_debut)}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Typography sx={{ fontWeight: "bold" }}>Date de fin</Typography>
                <Typography>
                  {convertDateFormat(conventionInfos.date_fin || "")}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Typography sx={{ fontWeight: "bold" }}>
                  Statut Juridique
                </Typography>
                {!isLoadingLegalForms ? (
                  <Typography>
                    {
                      legalForms.find(
                        (legalForm) =>
                          legalForm.legal_form_id ===
                          conventionInfos.legal_form_id
                      )?.name
                    }
                  </Typography>
                ) : (
                  <CircularProgress />
                )}
              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
