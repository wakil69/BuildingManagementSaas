import { useState } from "react";
import {
  Card,
  CardContent,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Button,
  Typography,
} from "@mui/material";
import { useForm, useFieldArray } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { newSurfacePrixUG } from "../../../../types/Admin/Administration";
import customRequest from "../../../../routes/api/api";

const validationSchemaAddPepinierePrix = yup
  .object({
    prix: yup
      .array()
      .of(
        yup.object().shape({
          surface: yup.number().required(),
          prix_an_1: yup.number().min(0).optional(),
          prix_an_2: yup.number().min(0).optional(),
          prix_an_3: yup.number().min(0).optional(),
        })
      )
      .required("La liste des prix est requise"),
    prix_date_debut: yup
      .string()
      .required("La date de début est requise")
      .matches(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (aaaa-mm-jj)"),
    prix_date_fin: yup
      .string()
      .optional()
      .test(
        "is-valid-format",
        "Format de date invalide (aaaa-mm-jj)",
        (value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value)
      )
      .test(
        "is-after-start",
        "La date de fin doit être après la date de début",
        function (value) {
          const { prix_date_debut } = this.parent;
          return !value || !prix_date_debut || value > prix_date_debut;
        }
      ),
    prix_type: yup.string().required("Le type de prix est requis"),
    batiment_id: yup.number().required(),
  })
  .required();

export default function AddPrixPepiniere({
  setIsOpen,
  batimentID,
  potentialDateDebut,
  surfaces,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  batimentID: number;
  potentialDateDebut?: string;
  surfaces: number[];
}) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");

  const {
    handleSubmit,
    control,
    register,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaAddPepinierePrix),
    defaultValues: {
      prix:
        surfaces.map((surface: number) => {
          return {
            surface,
            prix_an_1: 0,
            prix_an_2: 0,
            prix_an_3: 0,
          };
        }) || [],
      prix_type: "pepiniere",
      batiment_id: batimentID,
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "prix",
  });

  const addPrix = async (data: {
    prix: newSurfacePrixUG[];
    prix_date_debut: string;
    prix_date_fin?: string;
    prix_type: string;
    batiment_id: number;
  }) => {
    try {
      setMessage("");
      const response = await customRequest.post("/admin/prix-ugs", data);
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

  const newPrixMutation = useMutation({
    mutationFn: (data: {
      prix: newSurfacePrixUG[];
      prix_date_debut: string;
      prix_date_fin?: string;
      prix_type: string;
      batiment_id: number;
    }) => addPrix(data),
    onSuccess: (data) => {
      setMessage(data.message);
      setIsOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["PrixUGs", "Admin", batimentID],
      });
    },
    onError: (err) => {
      setMessage(err.message);
      console.error(err);
    },
  });

  const onSubmit = (data: {
    prix: newSurfacePrixUG[];
    prix_date_debut: string;
    prix_date_fin?: string;
    prix_type: string;
    batiment_id: number;
  }) => {
    newPrixMutation.mutate(data);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" id="modal-title" gutterBottom>
          Ajouter un nouveau groupe de prix - Formule pépinière
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
              mb: 2,
            }}
          >
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="body2" sx={{ mr: 2 }}>
                  Date de début:
                </Typography>
                <TextField
                  min={potentialDateDebut}
                  type="date"
                  {...register("prix_date_debut")}
                />
              </Box>
              <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                {errors.prix_date_debut && (
                  <Typography>{errors.prix_date_debut.message}</Typography>
                )}
              </Box>
            </Box>
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="body2" sx={{ mr: 2 }}>
                  Date de fin:
                </Typography>
                <TextField type="date" {...register("prix_date_fin")} />
              </Box>
              <Box
                mt={1}
                p={1}
                color="red"
                borderRadius="4px"
                sx={{ minHeight: "36px" }}
              >
                {errors.prix_date_fin && (
                  <Typography>{errors.prix_date_fin.message}</Typography>
                )}
              </Box>
            </Box>
          </Box>
          <Typography color="warning">
            Note: Avant d'ajouter un nouveau groupe de prix, assurez-vous
            d'avoir défini une date de fin pour le groupe de prix actuel.
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Superficie</TableCell>
                  <TableCell>Montant Année 1</TableCell>
                  <TableCell>Montant Année 2</TableCell>
                  <TableCell>Montant Année 3</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fields.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.surface}m²</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        {...register(`prix.${index}.prix_an_1` as const)}
                        defaultValue={item.prix_an_1}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        {...register(`prix.${index}.prix_an_2` as const)}
                        defaultValue={item.prix_an_2}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        {...register(`prix.${index}.prix_an_3` as const)}
                        defaultValue={item.prix_an_3}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 2,
              mt: 3,
            }}
          >
            {newPrixMutation.isSuccess && message && (
              <Typography sx={{ color: "success.main" }}>{message}</Typography>
            )}
            {newPrixMutation.isError && message && (
              <Typography sx={{ color: "error.main" }}>{message}</Typography>
            )}
            <Button
              onClick={() => setIsOpen(false)}
              color="secondary"
              variant="outlined"
            >
              Annuler
            </Button>
            <Button type="submit" color="primary" variant="contained">
              Sauvegarder
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
