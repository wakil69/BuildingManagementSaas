import countryList from "react-select-country-list";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
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
import { useNavigate } from "react-router-dom";
import { CreationUg, Etage } from "../../types/ugs/ugs";
import { Batiment } from "../../types/Admin/Administration";
import customRequest from "../../routes/api/api";
import { useUgType } from "../../hooks/ugs/useUgType";

type FieldName =
  | "name"
  | "nature_ug_id"
  | "batiment_id"
  | "num_voie"
  | "typ_voie"
  | "int_voie"
  | "complement_voie"
  | "code_postal"
  | "commune"
  | "cedex"
  | "pays"
  | "surface"
  | "etage_id"
  | "date_construction"
  | "date_entree";

const validationSchemaCreationUg = Yup.object().shape({
  batiment_id: Yup.number().required("Le bâtiment est requis."),
  nature_ug_id: Yup.number().required("La nature est requise."),
  name: Yup.string().required("L'intitulé est requis."),
  etage_id: Yup.number().required("L'étage est requis."),
  surface: Yup.number()
    .transform((value, originalValue) =>
      typeof originalValue === "string" && originalValue.trim() === ""
        ? undefined
        : value
    )
    .typeError("La valeur doit être un nombre")
    .min(0, "La valeur doit être postive.")
    .nullable()
    .optional()
    .typeError("La surface est requise."),
  date_construction: Yup.string().nullable(),
  date_entree: Yup.string().nullable(),
  num_voie: Yup.string().required("Le type de voie est requis."),
  typ_voie: Yup.string().required("Le type de voie est requis."),
  int_voie: Yup.string().required("L'intitulé de la voie est requis."),
  complement_voie: Yup.string().nullable(),
  code_postal: Yup.string().required("Le code postal est requis."),
  commune: Yup.string().required("La commune est requise."),
  cedex: Yup.string().nullable(),
  pays: Yup.string().required("Le pays est requis."),
});

export default function CreationUgSeul() {
  const [batimentChoice, setBatimentChoice] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const pays = useMemo(() => countryList().getData(), []);
  const { natureUgs, isLoadingNatureUgs } = useUgType();

  async function getBatiments(): Promise<Batiment[]> {
    try {
      const response = await customRequest.get("/admin/batiments");

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      setBatimentChoice(response.data[0].batiment_id);

      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  const { data: batiments = [], isLoading: isLoadingBatiments } = useQuery<
    Batiment[]
  >({
    queryKey: ["Batiments"],
    queryFn: getBatiments,
    refetchOnWindowFocus: false,
  });

  async function getEtages(): Promise<Etage[]> {
    try {
      const response = await customRequest.get("/admin/etages", {
        params: { batiment_id: batimentChoice },
      });

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  const { data: etages = [], isLoading: isLoadingEtages } = useQuery<Etage[]>({
    queryKey: ["Etages", batimentChoice],
    queryFn: getEtages,
    refetchOnWindowFocus: false,
    enabled: !!batimentChoice,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaCreationUg),
  });

  const createUg = async (data: CreationUg) => {
    try {
      setMessage("");
      const response = await customRequest.post(`/ug/`, data);

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

  const createUgMutation = useMutation({
    mutationFn: (data: CreationUg) => createUg(data),
    onSuccess: (data) => {
      setMessage(data.message);
      navigate(`/pageConnecte/patrimoine/recherche/visualisation/${data.ugId}`);
    },
    onError: (err) => {
      setMessage(err.message);
      console.error(err);
    },
  });

  const onSubmit = (data: CreationUg) => {
    createUgMutation.mutate(data);
  };

  const setUpperCase = (
    name: FieldName,
    event:
      | SelectChangeEvent<string>
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setValue(name, value.toUpperCase() || null);
  };

  return (
    <Box sx={{ width: "100%", padding: 4 }}>
      <Typography variant="h5" gutterBottom>
        Création d'une unité de gestion
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
              <Typography sx={{ fontWeight: "bold" }}>Bâtiment</Typography>
              {!isLoadingBatiments && batiments.length ? (
                <FormControl fullWidth>
                  <Select
                    {...register("batiment_id", {
                      onChange: (e) => {
                        setBatimentChoice(e.target.value);
                        setValue("batiment_id", e.target.value);
                      },
                    })}
                    name="batiment"
                    id="batiment"
                    defaultValue={batiments[0].batiment_id}
                  >
                    {batiments.map((data) => (
                      <MenuItem key={data.batiment_id} value={data.batiment_id}>
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
              {errors.batiment_id && (
                <Typography>{errors.batiment_id.message}</Typography>
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
              <Typography sx={{ fontWeight: "bold" }}>Nature</Typography>
              {!isLoadingNatureUgs && natureUgs.length ? (
                <FormControl fullWidth>
                  <Select
                    {...register("nature_ug_id")}
                    name="nature"
                    id="nature"
                    defaultValue={natureUgs[0].nature_ug_id}
                  >
                    {natureUgs.map((data) => (
                      <MenuItem
                        key={data.nature_ug_id}
                        value={data.nature_ug_id}
                      >
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
              {errors.nature_ug_id && (
                <Typography>{errors.nature_ug_id.message}</Typography>
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
              <Typography sx={{ fontWeight: "bold" }}>Intitulé</Typography>
              <TextField
                fullWidth
                {...register("name", {
                  onChange: (e) => setUpperCase("name", e),
                })}
                id="name"
                name="name"
              />
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.name && <Typography>{errors.name.message}</Typography>}
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
              <Typography sx={{ fontWeight: "bold" }}>Étage</Typography>
              {!isLoadingEtages && etages.length ? (
                <FormControl fullWidth>
                  <Select
                    {...register("etage_id")}
                    name="etage_id"
                    id="etage_id"
                    defaultValue={etages[0].etage_id}
                  >
                    {etages.map((etage: Etage) => (
                      <MenuItem key={etage.etage_id} value={etage.etage_id}>
                        {etage.num_etage}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <CircularProgress />
              )}
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.etage_id && (
                <Typography>{errors.etage_id.message}</Typography>
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
                Surface (m²)
              </Typography>
              <TextField
                fullWidth
                type="number"
                {...register("surface")}
                id="surface"
                name="surface"
              />
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.surface && (
                <Typography>{errors.surface.message}</Typography>
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
                Date de construction
              </Typography>
              <TextField
                fullWidth
                type="date"
                {...register("date_construction")}
                id="date_construction"
                name="date_construction"
              />
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.date_construction && (
                <Typography>{errors.date_construction.message}</Typography>
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
                Date d'entrée
              </Typography>
              <TextField
                fullWidth
                type="date"
                {...register("date_entree")}
                id="date_entree"
                name="date_entree"
              />
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.date_entree && (
                <Typography>{errors.date_entree.message}</Typography>
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
                N° Voie
              </Typography>
              <TextField
                fullWidth
                {...register("num_voie")}
                id="num_voie"
                name="num_voie"
              />
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.num_voie && (
                <Typography>{errors.num_voie.message}</Typography>
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
                Type Voie
              </Typography>
              <TextField
                fullWidth
                {...register("typ_voie", {
                  onChange: (e) => setUpperCase("typ_voie", e),
                })}
                id="typ_voie"
                name="typ_voie"
              />
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.typ_voie && (
                <Typography>{errors.typ_voie.message}</Typography>
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
                Intitulé Voie
              </Typography>
              <TextField
                fullWidth
                {...register("int_voie", {
                  onChange: (e) => setUpperCase("int_voie", e),
                })}
                id="int_voie"
                name="int_voie"
              />
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.int_voie && (
                <Typography>{errors.int_voie.message}</Typography>
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
                Complément Voie
              </Typography>
              <TextField
                fullWidth
                {...register("complement_voie", {
                  onChange: (e) => setUpperCase("complement_voie", e),
                })}
                id="complement_voie"
                name="complement_voie"
              />
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.complement_voie && (
                <Typography>{errors.complement_voie.message}</Typography>
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
                Code postal
              </Typography>
              <TextField
                fullWidth
                {...register("code_postal", {
                  onChange: (e) => setUpperCase("code_postal", e),
                })}
                id="code_postal"
                name="code_postal"
              />
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.code_postal && (
                <Typography>{errors.code_postal.message}</Typography>
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
              <Typography sx={{ fontWeight: "bold" }}>Commune</Typography>

              <TextField
                fullWidth
                {...register("commune", {
                  onChange: (e) => setUpperCase("commune", e),
                })}
                id="commune"
                name="commune"
              />
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.commune && (
                <Typography>{errors.commune.message}</Typography>
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
              <Typography sx={{ fontWeight: "bold" }}>Cedex</Typography>
              <TextField
                fullWidth
                {...register("cedex", {
                  onChange: (e) => setUpperCase("cedex", e),
                })}
                id="cedex"
                name="cedex"
              />
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.cedex && <Typography>{errors.cedex.message}</Typography>}
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
              <Typography sx={{ fontWeight: "bold" }}>Pays</Typography>
              <FormControl fullWidth>
                <Select
                  {...register("pays", {
                    onChange: (e) => setUpperCase("pays", e),
                  })}
                  id="pays"
                  name="pays"
                  defaultValue="France"
                >
                  {pays.map((option) => {
                    return (
                      <MenuItem key={option.value} value={option.label}>
                        {option.label}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Box>
            <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
              {errors.pays && <Typography>{errors.pays.message}</Typography>}
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
          Créer l'unité de gestion
        </Button>
        <Box sx={{ marginY: 3, display: "flex", alignItems: "center", gap: 3 }}>
          {createUgMutation.isSuccess && message && (
            <Typography sx={{ color: "success.main" }}>{message}</Typography>
          )}
          {createUgMutation.isError && message && (
            <Typography sx={{ color: "error.main" }}>{message}</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
