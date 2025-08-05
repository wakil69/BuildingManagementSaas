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
import { ConventionRubrique } from "../../../types/convention/convention";

export default function ConventionRubriquesVisu({
  rubriques,
}: {
  rubriques: ConventionRubrique[];
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
        <Typography variant="h6">Rubriques</Typography>
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
                      <TableCell align="center">
                        <Typography fontWeight="600">
                          Local
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="600">Équipement</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="600">Type</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="600">Montant</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="600">Périodicité</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="600">Condition de paiement</Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rubriques.map((rubrique, index) => (
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
                          <Typography>{rubrique.ug_name}</Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography>{rubrique.equipement_name}</Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography>{rubrique.rubrique}</Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography>{rubrique.montant}</Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography>{rubrique.periodicity}</Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography>{rubrique.condition_payment}</Typography>
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
