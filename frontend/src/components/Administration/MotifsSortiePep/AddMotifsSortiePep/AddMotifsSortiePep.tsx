import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import customRequest from "../../../../routes/api/api";
import { useMotifSortiePep } from "../../../../hooks/tiers/useMotifSortiePep";

export default function AddMotifsSortiePep() {
  const [message, setMessage] = useState("");
  const { motifsSortiePepiniere, isLoadingMotifsSortiePepiniere } =
    useMotifSortiePep();
  const queryClient = useQueryClient();

  const validationSchemaMotifsSortiePep = Yup.object().shape({
    name: Yup.string()
      .required("Le motif est requis.")
      .test("unique-name", "Le motif existe déjà.", (value) => {
        if (!value || !motifsSortiePepiniere) return true;
        return !motifsSortiePepiniere.some(
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
    resolver: yupResolver(validationSchemaMotifsSortiePep),
    defaultValues: {
      name: "",
    },
  });

  const addMotif = async (data: { name: string }) => {
    try {
      setMessage("");
      const response = await customRequest.post(
        `/admin/motifs-sortie-pep`,
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

  const addMotifMutation = useMutation({
    mutationFn: (data: { name: string }) => addMotif(data),
    onSuccess: (data) => {
      setMessage(data.message);
      queryClient.invalidateQueries({ queryKey: ["motif_sortie_pep"] });
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
    addMotifMutation.mutate(data);
  };

  return (
    <Box sx={{ width: "100%", padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        Ajout d'un nouveau motif de sortie pépinière
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
              {!isLoadingMotifsSortiePepiniere ? (
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
          disabled={addMotifMutation.isPending}
          onClick={() => handleSubmit(onSubmit)()}
        >
          Ajouter un motif
        </Button>
        <Box sx={{ marginY: 3, display: "flex", alignItems: "center", gap: 3 }}>
          {addMotifMutation.isSuccess && message && (
            <Typography sx={{ color: "success.main" }}>{message}</Typography>
          )}
          {addMotifMutation.isError && message && (
            <Typography sx={{ color: "error.main" }}>{message}</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
