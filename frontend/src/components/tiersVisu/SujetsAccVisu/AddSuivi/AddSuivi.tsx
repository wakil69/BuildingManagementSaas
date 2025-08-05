import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import customRequest from "../../../../routes/api/api";
import AddIcon from "@mui/icons-material/Add";
import LoopIcon from "@mui/icons-material/Loop";
import { AddSuiviType } from "../../../../types/tiers/tiers";
import { useTypesAcc } from "../../../../hooks/tiers/useTypesAcc";
import { useSujetsAcc } from "../../../../hooks/tiers/useSujetsAcc";

const validationSchemaAddSuivi = Yup.object().shape({
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

export default function AddSuivi({ id }: { id?: string }) {
  const [message, setMessage] = useState("");
  const { sujetsAcc, isLoadingSujetsAcc } = useSujetsAcc();
  const { typesAcc, isLoadingTypesAcc } = useTypesAcc();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaAddSuivi),
    defaultValues: {
      typ_accompagnement_id: 1,
      sujet_accompagnement_id: undefined,
    },
  });

  const addProjet = async (data: AddSuiviType) => {
    try {
      setMessage("");
      const response = await customRequest.post(`/tiers/suivi/PP/${id}`, data);

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

  const addSuiviMutation = useMutation({
    mutationFn: (data: AddSuiviType) => addProjet(data),
    onSuccess: (data) => {
      setMessage(data.message);
      queryClient.invalidateQueries({ queryKey: ["tiers", "suivi", id] });
      reset({
        date_acc_suivi: "",
        typ_accompagnement_id: 1,
        hour_begin: "",
        hour_end: "",
        sujet_accompagnement_id: undefined,
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

  const onSubmit = (data: AddSuiviType) => {
    addSuiviMutation.mutate(data);
  };

  return (
    <Box sx={{ width: "100%", padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        Ajout d'un nouveau suivi
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
                Date du suivi*
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

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "start",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Typography sx={{ fontWeight: "bold", flexShrink: 0 }}>
                Type d'accompagnement*
              </Typography>
              {!isLoadingTypesAcc && typesAcc.length ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <FormControl fullWidth>
                    <Select
                      {...register("typ_accompagnement_id")}
                      defaultValue={1}
                    >
                      {typesAcc.map((data) => (
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
              ) : null}
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
                Sujet de l'accompagnement*
              </Typography>
              {!isLoadingSujetsAcc && sujetsAcc.length ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <FormControl fullWidth>
                    <Select
                      {...register("sujet_accompagnement_id")}
                      defaultValue={""}
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
              ) : null}
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
              width: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                width: "80%",
              }}
            >
              <Typography sx={{ fontWeight: "bold", flexShrink: 0 }}>
                Commentaire
              </Typography>
              <TextField
                variant="standard"
                fullWidth
                multiline
                rows={4}
                margin="normal"
                {...register("feedback")}
              />
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.feedback && (
                <Typography>{errors.feedback.message}</Typography>
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
          Ajouter le projet
        </Button>
        <Box sx={{ marginY: 3, display: "flex", alignItems: "center", gap: 3 }}>
          {addSuiviMutation.isSuccess && message && (
            <Typography sx={{ color: "success.main" }}>{message}</Typography>
          )}
          {addSuiviMutation.isError && message && (
            <Typography sx={{ color: "error.main" }}>{message}</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
