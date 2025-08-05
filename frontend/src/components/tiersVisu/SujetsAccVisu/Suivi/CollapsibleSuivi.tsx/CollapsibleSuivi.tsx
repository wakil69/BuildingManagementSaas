import { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Dialog,
  DialogContent,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { Suivi, UpdateSuiviType } from "../../../../../types/tiers/tiers";
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
import { useSujetsAcc } from "../../../../../hooks/tiers/useSujetsAcc";
import { useTypesAcc } from "../../../../../hooks/tiers/useTypesAcc";
import OverlayRemoveSuivi from "../../overlayRemoveSuivi/overlayRemoveSuivi";
import FichiersVisuAcc from "../../FichierVisuAcc/fichiersVisuAcc/fichiersVisuAcc";
import { convertDateFormat } from "../../../../../utils/functions";

const validationSchemaSuivi = Yup.object().shape({
  suivi_id: Yup.number().required("L'identifiant du suivi est requis."),
  date_acc_suivi: Yup.string().required("La date est requise."),
  typ_accompagnement_id: Yup.number().required(
    "Le type d'accompagnement est requis."
  ),
  hour_begin: Yup.string()
    .length(5, "Le format doit être HH:MM")
    .required("L'heure de début est requise."),
  hour_end: Yup.string()
    .length(5, "Le format doit être HH:MM")
    .required("L'heure de début est requise."),
  sujet_accompagnement_id: Yup.number()
    .transform((value, originalValue) =>
      originalValue == null ||
      (typeof originalValue === "string" && originalValue.trim() === "")
        ? undefined
        : value
    )
    .typeError("Le sujet de l'accompagnement est requis.")
    .required("Le sujet de l'accompagnement est requis."),
  feedback: Yup.string().nullable(),
});

export default function CollapsibleSuivi({
  suivi,
  id,
}: {
  suivi: Suivi;
  id?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [editable, setEditable] = useState(false);
  const [message, setMessage] = useState("");
  const toggleOpen = () => setIsOpen(!isOpen);
  const queryClient = useQueryClient();
  const [isOpenRemoveSuivi, setIsOpenRemoveSuivi] = useState<null | number>(
    null
  );
  const { sujetsAcc, isLoadingSujetsAcc } = useSujetsAcc();
  const { typesAcc, isLoadingTypesAcc } = useTypesAcc();

  const {
    register,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaSuivi),
    defaultValues: {
      suivi_id: suivi.suivi_id,
      date_acc_suivi: suivi.date_acc_suivi,
      typ_accompagnement_id: suivi.typ_accompagnement_id,
      hour_begin: suivi.hour_begin,
      hour_end: suivi.hour_end,
      sujet_accompagnement_id: suivi.sujet_accompagnement_id,
      feedback: suivi.feedback,
    },
  });

  const suiviUpdate = async (data: UpdateSuiviType) => {
    try {
      setMessage("");
      const response = await customRequest.put(`/tiers/suivi/PP/${id}`, data);

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

  const suiviUpdateMutation = useMutation({
    mutationFn: (data: UpdateSuiviType) => suiviUpdate(data),
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

  const onSubmit = (data: UpdateSuiviType) => {
    suiviUpdateMutation.mutate(data);
  };

  const actionCollectiveID = useMemo(() => {
    return typesAcc.find((typeAcc) => typeAcc.name === "ACTION COLLECTIVE")
      ?.typ_accompagnement_id;
  }, [typesAcc]);

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
        open={isOpenRemoveSuivi === suivi.suivi_id}
        aria-labelledby="dialog-create-videos"
        maxWidth="xl"
        fullWidth
      >
        <DialogContent>
          <OverlayRemoveSuivi
            setIsOpen={setIsOpenRemoveSuivi}
            suivi={suivi}
            id={id}
          />
        </DialogContent>
      </Dialog>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">
          {convertDateFormat(suivi.date_acc_suivi)}
        </Typography>
        <Typography variant="h6">
          {
            sujetsAcc.find(
              (sujetAcc) =>
                sujetAcc.sujet_accompagnement_id ===
                suivi.sujet_accompagnement_id
            )?.name
          }
        </Typography>
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
                onClick={() => setIsOpenRemoveSuivi(suivi.suivi_id)}
              >
                <DeleteIcon fontSize="large" />
              </IconButton>
              {suiviUpdateMutation.isSuccess && message && (
                <Typography sx={{ color: "success.main" }}>
                  {message}
                </Typography>
              )}
              {suiviUpdateMutation.isError && message && (
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
                  <Typography sx={{ fontWeight: "bold", flexShrink: 0 }}>
                    Date du suivi{editable ? "*" : ""}
                  </Typography>
                  {editable ? (
                    <TextField
                      type="date"
                      fullWidth
                      disabled={
                        actionCollectiveID === suivi.typ_accompagnement_id
                      }
                      {...register("date_acc_suivi")}
                      defaultValue={suivi.date_acc_suivi || ""}
                    />
                  ) : (
                    <Typography>{getValues("date_acc_suivi")}</Typography>
                  )}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.date_acc_suivi && (
                    <Typography>{errors.date_acc_suivi.message}</Typography>
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
                    Heure de début{editable ? "*" : ""}
                  </Typography>
                  {editable ? (
                    <TextField
                      fullWidth
                      disabled={
                        actionCollectiveID === suivi.typ_accompagnement_id
                      }
                      {...register("hour_begin")}
                      defaultValue={suivi.hour_begin || ""}
                    />
                  ) : (
                    <Typography>{getValues("hour_begin")}</Typography>
                  )}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.hour_begin && (
                    <Typography>{errors.hour_begin.message}</Typography>
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
                    Heure de fin{editable ? "*" : ""}
                  </Typography>
                  {editable ? (
                    <TextField
                      fullWidth
                      disabled={
                        actionCollectiveID === suivi.typ_accompagnement_id
                      }
                      {...register("hour_end")}
                      defaultValue={suivi.hour_end || ""}
                    />
                  ) : (
                    <Typography>{getValues("hour_end")}</Typography>
                  )}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.hour_end && (
                    <Typography>{errors.hour_end.message}</Typography>
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
                    Type d'accompagnement{editable ? "*" : ""}
                  </Typography>
                  {editable && !isLoadingTypesAcc && typesAcc.length ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <FormControl fullWidth>
                        <Select
                          disabled={
                            actionCollectiveID === suivi.typ_accompagnement_id
                          }
                          {...register("typ_accompagnement_id")}
                          defaultValue={suivi.typ_accompagnement_id}
                        >
                          {typesAcc
                            .filter((typeAcc) => {
                              if (
                                suivi.typ_accompagnement_id ===
                                actionCollectiveID
                              ) {
                                return (
                                  typeAcc.typ_accompagnement_id ===
                                  actionCollectiveID
                                );
                              } else {
                                return (
                                  typeAcc.typ_accompagnement_id !==
                                  actionCollectiveID
                                );
                              }
                            })
                            .map((data) => (
                              <MenuItem
                                key={data.typ_accompagnement_id}
                                value={data.typ_accompagnement_id}
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
                            "/pageConnecte/administration/reglages#types-accompagnements",
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
                            queryKey: ["types_accompagnement"],
                          })
                        }
                      >
                        <LoopIcon fontSize="large" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Typography>
                      {
                        typesAcc.find(
                          (typeAcc) =>
                            typeAcc.typ_accompagnement_id ===
                            getValues("typ_accompagnement_id")
                        )?.name
                      }
                    </Typography>
                  )}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.typ_accompagnement_id && (
                    <Typography>
                      {errors.typ_accompagnement_id.message}
                    </Typography>
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
                    Sujet de l'accompagnement{editable ? "*" : ""}
                  </Typography>
                  {editable && !isLoadingSujetsAcc && sujetsAcc.length ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <FormControl fullWidth>
                        <Select
                          {...register("sujet_accompagnement_id")}
                          disabled={
                            typesAcc.find(
                              (typeAcc) =>
                                typeAcc.typ_accompagnement_id ===
                                suivi.typ_accompagnement_id
                            )?.name === "ACTION COLLECTIVE"
                          }
                          defaultValue={suivi.sujet_accompagnement_id || ""}
                        >
                          <MenuItem key="" value="">
                            --------
                          </MenuItem>
                          {sujetsAcc
                            .filter(
                              (sujetAcc) =>
                                sujetAcc.typ_accompagnement_id ===
                                getValues("typ_accompagnement_id")
                            )
                            .map((data) => (
                              <MenuItem
                                key={data.sujet_accompagnement_id}
                                value={data.sujet_accompagnement_id}
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
                            "/pageConnecte/administration/reglages#sujets-accompagnements",
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
                            queryKey: ["sujets_accompagnement"],
                          })
                        }
                      >
                        <LoopIcon fontSize="large" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Typography>
                      {
                        sujetsAcc.find(
                          (sujetAcc) =>
                            sujetAcc.sujet_accompagnement_id ===
                            getValues("sujet_accompagnement_id")
                        )?.name
                      }
                    </Typography>
                  )}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.sujet_accompagnement_id && (
                    <Typography>
                      {errors.sujet_accompagnement_id.message}
                    </Typography>
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
                    Commentaire
                  </Typography>
                  {editable ? (
                    <TextField
                      variant="standard"
                      fullWidth
                      multiline
                      disabled={!editable}
                      rows={4}
                      margin="normal"
                      {...register("feedback")}
                      defaultValue={suivi.feedback}
                    />
                  ) : (
                    <Typography>{getValues("feedback")}</Typography>
                  )}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.feedback && (
                    <Typography>{errors.feedback.message}</Typography>
                  )}
                </Box>
              </Box>

              <FichiersVisuAcc
                files={suivi.files}
                id={id}
                suiviId={suivi.suivi_id}
              />
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
