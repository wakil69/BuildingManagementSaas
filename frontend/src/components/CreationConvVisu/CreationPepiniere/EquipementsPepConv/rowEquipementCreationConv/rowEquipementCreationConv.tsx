import {
  Box,
  CircularProgress,
  IconButton,
  MenuItem,
  Select,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import customRequest from "../../../../../routes/api/api";
import { useQuery } from "@tanstack/react-query";
import {
  CreatePepConvention,
  EquipementAvailable,
} from "../../../../../types/convention/convention";
import DeleteIcon from "@mui/icons-material/Delete";
import { useMemo } from "react";
import {
  FieldErrors,
  UseFieldArrayRemove,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";

export default function RowEquipementCreationConv({
  index,
  errors,
  register,
  getValues,
  batimentId,
  remove,
  setValue,
  watch,
  ugs,
}: {
  index: number;
  register: UseFormRegister<CreatePepConvention>;
  setValue: UseFormSetValue<CreatePepConvention>;
  errors: FieldErrors<CreatePepConvention>;
  getValues: UseFormGetValues<CreatePepConvention>;
  batimentId: number;
  remove: UseFieldArrayRemove;
  watch: UseFormWatch<CreatePepConvention>;
  ugs?: {
    date_fin?: string | null | undefined;
    date_debut: string;
    name: string;
    ug_id: number;
    surface_rent: number;
    surface_available: number;
  }[];
}) {
  const ugId = watch(`equipements.${index}.ug_id`);
  const dateDebut = useMemo(() => {
    const dateDebut =
      ugs && ugs.length
        ? ugs.find((ug) => ug.ug_id === ugId)?.date_debut
        : "";
    return dateDebut;
  }, [ugId]);

  const dateFin = useMemo(() => {
    const dateFin =
      ugs && ugs.length
        ? ugs.find((ug) => ug.ug_id === ugId)?.date_fin
        : "";
    return dateFin;
  }, [ugId]);

  async function getEquipements(): Promise<EquipementAvailable[]> {
    try {
      const response = await customRequest.get(
        `/convention/equipements?ug_id=${ugId}&dateDebut=${dateDebut}&dateFin=${dateFin}&batiment_id=${batimentId}`
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

  const { data: equipements = [], isLoading: isLoadingEquipements } = useQuery<
    EquipementAvailable[]
  >({
    queryKey: ["equipements", index, ugId, dateDebut, dateFin, batimentId],
    queryFn: getEquipements,
    refetchOnWindowFocus: false,
    enabled: !!dateDebut && !!batimentId && !!ugId,
  });

  return (
    <TableRow key={index}>
      <TableCell align="center">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Select
            {...register(`equipements.${index}.ug_id`)}
            defaultValue={getValues(`equipements.${index}.ug_id`) || ""}
          >
            <MenuItem key="" value="">
              --------
            </MenuItem>
            {ugs && ugs.length
              ? ugs.map((local) => {
                  return (
                    <MenuItem key={local.ug_id} value={local.ug_id}>
                      {local.name}
                    </MenuItem>
                  );
                })
              : null}
          </Select>

          <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
            {errors.equipements &&
              errors.equipements[index] &&
              errors.equipements[index].ug_id && (
                <Typography>
                  {errors.equipements[index].ug_id.message}
                </Typography>
              )}
          </Box>
        </Box>
      </TableCell>
      <TableCell align="center">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Select
            {...register(`equipements.${index}.equipement_id`, {
              onChange: (e) => {
                setValue(
                  `equipements.${index}.equipement_prix`,
                  equipements.find(
                    (equipement) => equipement.equipement_id === e.target.value
                  )?.equipement_prix || 0
                );
              },
            })}
            defaultValue={getValues(`equipements.${index}.equipement_id`) || ""}
          >
            <MenuItem key="" value="">
              --------
            </MenuItem>
            {!isLoadingEquipements && equipements.length ? (
              equipements.map((equipement) => {
                return (
                  <MenuItem
                    key={equipement.equipement_id}
                    value={equipement.equipement_id}
                  >
                    {equipement.name}
                  </MenuItem>
                );
              })
            ) : isLoadingEquipements ? (
              <CircularProgress />
            ) : null}
          </Select>

          <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
            {errors.equipements &&
              errors.equipements[index] &&
              errors.equipements[index].equipement_id && (
                <Typography>
                  {errors.equipements[index].equipement_id.message}
                </Typography>
              )}
          </Box>
        </Box>
      </TableCell>
      <TableCell align="center">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <TextField
            fullWidth
            disabled={true}
            {...register(`equipements.${index}.equipement_prix`, {
              valueAsNumber: true,
            })}
          />
          <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
            {errors.equipements &&
              errors.equipements[index] &&
              errors.equipements[index].equipement_prix && (
                <Typography>
                  {errors.equipements[index].equipement_prix.message}
                </Typography>
              )}
          </Box>
        </Box>
      </TableCell>
      <TableCell align="center">
        <IconButton color="error" onClick={() => remove(index)}>
          <DeleteIcon />
        </IconButton>
        <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}></Box>
      </TableCell>
    </TableRow>
  );
}
