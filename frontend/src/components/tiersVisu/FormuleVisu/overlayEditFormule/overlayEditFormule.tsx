import { useState } from "react";
import {
  Card,
  CardContent,
  Box,
  Button,
  Typography,
  TextField,
  MenuItem,
  FormControl,
  Select,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import customRequest from "../../../../routes/api/api";
import {
  EditFormuleType,
  FormulePM,
  FormulePP,
} from "../../../../types/tiers/tiers";
import { useFormulesTypes } from "../../../../hooks/tiers/useFormules";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";

const validationSchemaFormuleEdit = Yup.object().shape({
  formule_id: Yup.number().required("La formule est requise."),
  date_debut_formule: Yup.string().required("La date de début est requise."),
  date_fin_formule: Yup.string().nullable(),
});

export default function OverlayEditFormule({
  setIsOpen,
  formule,
  qualite,
  id,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<number | null>>;
  formule: FormulePP | FormulePM;
  qualite?: "PP" | "PM";
  id?: string;
}) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const { formulesTypes, isLoadingFormulesTypes } = useFormulesTypes();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaFormuleEdit),
    defaultValues: {
      formule_id: formule.formule_id,
      date_debut_formule: formule.date_debut_formule,
      date_fin_formule: formule.date_fin_formule,
    },
  });

  const editFormule = async (data: EditFormuleType) => {
    try {
      setMessage("");

      const formuleId =
        "form_pp_id" in formule
          ? formule.form_pp_id
          : "form_pm_id" in formule
          ? formule.form_pm_id
          : null;

      if (!formuleId) {
        throw new Error(`Erreur: Vous n'avez pas sélectionné la formule.`);
      }

      const response = await customRequest.put(
        `/tiers/formule/${qualite}/${id}/${formuleId}`,
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

  const editFormuleMutation = useMutation({
    mutationFn: (data: EditFormuleType) => editFormule(data),
    onSuccess: async (data) => {
      setMessage(data.message);
      await queryClient.invalidateQueries({
        queryKey: ["tiers", qualite, id],
      });
      setIsOpen(null);
    },
    onError: (err) => {
      setMessage(err.message);
      console.error(err);
    },
  });

  const onSubmit = (data: EditFormuleType) => {
    editFormuleMutation.mutate(data);
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
                <Typography sx={{ fontWeight: "bold" }}>Formule*</Typography>
                {!isLoadingFormulesTypes && formulesTypes.length ? (
                  <FormControl fullWidth>
                    <Select
                      {...register("formule_id")}
                      name="batiment"
                      id="batiment"
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
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 2,
            mt: 3,
          }}
        >
          {editFormuleMutation.isSuccess && message && (
            <Typography sx={{ color: "success.main" }}>{message}</Typography>
          )}
          {editFormuleMutation.isError && message && (
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
