import { useState } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
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
import DeleteIcon from "@mui/icons-material/Delete";
import { Effectif } from "../../../../types/tiers/tiers";
import EditIcon from "@mui/icons-material/Edit";
import OverlayRemoveEffectif from "../overlayRemoveEffectif/overlayRemoveEffectif";
import OverlayEditEffectif from "../overlayEditEffectif/overlayEditEffectif";
import AddEffectif from "../AddEffectif/AddEffectif";

export default function EffectifVisu({
  effectifs,
  id,
}: {
  effectifs: Effectif[];
  id?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDeleteEffectif, setIsOpenDeleteEffectif] = useState<
    number | null
  >(null);
  const [isOpenEditEffectif, setIsOpenEditEffectif] = useState<number | null>(
    null
  );

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
        <Typography variant="h6">Effectif</Typography>
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
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                marginTop: 3,
              }}
            >
              <AddEffectif id={id} />
            </Box>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 6,
              }}
            >
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Typography align="center" fontWeight="600">
                          Année
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="600">CDI</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="600">CDD</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="600">Intérimaire(s)</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="600">
                          Contrat(s) aidé(s)
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="600">Alternant(s)</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="600">Stagiaire(s)</Typography>
                      </TableCell>
                      <TableCell align="center"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {effectifs.map((effectif, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                            transition: "background-color 0.3s, transform 0.3s",
                          },
                        }}
                      >
                        <Dialog
                          open={isOpenDeleteEffectif === effectif.year}
                          aria-labelledby="dialog-create-videos"
                          maxWidth="xl"
                          fullWidth
                        >
                          <DialogContent>
                            <OverlayRemoveEffectif
                              setIsOpen={setIsOpenDeleteEffectif}
                              effectif={effectif}
                              id={id}
                            />
                          </DialogContent>
                        </Dialog>
                        <Dialog
                          open={isOpenEditEffectif === effectif.year}
                          aria-labelledby="dialog-create-videos"
                          maxWidth="xl"
                          fullWidth
                        >
                          <DialogContent>
                            <OverlayEditEffectif
                              setIsOpen={setIsOpenEditEffectif}
                              effectif={effectif}
                              id={id}
                            />
                          </DialogContent>
                        </Dialog>
                        <TableCell align="center">
                          <Typography>{effectif.year}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography>{effectif.nb_cdi}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography>{effectif.nb_cdd}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography>{effectif.nb_int}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography>{effectif.nb_caid}</Typography>
                        </TableCell>{" "}
                        <TableCell align="center">
                          <Typography>{effectif.nb_alt}</Typography>
                        </TableCell>{" "}
                        <TableCell align="center">
                          <Typography>{effectif.nb_stg}</Typography>
                        </TableCell>
                        <TableCell
                          sx={{
                            display: "flex",
                            gap: 3,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <IconButton
                            color="error"
                            onClick={() => setIsOpenEditEffectif(effectif.year)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() =>
                              setIsOpenDeleteEffectif(effectif.year)
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
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
