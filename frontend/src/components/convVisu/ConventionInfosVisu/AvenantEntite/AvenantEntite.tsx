import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  Paper,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import customRequest from "../../../../routes/api/api";
import { useNavigate } from "react-router-dom";

export default function AddAvenantEntite({
  convId,
  version,
  raisonSociale,
}: {
  convId?: string;
  version?: string;
  raisonSociale: string;
}) {
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const validationSchemaEntite = Yup.object().shape({
    raison_sociale: Yup.string()
      .required("La raison sociale est requise.")
      .test(
        "different-from-raisonSociale",
        "La raison sociale doit être différente de la valeur actuelle.",
        function (value) {
          return value !== raisonSociale;
        }
      ),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaEntite),
  });

  const addAvenantEntite = async (data: { raison_sociale: string }) => {
    try {
      setMessage("");
      const response = await customRequest.post(
        `/convention/avenant-entite/${convId}/${version}`,
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

  const addAvenantEntiteMutation = useMutation({
    mutationFn: (data: { raison_sociale: string }) => addAvenantEntite(data),
    onSuccess: async (data) => {
      setMessage(data.message);
      await queryClient.invalidateQueries({
        queryKey: ["convention", convId, version],
      });
      await queryClient.invalidateQueries({
        queryKey: ["checks", "convention", convId],
      });
      reset({
        raison_sociale: undefined,
      });

      if (data.newVersion) {
        navigate(
          `/pageConnecte/convention/recherche/visualisation/${convId}/${data.newVersion}`
        );
      }
    },
    onError: (err) => {
      setMessage(err.message);
      console.error(err);
    },
  });

  const onSubmit = (data: { raison_sociale: string }) => {
    addAvenantEntiteMutation.mutate(data);
  };

  const setUpperCase = (
    name: "raison_sociale",
    event:
      | SelectChangeEvent<string>
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setValue(name, value.toUpperCase() || "");
  };

  return (
    <Box sx={{ width: "100%", padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        Ajout d'un avenant entité
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
              <Typography sx={{ fontWeight: "bold" }}>
                Raison sociale*
              </Typography>
              <TextField
                fullWidth
                {...register("raison_sociale", {
                  onChange: (e) => setUpperCase("raison_sociale", e),
                })}
              />
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.raison_sociale && (
                <Typography>{errors.raison_sociale.message}</Typography>
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
          disabled={addAvenantEntiteMutation.isPending}
          onClick={() => handleSubmit(onSubmit)()}
        >
          Ajouter l'avenant entité
        </Button>
        <Box sx={{ marginY: 3, display: "flex", alignItems: "center", gap: 3 }}>
          {addAvenantEntiteMutation.isSuccess && message && (
            <Typography sx={{ color: "success.main" }}>{message}</Typography>
          )}
          {addAvenantEntiteMutation.isError && message && (
            <Typography sx={{ color: "error.main" }}>{message}</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
