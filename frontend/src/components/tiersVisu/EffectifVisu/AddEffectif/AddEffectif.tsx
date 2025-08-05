import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Effectif } from "../../../../types/tiers/tiers";
import customRequest from "../../../../routes/api/api";

const validationSchemaEffectifAdd = Yup.object().shape({
  year: Yup.number().required("L'année est requise."),
  nb_cdi: Yup.number()
    .transform((value, originalValue) =>
      originalValue == null ||
      (typeof originalValue === "string" && originalValue.trim() === "")
        ? undefined
        : value
    )
    .typeError("Veuillez entrer un nombre.")
    .min(0, "La valeur doit être positive.")
    .nullable()
    .optional(),
  nb_cdd: Yup.number()
    .transform((value, originalValue) =>
      originalValue == null ||
      (typeof originalValue === "string" && originalValue.trim() === "")
        ? undefined
        : value
    )
    .typeError("Veuillez entrer un nombre.")
    .min(0, "La valeur doit être positive.")
    .nullable()
    .optional(),
  nb_int: Yup.number()
    .transform((value, originalValue) =>
      originalValue == null ||
      (typeof originalValue === "string" && originalValue.trim() === "")
        ? undefined
        : value
    )
    .typeError("Veuillez entrer un nombre.")
    .min(0, "La valeur doit être positive.")
    .nullable()
    .optional(),
  nb_caid: Yup.number()
    .transform((value, originalValue) =>
      originalValue == null ||
      (typeof originalValue === "string" && originalValue.trim() === "")
        ? undefined
        : value
    )
    .typeError("Veuillez entrer un nombre.")
    .min(0, "La valeur doit être positive.")
    .nullable()
    .optional(),
  nb_alt: Yup.number()
    .transform((value, originalValue) =>
      originalValue == null ||
      (typeof originalValue === "string" && originalValue.trim() === "")
        ? undefined
        : value
    )
    .typeError("Veuillez entrer un nombre.")
    .min(0, "La valeur doit être positive.")
    .nullable()
    .optional(),
  nb_stg: Yup.number()
    .transform((value, originalValue) =>
      originalValue == null ||
      (typeof originalValue === "string" && originalValue.trim() === "")
        ? undefined
        : value
    )
    .typeError("Veuillez entrer un nombre.")
    .min(0, "La valeur doit être positive.")
    .nullable()
    .optional(),
});

export default function AddEffectif({ id }: { id?: string }) {
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaEffectifAdd),
    defaultValues: {
      year: new Date().getFullYear(),
    },
  });

  const addEffectif = async (data: Effectif) => {
    try {
      setMessage("");
      const response = await customRequest.post(
        `/tiers/effectif/PM/${id}`,
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

  const addEffectifMutation = useMutation({
    mutationFn: (data: Effectif) => addEffectif(data),
    onSuccess: (data) => {
      setMessage(data.message);
      queryClient.invalidateQueries({ queryKey: ["tiers", "PM", id] });
      reset({
        year: new Date().getFullYear(),
        nb_cdi: null,
        nb_cdd: null,
        nb_int: null,
        nb_caid: null,
        nb_alt: null,
        nb_stg: null,
      });
    },
    onError: (err) => {
      setMessage(err.message);
      console.error(err);
    },
  });

  const onSubmit = (data: Effectif) => {
    addEffectifMutation.mutate(data);
  };

  return (
    <Box sx={{ width: "100%", padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        Ajout d'un nouveau effectif
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
                Année
              </Typography>
              <TextField fullWidth type="number" {...register("year")} />
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.year && <Typography>{errors.year.message}</Typography>}
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
                CDI
              </Typography>
              <TextField
                fullWidth
                min={0}
                type="number"
                {...register("nb_cdi")}
              />
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.nb_cdi && (
                <Typography>{errors.nb_cdi.message}</Typography>
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
                CDD
              </Typography>
              <TextField
                min={0}
                fullWidth
                type="number"
                {...register("nb_cdd")}
              />
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.nb_cdd && (
                <Typography>{errors.nb_cdd.message}</Typography>
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
                Intérimaire
              </Typography>
              <TextField
                fullWidth
                min={0}
                type="number"
                {...register("nb_int")}
              />
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.nb_int && (
                <Typography>{errors.nb_int.message}</Typography>
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
                Contrat aidé
              </Typography>
              <TextField
                fullWidth
                min={0}
                type="number"
                {...register("nb_caid")}
              />
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.nb_caid && (
                <Typography>{errors.nb_caid.message}</Typography>
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
                Alternant
              </Typography>
              <TextField
                fullWidth
                min={0}
                type="number"
                {...register("nb_alt")}
              />
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.nb_alt && (
                <Typography>{errors.nb_alt.message}</Typography>
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
                Stagiaire
              </Typography>
              <TextField
                fullWidth
                min={0}
                type="number"
                {...register("nb_stg")}
              />
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.nb_stg && (
                <Typography>{errors.nb_stg.message}</Typography>
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
          Ajouter l'effectif
        </Button>
        <Box sx={{ marginY: 3, display: "flex", alignItems: "center", gap: 3 }}>
          {addEffectifMutation.isSuccess && message && (
            <Typography sx={{ color: "success.main" }}>{message}</Typography>
          )}
          {addEffectifMutation.isError && message && (
            <Typography sx={{ color: "error.main" }}>{message}</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
