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
import EditIcon from "@mui/icons-material/Edit";
import { ChiffreAffaire } from "../../../../types/tiers/tiers";
import AddCA from "../AddCa/AddCa";
import OverlayRemoveCA from "../overlayRemoveCa/overlayRemoveCa";
import OverlayEditCA from "../overlayEditCa/overlayEditCa";

export default function CAVisu({
  cas,
  id,
}: {
  cas: ChiffreAffaire[];
  id?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDeleteCA, setIsOpenDeleteCA] = useState<number | null>(null);
  const [isOpenEditCA, setIsOpenEditCA] = useState<number | null>(null);

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
        <Typography variant="h6">Chiffre d'affaires</Typography>
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
              <AddCA id={id} />
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
                        <Typography fontWeight="600">
                          Chiffre d'affaires
                        </Typography>
                      </TableCell>
                      <TableCell align="center"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cas.map((ca, index) => (
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
                          open={isOpenDeleteCA === ca.year}
                          aria-labelledby="dialog-create-videos"
                          maxWidth="xl"
                          fullWidth
                        >
                          <DialogContent>
                            <OverlayRemoveCA
                              setIsOpen={setIsOpenDeleteCA}
                              ca={ca}
                              id={id}
                            />
                          </DialogContent>
                        </Dialog>
                        <Dialog
                          open={isOpenEditCA === ca.year}
                          aria-labelledby="dialog-create-videos"
                          maxWidth="xl"
                          fullWidth
                        >
                          <DialogContent>
                            <OverlayEditCA
                              setIsOpen={setIsOpenEditCA}
                              ca={ca}
                              id={id}
                            />
                          </DialogContent>
                        </Dialog>
                        <TableCell align="center">
                          <Typography>{ca.year}</Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography>{ca.ca}</Typography>
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
                            onClick={() => setIsOpenEditCA(ca.year)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => setIsOpenDeleteCA(ca.year)}
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
