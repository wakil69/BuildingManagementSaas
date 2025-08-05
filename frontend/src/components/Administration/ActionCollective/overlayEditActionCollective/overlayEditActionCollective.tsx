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
  Company,
  Dirigeant,
  EditRelation,
} from "../../../../types/tiers/tiers";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useRelationsPMPP } from "../../../../hooks/tiers/useRelations";

const validationSchemaRelationEdit = Yup.object().shape({
  rel_typ_id: Yup.number()
    .transform((value, originalValue) =>
      originalValue == null ||
      (typeof originalValue === "string" && originalValue.trim() === "")
        ? undefined
        : value
    )
    .typeError("Veuillez entrer un nombre.")
    .nullable()
    .optional(),
  relation_date_debut: Yup.string().nullable(),
  relation_date_fin: Yup.string().nullable(),
});

export default function OverlayEditRelation({
  setIsOpen,
  relation,
  qualite,
  id,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<number | null>>;
  relation: Company | Dirigeant;
  qualite?: "PP" | "PM";
  id?: string;
}) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const { relationsPMPP, isLoadingRelationsPMPP } = useRelationsPMPP();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaRelationEdit),
    defaultValues: {
      rel_typ_id: relation.rel_typ_id,
      relation_date_debut: relation.relation_date_debut,
      relation_date_fin: relation.relation_date_fin,
    },
  });

  const editRelation = async (data: EditRelation) => {
    try {
      setMessage("");

      if (!relation.rel_id) {
        throw new Error(`Erreur: Vous n'avez pas sélectionné la formule.`);
      }

      const response = await customRequest.put(
        `/tiers/relations/${qualite}/${id}/${relation.rel_id}`,
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
    mutationFn: (data: EditRelation) => editRelation(data),
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

  const onSubmit = (data: EditRelation) => {
    editFormuleMutation.mutate(data);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" id="modal-title" gutterBottom>
          Editer la relation
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
                  {qualite === "PP" ? "Entreprise" : "Dirigeant"}
                </Typography>
                <TextField
                  fullWidth
                  value={
                    qualite === "PP"
                      ? (relation as Company).raison_sociale
                      : (relation as Dirigeant).libelle
                  }
                  disabled={true}
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
                <Typography sx={{ fontWeight: "bold" }}>
                  Type de la relation
                </Typography>
                {!isLoadingRelationsPMPP && relationsPMPP.length ? (
                  <FormControl fullWidth>
                    <Select
                      {...register("rel_typ_id")}
                      name="rel_typ_id"
                      id="rel_typ_id"
                      defaultValue={relationsPMPP[0].rel_typ_id || ""}
                    >
                      <MenuItem key="" value="">
                        ------
                      </MenuItem>
                      {relationsPMPP.map((data) => (
                        <MenuItem key={data.rel_typ_id} value={data.rel_typ_id}>
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
                {errors.rel_typ_id && (
                  <Typography>{errors.rel_typ_id.message}</Typography>
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
                  Date de début
                </Typography>
                <TextField
                  fullWidth
                  type="date"
                  {...register("relation_date_debut")}
                  id="relation_date_debut"
                  name="relation_date_debut"
                />
              </Box>
              <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                {errors.relation_date_debut && (
                  <Typography>{errors.relation_date_debut.message}</Typography>
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
                  {...register("relation_date_fin")}
                  id="relation_date_fin"
                  name="relation_date_fin"
                />
              </Box>
              <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                {errors.relation_date_fin && (
                  <Typography>{errors.relation_date_fin.message}</Typography>
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
