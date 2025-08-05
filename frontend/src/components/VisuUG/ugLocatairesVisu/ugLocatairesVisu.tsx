import { useState } from "react";
import { Locataire } from "../../../types/ugs/ugs";
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


export default function UgLocatairesVisu({
  locataires,
}: {
  locataires: Locataire[];
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
        <Typography variant="h6">Locataires</Typography>
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
            style={{ overflow: "hidden" }}
          >
            <Box
              sx={{
                marginY: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "start",
                gap: 3,
              }}
            >
            
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Typography fontWeight="600">Raison sociale</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="600">Date début</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="600">Date fin</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="600">Surface loué</Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {locataires.map((locataire: Locataire) => (
                      <TableRow
                        key={locataire.conv_id}
                        sx={{
                          cursor: "pointer",
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                            transition: "background-color 0.3s, transform 0.3s",
                          },
                        }}
                        onClick={() => {
                          const targetUrl = `/pageConnecte/convention/recherche/visualisation/${locataire.conv_id}/${locataire.version}`;
                          window.open(targetUrl, "_blank");
                        }}
                      >
                        <TableCell>{locataire.raison_sociale}</TableCell>
                        <TableCell>{locataire.date_debut}</TableCell>
                        <TableCell>{locataire.date_fin}</TableCell>
                        <TableCell>{locataire.surface_rent}</TableCell>
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
