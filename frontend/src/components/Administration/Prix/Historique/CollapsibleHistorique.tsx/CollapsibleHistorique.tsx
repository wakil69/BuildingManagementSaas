import { useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { convertDateFormat } from "../../../../../utils/functions";
import { HistoriqueSurfacePrix } from "../../../../../types/Admin/Administration";

export default function CollapsibleHistorique({
  historique,
}: {
  historique: HistoriqueSurfacePrix;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <Box
      component={motion.div}
      layout
      onClick={toggleOpen}
      sx={{
        border: "1px solid #ddd",
        borderRadius: 4,
        padding: 2,
        marginBottom: 2,
        cursor: "pointer",
        width: "100%",
        backgroundColor: isOpen ? "#f9f9f9" : "white",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Typography variant="h6">
          {historique.prix_type === "pepiniere"
            ? "Formule Pépinière"
            : historique.prix_type === "centre_affaires"
            ? "Formule Centre d'affaires"
            : "Formule Coworking"}
        </Typography>
        <Typography variant="body2">
          Date de début: {convertDateFormat(historique.prix_date_debut)} - Date de fin:{" "}
          {historique.prix_date_fin ? convertDateFormat(historique.prix_date_fin) : "N/A"}
        </Typography>
      </Box>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden", padding: 3 }}
          >
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Prix ID</TableCell>
                    <TableCell>Surface</TableCell>
                    {historique.prix_type === "centre_affaires" ? (
                      <TableCell>Centre Affaires</TableCell>
                    ) : historique.prix_type === "coworking" ? (
                      <TableCell>Coworking</TableCell>
                    ) : (
                      <>
                        <TableCell>Prix Année 1</TableCell>
                        <TableCell>Prix Année 2</TableCell>
                        <TableCell>Prix Année 3</TableCell>
                      </>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historique.prix.map((price) => (
                    <TableRow key={price.prix_id}>
                      <TableCell>{price.prix_id}</TableCell>
                      <TableCell>{price.surface} m²</TableCell>
                      {historique.prix_type === "centre_affaires" ? (
                        <TableCell>
                          {price.prix_centre_affaires ?? "N/A"}
                        </TableCell>
                      ) : historique.prix_type === "coworking" ? (
                        <TableCell>{price.prix_coworking ?? "N/A"}</TableCell>
                      ) : (
                        <>
                          <TableCell>{price.prix_an_1 ?? "N/A"}</TableCell>
                          <TableCell>{price.prix_an_2 ?? "N/A"}</TableCell>
                          <TableCell>{price.prix_an_3 ?? "N/A"}</TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
