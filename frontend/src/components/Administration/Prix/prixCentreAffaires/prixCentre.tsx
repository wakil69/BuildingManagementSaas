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
import * as yup from "yup";
import { useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { SurfacePrixUGWithoutDates } from "../../../../types/Admin/Administration";
import customRequest from "../../../../routes/api/api";

const validationSchemaModificationCentrePrix = yup
  .object({
    prix: yup
      .array()
      .of(
        yup.object().shape({
          prix_id: yup.number().required(),
          batiment_id: yup.number().required(),
          surface: yup.number().required(),
          prix_centre_affaires: yup.number().min(0).optional(),
          prix_type: yup.string().required("Le type de prix est requis"),
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
  })
  .required();

export default function PrixCentre({
  prix,
  dateDebut,
  dateFin,
  prixType,
  batimentID,
}: {
  prix: SurfacePrixUGWithoutDates[];
  dateDebut: string;
  dateFin?: string;
  prixType: string;
  batimentID: number | null;
}) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");

  const {
    handleSubmit,
    control,
    register,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaModificationCentrePrix),
    defaultValues: {
      prix_date_debut: dateDebut,
      prix_date_fin: dateFin || undefined,
      prix,
      prix_type: prixType,
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "prix",
  });

  const prixUpdate = async (data: {
    prix: SurfacePrixUGWithoutDates[];
    prix_date_debut: string;
    prix_date_fin?: string;
    prix_type: string;
  }) => {
    try {
      setMessage("");
      const response = await customRequest.put("/admin/prix-current-ugs", data);

      if (response.status !== 200) {
        setMessage(response.data.message);
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

  const prixUpdateMutation = useMutation({
    mutationFn: (data: {
      prix: SurfacePrixUGWithoutDates[];
      prix_date_debut: string;
      prix_date_fin?: string;
      prix_type: string;
    }) => prixUpdate(data),
    onSuccess: (data) => {
      setMessage(data.message);
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
    prix: SurfacePrixUGWithoutDates[];
    prix_date_debut: string;
    prix_date_fin?: string;
    prix_type: string;
  }) => {
    prixUpdateMutation.mutate(data);
  };

  return (
    <Card>
      <CardContent>
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
              <TextField type="date" {...register("prix_date_debut")} />
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
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{ width: "25%" }}>Superficie</TableCell>
                <TableCell style={{ width: "25%" }}>Montant</TableCell>
                <TableCell style={{ width: "25%" }}></TableCell>
                <TableCell style={{ width: "25%" }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.id}>
                  <TableCell>
                    <b>{field.surface}m²</b>
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      {...register(
                        `prix.${index}.prix_centre_affaires` as const
                      )}
                      defaultValue={field.prix_centre_affaires ?? ""}
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
            flexDirection: "row",
            gap: 2,
            alignItems: "center",
            mt: 3,
          }}
        >
          <Button
            disabled={prixUpdateMutation.isPending}
            onClick={handleSubmit(onSubmit)}
            color="primary"
            variant="contained"
          >
            Sauvegarder les modifications
          </Button>
          {prixUpdateMutation.isSuccess && message && (
            <Typography sx={{ color: "success.main" }}>{message}</Typography>
          )}
          {prixUpdateMutation.isError && message && (
            <Typography sx={{ color: "error.main" }}>{message}</Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
