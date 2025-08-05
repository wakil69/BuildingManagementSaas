import countryList from "react-select-country-list";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Etage, UgInfos } from "../../../types/ugs/ugs";
import customRequest from "../../../routes/api/api";
import { Batiment } from "../../../types/Admin/Administration";
import { convertDateFormat } from "../../../utils/functions";
import {
  Box,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AnimatePresence, motion } from "framer-motion";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import LoopIcon from "@mui/icons-material/Loop";
import SaveIcon from "@mui/icons-material/Save";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useUgType } from "../../../hooks/ugs/useUgType";

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

const validationSchemaUgInfos = Yup.object().shape({
  batiment_id: Yup.number().required("Le bâtiment est requis."),
  nature_ug_id: Yup.number().required("La nature est requise."),
  name: Yup.string().required("L'intitulé est requis."),
  etage_id: Yup.number().required("L'étage est requis."),
  surface: Yup.number()
    .transform((value, originalValue) =>
      originalValue == null ||
      (typeof originalValue === "string" && originalValue.trim() === "")
        ? undefined
        : value
    )
    .typeError("Veuillez entrer un nombre.")
    .nullable()
    .optional(),
  date_construction: Yup.string().nullable(),
  date_entree: Yup.string().nullable(),
  num_voie: Yup.string().required("Le numéro de voie est requis."),
  typ_voie: Yup.string().required("Le type de voie est requis."),
  int_voie: Yup.string().required("L'intitulé de la voie est requis."),
  complement_voie: Yup.string().nullable(),
  code_postal: Yup.string().required("Le code postal est requis."),
  commune: Yup.string().required("La commune est requise."),
  cedex: Yup.string().nullable(),
  pays: Yup.string().required("Le pays est requis."),
});

export default function UgInfosVisu({
  ugInfos,
  ugId,
}: {
  ugInfos: UgInfos;
  ugId?: string;
}) {
  const [editable, setEditable] = useState(false);
  const [batimentChoice, setBatimentChoice] = useState<number | null>(
    ugInfos.batiment_id
  );
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
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
    staleTime: Infinity,
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
    getValues,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaUgInfos),
    defaultValues: ugInfos,
  });

  const ugUpdate = async (data: UgInfos) => {
    try {
      setMessage("");
      const response = await customRequest.put(`/ug/ug-infos/${ugId}`, data);

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

  const ugUpdateMutation = useMutation({
    mutationFn: (data: UgInfos) => ugUpdate(data),
    onSuccess: (data) => {
      setMessage(data.message);
      setEditable(false);
      queryClient.invalidateQueries({
        queryKey: ["ug", ugId],
      });
    },
    onError: (err) => {
      setMessage(err.message);
      console.error(err);
    },
  });

  const onSubmit = (data: UgInfos) => {
    ugUpdateMutation.mutate(data);
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
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          transition: "background-color 0.3s, transform 0.3s",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.05)",
            transform: "scale(1.02)",
          },
          padding: 2,
          cursor: "pointer",
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Typography variant="h6">Informations sur l'UG</Typography>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ExpandMoreIcon />
        </motion.div>
      </Box>
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <Box
              sx={{ marginY: 3, display: "flex", alignItems: "center", gap: 3 }}
            >
              {!editable ? (
                <IconButton aria-label="edit" onClick={() => setEditable(true)}>
                  <EditIcon fontSize="large" />
                </IconButton>
              ) : (
                <IconButton
                  aria-label="edit"
                  onClick={() => handleSubmit(onSubmit)()}
                >
                  <SaveIcon fontSize="large" />
                </IconButton>
              )}
              {ugUpdateMutation.isSuccess && message && (
                <Typography sx={{ color: "success.main" }}>
                  {message}
                </Typography>
              )}
              {ugUpdateMutation.isError && message && (
                <Typography sx={{ color: "error.main" }}>{message}</Typography>
              )}
            </Box>
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
                  <Typography sx={{ fontWeight: "bold" }}>ID</Typography>
                  <Typography>{ugId}</Typography>
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
                  <Typography sx={{ fontWeight: "bold" }}>Bâtiment</Typography>
                  {editable && !isLoadingBatiments ? (
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
                        defaultValue={ugInfos.batiment_id}
                      >
                        {batiments.map((data) => (
                          <MenuItem
                            key={data.batiment_id}
                            value={data.batiment_id}
                          >
                            {data.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <Typography>
                      {
                        batiments.find(
                          (batiment) =>
                            batiment.batiment_id === getValues("batiment_id")
                        )?.name
                      }
                    </Typography>
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
                  {editable && !isLoadingNatureUgs && natureUgs.length ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <FormControl fullWidth>
                        <Select
                          {...register("nature_ug_id")}
                          name="nature"
                          id="nature"
                          defaultValue={ugInfos.nature_ug_id}
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
                      <IconButton
                        aria-label="edit"
                        onClick={() =>
                          window.open(
                            "/pageConnecte/administration/reglages#nature-ug",
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
                            queryKey: ["nature", "ug"],
                          })
                        }
                      >
                        <LoopIcon fontSize="large" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Typography>
                      {
                        natureUgs.find(
                          (nature) =>
                            nature.nature_ug_id === getValues("nature_ug_id")
                        )?.name
                      }
                    </Typography>
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
                  {editable ? (
                    <TextField
                      fullWidth
                      {...register("name", {
                        onChange: (e) => setUpperCase("name", e),
                      })}
                      id="ugInt"
                      name="ugInt"
                    />
                  ) : (
                    <Typography>{getValues("name")}</Typography>
                  )}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.name && (
                    <Typography>{errors.name.message}</Typography>
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
                  <Typography sx={{ fontWeight: "bold" }}>Étage</Typography>
                  {editable && !isLoadingEtages ? (
                    <FormControl fullWidth>
                      <Select
                        {...register("etage_id")}
                        name="etage_id"
                        id="etage_id"
                        defaultValue={ugInfos.etage_id}
                      >
                        {etages.map((etage: Etage) => (
                          <MenuItem key={etage.etage_id} value={etage.etage_id}>
                            {etage.num_etage}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : !isLoadingEtages ? (
                    <Typography>
                      {
                        etages.find(
                          (etage) => etage.etage_id === getValues("etage_id")
                        )?.num_etage
                      }
                    </Typography>
                  ) : null}
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
                  {editable ? (
                    <TextField
                      fullWidth
                      type="number"
                      {...register("surface")}
                      id="surface"
                      name="surface"
                    />
                  ) : (
                    <Typography>{getValues("surface")}</Typography>
                  )}
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
                  {editable ? (
                    <TextField
                      fullWidth
                      type="date"
                      {...register("date_construction")}
                      id="date_construction"
                      name="date_construction"
                    />
                  ) : (
                    <Typography>
                      {convertDateFormat(getValues("date_construction") || "")}
                    </Typography>
                  )}
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
                  {editable ? (
                    <TextField
                      fullWidth
                      type="date"
                      {...register("date_entree")}
                      id="date_entree"
                      name="date_entree"
                    />
                  ) : (
                    <Typography>
                      {convertDateFormat(getValues("date_entree") || "")}
                    </Typography>
                  )}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.date_entree && (
                    <Typography>{errors.date_entree.message}</Typography>
                  )}
                </Box>
              </Box>

              {editable ? (
                <>
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
                        type="number"
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
                        <Typography>
                          {errors.complement_voie.message}
                        </Typography>
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
                      <Typography sx={{ fontWeight: "bold" }}>
                        Commune
                      </Typography>

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
                      {errors.cedex && (
                        <Typography>{errors.cedex.message}</Typography>
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
                      <Typography sx={{ fontWeight: "bold" }}>Pays</Typography>
                      <FormControl fullWidth>
                        <Select
                          {...register("pays")}
                          id="pays"
                          name="pays"
                          defaultValue={ugInfos.pays}
                        >
                          {pays.map((option) => {
                            return (
                              <MenuItem
                                key={option.value}
                                value={option.label}
                                selected
                              >
                                {option.label}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </Box>
                    <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                      {errors.pays && (
                        <Typography>{errors.pays.message}</Typography>
                      )}
                    </Box>
                  </Box>
                </>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "start",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <Typography sx={{ fontWeight: "bold" }}>Adresse</Typography>
                    <Typography>
                      {getValues("num_voie")} {getValues("typ_voie")}{" "}
                      {getValues("int_voie")} {getValues("complement_voie")}{" "}
                      {getValues("code_postal")} {getValues("commune")}{" "}
                      {getValues("cedex")} {getValues("pays")}
                    </Typography>
                  </Box>
                  <Box
                    mt={1}
                    p={1}
                    color="red"
                    sx={{ minHeight: "36px" }}
                  ></Box>
                </Box>
              )}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
