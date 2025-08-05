import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  List,
  ListItem,
  ListItemButton,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import {
  AddRelationTypePP,
  Company,
  Dirigeant,
} from "../../../../types/tiers/tiers";
import customRequest from "../../../../routes/api/api";
import { useRelationsPMPP } from "../../../../hooks/tiers/useRelations";
import { SearchCompany } from "../../../../types/types";
import { useAllPMs } from "../../../../hooks/useAllPMs/useAllPMs";
import { useDebounce } from "use-debounce";

const validationSchemaRelation = Yup.object().shape({
  tiepm_id: Yup.number().required("La personne morale est requise."),
  rel_typ_id: Yup.number()
    .transform((value, originalValue) =>
      originalValue == null ||
      (typeof originalValue && originalValue.trim() === "")
        ? undefined
        : value
    )
    .typeError("Veuillez entrer un nombre.")
    .nullable()
    .optional(),
  relation_date_debut: Yup.string().nullable(),
  relation_date_fin: Yup.string().nullable(),
});

export default function AddRelationPP({
  id,
  relations,
}: {
  id?: string;
  relations: Company[] | Dirigeant[];
}) {
  const [searchPM, setSearchPM] = useState("");
  const [debouncedSearchPM] = useDebounce(searchPM, 500);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const [message, setMessage] = useState("");
  const { relationsPMPP, isLoadingRelationsPMPP } = useRelationsPMPP();
  const { allPMs, isLoadingAllPMs } = useAllPMs(debouncedSearchPM);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaRelation),
  });

  const addRelation = async (data: AddRelationTypePP) => {
    try {
      setMessage("");
      const response = await customRequest.post(
        `/tiers/relations/PP/${id}`,
        data
      );

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      return response.data;
    } catch (err: any) {
      console.log(err);
      if (err.response && err.response.data && err.response.data.message) {
        throw new Error(err.response.data.message);
      } else {
        throw new Error("An unexpected error occurred. Please try again.");
      }
    }
  };

  const addRelationMutation = useMutation({
    mutationFn: (data: AddRelationTypePP) => addRelation(data),
    onSuccess: (data) => {
      setMessage(data.message);
      queryClient.invalidateQueries({ queryKey: ["tiers", "PP", id] });
      setTimeout(() => {
        setMessage("");
      }, 3000);
      reset({
        tiepm_id: undefined,
        rel_typ_id: null,
        relation_date_debut: "",
        relation_date_fin: "",
      });
      setSearchPM("");
    },
    onError: (err) => {
      setMessage(err.message);
      console.error(err);
    },
  });

  const onSubmit = (data: AddRelationTypePP) => {
    addRelationMutation.mutate(data);
  };

  const handleSelect = (pm: SearchCompany) => {
    setSearchPM(pm.raison_sociale);
    setValue("tiepm_id", pm.tiepm_id);
    setIsSearchActive(false);
  };

  return (
    <Box sx={{ width: "100%", padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        Ajout d'une nouvelle relation
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
              position: "relative",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <TextField
              type="text"
              value={searchPM}
              onChange={(e) => setSearchPM(e.target.value)}
              onFocus={() => setIsSearchActive(true)}
              onBlur={() => setIsSearchActive(false)}
              placeholder="Nom de la personne morale"
              variant="outlined"
              fullWidth
              sx={{
                width: "60%",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "16px",
                },
              }}
            />
            {isSearchActive && allPMs.length && searchPM.trim() ? (
              <Paper
                elevation={3}
                sx={{
                  position: "absolute",
                  bottom: "100%",
                  marginTop: 2,
                  width: "60%",
                  maxHeight: "300px",
                  overflowY: "auto",
                  zIndex: 20,
                  borderRadius: "8px",
                }}
              >
                <List>
                  {!isLoadingAllPMs &&
                    allPMs
                      .filter(
                        (pm) =>
                          !relations.some(
                            (relation) =>
                              pm.tiepm_id === (relation as Company).tiepm_id
                          )
                      )
                      .map((pm) => (
                        <ListItem
                          key={pm.tiepm_id}
                          disablePadding
                          sx={{
                            "&:hover": {
                              backgroundColor: "#f1f1f1",
                            },
                          }}
                        >
                          <ListItemButton onMouseDown={() => handleSelect(pm)}>
                            {pm.raison_sociale}
                          </ListItemButton>
                        </ListItem>
                      ))}
                </List>
              </Paper>
            ) : null}
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
                Type de la relation
              </Typography>
              {!isLoadingRelationsPMPP && relationsPMPP.length ? (
                <FormControl fullWidth>
                  <Select
                    {...register("rel_typ_id")}
                    name="rel_typ_id"
                    id="rel_typ_id"
                    defaultValue={relationsPMPP[0].rel_typ_id}
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
          Ajouter la relation
        </Button>
        <Box sx={{ marginY: 3, display: "flex", alignItems: "center", gap: 3 }}>
          {addRelationMutation.isSuccess && message && (
            <Typography sx={{ color: "success.main" }}>{message}</Typography>
          )}
          {addRelationMutation.isError && message && (
            <Typography sx={{ color: "error.main" }}>{message}</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
