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
import { useUgType } from "../../../../hooks/ugs/useUgType";
import AddNatureUg from "../AddNatureUg/AddNatureUg";
import OverlayRemoveNatureUg from "../overlayRemoveNatureUg/overlayRemoveNatureUg";

export default function NatureUgVisu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDeleteFormule, setIsOpenDeleteFormule] = useState<number | null>(
    null
  );

  const { natureUgs } = useUgType()

  return (
    <Box sx={{ width: "100%" }} id="nature-ug">
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
        <Typography variant="h6">Nature des locaux</Typography>
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
              <AddNatureUg />
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
                    {natureUgs.map((natureUg, index) => (
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
                          open={isOpenDeleteFormule === natureUg.nature_ug_id}
                          aria-labelledby="dialog-create-videos"
                          maxWidth="xl"
                          fullWidth
                        >
                          <DialogContent>
                            <OverlayRemoveNatureUg
                              setIsOpen={setIsOpenDeleteFormule}
                              name={natureUg.name}
                              id={natureUg.nature_ug_id}
                            />
                          </DialogContent>
                        </Dialog>

                        <TableCell align="center">
                          <Typography>
                            {natureUg.name}
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
                              setIsOpenDeleteFormule(natureUg.nature_ug_id)
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
