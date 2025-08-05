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
import { ChiffreAffaire, Effectif } from "../../../../types/tiers/tiers";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";

const validationSchemaCAEdit = Yup.object().shape({
  year: Yup.number().required("La formule est requise."),
  ca: Yup.number().required("Le chiffre d'affaires est requis."),
});

export default function OverlayEditCA({
  setIsOpen,
  ca,
  id,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<number | null>>;
  ca: ChiffreAffaire;
  id?: string;
}) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaCAEdit),
    defaultValues: ca,
  });

  const editCA = async (data: Effectif) => {
    try {
      setMessage("");

      const response = await customRequest.put(`/tiers/ca/PM/${id}`, data);

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

  const editCAMutation = useMutation({
    mutationFn: (data: ChiffreAffaire) => editCA(data),
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

  const onSubmit = (data: ChiffreAffaire) => {
    editCAMutation.mutate(data);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" id="modal-title" gutterBottom>
          Editer le chiffre d'affaires
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
                  Chiffre d'affaires
                </Typography>
                <TextField
                  min={0}
                  fullWidth
                  type="number"
                  {...register("ca")}
                />
              </Box>
              <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                {errors.ca && <Typography>{errors.ca.message}</Typography>}
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
          {editCAMutation.isSuccess && message && (
            <Typography sx={{ color: "success.main" }}>{message}</Typography>
          )}
          {editCAMutation.isError && message && (
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
