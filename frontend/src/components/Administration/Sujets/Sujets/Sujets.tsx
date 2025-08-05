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
import { useSujetsAcc } from "../../../../hooks/tiers/useSujetsAcc";
import { useTypesAcc } from "../../../../hooks/tiers/useTypesAcc";
import AddSujet from "../AddSujet/AddSujet";
import OverlayRemoveSujet from "../overlayRemoveSujet/overlayRemoveSujet";

export default function SujetsVisu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDeleteFormule, setIsOpenDeleteFormule] = useState<number | null>(
    null
  );

  const { sujetsAcc } = useSujetsAcc();
  const { typesAcc } = useTypesAcc();

  return (
    <Box sx={{ width: "100%" }} id="sujets-accompagnements">
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
        <Typography variant="h6">Sujets des entretiens</Typography>
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
              <AddSujet />
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
                          Type
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography align="center" fontWeight="600">
                          Nom
                        </Typography>
                      </TableCell>
                      <TableCell align="center"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sujetsAcc.map((sujet, index) => (
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
                          open={
                            isOpenDeleteFormule ===
                            sujet.sujet_accompagnement_id
                          }
                          aria-labelledby="dialog-create-videos"
                          maxWidth="xl"
                          fullWidth
                        >
                          <DialogContent>
                            <OverlayRemoveSujet
                              setIsOpen={setIsOpenDeleteFormule}
                              name={sujet.name}
                              id={sujet.sujet_accompagnement_id}
                            />
                          </DialogContent>
                        </Dialog>

                        <TableCell align="center">
                          <Typography>
                            {
                              typesAcc.find(
                                (typeAcc) =>
                                  typeAcc.typ_accompagnement_id ===
                                  sujet.typ_accompagnement_id
                              )?.name
                            }
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography>{sujet.name}</Typography>
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
                              setIsOpenDeleteFormule(
                                sujet.sujet_accompagnement_id
                              )
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
