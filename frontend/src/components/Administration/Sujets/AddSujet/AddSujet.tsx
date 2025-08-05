import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
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
import { useSujetsAcc } from "../../../../hooks/tiers/useSujetsAcc";
import { useTypesAcc } from "../../../../hooks/tiers/useTypesAcc";

export default function AddSujet() {
  const [message, setMessage] = useState("");
  const { sujetsAcc, isLoadingSujetsAcc } = useSujetsAcc();
  const { typesAcc, isLoadingTypesAcc } = useTypesAcc();
  const queryClient = useQueryClient();

  const validationSchemaSujet = Yup.object().shape({
    name: Yup.string()
      .required("Le sujet est requis.")
      .test("unique-name", "Le sujet existe déjà.", (value) => {
        if (!value || !sujetsAcc) return true;
        return !sujetsAcc.some(
          (form) =>
            form.name.toLowerCase().trim() === value.toLowerCase().trim()
        );
      }),
    typ_accompagnement_id: Yup.number().required(
      "Le type d'accompagnement est requis."
    ),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaSujet),
    defaultValues: {
      name: "",
    },
  });

  const addPrescriber = async (data: { name: string }) => {
    try {
      setMessage("");
      const response = await customRequest.post(
        `/admin/sujets-accompagnements`,
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

  const addPrescriberMutation = useMutation({
    mutationFn: (data: { name: string }) => addPrescriber(data),
    onSuccess: (data) => {
      setMessage(data.message);
      queryClient.invalidateQueries({ queryKey: ["sujets_accompagnement"] });
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
        Ajout d'un sujet
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
                Type d'accompagnement*
              </Typography>
              {!isLoadingTypesAcc && typesAcc.length ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
                Nom*
              </Typography>
              {!isLoadingSujetsAcc ? (
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
          Ajouter un sujet
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
