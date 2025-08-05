import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
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
import { convertDateFormat } from "../../../utils/functions";
import { ConventionUG } from "../../../types/convention/convention";
import OverlayAddAvenantLocal from "./AddAvenantLocal/AddAvenantLocal";

export default function ConventionUgsVisu({
  ugs,
  convId,
  version,
  latestVersion,
  batimentId,
  statut
}: {
  ugs: ConventionUG[];
  latestVersion?: boolean;
  convId?: string;
  version?: string;
  batimentId: number;
  statut: string
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddAvenantLocalOpen, setIsAddAvenantLocalOpen] = useState(false);

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
        <Typography variant="h6">Locaux</Typography>
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
            <Dialog
              open={isAddAvenantLocalOpen}
              aria-labelledby="dialog-create-videos"
              maxWidth="xl"
              fullWidth
            >
              <DialogContent>
                <OverlayAddAvenantLocal
                  setIsOpen={setIsAddAvenantLocalOpen}
                  ugs={ugs}
                  convId={convId}
                  version={version}
                  batimentId={batimentId}
                />
              </DialogContent>
            </Dialog>
            {latestVersion && statut !== "RÉSILIATION" && (
              <Box sx={{ marginY: 3 }}>
                <Button
                  onClick={() => setIsAddAvenantLocalOpen(true)}
                  color="primary"
                  variant="contained"
                >
                  Ajouter un avenant local
                </Button>
                <Typography color="warning" sx={{ marginY: 3 }}>
                  NOTE: Si vous mettez fin à un local, veuillez supprimer les
                  équipements associés afin qu'ils soient disponibles pour une
                  autre convention.
                </Typography>
              </Box>
            )}
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
                      <TableCell>
                        <Typography align="center" fontWeight="600">
                          Intitulé
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="600">Date de début</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="600">Date de fin</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="600">Surface loué</Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ugs.map((ug, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                            transition: "background-color 0.3s, transform 0.3s",
                          },
                        }}
                      >
                        <TableCell align="center">
                          <Typography>{ug.name}</Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography>{ug.date_debut}</Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography>
                            {convertDateFormat(ug.date_fin || "")}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography>{ug.surface_rent}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
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
