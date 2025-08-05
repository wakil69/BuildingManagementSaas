import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import customRequest from "../../../../routes/api/api";
import { useLegalForms } from "../../../../hooks/tiers/useLegalForms";
import AddIcon from "@mui/icons-material/Add";
import LoopIcon from "@mui/icons-material/Loop";
import { AddProjetType } from "../../../../types/tiers/tiers";

type FieldName = keyof Yup.InferType<typeof validationSchemaAddProjet>;

const validationSchemaAddProjet = Yup.object().shape({
  activite_prj: Yup.string().required("L'intitulé est requis."),
  raison_social_prj: Yup.string().nullable(),
  date_debut_prj: Yup.string().nullable(),
  nb_dirigeants_prj: Yup.number()
    .transform((value, originalValue) =>
      originalValue == null ||
      (typeof originalValue === "string" && originalValue.trim() === "")
        ? undefined
        : value
    )
    .typeError("Veuillez entrer un nombre.")
    .min(0, "La valeur doit être positive.")
    .nullable()
    .optional(),
  effectif_prj: Yup.number()
    .transform((value, originalValue) =>
      originalValue == null ||
      (typeof originalValue === "string" && originalValue.trim() === "")
        ? undefined
        : value
    )
    .typeError("Veuillez entrer un nombre.")
    .min(0, "La valeur doit être positive.")
    .nullable()
    .optional(),
  legal_form_id: Yup.number()
    .transform((value, originalValue) =>
      originalValue == null ||
      (typeof originalValue === "string" && originalValue.trim() === "")
        ? undefined
        : value
    )
    .typeError("Veuillez entrer un nombre.")
    .nullable()
    .optional(),
});

export default function AddProjet({ id }: { id?: string }) {
  const [message, setMessage] = useState("");
  const { legalForms, isLoadingLegalForms } = useLegalForms();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaAddProjet),
  });

  const addProjet = async (data: AddProjetType) => {
    try {
      setMessage("");
      const response = await customRequest.post(`/tiers/projet/PP/${id}`, data);

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

  const addProjetMutation = useMutation({
    mutationFn: (data: AddProjetType) => addProjet(data),
    onSuccess: (data) => {
      setMessage(data.message);
      queryClient.invalidateQueries({ queryKey: ["tiers", "PP", id] });
      reset({
        activite_prj: "",
        raison_social_prj: "",
        date_debut_prj: "",
        nb_dirigeants_prj: null,
        effectif_prj: null,
        legal_form_id: null,
      });
      setTimeout(() => {
        setMessage("");
      }, 3000);
    },
    onError: (err) => {
      setMessage(err.message);
      console.error(err);
    },
  });

  const onSubmit = (data: AddProjetType) => {
    addProjetMutation.mutate(data);
  };

  const setUpperCase = (
    name: FieldName,
    event:
      | SelectChangeEvent<string>
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setValue(name, value.toUpperCase() || undefined);
  };

  return (
    <Box sx={{ width: "100%", padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        Ajout d'un nouveau projet
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
                Dénomination entreprise
              </Typography>
              <TextField
                fullWidth
                {...register("raison_social_prj", {
                  onChange: (e) => setUpperCase("raison_social_prj", e),
                })}
                id="raison_social_prj"
                name="raison_social_prj"
              />
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.raison_social_prj && (
                <Typography>{errors.raison_social_prj.message}</Typography>
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
                Activité*
              </Typography>
              <TextField
                fullWidth
                {...register("activite_prj", {
                  onChange: (e) => setUpperCase("activite_prj", e),
                })}
                id="activite_prj"
                name="activite_prj"
              />
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.activite_prj && (
                <Typography>{errors.activite_prj.message}</Typography>
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
                Statut juridique
              </Typography>
              {!isLoadingLegalForms && legalForms.length ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <FormControl fullWidth>
                    <Select {...register("legal_form_id")} defaultValue={""}>
                      <MenuItem key="" value="">
                        -------
                      </MenuItem>
                      {legalForms.map((data) => (
                        <MenuItem
                          key={data.legal_form_id}
                          value={data.legal_form_id}
                        >
                          {data.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <IconButton
                    aria-label="edit"
                    onClick={() =>
                      window.open(
                        "/pageConnecte/administration/reglages#legal-forms",
                        "_blank"
                      )
                    }
                  >
                    <AddIcon fontSize="large" />
                  </IconButton>
                  <IconButton
                    aria-label="edit"
                    onClick={() =>
                      queryClient.invalidateQueries({
                        queryKey: ["legal_forms"],
                      })
                    }
                  >
                    <LoopIcon fontSize="large" />
                  </IconButton>
                </Box>
              ) : null}
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.legal_form_id && (
                <Typography>{errors.legal_form_id.message}</Typography>
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
                Date de création
              </Typography>
              <TextField
                fullWidth
                type="date"
                {...register("date_debut_prj")}
              />
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.date_debut_prj && (
                <Typography>{errors.date_debut_prj.message}</Typography>
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
                Nombre de dirigeants
              </Typography>
              <TextField
                fullWidth
                type="number"
                min={0}
                {...register("nb_dirigeants_prj")}
              />
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.nb_dirigeants_prj && (
                <Typography>{errors.nb_dirigeants_prj.message}</Typography>
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
                Effectif prévisionnel
              </Typography>
              <TextField
                fullWidth
                type="number"
                min={0}
                {...register("effectif_prj")}
              />
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.effectif_prj && (
                <Typography>{errors.effectif_prj.message}</Typography>
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
          onClick={() => handleSubmit(onSubmit)()}
        >
          Ajouter le projet
        </Button>
        <Box sx={{ marginY: 3, display: "flex", alignItems: "center", gap: 3 }}>
          {addProjetMutation.isSuccess && message && (
            <Typography sx={{ color: "success.main" }}>{message}</Typography>
          )}
          {addProjetMutation.isError && message && (
            <Typography sx={{ color: "error.main" }}>{message}</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
