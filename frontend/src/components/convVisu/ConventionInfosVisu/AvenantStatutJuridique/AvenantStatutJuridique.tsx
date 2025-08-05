import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  Select,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import customRequest from "../../../../routes/api/api";
import { useLegalForms } from "../../../../hooks/tiers/useLegalForms";
import { useNavigate } from "react-router-dom";

const validationSchemaStatutJur = Yup.object().shape({
  legal_form_id: Yup.number()
    .transform((value, originalValue) =>
      originalValue == null ||
      (typeof originalValue === "string" && originalValue.trim() === "")
        ? undefined
        : value
    )
    .typeError("Veuillez choisir le type de la relation.")
    .required("Le statut juridique est requis."),
});

export default function AddAvenantStatutJuridique({
  convId,
  version,
  legalFormId,
}: {
  convId?: string;
  version?: string;
  legalFormId?: number | null;
}) {
  const [message, setMessage] = useState("");
  const { legalForms, isLoadingLegalForms } = useLegalForms();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaStatutJur),
  });

  const addAvenantStatutJur = async (data: { legal_form_id: number }) => {
    try {
      setMessage("");
      const response = await customRequest.post(
        `/convention/avenant-statut-juridique/${convId}/${version}`,
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

  const addAvenantStatutJurMutation = useMutation({
    mutationFn: (data: { legal_form_id: number }) => addAvenantStatutJur(data),
    onSuccess: async (data) => {
      setMessage(data.message);
      await queryClient.invalidateQueries({
        queryKey: ["convention", convId, version],
      });
      await queryClient.invalidateQueries({
        queryKey: ["checks", "convention", convId],
      });
      reset({
        legal_form_id: undefined,
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

  const onSubmit = (data: { legal_form_id: number }) => {
    addAvenantStatutJurMutation.mutate(data);
  };

  return (
    <Box sx={{ width: "100%", padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        Ajout d'un avenant statut juridique
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
                Statut Juridique*
              </Typography>
              {!isLoadingLegalForms && legalForms.length ? (
                <Select {...register("legal_form_id")} defaultValue={""}>
                  <MenuItem key="" value="">
                    ----------------
                  </MenuItem>
                  {legalForms
                    .filter(
                      (legalForm) => legalForm.legal_form_id !== legalFormId
                    )
                    .map((data) => (
                      <MenuItem
                        key={data.legal_form_id}
                        value={data.legal_form_id}
                      >
                        {data.name}
                      </MenuItem>
                    ))}
                </Select>
              ) : (
                <CircularProgress />
              )}
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.legal_form_id && (
                <Typography>{errors.legal_form_id.message}</Typography>
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
          disabled={addAvenantStatutJurMutation.isPending}
          onClick={() => handleSubmit(onSubmit)()}
        >
          Ajouter l'avenant
        </Button>
        <Box sx={{ marginY: 3, display: "flex", alignItems: "center", gap: 3 }}>
          {addAvenantStatutJurMutation.isSuccess && message && (
            <Typography sx={{ color: "success.main" }}>{message}</Typography>
          )}
          {addAvenantStatutJurMutation.isError && message && (
            <Typography sx={{ color: "error.main" }}>{message}</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
