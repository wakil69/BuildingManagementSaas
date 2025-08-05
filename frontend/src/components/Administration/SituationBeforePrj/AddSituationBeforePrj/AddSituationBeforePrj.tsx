import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import customRequest from "../../../../routes/api/api";
import { useSituationAvPrj } from "../../../../hooks/tiers/useSituationAvPrj";

export default function AddSituationBeforePrj() {
  const [message, setMessage] = useState("");
  const { situationAvPrj, isLoadingSituationAvPrj } = useSituationAvPrj();
  const queryClient = useQueryClient();

  const validationSchemaSituationBeforePrj = Yup.object().shape({
    name: Yup.string()
      .required("La situation est requise.")
      .test("unique-name", "La situation existe déjà.", (value) => {
        if (!value || !situationAvPrj) return true;
        return !situationAvPrj.some(
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
    resolver: yupResolver(validationSchemaSituationBeforePrj),
    defaultValues: {
      name: "",
    },
  });

  const addSituationAvPrj = async (data: { name: string }) => {
    try {
      setMessage("");
      const response = await customRequest.post(
        `/admin/situation-before-prjs`,
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

  const addSituationAvPrjMutation = useMutation({
    mutationFn: (data: { name: string }) => addSituationAvPrj(data),
    onSuccess: (data) => {
      setMessage(data.message);
      queryClient.invalidateQueries({ queryKey: ["situation_avant_projet"] });
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
    addSituationAvPrjMutation.mutate(data);
  };

  return (
    <Box sx={{ width: "100%", padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        Ajout d'une situation avant projet
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
              {!isLoadingSituationAvPrj ? (
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
          disabled={addSituationAvPrjMutation.isPending}
          onClick={() => handleSubmit(onSubmit)()}
        >
          Ajouter une situation
        </Button>
        <Box sx={{ marginY: 3, display: "flex", alignItems: "center", gap: 3 }}>
          {addSituationAvPrjMutation.isSuccess && message && (
            <Typography sx={{ color: "success.main" }}>{message}</Typography>
          )}
          {addSituationAvPrjMutation.isError && message && (
            <Typography sx={{ color: "error.main" }}>{message}</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
