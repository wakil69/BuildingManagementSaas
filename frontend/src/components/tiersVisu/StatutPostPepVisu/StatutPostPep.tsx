import {
  Box,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { PostPepiniere } from "../../../types/tiers/tiers";
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
import { useStatutsPostPep } from "../../../hooks/tiers/useStatutsPostPep";

const validationSchemaStatutPostPep = Yup.object().shape({
  actualisation_date: Yup.string().required(
    "La date d'actualisation est requise."
  ),
  statut_id: Yup.string().required("Le statut est requis."),
});

export default function StatutPostPepiniere({
  statutPostPep,
  id,
}: {
  statutPostPep: PostPepiniere;
  id?: string;
}) {
  const [editable, setEditable] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const { statutsPostPepiniere, isLoadingStatutsPostPepiniere } =
    useStatutsPostPep();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaStatutPostPep),
    defaultValues: statutPostPep,
  });

  const statutPostPepUpdate = async (data: PostPepiniere) => {
    try {
      setMessage("");

      const response = await customRequest.put(
        `/tiers/statut-post-pep/PM/${id}`,
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

  const statutPostPepUpdateMutation = useMutation({
    mutationFn: (data: PostPepiniere) => statutPostPepUpdate(data),
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

  const onSubmit = (data: PostPepiniere) => {
    statutPostPepUpdateMutation.mutate(data);
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
        <Typography variant="h6">Statut Post Pépinère</Typography>
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
              {statutPostPepUpdateMutation.isSuccess && message && (
                <Typography sx={{ color: "success.main" }}>
                  {message}
                </Typography>
              )}
              {statutPostPepUpdateMutation.isError && message && (
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
                    Date d'actualisation
                  </Typography>
                  <TextField
                    disabled={!editable}
                    type="date"
                    fullWidth
                    {...register("actualisation_date")}
                  />
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.actualisation_date && (
                    <Typography>{errors.actualisation_date.message}</Typography>
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
                  <Typography sx={{ fontWeight: "bold" }}>Statut</Typography>
                  {!isLoadingStatutsPostPepiniere &&
                  statutsPostPepiniere.length ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <FormControl fullWidth>
                        <Select
                          disabled={!editable}
                          {...register("statut_id")}
                          defaultValue={statutPostPep.statut_id || ""}
                        >
                          <MenuItem key="" value="">
                            -------
                          </MenuItem>
                          {statutsPostPepiniere.map((data) => (
                            <MenuItem
                              key={data.statut_id}
                              value={data.statut_id}
                            >
                              {data.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <IconButton
                        aria-label="edit"
                        onClick={() =>
                          window.open(
                            "/pageConnecte/administration/reglages#statuts-post-pepiniere",
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
                            queryKey: ["statuts_post_pep"],
                          })
                        }
                      >
                        <LoopIcon fontSize="large" />
                      </IconButton>
                    </Box>
                  ) : null}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.statut_id && (
                    <Typography>{errors.statut_id.message}</Typography>
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
