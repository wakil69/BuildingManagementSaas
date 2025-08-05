import countryList from "react-select-country-list";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AnimatePresence, motion } from "framer-motion";
import AddIcon from "@mui/icons-material/Add";
import LoopIcon from "@mui/icons-material/Loop";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useStudyLevels } from "../../hooks/tiers/useStudyLevels";
import { useSituationAvPrj } from "../../hooks/tiers/useSituationAvPrj";
import { useBatiments } from "../../hooks/tiers/useBatiments";
import { useSituationSocioPro } from "../../hooks/tiers/useSituationSocioPro";
import customRequest from "../../routes/api/api";
import { CreatePP } from "../../types/tiers/tiers";
import { useLegalForms } from "../../hooks/tiers/useLegalForms";
import { usePrescriber } from "../../hooks/tiers/usePrescriber";
import { useFormulesTypes } from "../../hooks/tiers/useFormules";

type FieldName = keyof Yup.InferType<typeof validationSchemaPPInfos>;

const validationSchemaPPInfos = Yup.object().shape({
  batiment_id: Yup.number().required("Le bâtiment est requis."),
  civilite: Yup.string()
    .oneOf(["Mr", "Mme", ""], "Veuillez choisir une des options.")
    .nullable(),
  surname: Yup.string().required("L'intitulé est requis."),
  first_name: Yup.string().required("Le prénom est requis."),
  birth_date: Yup.string().nullable(),
  birth_name: Yup.string().nullable(),
  email: Yup.string().required("L'email est requis."),
  phone_number: Yup.string().nullable(),
  num_voie: Yup.string().nullable(),
  int_voie: Yup.string().nullable(),
  typ_voie: Yup.string().nullable(),
  complement_voie: Yup.string().nullable(),
  code_postal: Yup.string().nullable(),
  commune: Yup.string().nullable(),
  cedex: Yup.string().nullable(),
  pays: Yup.string().nullable(),
  qpv: Yup.string()
    .oneOf(["Oui", "Non", ""], "Veuillez choisir une des options.")
    .nullable(),
  zfu: Yup.string()
    .oneOf(["Oui", "Non", ""], "Veuillez choisir une des options.")
    .nullable(),
  study_level_id: Yup.number()
    .transform((value, originalValue) =>
      originalValue == null ||
      (typeof originalValue === "string" && originalValue.trim() === "")
        ? undefined
        : value
    )
    .typeError("Veuillez entrer un nombre.")
    .nullable()
    .optional(),
  situation_before_prj_id: Yup.number()
    .transform((value, originalValue) =>
      originalValue == null ||
      (typeof originalValue === "string" && originalValue.trim() === "")
        ? undefined
        : value
    )
    .typeError("Veuillez entrer un nombre.")
    .nullable()
    .optional(),
  situation_socio_pro_id: Yup.string().nullable(),
  image_authorisation: Yup.string()
    .oneOf(["Oui", "Non", ""], "Veuillez choisir une des options.")
    .nullable(),
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
  first_meeting_date: Yup.string().nullable(),
  first_meeting_hour_begin: Yup.string()
    .nullable()
    .when("first_meeting_date", {
      is: (value: string) => !!value,
      then: (schema) =>
        schema.length(5, 'Le format doit être HH:MM').required(
          "L'heure de début est obligatoire lorsque la date est renseignée."
        ),
    }),
  first_meeting_hour_end: Yup.string()
    .nullable()
    .when("first_meeting_date", {
      is: (value: string) => !!value,
      then: (schema) =>
        schema.length(5, 'Le format doit être HH:MM').required(
          "L'heure de fin est obligatoire lorsque la date est renseignée."
        ),
    }),
  prescriber_id: Yup.number()
    .transform((value, originalValue) =>
      originalValue == null ||
      (typeof originalValue === "string" && originalValue.trim() === "")
        ? undefined
        : value
    )
    .typeError("Veuillez entrer un nombre.")
    .nullable()
    .optional(),
  first_meeting_feedback: Yup.string().nullable(),
  formule_wishes: Yup.object({
    "Extra-Muros": Yup.boolean().required("Extra-Muros is required."),
    Coworking: Yup.boolean().required("Coworking is required."),
    "Bureau Partagé": Yup.boolean().required("Bureau Partagé is required."),
    Bureau: Yup.boolean().required("Bureau is required."),
  }).required("formule_wishes is required."),
  surface_wishes: Yup.object()
    .test(
      "is-boolean-record",
      "surface_wishes must be a record with boolean values",
      (value: any) => {
        if (!value || typeof value !== "object") return false;
        return Object.values(value).every((val) => typeof val === "boolean");
      }
    )
    .required("surface_wishes is required."),
  date_entree_wished: Yup.string().nullable(),
  formule_id: Yup.number().required("La formule est requise."),
  date_debut_formule: Yup.string().required("La date de début est requise."),
  date_fin_formule: Yup.string().nullable(),
});

export default function CreationTiersPPVisu() {
  const [isOpen, setIsOpen] = useState(true);
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const pays = useMemo(() => countryList().getData(), []);
  const { batiments, isLoadingBatiments } = useBatiments();
  const { studyLevels, isLoadingStudyLevels } = useStudyLevels();
  const { situationAvPrj, isLoadingSituationAvPrj } = useSituationAvPrj();
  const { situationSocioPro, isLoadingSituationSocioPro } =
    useSituationSocioPro();
  const { legalForms, isLoadingLegalForms } = useLegalForms();
  const { prescribers, isLoadingPrescriber } = usePrescriber();
  const { formulesTypes, isLoadingFormulesTypes } = useFormulesTypes();

  const {
    register,
    getValues,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaPPInfos),
    defaultValues: {
      batiment_id: batiments[0].batiment_id,
    },
  });

  async function getSurfacesWishes(): Promise<Record<string, boolean>> {
    try {
      const response = await customRequest.get("/admin/surfaces", {
        params: { batiment_id: getValues("batiment_id") },
      });

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      let data: number[] = response.data;

      const surfaceWishes: Record<string, boolean> = data.reduce(
        (acc: Record<string, boolean>, cur: number) => {
          acc[cur] = false;
          return acc;
        },
        {}
      );

      setValue(`surface_wishes`, surfaceWishes);

      return surfaceWishes;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  const { data: surfaceWishes } = useQuery<Record<string, boolean>>({
    queryKey: ["surfaces_wishes", getValues("batiment_id")],
    queryFn: getSurfacesWishes,
    refetchOnWindowFocus: false,
    enabled: !!getValues("batiment_id"),
  });

  const tiersSave = async (data: CreatePP) => {
    try {
      setMessage("");

      const response = await customRequest.post(`/tiers/create-pp`, {
        ...data,
        surface_wishes: JSON.stringify(data.surface_wishes),
        formule_wishes: JSON.stringify(data.formule_wishes),
      });

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

  const tiersSaveMutation = useMutation({
    mutationFn: (data: CreatePP) => tiersSave(data),
    onSuccess: (data) => {
      setMessage(data.message);
      navigate(`/pageConnecte/tiers/recherche/visualisation/PP/${data.id}`);
    },
    onError: (err) => {
      setMessage(err.message);
      console.error(err);
    },
  });

  const onSubmit = (data: CreatePP) => {
    tiersSaveMutation.mutate(data);
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
        <Typography variant="h6">Personne Physique</Typography>
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
            style={{ overflow: "hidden", padding: 3 }}
          >
            <Paper elevation={3} sx={{ padding: 3, marginY: 3 }}>
              <Typography variant="h6">Informations générales</Typography>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 6,
                  marginY: 3,
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
                      Bâtiment*
                    </Typography>
                    {!isLoadingBatiments ? (
                      <FormControl fullWidth>
                        <Select
                          {...register("batiment_id", {
                            onChange: (e) => {
                              setValue("batiment_id", e.target.value);
                            },
                          })}
                          defaultValue={batiments[0].batiment_id}
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
                    ) : null}
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
                    <Typography sx={{ fontWeight: "bold", flexShrink: 0 }}>
                      Civilité
                    </Typography>
                    <Select
                      {...register("civilite")}
                      name="civilite"
                      id="civilite"
                      defaultValue={""}
                    >
                      <MenuItem key="" value="">
                        --------
                      </MenuItem>
                      <MenuItem key="Mr" value="Mr">
                        Mr
                      </MenuItem>
                      <MenuItem key="Mme" value="Mme">
                        Mme
                      </MenuItem>
                    </Select>
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.civilite && (
                      <Typography>{errors.civilite.message}</Typography>
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
                      Prénom*
                    </Typography>
                    <TextField
                      fullWidth
                      {...register("first_name", {
                        onChange: (e) => setUpperCase("first_name", e),
                      })}
                      id="first_name"
                      name="first_name"
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.first_name && (
                      <Typography>{errors.first_name.message}</Typography>
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
                      Nom*
                    </Typography>
                    <TextField
                      fullWidth
                      {...register("surname", {
                        onChange: (e) => setUpperCase("surname", e),
                      })}
                      id="surname"
                      name="surname"
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.surname && (
                      <Typography>{errors.surname.message}</Typography>
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
                      Nom de naissance
                    </Typography>
                    <TextField
                      fullWidth
                      {...register("birth_name", {
                        onChange: (e) => setUpperCase("birth_name", e),
                      })}
                      id="birth_name"
                      name="birth_name"
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.birth_name && (
                      <Typography>{errors.birth_name.message}</Typography>
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
                      Date de naissance
                    </Typography>
                    <TextField
                      fullWidth
                      type="date"
                      {...register("birth_date")}
                      id="birth_date"
                      name="birth_date"
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.birth_date && (
                      <Typography>{errors.birth_date.message}</Typography>
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
                      Email*
                    </Typography>
                    <TextField
                      fullWidth
                      {...register("email")}
                      id="email"
                      name="email"
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.email && (
                      <Typography>{errors.email.message}</Typography>
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
                      Téléphone
                    </Typography>
                    <TextField
                      fullWidth
                      {...register("phone_number")}
                      id="phone_number"
                      name="phone_number"
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.phone_number && (
                      <Typography>{errors.phone_number.message}</Typography>
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
                    <Typography sx={{ fontWeight: "bold", flexShrink: 0 }}>
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
                    <Typography sx={{ fontWeight: "bold", flexShrink: 0 }}>
                      Cedex
                    </Typography>
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
                    <Typography sx={{ fontWeight: "bold", flexShrink: 0 }}>
                      Pays
                    </Typography>
                    <FormControl fullWidth>
                      <Select
                        {...register("pays")}
                        id="pays"
                        name="pays"
                        defaultValue={"France"}
                      >
                        <MenuItem key="" value="" selected>
                          --------
                        </MenuItem>
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

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "start",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <Typography sx={{ fontWeight: "bold", flexShrink: 0 }}>
                      QPV
                    </Typography>
                    <Select
                      {...register("qpv")}
                      name="qpv"
                      id="qpv"
                      defaultValue={""}
                    >
                      <MenuItem key="" value="">
                        --------
                      </MenuItem>
                      <MenuItem key="Oui" value="Oui">
                        Oui
                      </MenuItem>
                      <MenuItem key="Non" value="Non">
                        Non
                      </MenuItem>
                    </Select>
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.qpv && (
                      <Typography>{errors.qpv.message}</Typography>
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
                      ZFU
                    </Typography>
                    <Select
                      {...register("zfu")}
                      name="zfu"
                      id="zfu"
                      defaultValue={""}
                    >
                      <MenuItem key="" value="">
                        --------
                      </MenuItem>
                      <MenuItem key="Oui" value="Oui">
                        Oui
                      </MenuItem>
                      <MenuItem key="Non" value="Non">
                        Non
                      </MenuItem>
                    </Select>
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.zfu && (
                      <Typography>{errors.zfu.message}</Typography>
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
                      Niveau d'étude
                    </Typography>
                    {!isLoadingStudyLevels && studyLevels.length ? (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <FormControl fullWidth>
                          <Select
                            {...register("study_level_id")}
                            name="study_level_id"
                            id="study_level_id"
                            defaultValue={""}
                          >
                            <MenuItem key="" value="">
                              -------
                            </MenuItem>
                            {studyLevels.map((data) => (
                              <MenuItem
                                key={data.study_level_id}
                                value={data.study_level_id}
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
                              "/pageConnecte/administration/reglages#study-levels",
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
                              queryKey: ["study_levels"],
                            })
                          }
                        >
                          <LoopIcon fontSize="large" />
                        </IconButton>
                      </Box>
                    ) : null}
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.study_level_id && (
                      <Typography>{errors.study_level_id.message}</Typography>
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
                      Situation avant projet
                    </Typography>
                    {!isLoadingSituationAvPrj && situationAvPrj.length ? (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Select
                          {...register("situation_before_prj_id")}
                          name="situation_before_prj_id"
                          id="situation_before_prj_id"
                          defaultValue={""}
                        >
                          <MenuItem key="" value="">
                            -------
                          </MenuItem>
                          {situationAvPrj.map((data) => (
                            <MenuItem
                              key={data.situation_before_prj_id}
                              value={data.situation_before_prj_id}
                            >
                              {data.name}
                            </MenuItem>
                          ))}
                        </Select>

                        <IconButton
                          aria-label="edit"
                          onClick={() =>
                            window.open(
                              "/pageConnecte/administration/reglages#situation-avant-prj",
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
                              queryKey: ["situation_avant_projet"],
                            })
                          }
                        >
                          <LoopIcon fontSize="large" />
                        </IconButton>
                      </Box>
                    ) : null}
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.situation_before_prj_id && (
                      <Typography>
                        {errors.situation_before_prj_id.message}
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
                      Expérience professionnelle
                    </Typography>
                    {!isLoadingSituationSocioPro && situationSocioPro.length ? (
                      <Select
                        {...register("situation_socio_pro_id")}
                        name="situation_socio_pro_id"
                        id="situation_socio_pro_id"
                        defaultValue={""}
                      >
                        <MenuItem key="" value="">
                          --------
                        </MenuItem>
                        {situationSocioPro.map((data, idx) => {
                          if (idx != 0) {
                            return (
                              <MenuItem
                                key={data["Liste PCS-ESE"]}
                                value={data["Liste PCS-ESE"]}
                              >
                                {data["Liste PCS-ESE"]} -{" "}
                                {
                                  data[
                                    "Liste des professions et catégories socioprofessionnelles des emplois salariés des employeurs privés et publics"
                                  ]
                                }
                              </MenuItem>
                            );
                          }
                          return null;
                        })}
                      </Select>
                    ) : null}
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.situation_socio_pro_id && (
                      <Typography>
                        {errors.situation_socio_pro_id.message}
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
                      Autorisation droit à l'image
                    </Typography>

                    <Select
                      {...register("image_authorisation")}
                      name="image_authorisation"
                      id="image_authorisation"
                      defaultValue={""}
                    >
                      <MenuItem key="" value="">
                        --------
                      </MenuItem>
                      <MenuItem key="Oui" value="Oui">
                        Oui
                      </MenuItem>
                      <MenuItem key="Non" value="Non">
                        Non
                      </MenuItem>
                    </Select>
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.image_authorisation && (
                      <Typography>
                        {errors.image_authorisation.message}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </Paper>
            <Paper elevation={3} sx={{ padding: 3, marginY: 3 }}>
              <Typography variant="h6">Informations sur le projet</Typography>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 6,
                  marginY: 3,
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
                      <Typography>
                        {errors.raison_social_prj.message}
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
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <FormControl fullWidth>
                          <Select
                            {...register("legal_form_id")}
                            defaultValue={""}
                          >
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
                      <Typography>
                        {errors.nb_dirigeants_prj.message}
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
            <Paper elevation={3} sx={{ padding: 3, marginY: 3 }}>
              <Typography variant="h6">Premier entretien</Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 3,
                  marginY: 3,
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
                      Date de premier entretien
                    </Typography>
                    <TextField
                      type="date"
                      fullWidth
                      {...register("first_meeting_date")}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.first_meeting_date && (
                      <Typography>
                        {errors.first_meeting_date.message}
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
                      Heure de début
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="HH:MM"
                      {...register("first_meeting_hour_begin")}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.first_meeting_hour_begin && (
                      <Typography>
                        {errors.first_meeting_hour_begin.message}
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
                      Heure de fin
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="HH:MM"
                      {...register("first_meeting_hour_end")}
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.first_meeting_hour_end && (
                      <Typography>
                        {errors.first_meeting_hour_end.message}
                      </Typography>
                    )}
                  </Box>
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
                    Prescripteur
                  </Typography>
                  {!isLoadingPrescriber && prescribers.length ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <FormControl fullWidth>
                        <Select
                          {...register("prescriber_id")}
                          defaultValue={""}
                        >
                          <MenuItem key="" value="">
                            -------
                          </MenuItem>
                          {prescribers.map((data) => (
                            <MenuItem
                              key={data.prescriber_id}
                              value={data.prescriber_id}
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
                            "/pageConnecte/administration/reglages#prescribers",
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
                            queryKey: ["prescribers"],
                          })
                        }
                      >
                        <LoopIcon fontSize="large" />
                      </IconButton>
                    </Box>
                  ) : null}
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.prescriber_id && (
                    <Typography>{errors.prescriber_id.message}</Typography>
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
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    width: "80%",
                  }}
                >
                  <Typography sx={{ fontWeight: "bold", flexShrink: 0 }}>
                    Commentaire
                  </Typography>
                  <TextField
                    variant="standard"
                    fullWidth
                    multiline
                    rows={4}
                    margin="normal"
                    {...register("first_meeting_feedback")}
                  />
                </Box>
                <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                  {errors.first_meeting_feedback && (
                    <Typography>
                      {errors.first_meeting_feedback.message}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Paper>
            <Paper elevation={3} sx={{ padding: 3, marginY: 3 }}>
              <Typography variant="h6">Accompagnement souhaité</Typography>
              <TableContainer>
                <Table>
                  <TableHead></TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell
                        rowSpan={2}
                        sx={{ width: "30%", fontWeight: "bold" }}
                      >
                        Formule(s) souhaitée(s)
                      </TableCell>
                      <TableCell>
                        <FormControlLabel
                          control={
                            <Checkbox
                              {...register("formule_wishes.Bureau", {
                                onChange: (e) => {
                                  setValue(
                                    `formule_wishes.Bureau`,
                                    e.target.checked
                                  );
                                },
                              })}
                            />
                          }
                          label="Bureau"
                        />
                      </TableCell>
                      <TableCell>
                        <FormControlLabel
                          control={
                            <Checkbox
                              {...register("formule_wishes.Bureau Partagé", {
                                onChange: (e) => {
                                  setValue(
                                    `formule_wishes.Bureau Partagé`,
                                    e.target.checked
                                  );
                                },
                              })}
                            />
                          }
                          label="Bureau Partagé"
                        />
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <FormControlLabel
                          control={
                            <Checkbox
                              {...register("formule_wishes.Extra-Muros", {
                                onChange: (e) => {
                                  setValue(
                                    `formule_wishes.Extra-Muros`,
                                    e.target.checked
                                  );
                                },
                              })}
                            />
                          }
                          label="Extra-Muros"
                        />
                      </TableCell>
                      <TableCell>
                        <FormControlLabel
                          control={
                            <Checkbox
                              {...register("formule_wishes.Coworking", {
                                onChange: (e) => {
                                  setValue(
                                    `formule_wishes.Coworking`,
                                    e.target.checked
                                  );
                                },
                              })}
                            />
                          }
                          label="Coworking"
                        />
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>

                    {surfaceWishes &&
                      Object.entries(surfaceWishes)
                        .reduce((rows: any[], [size, value], index) => {
                          if (index % 4 === 0) rows.push([]);
                          rows[rows.length - 1].push({ size, value });
                          return rows;
                        }, [])
                        .map((row, rowIndex) => (
                          <TableRow key={rowIndex}>
                            {rowIndex === 0 && (
                              <TableCell
                                rowSpan={Math.ceil(
                                  Object.keys(surfaceWishes).length / 4
                                )}
                                sx={{ width: "20%", fontWeight: "bold" }}
                              >
                                Superficie
                              </TableCell>
                            )}
                            {row.map(({ size }: any) => (
                              <TableCell key={size} sx={{ width: "20%" }}>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      {...register(
                                        `surface_wishes.${size}` as any
                                      )}
                                    />
                                  }
                                  label={`${size} m²`}
                                />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}

                    <TableRow>
                      <TableCell
                        sx={{
                          width: "30%",
                          height: "6rem",
                          fontWeight: "bold",
                        }}
                      >
                        Date prévisionnelle d'entrée
                      </TableCell>
                      <TableCell colSpan={2}>
                        <TextField
                          type="date"
                          {...register("date_entree_wished")}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
            <Paper elevation={3} sx={{ padding: 3, marginY: 3 }}>
              <Typography variant="h6">
                Formule de la personne physique
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 6,
                  marginY: 3,
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
                    <Typography sx={{ fontWeight: "bold" }}>
                      Formule*
                    </Typography>
                    {!isLoadingFormulesTypes && formulesTypes.length ? (
                      <FormControl fullWidth>
                        <Select
                          {...register("formule_id")}
                          name="formule_id"
                          id="formule_id"
                          defaultValue={formulesTypes[0].formule_id}
                        >
                          {formulesTypes.map((data) => (
                            <MenuItem
                              key={data.formule_id}
                              value={data.formule_id}
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
                    {errors.formule_id && (
                      <Typography>{errors.formule_id.message}</Typography>
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
                      Date de début*
                    </Typography>
                    <TextField
                      fullWidth
                      type="date"
                      {...register("date_debut_formule")}
                      id="date_debut_formule"
                      name="date_debut_formule"
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.date_debut_formule && (
                      <Typography>
                        {errors.date_debut_formule.message}
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
                      Date de fin
                    </Typography>
                    <TextField
                      fullWidth
                      type="date"
                      {...register("date_fin_formule")}
                      id="date_fin_formule"
                      name="date_fin_formule"
                    />
                  </Box>
                  <Box mt={1} p={1} color="red" sx={{ minHeight: "36px" }}>
                    {errors.date_fin_formule && (
                      <Typography>{errors.date_fin_formule.message}</Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </Paper>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                mt: 3,
              }}
            >
              <Button
                onClick={() => handleSubmit(onSubmit)()}
                color="primary"
                variant="contained"
              >
                Ajouter la personne physique
              </Button>
              {tiersSaveMutation.isSuccess && message && (
                <Typography sx={{ color: "success.main" }}>
                  {message}
                </Typography>
              )}
              {tiersSaveMutation.isError && message && (
                <Typography sx={{ color: "error.main" }}>{message}</Typography>
              )}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
