import { useState } from "react";
import {
  Card,
  CardContent,
  Box,
  Button,
  Typography,
  TextField,
  Paper,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import customRequest from "../../../../routes/api/api";
import { Effectif } from "../../../../types/tiers/tiers";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";

const validationSchemaEffectifEdit = Yup.object().shape({
  year: Yup.number().required("La formule est requise."),
  nb_cdi: Yup.number()
    .transform((value, originalValue) =>
      typeof originalValue === "string" && originalValue.trim() === ""
        ? undefined
        : value
    )
    .typeError("Veuillez entrer un nombre.")
    .min(0, "La valeur doit être positive.")
    .nullable()
    .optional(),
  nb_cdd: Yup.number()
    .transform((value, originalValue) =>
      typeof originalValue === "string" && originalValue.trim() === ""
        ? undefined
        : value
    )
    .typeError("Veuillez entrer un nombre.")
    .min(0, "La valeur doit être positive.")
    .nullable()
    .optional(),
  nb_int: Yup.number()
    .transform((value, originalValue) =>
      typeof originalValue === "string" && originalValue.trim() === ""
        ? undefined
        : value
    )
    .typeError("Veuillez entrer un nombre.")
    .min(0, "La valeur doit être positive.")
    .nullable()
    .optional(),
  nb_caid: Yup.number()
    .transform((value, originalValue) =>
      typeof originalValue === "string" && originalValue.trim() === ""
        ? undefined
        : value
    )
    .typeError("Veuillez entrer un nombre.")
    .min(0, "La valeur doit être positive.")
    .nullable()
    .optional(),
  nb_alt: Yup.number()
    .transform((value, originalValue) =>
      typeof originalValue === "string" && originalValue.trim() === ""
        ? undefined
        : value
    )
    .typeError("Veuillez entrer un nombre.")
    .min(0, "La valeur doit être positive.")
    .nullable()
    .optional(),
  nb_stg: Yup.number()
    .transform((value, originalValue) =>
      typeof originalValue === "string" && originalValue.trim() === ""
        ? undefined
        : value
    )
    .typeError("Veuillez entrer un nombre.")
    .min(0, "La valeur doit être positive.")
    .nullable()
    .optional(),
});

export default function OverlayEditEffectif({
  setIsOpen,
  effectif,
  id,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<number | null>>;
  effectif: Effectif;
  id?: string;
}) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaEffectifEdit),
    defaultValues: effectif,
  });

  const editEffectif = async (data: Effectif) => {
    try {
      setMessage("");

      const response = await customRequest.put(
        `/tiers/effectif/PM/${id}`,
        data
      );

      if (response.status !== 200) {
        throw new Error(`Erreur: ${response.status} ${response.statusText}`);
      }

      return response.data;
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        throw new Error(err.response.data.message);
      } else {
        throw new Error("Une erreur est survenue. Veuillez réessayer.");
      }
    }
  };

  const editEffectifMutation = useMutation({
    mutationFn: (data: Effectif) => editEffectif(data),
    onSuccess: async (data) => {
      setMessage(data.message);
      await queryClient.invalidateQueries({
        queryKey: ["tiers", "PM", id],
      });
      setIsOpen(null);
    },
    onError: (err) => {
      setMessage(err.message);
      console.error(err);
    },
  });

  const onSubmit = (data: Effectif) => {
    editEffectifMutation.mutate(data);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" id="modal-title" gutterBottom>
          Editer la formule
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
                <TextField
                  fullWidth
                  type="number"
                  disabled={true}
                  min={0}
                  {...register("year")}
                />
              </Box>
              <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}></Box>
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
                  min={0}
                  fullWidth
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
                <TextField fullWidth type="number" {...register("nb_cdd")} />
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
                  min={0}
                  fullWidth
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
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 2,
            mt: 3,
          }}
        >
          {editEffectifMutation.isSuccess && message && (
            <Typography sx={{ color: "success.main" }}>{message}</Typography>
          )}
          {editEffectifMutation.isError && message && (
            <Typography sx={{ color: "error.main" }}>{message}</Typography>
          )}
          <Button
            onClick={() => setIsOpen(null)}
            color="secondary"
            variant="outlined"
          >
            Annuler
          </Button>
          <Button
            onClick={() => handleSubmit(onSubmit)()}
            color="primary"
            variant="contained"
          >
            Editer
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
