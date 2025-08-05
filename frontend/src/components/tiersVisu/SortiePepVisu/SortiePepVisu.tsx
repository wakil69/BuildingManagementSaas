import {
  Box,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { SortiePepiniere } from "../../../types/tiers/tiers";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import customRequest from "../../../routes/api/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import AddIcon from "@mui/icons-material/Add";
import LoopIcon from "@mui/icons-material/Loop";
import { useMotifSortiePep } from "../../../hooks/tiers/useMotifSortiePep";

const validationSchemaSortiePepiniere = Yup.object().shape({
  date_sortie: Yup.string().required("La date de sortie est requise."),
  motif_id: Yup.number().required("Le motif est requis."),
  new_implantation: Yup.string().nullable(),
});

export default function SortiePepiniereInfo({
  sortiePep,
  id,
}: {
  sortiePep: SortiePepiniere;
  id?: string;
}) {
  const [editable, setEditable] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const { motifsSortiePepiniere, isLoadingMotifsSortiePepiniere } =
    useMotifSortiePep();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaSortiePepiniere),
    defaultValues: sortiePep,
  });

  const sortiePepiniereUpdate = async (data: SortiePepiniere) => {
    try {
      setMessage("");

      const response = await customRequest.put(
        `/tiers/sortie-pep/PM/${id}`,
        data
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

  const sortiePepiniereUpdateMutation = useMutation({
    mutationFn: (data: SortiePepiniere) => sortiePepiniereUpdate(data),
    onSuccess: (data) => {
      setMessage(data.message);
      setEditable(false);
      queryClient.invalidateQueries({
        queryKey: ["tiers", "PP", id],
      });
      setTimeout(() => {
        setMessage("");
      }, 3000);
    },
    onError: (err) => {
      setMessage(err.message);
      console.error(err);
    },
  });

  const onSubmit = (data: SortiePepiniere) => {
    sortiePepiniereUpdateMutation.mutate(data);
  };

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
          overflow: "hidden",
          padding: 2,
          cursor: "pointer",
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Typography variant="h6">Sortie Pépinière</Typography>
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
              sx={{ marginY: 3, display: "flex", alignItems: "center", gap: 3 }}
            >
              {!editable ? (
                <IconButton aria-label="edit" onClick={() => setEditable(true)}>
                  <EditIcon fontSize="large" />
                </IconButton>
              ) : (
                <IconButton
                  aria-label="edit"
                  onClick={() => handleSubmit(onSubmit)()}
                >
                  <SaveIcon fontSize="large" />
                </IconButton>
              )}
              {sortiePepiniereUpdateMutation.isSuccess && message && (
                <Typography sx={{ color: "success.main" }}>
                  {message}
                </Typography>
              )}
              {sortiePepiniereUpdateMutation.isError && message && (
                <Typography sx={{ color: "error.main" }}>{message}</Typography>
              )}
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 3,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "start",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <Typography sx={{ fontWeight: "bold", flexShrink: 0 }}>
                    Date de sortie
                  </Typography>
                  <TextField
                    disabled={!editable}
                    type="date"
                    fullWidth
                    {...register("date_sortie")}
                  />
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.date_sortie && (
                    <Typography>{errors.date_sortie.message}</Typography>
                  )}
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "start",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <Typography sx={{ fontWeight: "bold" }}>Motif</Typography>
                  {!isLoadingMotifsSortiePepiniere &&
                  motifsSortiePepiniere.length ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <FormControl fullWidth>
                        <Select
                          disabled={!editable}
                          {...register("motif_id")}
                          defaultValue={sortiePep.motif_id || ""}
                        >
                          <MenuItem key="" value="">
                            -------
                          </MenuItem>
                          {motifsSortiePepiniere.map((data) => (
                            <MenuItem key={data.motif_id} value={data.motif_id}>
                              {data.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <IconButton
                        aria-label="edit"
                        onClick={() =>
                          window.open(
                            "/pageConnecte/administration/reglages#motifs-sortie-pepiniere",
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
                            queryKey: ["motif_sortie_pep"],
                          })
                        }
                      >
                        <LoopIcon fontSize="large" />
                      </IconButton>
                    </Box>
                  ) : null}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.motif_id && (
                    <Typography>{errors.motif_id.message}</Typography>
                  )}
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "start",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <Typography sx={{ fontWeight: "bold", flexShrink: 0 }}>
                    Nouvelle implantatation
                  </Typography>
                  <TextField
                    fullWidth
                    disabled={!editable}
                    {...register("new_implantation")}
                  />
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.new_implantation && (
                    <Typography>{errors.new_implantation.message}</Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
