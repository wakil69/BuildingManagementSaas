import { useState } from "react";
import {
  Box,
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
import {
  ConventionEquipement,
  ConventionUG,
} from "../../../types/convention/convention";
import AddEquipementConv from "./AddEquipementConv/AddEquipementConv";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import customRequest from "../../../routes/api/api";
import DeleteIcon from "@mui/icons-material/Delete";

export default function ConventionEquipementsVisu({
  equipements,
  ugs,
  latestVersion,
  convId,
  version,
  statut,
}: {
  equipements: ConventionEquipement[];
  ugs: ConventionUG[];
  latestVersion?: boolean;
  convId?: string;
  version?: string;
  statut: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const deleteEquipment = async (data: { equipement_id: number }) => {
    try {
      setMessage("");
      const response = await customRequest.delete(
        `/convention/equipement/${convId}/${version}/${data.equipement_id}`
      );

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      return response.data;
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        throw new Error(err.response.data.message);
      } else {
        throw new Error("An unexpected error occurred. Please try again.");
      }
    }
  };

  const deleteEquipementMutation = useMutation({
    mutationFn: (data: { equipement_id: number }) => deleteEquipment(data),
    onSuccess: async (data) => {
      setMessage(data.message);
      await queryClient.invalidateQueries({
        queryKey: ["convention", convId, version],
      });
      setTimeout(() => {
        setMessage("");
      }, 2000);
    },
    onError: (err) => {
      setMessage(err.message);
      console.error(err);
    },
  });

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
        <Typography variant="h6">Équipements</Typography>
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
            {latestVersion && statut !== "RÉSILIATION" && (
              <AddEquipementConv convId={convId} version={version} ugs={ugs} />
            )}
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              {deleteEquipementMutation.isSuccess && message && (
                <Typography sx={{ color: "success.main" }}>
                  {message}
                </Typography>
              )}
              {deleteEquipementMutation.isError && message && (
                <Typography sx={{ color: "error.main" }}>{message}</Typography>
              )}
            </Box>
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
                          Intitulé du local
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="600">Équipement</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="600">Prix</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="600">Statut</Typography>
                      </TableCell>
                      <TableCell align="center"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {equipements.map((equipement, index) => (
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
                          <Typography>{equipement.ug_name}</Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography>{equipement.equipement_name}</Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography>{equipement.equipement_prix}</Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography>
                            {equipement.is_deleted ? "INACTIF" : "ACTIF"}
                          </Typography>
                        </TableCell>
                        {latestVersion && (
                          <TableCell align="center">
                            <IconButton
                              color="error"
                              onClick={() =>
                                deleteEquipementMutation.mutate({
                                  equipement_id: equipement.equipement_id,
                                })
                              }
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        )}
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
