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
import { ConventionVersion } from "../../../types/convention/convention";
import { convertDateFormat } from "../../../utils/functions";

export default function ConventionHistoriqueVisu({
  convId,
  versions,
}: {
  convId?:string,
  versions: ConventionVersion[];
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
        <Typography variant="h6">Versions</Typography>
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
              }}
            >
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">
                        <Typography fontWeight="600">Date de mise à jour</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="600">Version</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="600">Dénomination</Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {versions.map((version, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          cursor:"pointer",
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                            transition: "background-color 0.3s, transform 0.3s",
                          },
                        }}
                        onClick={() => {
                          const targetUrl = `/pageConnecte/convention/recherche/visualisation/${convId}/${version.version}`;
                          window.open(targetUrl, "_blank");
                        }}

                      >
                        <TableCell align="center">
                          <Typography>{convertDateFormat(new Date(version.update_date).toISOString().split("T")[0])}</Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography>{version.version}</Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography>{version.statut}</Typography>
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
