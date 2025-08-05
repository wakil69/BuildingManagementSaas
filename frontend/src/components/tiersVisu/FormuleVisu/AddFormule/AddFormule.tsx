import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { AddFormuleType } from "../../../../types/tiers/tiers";
import { useFormulesTypes } from "../../../../hooks/tiers/useFormules";
import customRequest from "../../../../routes/api/api";

const validationSchemaFormule = Yup.object().shape({
  formule_id: Yup.number().required("La formule est requise."),
  date_debut_formule: Yup.string().required("La date de début est requise."),
  date_fin_formule: Yup.string().nullable(),
});

export default function AddFormule({
  qualite,
  id,
}: {
  qualite?: "PM" | "PP";
  id?: string;
}) {
  const [message, setMessage] = useState("");
  const { formulesTypes, isLoadingFormulesTypes } = useFormulesTypes();
  const queryClient = useQueryClient();
  const nowInParis = new Date().toLocaleString("en-US", {
    timeZone: "Europe/Paris",
  });
  const parisDate = new Date(nowInParis);
  const formattedDate = parisDate.toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaFormule),
    defaultValues: {
      formule_id: 1,
      date_debut_formule: formattedDate,
    },
  });

  const addFormule = async (data: AddFormuleType) => {
    try {
      setMessage("");
      console.log(qualite)
      const response = await customRequest.post(
        `/tiers/formule/${qualite}/${id}`,
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

  const addFormuleMutation = useMutation({
    mutationFn: (data: AddFormuleType) => addFormule(data),
    onSuccess: (data) => {
      setMessage(data.message);
      queryClient.invalidateQueries({ queryKey: ["tiers", qualite, id] });
      reset({
        formule_id: 1,
        date_debut_formule: formattedDate,
        date_fin_formule: null,
      });
    },
    onError: (err) => {
      setMessage(err.message);
      console.error(err);
    },
  });

  const onSubmit = (data: AddFormuleType) => {
    addFormuleMutation.mutate(data);
  };

  return (
    <Box sx={{ width: "100%", padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        Ajout d'une nouvelle formule
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
              <Typography sx={{ fontWeight: "bold" }}>Formule*</Typography>
              {!isLoadingFormulesTypes && formulesTypes.length ? (
                <FormControl fullWidth>
                  <Select
                    {...register("formule_id")}
                    name="formule_id"
                    id="formule_id"
                    defaultValue={formulesTypes[0].formule_id}
                  >
                    {formulesTypes.map((data) => (
                      <MenuItem key={data.formule_id} value={data.formule_id}>
                        {data.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <CircularProgress />
              )}
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.formule_id && (
                <Typography>{errors.formule_id.message}</Typography>
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
                Date de début*
              </Typography>
              <TextField
                fullWidth
                type="date"
                {...register("date_debut_formule")}
                id="date_debut_formule"
                name="date_debut_formule"
              />
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.date_debut_formule && (
                <Typography>{errors.date_debut_formule.message}</Typography>
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
                Date de fin
              </Typography>
              <TextField
                fullWidth
                type="date"
                {...register("date_fin_formule")}
                id="date_fin_formule"
                name="date_fin_formule"
              />
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.date_fin_formule && (
                <Typography>{errors.date_fin_formule.message}</Typography>
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
          disabled={addFormuleMutation.isPending}
          onClick={() => handleSubmit(onSubmit)()}
        >
          Ajouter la formule
        </Button>
        <Box sx={{ marginY: 3, display: "flex", alignItems: "center", gap: 3 }}>
          {addFormuleMutation.isSuccess && message && (
            <Typography sx={{ color: "success.main" }}>{message}</Typography>
          )}
          {addFormuleMutation.isError && message && (
            <Typography sx={{ color: "error.main" }}>{message}</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
