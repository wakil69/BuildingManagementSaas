import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import customRequest from "../../../../routes/api/api";
import { usePrescriber } from "../../../../hooks/tiers/usePrescriber";

export default function AddPrescriber() {
  const [message, setMessage] = useState("");
  const { prescribers, isLoadingPrescriber } = usePrescriber();
  const queryClient = useQueryClient();

  const validationSchemaPrescriber = Yup.object().shape({
    name: Yup.string()
      .required("Le prescripteur est requis.")
      .test("unique-name", "Le prescripteur existe déjà.", (value) => {
        if (!value || !prescribers) return true;
        return !prescribers.some(
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
    resolver: yupResolver(validationSchemaPrescriber),
    defaultValues: {
      name: "",
    },
  });

  const addPrescriber = async (data: { name: string }) => {
    try {
      setMessage("");
      const response = await customRequest.post(`/admin/prescribers`, data);

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

  const addPrescriberMutation = useMutation({
    mutationFn: (data: { name: string }) => addPrescriber(data),
    onSuccess: (data) => {
      setMessage(data.message);
      queryClient.invalidateQueries({ queryKey: ["prescribers"] });
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
    addPrescriberMutation.mutate(data);
  };

  return (
    <Box sx={{ width: "100%", padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        Ajout d'un prescripteur
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
              {!isLoadingPrescriber ? (
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
          disabled={addPrescriberMutation.isPending}
          onClick={() => handleSubmit(onSubmit)()}
        >
          Ajouter un prescripteur
        </Button>
        <Box sx={{ marginY: 3, display: "flex", alignItems: "center", gap: 3 }}>
          {addPrescriberMutation.isSuccess && message && (
            <Typography sx={{ color: "success.main" }}>{message}</Typography>
          )}
          {addPrescriberMutation.isError && message && (
            <Typography sx={{ color: "error.main" }}>{message}</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
