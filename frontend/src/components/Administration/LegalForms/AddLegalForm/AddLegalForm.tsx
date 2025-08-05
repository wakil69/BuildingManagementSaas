import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import customRequest from "../../../../routes/api/api";
import { useLegalForms } from "../../../../hooks/tiers/useLegalForms";

export default function AddLegalForm() {
  const [message, setMessage] = useState("");
  const { legalForms, isLoadingLegalForms } = useLegalForms();
  const queryClient = useQueryClient();

  const validationSchemaLegalForm = Yup.object().shape({
    name: Yup.string()
      .required("Le statut juridique est requis.")
      .test("unique-name", "Le statut juridique existe déjà.", (value) => {
        if (!value || !legalForms) return true;
        return !legalForms.some(
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
    resolver: yupResolver(validationSchemaLegalForm),
    defaultValues: {
      name: "",
    },
  });

  const addLegalForm = async (data: { name: string }) => {
    try {
      setMessage("");
      const response = await customRequest.post(`/admin/legal-forms`, data);

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

  const addLegalFormMutation = useMutation({
    mutationFn: (data: { name: string }) => addLegalForm(data),
    onSuccess: (data) => {
      setMessage(data.message);
      queryClient.invalidateQueries({ queryKey: ["legal_forms"] });
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
    addLegalFormMutation.mutate(data);
  };

  return (
    <Box sx={{ width: "100%", padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        Ajout d'un nouveau statut juridique
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
              {!isLoadingLegalForms ? (
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
          disabled={addLegalFormMutation.isPending}
          onClick={() => handleSubmit(onSubmit)()}
        >
          Ajouter le statut juridique
        </Button>
        <Box sx={{ marginY: 3, display: "flex", alignItems: "center", gap: 3 }}>
          {addLegalFormMutation.isSuccess && message && (
            <Typography sx={{ color: "success.main" }}>{message}</Typography>
          )}
          {addLegalFormMutation.isError && message && (
            <Typography sx={{ color: "error.main" }}>{message}</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
