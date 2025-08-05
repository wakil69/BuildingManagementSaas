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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreatePepConvention,
  LocalAvailable,
} from "../../../../../types/convention/convention";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  FieldErrors,
  UseFieldArrayRemove,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";

export default function RowUgCreationConv({
  index,
  errors,
  register,
  getValues,
  batimentId,
  remove,
  setValue,
  watch,
}: {
  index: number;
  register: UseFormRegister<CreatePepConvention>;
  setValue: UseFormSetValue<CreatePepConvention>;
  errors: FieldErrors<CreatePepConvention>;
  getValues: UseFormGetValues<CreatePepConvention>;
  batimentId: number;
  remove: UseFieldArrayRemove;
  watch: UseFormWatch<CreatePepConvention>;
}) {
  const queryClient = useQueryClient();
  const ugId = watch(`ugs.${index}.ug_id`);
  const dateDebut = watch(`ugs.${index}.date_debut`);
  const dateFin = watch(`ugs.${index}.date_fin`);
  const surfaceAvailable = watch(`ugs.${index}.surface_available`);

  async function getLocaux(): Promise<LocalAvailable[]> {
    try {
      const response = await customRequest.get(
        `/convention/locaux?dateDebut=${dateDebut}&dateFin=${dateFin}&batiment_id=${batimentId}`
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

  const { data: locaux = [], isLoading: isLoadingLocaux } = useQuery<
    LocalAvailable[]
  >({
    queryKey: ["locaux", index, dateDebut, dateFin, batimentId],
    queryFn: getLocaux,
    refetchOnWindowFocus: false,
    enabled: !!dateDebut && !!batimentId,
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
          <TextField
            fullWidth
            type="date"
            {...register(`ugs.${index}.date_debut`, {
              onChange: (e: any) => {
                setValue(`ugs.${index}.date_debut`, e.target.value);
                queryClient.invalidateQueries({
                  queryKey: [
                    "locaux",
                    index,
                    e.target.value,
                    dateFin,
                    batimentId,
                  ],
                });
              },
            })}
          />
          <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
            {errors.ugs &&
              errors.ugs[index] &&
              errors.ugs[index].date_debut && (
                <Typography>{errors.ugs[index].date_debut.message}</Typography>
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
            type="date"
            {...register(`ugs.${index}.date_fin`, {
              onChange: async (e: any) => {
                setValue(`ugs.${index}.date_fin`, e.target.value);
                await queryClient.invalidateQueries({
                  queryKey: [
                    "locaux",
                    index,
                    dateDebut,
                    e.target.value,
                    batimentId,
                  ],
                });
              },
            })}
          />

          <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
            {errors.ugs && errors.ugs[index] && errors.ugs[index].date_fin && (
              <Typography>{errors.ugs[index].date_fin.message}</Typography>
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
            {...register(`ugs.${index}.ug_id`, {
              onChange: (e) => {
                setValue(`ugs.${index}.ug_id`, e.target.value);
                setValue(
                  `ugs.${index}.name`,
                  locaux.find((local) => local.ug_id === e.target.value)
                    ?.name || ""
                );
                setValue(
                  `ugs.${index}.surface_available`,
                  locaux.find((local) => local.ug_id === e.target.value)
                    ?.surface_available || 0
                );
                setValue(
                  `ugs.${index}.surface`,
                  locaux.find((local) => local.ug_id === e.target.value)
                    ?.surface || 0
                );
              },
            })}
            defaultValue={getValues(`ugs.${index}.ug_id`) || ""}
          >
            <MenuItem key="" value="">
              --------
            </MenuItem>
            {!isLoadingLocaux && locaux.length ? (
              locaux.map((local) => {
                return (
                  <MenuItem key={local.ug_id} value={local.ug_id}>
                    {local.name}
                  </MenuItem>
                );
              })
            ) : isLoadingLocaux ? (
              <CircularProgress />
            ) : null}
          </Select>

          <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
            {errors.ugs && errors.ugs[index] && errors.ugs[index].ug_id && (
              <Typography>{errors.ugs[index].ug_id.message}</Typography>
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
            {...register(`ugs.${index}.surface_available`, {
              valueAsNumber: true,
            })}
          />
          <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
            {errors.ugs &&
              errors.ugs[index] &&
              errors.ugs[index].surface_available && (
                <Typography>
                  {errors.ugs[index].surface_available.message}
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
            disabled={!ugId || !surfaceAvailable}
            min={1}
            max={
              locaux.find((local) => local.ug_id === ugId)?.surface_available
            }
            type="number"
            onInput={(e) => {
              const input = e.target as HTMLInputElement;
              const maxValue =
                locaux.find((local) => local.ug_id === ugId)
                  ?.surface_available || Infinity;
              if (Number(input.value) > maxValue) {
                input.value = String(maxValue);
              }
              const minValue = 1;
              if (Number(input.value) < minValue) {
                input.value = String(minValue);
              }
            }}
            {...register(`ugs.${index}.surface_rent`, {
              valueAsNumber: true,
            })}
          />

          <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
            {errors.ugs &&
              errors.ugs[index] &&
              errors.ugs[index].surface_rent && (
                <Typography>
                  {errors.ugs[index].surface_rent.message}
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
