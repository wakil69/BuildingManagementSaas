import { useState } from "react";
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
  List,
  CircularProgress,
  ListItem,
  ListItemButton,
  Chip,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useFieldArray, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import LoopIcon from "@mui/icons-material/Loop";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { ActionCollective } from "../../../../types/Admin/Administration";
import { useAllPPs } from "../../../../hooks/useAllPPs/useAllPPs";
import { useSujetsAcc } from "../../../../hooks/tiers/useSujetsAcc";
import { useDebounce } from "use-debounce";
import customRequest from "../../../../routes/api/api";
import { SearchPP } from "../../../../types/types";
import CloseIcon from "@mui/icons-material/Close";
import OverlayRemoveActionCollective from "../overlayRemoveActionCollective/overlayRemoveActionCollective";
import { useTypesAcc } from "../../../../hooks/tiers/useTypesAcc";

const validationSchemaAddActionCollective = Yup.object().shape({
  date_acc_suivi: Yup.string().required("La date est requise."),
  typ_accompagnement_id: Yup.number()
    .transform((value, originalValue) =>
      originalValue == null ||
      (typeof originalValue === "string" && originalValue.trim() === "")
        ? undefined
        : value
    )
    .typeError("Veuillez entrer un nombre.")
    .required("Le type d'accompagnement est requis."),
  hour_begin: Yup.string()
    .length(5, "Le format doit être HH:MM")
    .required("L'heure de début est requise."),
  hour_end: Yup.string()
    .length(5, "Le format doit être HH:MM")
    .required("L'heure de fin est requise."),
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
  attendants: Yup.array()
    .of(
      Yup.object().shape({
        tiepp_id: Yup.number().required(
          "Chaque participant doit avoir un ID valide."
        ),
        libelle: Yup.string().required(
          "Chaque participant doit avoir un libelle."
        ),
        statut: Yup.string().oneOf(["added", "removed"]).optional(),
        suivi_id: Yup.number().optional(),
      })
    )
    .min(1, "Il faut au moins un participant.")
    .required("Les participants sont requis.")
    .test(
      "at-least-one-not-removed",
      "Il faut au moins un participant.",
      (attendants) => {
        return attendants.some((attendant) => attendant.statut !== "removed");
      }
    ),
});

export default function CollapsibleActionCollective({
  actionCollective,
}: {
  actionCollective: ActionCollective;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [editable, setEditable] = useState(false);
  const toggleOpen = () => setIsOpen(!isOpen);
  const [searchPP, setSearchPP] = useState("");
  const [debouncedSearchPP] = useDebounce(searchPP, 500);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const { allPPs, isLoadingAllPPs } = useAllPPs(debouncedSearchPP);
  const { sujetsAcc, isLoadingSujetsAcc } = useSujetsAcc();
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const [isOpenRemoveProjet, setIsOpenRemoveProjet] = useState<null | number>(
    null
  );
  const { typesAcc } = useTypesAcc();

  const {
    control,
    register,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaAddActionCollective),
    defaultValues: actionCollective,
  });

  const { fields, append, update, remove } = useFieldArray({
    name: "attendants",
    control,
  });

  const actionCollectiveUpdate = async (data: ActionCollective) => {
    try {
      setMessage("");
      const response = await customRequest.put(
        `/admin/action-collective`,
        data
      );

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      return response.data;
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        throw new Error(err.message.data.error);
      } else {
        throw new Error("An unexpected error occurred. Please try again.");
      }
    }
  };

  const actionCollectiveUpdateMutation = useMutation({
    mutationFn: (data: ActionCollective) => actionCollectiveUpdate(data),
    onSuccess: (data) => {
      setMessage(data.message);
      setEditable(false);
      queryClient.invalidateQueries({
        queryKey: ["actions_collectives"],
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

  const onSubmit = (data: ActionCollective) => {
    actionCollectiveUpdateMutation.mutate(data);
  };

  const removeAttendant = async (
    attendant: {
      tiepp_id: number;
      libelle: string;
      statut?: "added" | "removed";
    },
    index: number
  ) => {
    if (attendant.statut === "added") {
      remove(index);
    } else {
      update(index, {
        ...attendant,
        statut: "removed",
      });
    }
  };

  const handleSelect = (pp: SearchPP) => {
    setSearchPP(pp.libelle);
    append({
      tiepp_id: pp.tiepp_id,
      libelle: pp.libelle,
      statut: actionCollective.attendants.find(
        (attendant) => attendant.tiepp_id === pp.tiepp_id
      )
        ? undefined
        : "added",
    });
    setIsSearchActive(false);
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
        open={isOpenRemoveProjet === actionCollective.sujet_accompagnement_id}
        aria-labelledby="dialog-create-videos"
        maxWidth="xl"
        fullWidth
      >
        <DialogContent>
          <OverlayRemoveActionCollective
            setIsOpen={setIsOpenRemoveProjet}
            actionCollective={actionCollective}
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
        <Typography variant="h6">
          {
            sujetsAcc.find(
              (sujetAcc) =>
                sujetAcc.sujet_accompagnement_id ===
                actionCollective.sujet_accompagnement_id
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
            style={{ overflow: "hidden", cursor: "default" }}
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
                onClick={() =>
                  setIsOpenRemoveProjet(
                    actionCollective.sujet_accompagnement_id
                  )
                }
              >
                <DeleteIcon fontSize="large" />
              </IconButton>
              {actionCollectiveUpdateMutation.isSuccess && message && (
                <Typography sx={{ color: "success.main" }}>
                  {message}
                </Typography>
              )}
              {actionCollectiveUpdateMutation.isError && message && (
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
                    Type
                  </Typography>
                  <TextField
                    fullWidth
                    disabled={true}
                    defaultValue={
                      typesAcc.find(
                        (typeAcc) =>
                          typeAcc.typ_accompagnement_id ===
                          actionCollective.typ_accompagnement_id
                      )?.name || ""
                    }
                  />
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
                    Sujet de l'action collective
                  </Typography>
                  {editable && !isLoadingSujetsAcc && sujetsAcc.length ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <FormControl fullWidth>
                        <Select
                          {...register("sujet_accompagnement_id")}
                          defaultValue={
                            actionCollective.sujet_accompagnement_id || ""
                          }
                        >
                          <MenuItem key="" value="">
                            ------
                          </MenuItem>
                          {sujetsAcc
                            .filter(
                              (sujetAcc) =>
                                sujetAcc.typ_accompagnement_id ===
                                actionCollective.typ_accompagnement_id
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
                  ) : isLoadingSujetsAcc ? (
                    <CircularProgress size={12} />
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
                  position: "relative",
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  alignItems: "center",
                }}
              >
                <TextField
                  type="text"
                  value={searchPP}
                  disabled={!editable}
                  onChange={(e) => setSearchPP(e.target.value)}
                  onFocus={() => setIsSearchActive(true)}
                  onBlur={() => setIsSearchActive(false)}
                  placeholder="Nom de la personne physique"
                  variant="outlined"
                  fullWidth
                  sx={{
                    width: "60%",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "16px",
                    },
                  }}
                />
                {editable &&
                isSearchActive &&
                allPPs.length &&
                searchPP.trim() ? (
                  <Paper
                    elevation={3}
                    sx={{
                      position: "absolute",
                      bottom: "100%",
                      marginTop: 2,
                      width: "60%",
                      maxHeight: "300px",
                      overflowY: "auto",
                      zIndex: 20,
                      borderRadius: "8px",
                    }}
                  >
                    <List>
                      {!isLoadingAllPPs &&
                        allPPs
                          .filter(
                            (pp) =>
                              !fields.some(
                                (attendant) =>
                                  pp.tiepp_id === attendant.tiepp_id
                              )
                          )
                          .map((pp) => (
                            <ListItem
                              key={pp.tiepp_id}
                              disablePadding
                              sx={{
                                "&:hover": {
                                  backgroundColor: "#f1f1f1",
                                },
                              }}
                            >
                              <ListItemButton
                                onMouseDown={() => handleSelect(pp)}
                              >
                                {pp.libelle}
                              </ListItemButton>
                            </ListItem>
                          ))}
                    </List>
                  </Paper>
                ) : null}
                {fields.length ? (
                  <Box mt={4} width="100%">
                    <List sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                      {fields
                        .filter((attendant) => attendant.statut !== "removed")
                        .map((attendant, index) => (
                          <ListItem
                            key={attendant.tiepp_id}
                            sx={{
                              display: "inline-flex",
                              width: "auto",
                              padding: 0,
                            }}
                          >
                            <Chip
                              disabled={!editable}
                              label={attendant.libelle}
                              onDelete={() => removeAttendant(attendant, index)}
                              deleteIcon={
                                <IconButton>
                                  <CloseIcon sx={{ color: "red" }} />
                                </IconButton>
                              }
                              sx={{
                                backgroundColor: "#e3f2fd",
                                color: "#1976d2",
                                padding: "8px 16px",
                              }}
                              variant="outlined"
                            />
                          </ListItem>
                        ))}
                    </List>
                  </Box>
                ) : null}
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.attendants && (
                    <Typography>{errors.attendants.message}</Typography>
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
                    Date de l'action collective*
                  </Typography>
                  {editable ? (
                    <TextField
                      type="date"
                      fullWidth
                      {...register("date_acc_suivi")}
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
                    Heure de début*
                  </Typography>
                  {editable ? (
                    <TextField fullWidth {...register("hour_begin")} />
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
                    Heure de fin*
                  </Typography>
                  {editable ? (
                    <TextField fullWidth {...register("hour_end")} />
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
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
