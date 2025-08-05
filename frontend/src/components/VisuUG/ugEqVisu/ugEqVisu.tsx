import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Equipement, NewEquipement } from "../../../types/ugs/ugs";
import customRequest from "../../../routes/api/api";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEqType } from "../../../hooks/ugs/useEqType";
import AddIcon from "@mui/icons-material/Add";
import LoopIcon from "@mui/icons-material/Loop";

const validationSchemaEquipement = Yup.object().shape({
  nature_equipement_id: Yup.number().required("La nature est requise."),
  name: Yup.string().required("L'intitulé est requis."),
  equipement_prix: Yup.number().required("La nature est requise."),
});

export default function UgEquipementsVisu({
  equipements,
  ugId,
}: {
  equipements: Equipement[];
  ugId?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const { natureEquipements, isLoadingNatureEq } = useEqType();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaEquipement),
  });

  const newEquipment = async (data: NewEquipement) => {
    try {
      setMessage("");
      const response = await customRequest.post(`/ug/equipement/${ugId}`, data);

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

  const newEquipementMutation = useMutation({
    mutationFn: (data: NewEquipement) => newEquipment(data),
    onSuccess: (data) => {
      setMessage(data.message);
      queryClient.invalidateQueries({
        queryKey: ["ug", ugId],
      });
    },
    onError: (err) => {
      setMessage(err.message);
      console.error(err);
    },
  });

  const onSubmit = (data: NewEquipement) => {
    newEquipementMutation.mutate(data);
  };

  const deleteEquipment = async (data: { equipement_id: number }) => {
    try {
      setMessage("");
      const response = await customRequest.delete(
        `/ug/equipement/${data.equipement_id}`
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
    onSuccess: (data) => {
      setMessage(data.message);
      queryClient.invalidateQueries({
        queryKey: ["ug", ugId],
      });
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
        <Typography variant="h6">Équipements de l'UG</Typography>
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
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 3,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <Typography sx={{ fontWeight: "bold", flexShrink: 0 }}>
                    Nature de l'équipement
                  </Typography>
                  {!isLoadingNatureEq && natureEquipements.length ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <FormControl fullWidth>
                        <Select
                          {...register("nature_equipement_id")}
                          id="nature_equipement_id"
                          defaultValue={
                            natureEquipements[0].nature_equipement_id
                          }
                        >
                          {natureEquipements.map((nature) => (
                            <MenuItem
                              key={nature.nature_equipement_id}
                              value={nature.nature_equipement_id}
                            >
                              {nature.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <IconButton
                        aria-label="edit"
                        onClick={() =>
                          window.open(
                            "/pageConnecte/administration/reglages#nature-equipement",
                            "_blank"
                          )
                        }
                      >
                        <AddIcon fontSize="large" />
                      </IconButton>
                      <IconButton
                        aria-label="edit"
                        onClick={() =>
                          queryClient.invalidateQueries({
                            queryKey: ["nature", "equipements", "ug"],
                          })
                        }
                      >
                        <LoopIcon fontSize="large" />
                      </IconButton>
                    </Box>
                  ) : (
                    <CircularProgress />
                  )}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.nature_equipement_id && (
                    <Typography>
                      {errors.nature_equipement_id.message}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <Typography sx={{ fontWeight: "bold", flexShrink: 0 }}>
                    Nom de l'équipement
                  </Typography>
                  <TextField fullWidth {...register("name")} id="name" />
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.name && (
                    <Typography>{errors.name.message}</Typography>
                  )}
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <Typography sx={{ fontWeight: "bold", flexShrink: 0 }}>
                    Prix de l'équipement
                  </Typography>
                  <TextField
                    fullWidth
                    type="number"
                    {...register("equipement_prix")}
                    id="equipement_prix"
                  />
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.equipement_prix && (
                    <Typography>{errors.equipement_prix.message}</Typography>
                  )}
                </Box>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit(onSubmit)}
                >
                  Ajouter un équipement
                </Button>
              </Box>

              {(deleteEquipementMutation.isSuccess ||
                newEquipementMutation.isSuccess) &&
                message && (
                  <Typography sx={{ color: "success.main" }}>
                    {message}
                  </Typography>
                )}
              {(deleteEquipementMutation.isError ||
                newEquipementMutation.isError) &&
                message && (
                  <Typography sx={{ color: "error.main" }}>
                    {message}
                  </Typography>
                )}
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
                        <Typography fontWeight="600">Nom</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="600">Type</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="600">Prix</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="600">Propriétaire</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="600">Actions</Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {equipements.map((equipment: Equipement) => (
                      <TableRow
                        key={equipment.equipement_id}
                      >
                        <TableCell>{equipment.name}</TableCell>
                        <TableCell>{equipment.type}</TableCell>
                        <TableCell>{equipment.equipement_prix} €</TableCell>
                        <TableCell>{equipment.raison_sociale}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="error"
                            onClick={() =>
                              deleteEquipementMutation.mutate({
                                equipement_id: equipment.equipement_id,
                              })
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
