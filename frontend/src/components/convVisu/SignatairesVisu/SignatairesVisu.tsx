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
import { convertDateFormat } from "../../../utils/functions";
import { Signataire } from "../../../types/convention/convention";

export default function ConventionSignatairesVisu({
  signataires,
}: {
  signataires: Signataire[];
}) {
  const [isOpen, setIsOpen] = useState(false);

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
        <Typography variant="h6">Signataires</Typography>
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
                      <TableCell>
                        <Typography align="center" fontWeight="600">
                          Signataire
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="600">Fonction</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="600">
                          Date de début de relation
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="600">
                          Date de fin de relation
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {signataires.map((signataire, index) => (
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
                          <Typography>{signataire.libelle}</Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography>{signataire.fonction}</Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography>
                            {convertDateFormat(
                              signataire.relation_date_debut || ""
                            )}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography>
                            {convertDateFormat(
                              signataire.relation_date_fin || ""
                            )}
                          </Typography>
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
