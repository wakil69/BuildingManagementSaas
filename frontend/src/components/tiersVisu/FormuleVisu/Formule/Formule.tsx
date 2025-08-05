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
import { FormulePM, FormulePP } from "../../../../types/tiers/tiers";
import { useFormulesTypes } from "../../../../hooks/tiers/useFormules";
import { convertDateFormat } from "../../../../utils/functions";
import AddFormule from "../AddFormule/AddFormule";
import EditIcon from "@mui/icons-material/Edit";
import OverlayEditFormule from "../overlayEditFormule/overlayEditFormule";
import OverlayRemoveFormule from "../overlayRemoveFormule/overlayRemoveFormule";

export default function FormuleVisu({
  formules,
  qualite,
  id,
}: {
  formules: FormulePP[] | FormulePM[];
  qualite?: "PM" | "PP";
  id?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { formulesTypes } = useFormulesTypes();
  const [isOpenDeleteFormule, setIsOpenDeleteFormule] = useState<number | null>(
    null
  );
  const [isOpenEditFormule, setIsOpenEditFormule] = useState<number | null>(
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
        <Typography variant="h6">Historique des formules</Typography>
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
              <Typography color="warning">
                {qualite === "PP"
                  ? "Si vous modifiez, ajoutez ou supprimez une formule, pensez à effectuer la même action pour les entreprises liées à la personne physique. Vous pouvez consulter les entreprises associées à la personne physique dans la section Entreprises."
                  : "Si vous modifiez, ajoutez ou supprimez une formule, pensez à effectuer la même action pour les dirigeants. Vous pouvez consulter les personnes associées à la personne morale dans la section Dirigeants."}
              </Typography>
              <AddFormule id={id} qualite="PM" />
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
                          Date de début
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="600">Date de fin</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="600">Formule</Typography>
                      </TableCell>
                      <TableCell align="center"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formules.map((formule, index) => (
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
                          open={isOpenDeleteFormule === formule.formule_id}
                          aria-labelledby="dialog-create-videos"
                          maxWidth="xl"
                          fullWidth
                        >
                          <DialogContent>
                            <OverlayRemoveFormule
                              setIsOpen={setIsOpenDeleteFormule}
                              qualite={qualite}
                              formule={formule}
                              id={id}
                            />
                          </DialogContent>
                        </Dialog>
                        <Dialog
                          open={isOpenEditFormule === formule.formule_id}
                          aria-labelledby="dialog-create-videos"
                          maxWidth="xl"
                          fullWidth
                        >
                          <DialogContent>
                            <OverlayEditFormule
                              setIsOpen={setIsOpenEditFormule}
                              qualite={qualite}
                              formule={formule}
                              id={id}
                            />
                          </DialogContent>
                        </Dialog>
                        <TableCell align="center">
                          <Typography>
                            {convertDateFormat(
                              formule.date_debut_formule || ""
                            )}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography>
                            {convertDateFormat(formule.date_fin_formule || "")}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography>
                            {
                              formulesTypes.find(
                                (formuleType) =>
                                  formuleType.formule_id === formule.formule_id
                              )?.name
                            }
                          </Typography>
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
                            onClick={() =>
                              setIsOpenEditFormule(formule.formule_id)
                            }
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() =>
                              setIsOpenDeleteFormule(formule.formule_id)
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
