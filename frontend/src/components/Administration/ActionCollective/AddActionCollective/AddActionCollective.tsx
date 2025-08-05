import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import customRequest from "../../../../routes/api/api";
import { SearchPP } from "../../../../types/types";
import { useDebounce } from "use-debounce";
import { useAllPPs } from "../../../../hooks/useAllPPs/useAllPPs";
import { useSujetsAcc } from "../../../../hooks/tiers/useSujetsAcc";
import { ActionCollective } from "../../../../types/Admin/Administration";
import { useTypesAcc } from "../../../../hooks/tiers/useTypesAcc";
import AddIcon from "@mui/icons-material/Add";
import LoopIcon from "@mui/icons-material/Loop";
import CloseIcon from "@mui/icons-material/Close";

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
        tiepp_id: Yup.number()
          .transform((value, originalValue) =>
            originalValue == null ||
            (typeof originalValue === "string" && originalValue.trim() === "")
              ? undefined
              : value
          )
          .typeError("Veuillez entrer un nombre.")
          .required("Chaque participant doit avoir un ID valide."),
        libelle: Yup.string().required(
          "Chaque participant doit avoir un ID valide."
        ),
      })
    )
    .min(1, "Il faut au moins un participant.")
    .required("Les participants sont requis."),
});

export default function AddActionCollective({
  actionCollectiveID,
}: {
  actionCollectiveID?: number;
}) {
  const [searchPP, setSearchPP] = useState("");
  const [debouncedSearchPP] = useDebounce(searchPP, 500);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const { allPPs, isLoadingAllPPs } = useAllPPs(debouncedSearchPP);
  const { sujetsAcc, isLoadingSujetsAcc } = useSujetsAcc();
  const { typesAcc } = useTypesAcc();
  const [message, setMessage] = useState("");

  const queryClient = useQueryClient();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaAddActionCollective),
    defaultValues: {
      typ_accompagnement_id: actionCollectiveID,
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "attendants",
    control,
  });

  const addActionCollective = async (data: ActionCollective) => {
    try {
      setMessage("");
      const response = await customRequest.post(
        `/admin/action-collective`,
        data
      );

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      return response.data;
    } catch (err: any) {
      console.log(err);
      if (err.response && err.response.data && err.response.data.message) {
        throw new Error(err.response.data.message);
      } else {
        throw new Error("An unexpected error occurred. Please try again.");
      }
    }
  };

  const addActionCollectiveMutation = useMutation({
    mutationFn: (data: ActionCollective) => addActionCollective(data),
    onSuccess: (data) => {
      setMessage(data.message);
      queryClient.invalidateQueries({ queryKey: ["actions_collectives"] });
      setTimeout(() => {
        setMessage("");
      }, 3000);
      reset({
        sujet_accompagnement_id: undefined,
        date_acc_suivi: "",
        hour_begin: "",
        hour_end: "",
        feedback: "",
        attendants: [],
        typ_accompagnement_id: actionCollectiveID,
      });
      setSearchPP("");
    },
    onError: (err) => {
      setMessage(err.message);
      console.error(err);
    },
  });

  const onSubmit = (data: ActionCollective) => {
    addActionCollectiveMutation.mutate(data);
  };

  const handleSelect = (pp: SearchPP) => {
    setSearchPP(pp.libelle);
    append({ tiepp_id: pp.tiepp_id, libelle: pp.libelle });
    setIsSearchActive(false);
  };

  return (
    <Box sx={{ width: "100%", padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        Ajout d'une nouvelle action collective
      </Typography>
      <Paper elevation={3} sx={{ padding: 3, marginY: 3 }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 6,
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
                Type
              </Typography>
              <TextField
                fullWidth
                disabled={true}
                defaultValue={
                  typesAcc.find(
                    (typeAcc) =>
                      typeAcc.typ_accompagnement_id === actionCollectiveID
                  )?.name || ""
                }
              />
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.typ_accompagnement_id && (
                <Typography>{errors.typ_accompagnement_id.message}</Typography>
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
              {!isLoadingSujetsAcc && sujetsAcc.length ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <FormControl fullWidth>
                    <Select
                      {...register("sujet_accompagnement_id")}
                      defaultValue={""}
                    >
                      <MenuItem key="" value="">
                        ------
                      </MenuItem>
                      {sujetsAcc
                        .filter(
                          (sujetAcc) =>
                            sujetAcc.typ_accompagnement_id ===
                            actionCollectiveID
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
                <CircularProgress />
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
            {isSearchActive && allPPs.length && searchPP.trim() ? (
              <Paper
                elevation={3}
                sx={{
                  position: "absolute",
                  bottom: "100%",
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
                            (attendant) => pp.tiepp_id === attendant.tiepp_id
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
                          <ListItemButton onMouseDown={() => handleSelect(pp)}>
                            {pp.libelle}
                          </ListItemButton>
                        </ListItem>
                      ))}
                </List>
              </Paper>
            ) : null}
            {fields.length ? (
              <Box mt={4} width="100%">
                <List
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 2,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  {fields.map((attendant, index) => (
                    <ListItem
                      key={attendant.tiepp_id}
                      sx={{
                        display: "inline-flex",
                        width: "auto",
                        padding: 0,
                      }}
                    >
                      <Chip
                        label={attendant.libelle}
                        onDelete={() => remove(index)}
                        deleteIcon={
                          <IconButton>
                            <CloseIcon sx={{ color: "red" }} />
                          </IconButton>
                        }
                        sx={{
                          backgroundColor: "#e3f2fd",
                          color: "#1976d2",
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
              <TextField
                type="date"
                fullWidth
                {...register("date_acc_suivi")}
              />
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
              <TextField fullWidth {...register("hour_begin")} />
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
              <TextField fullWidth {...register("hour_end")} />
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.hour_end && (
                <Typography>{errors.hour_end.message}</Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          alignItems: "center",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleSubmit(onSubmit)()}
        >
          Ajouter l'action collective
        </Button>
        <Box sx={{ marginY: 3, display: "flex", alignItems: "center", gap: 3 }}>
          {addActionCollectiveMutation.isSuccess && message && (
            <Typography sx={{ color: "success.main" }}>{message}</Typography>
          )}
          {addActionCollectiveMutation.isError && message && (
            <Typography sx={{ color: "error.main" }}>{message}</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
