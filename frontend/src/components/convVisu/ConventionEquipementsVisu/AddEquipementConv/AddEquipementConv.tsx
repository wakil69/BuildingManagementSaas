import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import {
  ConventionUG,
  EquipementAvailable,
} from "../../../../types/convention/convention";

export default function AddEquipementConv({
  convId,
  version,
  ugs,
}: {
  convId?: string;
  version?: string;
  ugs: ConventionUG[];
}) {
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();

  const validationSchemaAddEquipement = Yup.object().shape({
    equipement_id: Yup.number()
      .transform((value, originalValue) =>
        originalValue == null ||
        (typeof originalValue === "string" && originalValue.trim() === "")
          ? undefined
          : value
      )
      .typeError("Veuillez entrer un nombre.")
      .required("L'équipement est requis."),
    ug_id: Yup.number()
      .transform((value, originalValue) =>
        originalValue == null ||
        (typeof originalValue === "string" && originalValue.trim() === "")
          ? undefined
          : value
      )
      .typeError("Veuillez entrer un nombre.")
      .required("Le local est requis."),
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaAddEquipement),
  });

  const ugId = watch("ug_id");

  async function getEquipementsAvailable(): Promise<EquipementAvailable[]> {
    try {
      const response = await customRequest.get(
        `/convention/equipements?ug_id=${ugId}&dateDebut=${
          ugs.find((ug) => ug.ug_id === ugId)?.date_debut
        }&dateFin=${ugs.find((ug) => ug.ug_id === ugId)?.date_fin}`
      );

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  const {
    data: equipementsAvailable = [],
    isLoading: isLoadingEquipementsAvailable,
  } = useQuery<EquipementAvailable[]>({
    queryKey: ["equipements", ugId],
    queryFn: getEquipementsAvailable,
    refetchOnWindowFocus: false,
    enabled: !!ugId,
  });

  const addEquipement = async (data: {
    equipement_id: number;
    ug_id: number;
  }) => {
    try {
      setMessage("");
      const response = await customRequest.post(
        `/convention/equipement/${convId}/${version}`,
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

  const addEquipementMutation = useMutation({
    mutationFn: (data: { equipement_id: number; ug_id: number }) =>
      addEquipement(data),
    onSuccess: async (data) => {
      setMessage(data.message);
      await queryClient.invalidateQueries({
        queryKey: ["convention", convId, version],
      });
      reset({
        equipement_id: undefined,
      });
      setTimeout(() => {
        setMessage("");
      }, 2000);
    },
    onError: (err) => {
      setMessage(err.message);
      console.error(err);
    },
  });

  const onSubmit = (data: { equipement_id: number; ug_id: number }) => {
    addEquipementMutation.mutate(data);
  };

  return (
    <Box sx={{ width: "100%", padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        Ajout d'un équipement
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
              <Typography sx={{ fontWeight: "bold" }}>Local*</Typography>
              <Select {...register("ug_id")} defaultValue={""}>
                <MenuItem key="" value="">
                  ----------------
                </MenuItem>
                {ugs.map((ug) => (
                  <MenuItem key={ug.ug_id} value={ug.ug_id}>
                    {ug.name}
                  </MenuItem>
                ))}
              </Select>
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.ug_id && <Typography>{errors.ug_id.message}</Typography>}
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
              <Typography sx={{ fontWeight: "bold" }}>Equipement*</Typography>
              {!isLoadingEquipementsAvailable && equipementsAvailable.length ? (
                <Select {...register("equipement_id")} defaultValue={""}>
                  <MenuItem key="" value="">
                    ----------------
                  </MenuItem>
                  {equipementsAvailable.map((equipement) => (
                    <MenuItem
                      key={equipement.equipement_id}
                      value={equipement.equipement_id}
                    >
                      {equipement.name}
                    </MenuItem>
                  ))}
                </Select>
              ) : isLoadingEquipementsAvailable ? (
                <CircularProgress />
              ) : <Typography>Aucun équipement n'est disponible pour ce local.</Typography>}
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.equipement_id && (
                <Typography>{errors.equipement_id.message}</Typography>
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
          disabled={addEquipementMutation.isPending}
          onClick={() => handleSubmit(onSubmit)()}
        >
          Ajouter l'équipement
        </Button>
        <Box sx={{ marginY: 3, display: "flex", alignItems: "center", gap: 3 }}>
          {addEquipementMutation.isSuccess && message && (
            <Typography sx={{ color: "success.main" }}>{message}</Typography>
          )}
          {addEquipementMutation.isError && message && (
            <Typography sx={{ color: "error.main" }}>{message}</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
