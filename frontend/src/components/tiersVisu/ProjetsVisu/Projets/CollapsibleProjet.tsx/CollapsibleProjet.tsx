import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  SelectChangeEvent,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Dialog,
  DialogContent,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { Projet } from "../../../../../types/tiers/tiers";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import customRequest from "../../../../../routes/api/api";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import LoopIcon from "@mui/icons-material/Loop";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLegalForms } from "../../../../../hooks/tiers/useLegalForms";
import OverlayRemoveProjet from "../../overlayRemoveProjet/overlayRemoveProjet";

type FieldName = keyof Yup.InferType<typeof validationSchemaProjet>;

const validationSchemaProjet = Yup.object().shape({
  prj_id: Yup.number().required("L'identifiant du projet est requis."),
  activite_prj: Yup.string().required("L'intitulé est requis."),
  raison_social_prj: Yup.string().nullable(),
  date_debut_prj: Yup.string().nullable(),
  nb_dirigeants_prj: Yup.number()
    .min(0, "Vous ne pouvez pas mettre un nombre négatif.")
    .nullable(),
  effectif_prj: Yup.number()
    .min(0, "Vous ne pouvez pas mettre un nombre négatif.")
    .nullable(),
  legal_form_id: Yup.number()
    .transform((value, originalValue) =>
      originalValue == null ||
      (typeof originalValue === "string" && originalValue.trim() === "")
        ? undefined
        : value
    )
    .typeError("Veuillez entrer un nombre.")
    .nullable()
    .optional(),
});

export default function CollapsibleProjet({
  projet,
  id,
}: {
  projet: Projet;
  id?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [editable, setEditable] = useState(false);
  const [message, setMessage] = useState("");
  const toggleOpen = () => setIsOpen(!isOpen);
  const { legalForms, isLoadingLegalForms } = useLegalForms();
  const queryClient = useQueryClient();
  const [isOpenRemoveProjet, setIsOpenRemoveProjet] = useState<null | number>(
    null
  );
  const {
    register,
    getValues,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaProjet),
    defaultValues: projet,
  });

  const projetUpdate = async (data: Projet) => {
    try {
      setMessage("");
      const response = await customRequest.put(`/tiers/projet/PP/${id}`, data);

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

  const projetUpdateMutation = useMutation({
    mutationFn: (data: Projet) => projetUpdate(data),
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

  const onSubmit = (data: Projet) => {
    projetUpdateMutation.mutate(data);
  };

  const setUpperCase = (
    name: FieldName,
    event:
      | SelectChangeEvent<string>
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setValue(name, value.toUpperCase() || undefined);
  };

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
      <Dialog
        open={isOpenRemoveProjet === projet.prj_id}
        aria-labelledby="dialog-create-videos"
        maxWidth="xl"
        fullWidth
      >
        <DialogContent>
          <OverlayRemoveProjet
            setIsOpen={setIsOpenRemoveProjet}
            projet={projet}
            id={id}
          />
        </DialogContent>
      </Dialog>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Typography variant="h6">{projet.raison_social_prj}</Typography>
      </Box>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden" }}
          >
            <Box
              sx={{
                marginY: 3,
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
              onClick={(e) => e.stopPropagation()}
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
              <IconButton
                aria-label="edit"
                onClick={() => setIsOpenRemoveProjet(projet.prj_id)}
              >
                <DeleteIcon fontSize="large" />
              </IconButton>
              {projetUpdateMutation.isSuccess && message && (
                <Typography sx={{ color: "success.main" }}>
                  {message}
                </Typography>
              )}
              {projetUpdateMutation.isError && message && (
                <Typography sx={{ color: "error.main" }}>{message}</Typography>
              )}
            </Box>
            <Paper
              sx={{
                mt: 2,
                p: 2,
                display: "flex",
                flexDirection: "column",
                flexWrap: "wrap",
                gap: 3,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "start",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <Typography sx={{ fontWeight: "bold" }}>
                    Dénomination entreprise
                  </Typography>
                  {editable ? (
                    <TextField
                      fullWidth
                      {...register("raison_social_prj", {
                        onChange: (e) => setUpperCase("raison_social_prj", e),
                      })}
                      id="raison_social_prj"
                      name="raison_social_prj"
                    />
                  ) : (
                    <Typography>{getValues("raison_social_prj")}</Typography>
                  )}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.raison_social_prj && (
                    <Typography>{errors.raison_social_prj.message}</Typography>
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
                  <Typography sx={{ fontWeight: "bold" }}>
                    Activité{editable ? "*" : ""}
                  </Typography>
                  {editable ? (
                    <TextField
                      fullWidth
                      {...register("activite_prj", {
                        onChange: (e) => setUpperCase("activite_prj", e),
                      })}
                      id="activite_prj"
                      name="activite_prj"
                    />
                  ) : (
                    <Typography>{getValues("activite_prj")}</Typography>
                  )}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.activite_prj && (
                    <Typography>{errors.activite_prj.message}</Typography>
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
                  <Typography sx={{ fontWeight: "bold" }}>
                    Statut juridique
                  </Typography>
                  {editable && !isLoadingLegalForms && legalForms.length ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <FormControl fullWidth>
                        <Select
                          {...register("legal_form_id")}
                          defaultValue={projet.legal_form_id || ""}
                        >
                          <MenuItem key="" value="">
                            -------
                          </MenuItem>
                          {legalForms.map((data) => (
                            <MenuItem
                              key={data.legal_form_id}
                              value={data.legal_form_id}
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
                            "/pageConnecte/administration/reglages#legal-forms",
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
                            queryKey: ["legal_forms"],
                          })
                        }
                      >
                        <LoopIcon fontSize="large" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Typography>
                      {
                        legalForms.find(
                          (legalForm) =>
                            legalForm.legal_form_id ===
                            getValues("legal_form_id")
                        )?.name
                      }
                    </Typography>
                  )}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.legal_form_id && (
                    <Typography>{errors.legal_form_id.message}</Typography>
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
                  <Typography sx={{ fontWeight: "bold" }}>
                    Date de création
                  </Typography>
                  {editable ? (
                    <TextField
                      fullWidth
                      type="date"
                      {...register("date_debut_prj")}
                      id="date_debut_prj"
                      name="date_debut_prj"
                    />
                  ) : (
                    <Typography>{getValues("date_debut_prj")}</Typography>
                  )}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.date_debut_prj && (
                    <Typography>{errors.date_debut_prj.message}</Typography>
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
                  <Typography sx={{ fontWeight: "bold" }}>
                    Nombre de dirigeants
                  </Typography>
                  {editable ? (
                    <TextField
                      fullWidth
                      type="number"
                      min={0}
                      {...register("nb_dirigeants_prj")}
                      id="nb_dirigeants_prj"
                      name="nb_dirigeants_prj"
                    />
                  ) : (
                    <Typography>{getValues("nb_dirigeants_prj")}</Typography>
                  )}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.nb_dirigeants_prj && (
                    <Typography>{errors.nb_dirigeants_prj.message}</Typography>
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
                  <Typography sx={{ fontWeight: "bold" }}>
                    Effectif prévisionnel
                  </Typography>
                  {editable ? (
                    <TextField
                      fullWidth
                      type="number"
                      min={0}
                      {...register("effectif_prj")}
                      id="effectif_prj"
                      name="effectif_prj"
                    />
                  ) : (
                    <Typography>{getValues("effectif_prj")}</Typography>
                  )}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.effectif_prj && (
                    <Typography>{errors.effectif_prj.message}</Typography>
                  )}
                </Box>
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
