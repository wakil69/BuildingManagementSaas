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
import { useEqType } from "../../../../hooks/ugs/useEqType";
import OverlayRemoveNature from "../overlayRemoveNatureEq/overlayRemoveNatureEq";
import AddNatureEq from "../AddNatureEq/AddNatureEq";

export default function NatureEqVisu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDeleteFormule, setIsOpenDeleteFormule] = useState<number | null>(
    null
  );

  const { natureEquipements } = useEqType()

  return (
    <Box sx={{ width: "100%" }} id="nature-equipement">
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
        <Typography variant="h6">Nature des équipements</Typography>
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
              <AddNatureEq />
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
                          Nom
                        </Typography>
                      </TableCell>
                      <TableCell align="center"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {natureEquipements.map((natureEquipement, index) => (
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
                          open={isOpenDeleteFormule === natureEquipement.nature_equipement_id}
                          aria-labelledby="dialog-create-videos"
                          maxWidth="xl"
                          fullWidth
                        >
                          <DialogContent>
                            <OverlayRemoveNature
                              setIsOpen={setIsOpenDeleteFormule}
                              name={natureEquipement.name}
                              id={natureEquipement.nature_equipement_id}
                            />
                          </DialogContent>
                        </Dialog>

                        <TableCell align="center">
                          <Typography>
                            {natureEquipement.name}
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
                              setIsOpenDeleteFormule(natureEquipement.nature_equipement_id)
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
