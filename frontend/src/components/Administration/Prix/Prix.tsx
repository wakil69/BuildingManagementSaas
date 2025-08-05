import {
  Box,
  Button,
  Dialog,
  DialogContent,
  LinearProgress,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Batiment, PrixResponse } from "../../../types/Admin/Administration";
import customRequest from "../../../routes/api/api";
import AddPrixPepiniere from "./AddPrixPepiniere/AddPrixPepiniere";
import AddPrixCoworking from "./AddPrixCoworking/AddPrixCoworking";
import AddPrixCentre from "./AddPrixCentre/AddPrixCentre";
import PrixPepiniere from "./prixPepiniere/prixPepiniere";
import PrixCentre from "./prixCentreAffaires/prixCentre";
import PrixCoworking from "./prixCoworking/prixCoworking";
import { AnimatePresence, motion } from "framer-motion";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function PrixVisu() {
  const [isOpen, setIsOpen] = useState(false);
  const [batimentChoice, setBatimentChoice] = useState<number | null>(null);
  const [isOpenAddPepiniere, setIsOpenAddPepiniere] = useState(false);
  const [isOpenAddCentre, setIsOpenAddCentre] = useState(false);
  const [isOpenAddCoworking, setIsOpenAddCoworking] = useState(false);

  async function getBatiments(): Promise<Batiment[]> {
    try {
      const response = await customRequest.get("/admin/batiments");

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      setBatimentChoice(response.data[0].batiment_id);
      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  const { data: batiments, isLoading: isLoadingBatiments } = useQuery<
    Batiment[]
  >({
    queryKey: ["Batiments"],
    queryFn: getBatiments,
    refetchOnWindowFocus: false,
  });

  async function getSurfaces(): Promise<number[]> {
    try {
      const response = await customRequest.get("/admin/surfaces", {
        params: { batiment_id: batimentChoice },
      });

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  const { data: surfaces } = useQuery<number[]>({
    queryKey: ["Surfaces", batimentChoice],
    queryFn: getSurfaces,
    refetchOnWindowFocus: false,
    enabled: !!batimentChoice,
  });

  async function getPrix(): Promise<PrixResponse> {
    try {
      const response = await customRequest.get("/admin/prix-current-ugs", {
        params: { batiment_id: batimentChoice },
      });

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  const {
    data: prix,
    isLoading: isLoadingPrix,
    isError,
    isFetched,
  } = useQuery<PrixResponse>({
    queryKey: ["PrixUGs", "Admin", batimentChoice],
    queryFn: getPrix,
    refetchOnWindowFocus: false,
    enabled: !!batimentChoice,
  });

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
        <Typography variant="h6">Prix</Typography>
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
          >
            {batimentChoice && surfaces?.length && (
              <Dialog
                open={isOpenAddPepiniere}
                // onClose={() => setIsOpenAddPepiniere(false)}
                aria-labelledby="dialog-create-videos"
                maxWidth="xl"
                fullWidth
              >
                <DialogContent>
                  <AddPrixPepiniere
                    setIsOpen={setIsOpenAddPepiniere}
                    surfaces={surfaces}
                    batimentID={batimentChoice}
                    potentialDateDebut={prix?.pepiniere.prix_date_fin}
                  />
                </DialogContent>
              </Dialog>
            )}
            {batimentChoice && (
              <Dialog
                open={isOpenAddCoworking}
                // onClose={() => setIsOpenAddPepiniere(false)}
                aria-labelledby="dialog-create-videos"
                maxWidth="xl"
                fullWidth
              >
                <DialogContent>
                  <AddPrixCoworking
                    setIsOpen={setIsOpenAddCoworking}
                    batimentID={batimentChoice}
                    potentialDateDebut={prix?.pepiniere.prix_date_fin}
                  />
                </DialogContent>
              </Dialog>
            )}
            {batimentChoice && surfaces?.length && (
              <Dialog
                open={isOpenAddCentre}
                // onClose={() => setIsOpenAddPepiniere(false)}
                aria-labelledby="dialog-create-videos"
                maxWidth="xl"
                fullWidth
              >
                <DialogContent>
                  <AddPrixCentre
                    setIsOpen={setIsOpenAddCentre}
                    surfaces={surfaces}
                    batimentID={batimentChoice}
                    potentialDateDebut={prix?.pepiniere.prix_date_fin}
                  />
                </DialogContent>
              </Dialog>
            )}
            {isLoadingBatiments ? (
              <LinearProgress color="info" />
            ) : batiments ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 2,
                  marginY: 3
                }}
              >
                <Select
                  labelId="batiment-select-label"
                  value={batimentChoice || ""}
                  onChange={(e) => setBatimentChoice(Number(e.target.value))}
                  label="Select Batiment"
                >
                  {batiments?.map((batiment) => (
                    <MenuItem
                      key={batiment.batiment_id}
                      value={batiment.batiment_id}
                    >
                      {batiment.name}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            ) : null}
            {isLoadingPrix ? (
              <LinearProgress color="info" />
            ) : isFetched && prix ? (
              <Box
                sx={{
                  padding: 2,
                  gap: 6,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    LES PRIX DES LOCAUX (MENSUEL ET HT) - FORMULE PÉPINIÈRE
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => setIsOpenAddPepiniere(true)}
                  >
                    Ajouter un groupe de prix
                  </Button>
                </Box>

                {prix.pepiniere.prix.length ? (
                  <PrixPepiniere
                    prix={prix.pepiniere.prix}
                    dateDebut={prix.pepiniere.prix_date_debut}
                    dateFin={prix.pepiniere.prix_date_fin}
                    prixType="pepiniere"
                    batimentID={batimentChoice}
                  />
                ) : (
                  <Typography color="info">
                    Il n'y a actuellement pas de prix défini pour la formule
                    coworking et pour le batiment choisi.
                  </Typography>
                )}

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    LES PRIX DES LOCAUX (MENSUEL ET HT) - FORMULE CENTRE
                    D’AFFAIRES
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => setIsOpenAddCentre(true)}
                  >
                    Ajouter un groupe de prix
                  </Button>
                </Box>

                {prix.centre_affaires.prix.length ? (
                  <PrixCentre
                    prix={prix.centre_affaires.prix}
                    dateDebut={prix.centre_affaires.prix_date_debut}
                    dateFin={prix.centre_affaires.prix_date_fin}
                    prixType="centre_affaires"
                    batimentID={batimentChoice}
                  />
                ) : (
                  <Typography color="info">
                    Il n'y a actuellement pas de prix défini pour la formule
                    pépinière et pour le batiment choisi.
                  </Typography>
                )}

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    TARIFICATION (MENSUEL ET HT) - FORMULE COWORKING
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => setIsOpenAddCoworking(true)}
                  >
                    Ajouter un groupe de prix
                  </Button>
                </Box>

                {prix.coworking.prix.length ? (
                  <PrixCoworking
                    prix={prix.coworking.prix}
                    dateDebut={prix.coworking.prix_date_debut}
                    dateFin={prix.coworking.prix_date_fin}
                    prixType="coworking"
                    batimentID={batimentChoice}
                  />
                ) : (
                  <Typography color="info">
                    Il n'y a actuellement pas de prix défini pour la formule
                    pépinière et pour le batiment choisi.
                  </Typography>
                )}
              </Box>
            ) : isError ? (
              <Box
                sx={{
                  display: "flex",
                  justifyItems: "center",
                  alignItems: "center",
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  TARIFICATION (MENSUEL ET HT) - FORMULE COWORKING
                </Typography>
              </Box>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
