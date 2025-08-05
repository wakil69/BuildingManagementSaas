import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import customRequest from "../../../../routes/api/api";
import { useSecteursActivites } from "../../../../hooks/tiers/useSecteursActivites";

export default function AddSecteurActivite() {
  const [message, setMessage] = useState("");
  const { secteursActivites , isLoadingSecteursActivites } = useSecteursActivites();
  const queryClient = useQueryClient();

  const validationSchemaSecteurActivite = Yup.object().shape({
    name: Yup.string()
      .required("Le secteur d'activité est requis.")
      .test("unique-name", "Le secteur d'activité existe déjà.", (value) => {
        if (!value || !secteursActivites) return true;
        return !secteursActivites.some(
          (form) =>
            form.name.toLowerCase().trim() === value.toLowerCase().trim()
        );
      }),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaSecteurActivite),
    defaultValues: {
      name: "",
    },
  });

  const addSecteurActivite = async (data: { name: string }) => {
    try {
      setMessage("");
      const response = await customRequest.post(
        `/admin/secteurs-activites`,
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

  const addSecteurActiviteMutation = useMutation({
    mutationFn: (data: { name: string }) => addSecteurActivite(data),
    onSuccess: (data) => {
      setMessage(data.message);
      queryClient.invalidateQueries({ queryKey: ["secteurs_activites"] });
      reset({
        name: "",
      });
    },
    onError: (err) => {
      setMessage(err.message);
      console.error(err);
    },
  });

  const onSubmit = (data: { name: string }) => {
    addSecteurActiviteMutation.mutate(data);
  };

  return (
    <Box sx={{ width: "100%", padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        Ajout d'un secteur d'activité
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
                Nom*
              </Typography>
              {!isLoadingSecteursActivites ? (
                <TextField fullWidth {...register("name")} />
              ) : null}
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.name && <Typography>{errors.name.message}</Typography>}
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
          disabled={addSecteurActiviteMutation.isPending}
          onClick={() => handleSubmit(onSubmit)()}
        >
          Ajouter
        </Button>
        <Box sx={{ marginY: 3, display: "flex", alignItems: "center", gap: 3 }}>
          {addSecteurActiviteMutation.isSuccess && message && (
            <Typography sx={{ color: "success.main" }}>{message}</Typography>
          )}
          {addSecteurActiviteMutation.isError && message && (
            <Typography sx={{ color: "error.main" }}>{message}</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
